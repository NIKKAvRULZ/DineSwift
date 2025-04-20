const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String, default: '' },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    isSpicy: { type: Boolean, default: false },
    discount: { type: Number, min: 0, max: 100, default: 0 }, // Percentage discount
    rating: { type: Number, min: 0, max: 5, default: 0 }
});

const MenuItem = mongoose.model('MenuItem', MenuItemSchema);

module.exports = MenuItem;
