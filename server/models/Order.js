const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant: { name: String, value: String },
});

const statusHistorySchema = new mongoose.Schema({
  status: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  location: String,
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
  },
  pricing: {
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  coupon: {
    code: String,
    discount: Number,
  },
  payment: {
    method: { type: String, enum: ['stripe', 'razorpay', 'cod'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    transactionId: String,
    paidAt: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  statusHistory: [statusHistorySchema],
  estimatedDelivery: Date,
  deliveredAt: Date,
  notes: String,
  isReviewed: { type: Boolean, default: false },
}, { timestamps: true });

// Auto-generate Order ID
orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    this.orderId = 'SZ-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
