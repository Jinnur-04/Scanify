import mongoose from 'mongoose';

const paymentMappingSchema = new mongoose.Schema({
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    required: true,
    unique: true,
  },
  razorpayOrderId: {
    type: String,
    required: true,
  },
});

export default mongoose.model('PaymentMapping', paymentMappingSchema);
