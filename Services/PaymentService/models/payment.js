const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  customerId: {
    type: String,
    required: true,
  },
  restaurantId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "usd",
  },
  status: {
    type: String, 
    enum: ["pending", "succeeded", "failed", "refunded"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["card", "cash"],
    required: true,
  },
  transactionId: {
    type: String,
    sparse: true,  // This allows multiple null values
    unique: true   // Only enforces uniqueness for non-null values
  },
  stripePaymentId: {
    type: String,
    sparse: true,
    unique: true
  },
  stripeSessionId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Payment", PaymentSchema);