const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    customerId: { 
        type: String, 
        required: true 
    },
    restaurantId: { 
        type: String, 
        required: true 
    },
    items: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
    }],
    totalAmount: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["pending", "confirmed", "preparing", "ready", "delivering", "delivered"], 
        default: "pending" 
    },
    paymentMethod: { 
        type: String, 
        required: true,
        enum: ['card', 'cash']
    },
    deliveryAddress: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("Order", OrderSchema);