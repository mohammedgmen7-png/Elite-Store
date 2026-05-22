const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  icon: String,
  description: String,
  packages: [
    {
      name: String, // مثلاً: 100 جم
      price: Number,
      gems: Number // عدد الجواهر
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Game', gameSchema);