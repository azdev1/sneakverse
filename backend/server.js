import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

import getProductModel from './models/productModel.js';
import getUserModel from './models/userModel.js';

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Set up upload directories
const __dirname = path.resolve();
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serves static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB Connection
await connectDB();

// Database Seeding Logic
const seedDatabase = async () => {
  try {
    const Product = getProductModel();
    const User = getUserModel();

    // 1. Seed Admin User if not exists
    const adminCount = await User.countDocuments({ isAdmin: true });
    if (adminCount === 0) {
      console.log('👤 Seeding default Admin account...');
      const hashedPassword = await bcrypt.hash('adminpassword', 10);
      await User.create({
        name: 'SneakVerse Admin',
        email: 'admin@sneakverse.com',
        password: hashedPassword,
        isAdmin: true
      });
      console.log('🔑 Admin User Seeded: admin@sneakverse.com / adminpassword');
    }

    // 2. Seed default products if not exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('👟 Seeding initial products database...');
      const seedFilePath = path.join(__dirname, 'data', 'seedData.json');
      if (fs.existsSync(seedFilePath)) {
        const seedFileContent = fs.readFileSync(seedFilePath, 'utf8');
        const { products } = JSON.parse(seedFileContent);
        
        // Load the admin user ID to map reviews to
        const adminUser = await User.findOne({ email: 'admin@sneakverse.com' });
        const adminId = adminUser ? adminUser._id : 'admin_placeholder_id';

        for (const prod of products) {
          // Map mock reviews to admin user
          const parsedReviews = prod.reviews.map(rev => ({
            ...rev,
            user: adminId
          }));
          
          await Product.create({
            ...prod,
            reviews: parsedReviews
          });
        }
        console.log(`✅ Database seeded with ${products.length} premium products!`);
      } else {
        console.warn('⚠️ seedData.json file not found. Skipping product seeding.');
      }
    }
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
  }
};

// Seed database on startup
await seedDatabase();

// Route mappings
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'SneakVerse E-Commerce API',
    status: 'online',
    db_mode: global.useMockDB ? 'JSON Fallback Local File' : 'MongoDB Connection Active'
  });
});

// 404 Route handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global 500 error handler middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 SneakVerse API Server running on port ${PORT}`);
  console.log(`🔗 Health check endpoint active at: http://localhost:${PORT}/`);
});
