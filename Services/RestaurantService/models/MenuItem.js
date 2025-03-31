const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String, default: '' },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    isSpicy: { type: Boolean, default: false }
});

const MenuItem = mongoose.model('MenuItem', MenuItemSchema);

module.exports = MenuItem;
