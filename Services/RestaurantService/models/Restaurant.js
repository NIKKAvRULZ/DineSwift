const mongoose = require('mongoose');
const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  cuisine: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  deliveryTime: { type: Number, required: true, min: 0 },
  minOrder: { type: Number, required: true, min: 0 },
  isOpen: { type: Boolean, default: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  location: {  
    type: {
      type: String, 
      enum: ['Point'], 
      required: true
    },
    coordinates: {
      type: [Number], 
      required: true
    }
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  menuItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }]
}, { timestamps: true });

// Create a 2dsphere index for geospatial queries
restaurantSchema.index({ location: "2dsphere" });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;