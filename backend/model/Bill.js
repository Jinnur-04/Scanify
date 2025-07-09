import mongoose from 'mongoose';

// Embed full product details inside each bill item
const billItemSchema = new mongoose.Schema({
  barcode: { type: String, required: true },        // From ProductItem
  name: { type: String, required: true },           // ProductType.name
  brand: { type: String },
  category: { type: String },
  unit: { type: String },
  imageUrl: { type: String },

  originalPrice: { type: Number, required: true },  // ProductType.price
  discount: { type: String },                       // e.g., "5%"
  finalPrice: { type: Number, required: true },     // Price after discount
  qty: { type: Number, required: true }             // Usually 1 per barcode
}, { _id: false });

// Customer subdocument schema
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String }
}, { _id: false });

// Bill schema
const billSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  staff: {
    type: mongoose.Schema.Types.ObjectId,ref: 'Staff',required: true},

  customer: customerSchema,
  total: { type: Number, required: true },

  items: [billItemSchema]
}, {
  timestamps: true
});

export default mongoose.model('Bill', billSchema);
