const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  restaurantName: {
    type: String,
    required: true,
    default: 'DineSwift Restaurant',
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Preparing', 'On the Way', 'Delivered'],
    default: 'Pending',
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
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null,
  },
  estimatedDeliveryTime: {
    type: Date,
  },
  orderTotal: {
    type: Number,
  },
}, {
  timestamps: true,
});

// Index for geospatial queries
deliverySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Delivery', deliverySchema);