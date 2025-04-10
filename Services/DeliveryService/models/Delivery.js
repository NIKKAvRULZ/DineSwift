const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, required: false }, // Make driverId optional
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'delivered', 'cancelled'],
    default: 'pending',
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // Fixed typo: "requried" -> "required"
  },
  estimatedDeliveryTime: { type: Date },
});

// Explicitly define the 2dsphere index
deliverySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Delivery', deliverySchema);