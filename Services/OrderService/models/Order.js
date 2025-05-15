import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
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
        enum: ["Pending", "Accepted", "Preparing", "On the Way", "Delivered"], 
        default: "Pending"
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
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: function(v) {
                return /^\+?[1-9]\d{9,14}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    deliveryNotes: {
        type: String,
        required: false
    },
    customerDetails: {
        name: String,
        email: String,
        phone: String,
        address: String
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },

    // Add rating fields
    rating: {
        score: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },
        feedback: {
            type: String,
            default: ''
        },
        createdAt: {
            type: Date,
            default: null
        }
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;