const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  gameName: {
    type: String,
    required: true
  },
  playerID: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  packageType: {
    type: String,
    required: true
  },
  paymentProof: {
    type: String,
    required: true // صورة الإشعار
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  rejectionReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  notes: String
});

module.exports = mongoose.model('Order', orderSchema);