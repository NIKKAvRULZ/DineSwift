const mongoose = require('mongoose');

// Define a schema for individual ratings
const RatingSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and string for anonymous users
        required: true 
    },
    value: { 
        type: Number, 
        required: true,
        min: 1,
        max: 5
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

const MenuItemSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true },
    description: { type: String },
    images: [{ type: String }], // Changed from single image to array of images
    category: { type: String, required: true },
    price: { type: Number, required: true },
    isSpicy: { type: Boolean, default: false },
    discount: { type: Number, min: 0, max: 100, default: 0 }, // Percentage discount
    rating: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, default: 0 }, // Track number of ratings
    ratings: {
        type: [RatingSchema],
        default: []
    }
});

const MenuItem = mongoose.model('MenuItem', MenuItemSchema);

module.exports = MenuItem;
