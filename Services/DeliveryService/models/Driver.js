const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: false }, // Phone number
  email: { type: String, required: false },   // Email address
  status: {
    type: String,
    enum: ['available', 'assigned', 'in_progress', 'offline'],
    default: 'available',
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
});

// Explicitly define the 2dsphere index
driverSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);