const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    customerId: { type: String, required: true },
    restaurantId: { type: String, required: true },
    items: [{ name: String, price: Number, quantity: Number }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Accepted", "Preparing", "On the Way", "Delivered"], default: "Pending" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", OrderSchema);