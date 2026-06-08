import mongoose from 'mongoose';
import { JsonModel } from '../config/jsonDb.js';

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    category: { type: String, required: true },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    image: { type: String, required: true }, // Main display image
    images: [{ type: String }],            // Carousel images
    sizes: [{ type: Number }],             // Supported sizes (e.g. 8, 9, 10, 11)
    colors: [
      {
        name: { type: String, required: true }, // e.g. "Neon Blue"
        hex: { type: String, required: true }   // e.g. "#00f0ff"
      }
    ],
    stock: { type: Number, required: true, default: 0 },
    isFeatured: { type: Boolean, required: true, default: false },
    featuredImage: { type: String },
    specs: {
      type: Map,
      of: String
    },
    reviews: [reviewSchema]
  },
  { timestamps: true }
);

const getProductModel = () => {
  if (global.useMockDB) {
    return new JsonModel('Product');
  }
  return mongoose.models.Product || mongoose.model('Product', productSchema);
};

export default getProductModel;
