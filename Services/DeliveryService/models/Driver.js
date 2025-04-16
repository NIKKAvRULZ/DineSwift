const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: false }, // Phone number (e.g., "+94 771 234 567")
  email: { type: String, required: false },   // Email address (e.g., "driver@example.com")
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

// 2dsphere index for geospatial queries
driverSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);