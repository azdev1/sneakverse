import mongoose from 'mongoose';
import { JsonModel } from '../config/jsonDb.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false }
  },
  { timestamps: true }
);

const getUserModel = () => {
  if (global.useMockDB) {
    return new JsonModel('User');
  }
  return mongoose.models.User || mongoose.model('User', userSchema);
};

export default getUserModel;
