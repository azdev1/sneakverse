import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'local_db.json');

// Ensure database file and directory exist
const initDbFile = () => {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify({ users: [], products: [], orders: [] }, null, 2)
    );
  }
};

const readDb = () => {
  initDbFile();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local JSON DB, resetting:', err);
    const emptyDb = { users: [], products: [], orders: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(emptyDb, null, 2));
    return emptyDb;
  }
};

const writeDb = (data) => {
  initDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

class JsonQuery {
  constructor(data) {
    this.data = JSON.parse(JSON.stringify(data)); // Deep clone
  }

  sort(sortObj) {
    if (!sortObj) return this;
    const entries = Object.entries(sortObj);
    if (entries.length === 0) return this;
    
    const [key, direction] = entries[0];
    const isDesc = direction === -1 || direction === 'desc' || direction === 'descending';

    this.data.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];
      
      // Handle date sorting
      if (key === 'createdAt' || key === 'updatedAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return isDesc ? 1 : -1;
      if (valA > valB) return isDesc ? -1 : 1;
      return 0;
    });
    return this;
  }

  select(fields) {
    if (!fields) return this;
    
    const fieldsStr = typeof fields === 'string' ? fields : Object.keys(fields).join(' ');
    const isExcluding = fieldsStr.startsWith('-');
    const fieldList = fieldsStr.replace('-', '').split(/\s+/).filter(Boolean);

    this.data = this.data.map(item => {
      const newItem = { ...item };
      if (isExcluding) {
        fieldList.forEach(f => delete newItem[f]);
      } else {
        const filtered = {};
        fieldList.forEach(f => {
          if (item[f] !== undefined) filtered[f] = item[f];
        });
        // Always include id / _id if not explicitly excluded
        if (item._id !== undefined && !fieldList.includes('-_id')) {
          filtered._id = item._id;
        }
        return filtered;
      }
      return newItem;
    });
    return this;
  }

  limit(num) {
    if (typeof num === 'number') {
      this.data = this.data.slice(0, num);
    }
    return this;
  }

  skip(num) {
    if (typeof num === 'number') {
      this.data = this.data.slice(num);
    }
    return this;
  }

  // Support promise resolution
  async then(onFulfilled, onRejected) {
    try {
      const result = await Promise.resolve(this.data);
      return onFulfilled(result);
    } catch (err) {
      if (onRejected) return onRejected(err);
      throw err;
    }
  }
}

export class JsonModel {
  constructor(collectionName) {
    // Collection key in the JSON database file (e.g. 'users', 'products', 'orders')
    this.collectionKey = collectionName.toLowerCase() + 's';
  }

  _getCollection() {
    const db = readDb();
    if (!db[this.collectionKey]) {
      db[this.collectionKey] = [];
      writeDb(db);
    }
    return db[this.collectionKey];
  }

  _saveCollection(items) {
    const db = readDb();
    db[this.collectionKey] = items;
    writeDb(db);
  }

  _match(item, query) {
    if (!query) return true;
    return Object.entries(query).every(([key, val]) => {
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        // Handle MongoDB operators (like $regex)
        return Object.entries(val).every(([op, opVal]) => {
          if (op === '$regex') {
            const regex = new RegExp(opVal, 'i');
            return regex.test(item[key]);
          }
          if (op === '$in') {
            return Array.isArray(opVal) && opVal.includes(item[key]);
          }
          return false;
        });
      }
      // Simple equivalence check (handle strings, numbers, etc.)
      return String(item[key]) === String(val);
    });
  }

  find(query = {}) {
    const items = this._getCollection();
    const filtered = items.filter(item => this._match(item, query));
    return new JsonQuery(filtered);
  }

  async findOne(query = {}) {
    const items = this._getCollection();
    const found = items.find(item => this._match(item, query));
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  async findById(id) {
    const items = this._getCollection();
    const found = items.find(item => String(item._id) === String(id));
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  async create(data) {
    const items = this._getCollection();
    const newItem = {
      _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    this._saveCollection(items);
    return JSON.parse(JSON.stringify(newItem));
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const items = this._getCollection();
    const index = items.findIndex(item => String(item._id) === String(id));
    if (index === -1) return null;

    // Handle updates, merging fields (simple shallow merge or deep if needed)
    const original = items[index];
    
    // Mongoose update syntax support ($push, etc.)
    let updated = { ...original };
    
    if (updateData.$push) {
      Object.entries(updateData.$push).forEach(([key, val]) => {
        if (!Array.isArray(updated[key])) {
          updated[key] = [];
        }
        updated[key].push(val);
      });
      // remove $push keys to avoid overwrite
      const { $push, ...rest } = updateData;
      updated = { ...updated, ...rest };
    } else {
      updated = { ...updated, ...updateData };
    }

    updated.updatedAt = new Date().toISOString();
    items[index] = updated;
    this._saveCollection(items);
    return JSON.parse(JSON.stringify(updated));
  }

  async findByIdAndDelete(id) {
    const items = this._getCollection();
    const index = items.findIndex(item => String(item._id) === String(id));
    if (index === -1) return null;
    const [deleted] = items.splice(index, 1);
    this._saveCollection(items);
    return JSON.parse(JSON.stringify(deleted));
  }

  async countDocuments(query = {}) {
    const items = this._getCollection();
    return items.filter(item => this._match(item, query)).length;
  }
}
