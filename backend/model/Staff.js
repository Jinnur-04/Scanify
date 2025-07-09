import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['Billing', 'Manager', 'Admin'], required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true } // Should be hashed in production
}, {
  timestamps: true
});

export default mongoose.model('Staff', staffSchema);
