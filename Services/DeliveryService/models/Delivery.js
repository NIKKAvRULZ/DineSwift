const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'delivered', 'cancelled'],
    default: 'pending',
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  estimatedDeliveryTime: { type: Date },
});

deliverySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Delivery', deliverySchema);