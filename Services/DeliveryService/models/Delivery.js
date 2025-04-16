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
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'delivered', 'cancelled'],
    default: 'pending',
  },
  estimatedDeliveryTime: {
    type: Date,
    default: null,
  },
});

deliverySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Delivery', deliverySchema);