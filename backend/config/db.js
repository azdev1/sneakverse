import mongoose from 'mongoose';

// Initialize the global mock db flag
global.useMockDB = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri || uri.trim() === '' || uri.trim() === 'mock') {
    console.warn('\n======================================================');
    console.warn('⚠️  MONGODB_URI environment variable is not defined or is set to mock.');
    console.warn('⚠️  SneakVerse backend is falling back to a local JSON Database.');
    console.warn('📂  Local DB file: backend/data/local_db.json');
    console.warn('======================================================\n');
    global.useMockDB = true;
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // Time out after 5s
    });
    console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);
    global.useMockDB = false;
  } catch (error) {
    console.error(`\n❌ MongoDB connection failed: ${error.message}`);
    console.warn('⚠️  SneakVerse backend is falling back to a local JSON Database.');
    console.warn('📂  Local DB file: backend/data/local_db.json');
    console.warn('======================================================\n');
    global.useMockDB = true;
  }
};
