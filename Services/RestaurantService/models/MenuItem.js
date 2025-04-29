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

// Define a schema for comments
const CommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and string for anonymous users
        required: true
    },
    text: {
        type: String,
        required: true,
        maxlength: 500
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
    image: { type: String }, // Keep single image field for backward compatibility
    images: [{ type: String }], // Array of up to 5 images for slideshow
    category: { type: String, required: true },
    price: { type: Number, required: true },
    isSpicy: { type: Boolean, default: false },
    discount: { type: Number, min: 0, max: 100, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, default: 0 },
    ratings: {
        type: [RatingSchema],
        default: []
    },
    comments: {
        type: [CommentSchema],
        default: []
    }
});

// Add a validation to limit the number of images to 5
MenuItemSchema.path('images').validate(function(value) {
    return value.length <= 5;
}, 'A maximum of 5 images is allowed.');

const MenuItem = mongoose.model('MenuItem', MenuItemSchema);

module.exports = MenuItem;
