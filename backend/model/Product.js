// models/Product.js

import mongoose from 'mongoose';

const productTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  price: Number,
  discount: String,
  category: String,
  unit: String,
  imageUrl: String,
  imagePublicId: String
}, { timestamps: true });

const productItemSchema = new mongoose.Schema({
  barcode: { type: String, required: true, unique: true },
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductType', required: true },
  sold: { type: Boolean, default: false }
}, { timestamps: true });

// Export both models
export const ProductType = mongoose.model('ProductType', productTypeSchema);
export const ProductItem = mongoose.model('ProductItem', productItemSchema);
