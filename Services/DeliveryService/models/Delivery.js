const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'delivered', 'cancelled'],
    default: 'pending',
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
  estimatedDeliveryTime: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 60000), // 30 minutes from now
  },
  restaurantName: {
    type: String,
    default: 'DineSwift Restaurant',
  },
  orderTotal: {
    type: Number,
    default: 32.59,
  },
}, {
  timestamps: true,
});

// Index for geospatial queries
deliverySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Delivery', deliverySchema);