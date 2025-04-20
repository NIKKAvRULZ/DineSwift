const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'busy'],
    default: 'available',
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
}, {
  timestamps: true,
});

// Index for geospatial queries
driverSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);