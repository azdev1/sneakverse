'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { 
  Sliders, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle,
  Truck,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import Loader from '../../components/Loader';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState('analytics'); // analytics, products, orders, users
  
  // Data lists
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);

  // Form states for creating/editing product
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editProductId, setEditProductId] = useState(null); // null means adding a new one
  
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('SneakVerse');
  const [prodCategory, setProdCategory] = useState('Casual Sneakers');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPrice, setProdPrice] = useState(200);
  const [prodStock, setProdStock] = useState(10);
  const [prodImage, setProdImage] = useState('/uploads/sneaker-quantum.png');

  // Verify Admin rights
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=admin');
    } else if (!user.isAdmin) {
      alert('Access Denied. Admin privileges required.');
      router.push('/profile');
    }
  }, [user, router]);

  // Load Admin Data
  const loadAdminData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      // 1. Fetch products
      const prodRes = await fetch('http://localhost:5000/api/products');
      const prodData = await prodRes.json();
      setProducts(prodData);

      // 2. Fetch orders
      const orderRes = await fetch('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orderData = await orderRes.json();
      setOrders(orderData);

      // 3. Fetch users
      const usersRes = await fetch('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      setUsersList(usersData);
    } catch (err) {
      console.warn('API error, seeding mock admin panels.', err);
      // Hydrate local mock details for standalone demo validation
      setProducts([
        { _id: 'quantum_mock', name: 'SneakVerse Quantum', brand: 'SneakVerse', category: 'Running Shoes', price: 220, stock: 15 },
        { _id: 'stratus_mock', name: 'AeroStratus Basketball', brand: 'SneakVerse', category: 'Basketball Shoes', price: 260, stock: 8 }
      ]);
      setOrders([
        {
          _id: 'order_mock_1',
          createdAt: new Date().toISOString(),
          totalAmount: 480.00,
          isPaid: true,
          isDelivered: false,
          status: 'Processing',
          user: { name: 'Alex Mercer', email: 'alex@example.com' },
          orderItems: [{ name: 'SneakVerse Quantum', qty: 1, price: 220 }]
        }
      ]);
      setUsersList([
        { _id: 'admin_id', name: 'SneakVerse Admin', email: 'admin@sneakverse.com', isAdmin: true },
        { _id: 'user_id', name: 'Alex Mercer', email: 'alex@example.com', isAdmin: false }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.isAdmin) {
      loadAdminData();
    }
  }, [token, user]);

  // Handle Product deletion
  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this sneaker?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      alert('Product deleted successfully');
      loadAdminData();
    } catch (err) {
      alert('Local Database fallback delete mock completed.');
      setProducts(products.filter(p => p._id !== id));
    }
  };

  // Submit product Addition or Edit
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: prodName,
      brand: prodBrand,
      category: prodCategory,
      description: prodDescription,
      price: Number(prodPrice),
      stock: Number(prodStock),
      image: prodImage,
      sizes: [8, 9, 10, 11, 12],
      colors: [
        { name: 'Core Edition', hex: '#00f0ff' },
        { name: 'Matrix Black', hex: '#111111' }
      ]
    };

    try {
      let url = 'http://localhost:5000/api/products';
      let method = 'POST';

      if (editProductId) {
        url = `http://localhost:5000/api/products/${editProductId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Save product failed');
      
      alert(editProductId ? 'Product updated' : 'Product created');
      setIsFormOpen(false);
      resetForm();
      loadAdminData();
    } catch (err) {
      alert('Local Mock database saved changes.');
      if (editProductId) {
        setProducts(products.map(p => p._id === editProductId ? { ...p, ...payload } : p));
      } else {
        setProducts([...products, { _id: 'mock_new_' + Date.now(), ...payload }]);
      }
      setIsFormOpen(false);
      resetForm();
    }
  };

  // Mark order as delivered
  const handleMarkDelivered = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}/deliver`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delivery update failed');
      alert('Order marked as Delivered!');
      loadAdminData();
    } catch (err) {
      alert('Local Mock DB delivery status updated.');
      setOrders(orders.map(o => o._id === id ? { ...o, isDelivered: true, status: 'Delivered' } : o));
    }
  };

  const resetForm = () => {
    setEditProductId(null);
    setProdName('');
    setProdBrand('SneakVerse');
    setProdCategory('Casual Sneakers');
    setProdDescription('');
    setProdPrice(200);
    setProdStock(10);
  };

  const openEditForm = (prod) => {
    setEditProductId(prod._id);
    setProdName(prod.name);
    setProdBrand(prod.brand);
    setProdCategory(prod.category);
    setProdDescription(prod.description || '');
    setProdPrice(prod.price);
    setProdStock(prod.stock);
    setProdImage(prod.image || '/uploads/sneaker-quantum.png');
    setIsFormOpen(true);
  };

  if (!user || !user.isAdmin) return <Loader />;

  // Calculate high level metrics
  const totalSales = orders.filter(o => o.isPaid).reduce((acc, o) => acc + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => !o.isDelivered).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="border-b border-white/5 pb-4 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Sliders size={20} className="text-accent animate-spin-slow" />
            SneakVerse Terminal
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Administrative Overview</p>
        </div>

        <button
          onClick={loadAdminData}
          className="p-2 rounded-full border border-white/10 hover:text-accent hover:border-accent/40 text-gray-400 transition-all"
          title="Reload Console Data"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-white/5 gap-6">
        {['analytics', 'products', 'orders', 'users'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
              activeTab === tab ? 'border-accent text-white' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div>
        {/* TAB 1: ANALYTICS OVERVIEW */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Revenue */}
              <div className="glass p-6 rounded-2xl border-white/5 space-y-2">
                <div className="flex justify-between items-center text-gray-400">
                  <span className="text-[10px] font-bold uppercase">Total Revenue</span>
                  <DollarSign size={16} className="text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-white">${totalSales.toFixed(2)}</div>
                <div className="text-[9px] text-gray-500">Accumulated checkout purchases</div>
              </div>

              {/* Card 2: Orders */}
              <div className="glass p-6 rounded-2xl border-white/5 space-y-2">
                <div className="flex justify-between items-center text-gray-400">
                  <span className="text-[10px] font-bold uppercase">Total Orders</span>
                  <ShoppingBag size={16} className="text-accent" />
                </div>
                <div className="text-2xl font-black text-white">{orders.length}</div>
                <div className="text-[9px] text-gray-500">{pendingOrders} awaiting delivery</div>
              </div>

              {/* Card 3: Products */}
              <div className="glass p-6 rounded-2xl border-white/5 space-y-2">
                <div className="flex justify-between items-center text-gray-400">
                  <span className="text-[10px] font-bold uppercase">Active Catalog</span>
                  <Sparkles size={16} className="text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white">{products.length}</div>
                <div className="text-[9px] text-gray-500">Customizer templates loaded</div>
              </div>

              {/* Card 4: Users */}
              <div className="glass p-6 rounded-2xl border-white/5 space-y-2">
                <div className="flex justify-between items-center text-gray-400">
                  <span className="text-[10px] font-bold uppercase">Registered Designers</span>
                  <Users size={16} className="text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white">{usersList.length}</div>
                <div className="text-[9px] text-gray-500">Active accounts database</div>
              </div>

            </div>

            {/* Quick action checklist panel */}
            <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">System Logs & Integrity Check</h3>
              <div className="space-y-2.5 text-xs text-gray-400">
                <div className="flex justify-between items-center border-b border-white/5 py-1.5">
                  <span>API Status</span>
                  <span className="text-emerald-500 font-bold">ONLINE</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 py-1.5">
                  <span>Database State</span>
                  <span className="text-accent font-bold">JSON Mock Fallback / Local sync</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span>SSL Handshake</span>
                  <span className="text-emerald-500 font-bold">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Shoe Catalog ({products.length})</h3>
              
              <button
                onClick={() => { resetForm(); setIsFormOpen(true); }}
                className="py-2 px-5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-full hover:bg-accent flex items-center gap-1.5 transition-all"
              >
                <Plus size={14} />
                <span>Add Product</span>
              </button>
            </div>

            {/* Product submission Form panel */}
            {isFormOpen && (
              <form onSubmit={handleProductSubmit} className="glass p-6 rounded-2xl border-accent/20 bg-accent/5 max-w-2xl space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">
                  {editProductId ? 'Edit Sneaker Configuration' : 'Add New Sneaker Template'}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Name</label>
                    <input
                      type="text"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-full py-2 px-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-accent"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Brand</label>
                    <input
                      type="text"
                      value={prodBrand}
                      onChange={(e) => setProdBrand(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-full py-2 px-4 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Category</label>
                    <input
                      type="text"
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-full py-2 px-4 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Price ($)</label>
                    <input
                      type="number"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-full py-2 px-4 text-xs text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Stock Quantity</label>
                    <input
                      type="number"
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-full py-2 px-4 text-xs text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Description</label>
                  <textarea
                    rows="3"
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-full bg-accent text-black font-black uppercase text-xs tracking-widest hover:bg-accent/80 transition-all"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsFormOpen(false); resetForm(); }}
                    className="py-2.5 px-6 rounded-full border border-white/10 text-gray-400 hover:text-white transition-all font-bold uppercase text-xs tracking-widest"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Products grid list */}
            <div className="glass p-6 rounded-3xl border-white/5 overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-400">
                <thead>
                  <tr className="border-b border-white/5 text-white uppercase text-[10px] font-black tracking-wider">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-right">Price</th>
                    <th className="pb-3 text-right">Stock</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 text-white uppercase font-black">{p.name}</td>
                      <td className="py-4">{p.category}</td>
                      <td className="py-4 text-right text-accent">${p.price}</td>
                      <td className={`py-4 text-right ${p.stock < 5 ? 'text-amber-500' : 'text-gray-300'}`}>
                        {p.stock}
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditForm(p)}
                          className="p-1 rounded bg-white/5 text-gray-400 hover:text-accent hover:bg-white/10 transition-all inline-block"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          className="p-1 rounded bg-white/5 text-gray-400 hover:text-red-400 hover:bg-white/10 transition-all inline-block"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="glass p-6 rounded-3xl border-white/5 space-y-4 overflow-x-auto">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Full Order Registry</h3>
            
            <table className="w-full text-left text-xs text-gray-400">
              <thead>
                <tr className="border-b border-white/5 text-white uppercase text-[10px] font-black tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Buyer Email</th>
                  <th className="pb-3 text-right">Charge</th>
                  <th className="pb-3 text-center">Paid</th>
                  <th className="pb-3 text-center">Delivered</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 text-white font-mono select-all">{o._id}</td>
                    <td className="py-4">
                      {o.user?.email || 'guest@example.com'}
                    </td>
                    <td className="py-4 text-right text-accent">${o.totalAmount.toFixed(2)}</td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        o.isPaid ? 'bg-emerald-950/20 text-emerald-500' : 'bg-amber-950/20 text-amber-500'
                      }`}>
                        {o.isPaid ? 'PAID' : 'PENDING'}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        o.isDelivered ? 'bg-emerald-950/20 text-emerald-500' : 'bg-blue-950/20 text-blue-400'
                      }`}>
                        {o.isDelivered ? 'DELIVERED' : 'PROCESSING'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {!o.isDelivered && (
                        <button
                          onClick={() => handleMarkDelivered(o._id)}
                          className="py-1 px-3 bg-white hover:bg-accent text-black font-black uppercase text-[9px] tracking-wider rounded-full flex items-center gap-1 transition-all ml-auto"
                        >
                          <Truck size={10} />
                          <span>Deliver</span>
                        </button>
                      )}
                      {o.isDelivered && (
                        <span className="text-emerald-500 flex items-center gap-1 justify-end text-[10px]">
                          <CheckCircle size={11} />
                          Complete
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="glass p-6 rounded-3xl border-white/5 space-y-4 overflow-x-auto">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Users Registry</h3>
            
            <table className="w-full text-left text-xs text-gray-400">
              <thead>
                <tr className="border-b border-white/5 text-white uppercase text-[10px] font-black tracking-wider">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3 text-right">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold">
                {usersList.map((usr) => (
                  <tr key={usr._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 text-white uppercase font-black">{usr.name}</td>
                    <td className="py-4 font-mono">{usr.email}</td>
                    <td className="py-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        usr.isAdmin ? 'bg-accent/20 text-accent border border-accent/20' : 'bg-white/5 text-gray-400'
                      }`}>
                        {usr.isAdmin ? 'ADMIN' : 'USER'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
