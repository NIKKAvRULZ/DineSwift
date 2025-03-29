const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, default: '' },
    openingHours: { type: String, default: 'Not specified' },
    closingHours: { type: String, default: 'Not specified' },
    phoneNumber: { type: String, default: 'Not specified' },
    email: { type: String, default: 'Not specified' },
    address: { type: String, default: 'Not specified' },
    menuItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
}, {
    timestamps: true
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
