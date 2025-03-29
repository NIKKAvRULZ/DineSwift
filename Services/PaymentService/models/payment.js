/*const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ['Credit Card', 'Debit Card', 'PayPal'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    transactionId: {
      type: String,
      unique: true,  // If you want this to be unique, ensure you generate it.
      required: false,  // Make it optional if not always required
      default: function() {
        return 'txn-' + new Date().getTime(); // Example of generating a unique transactionId
      }
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", PaymentSchema);
module.exports = Payment;*/


const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  status: { type: String, default: "Pending" },
  transactionId: { type: String, required: true },
});

module.exports = mongoose.model("Payment", paymentSchema);

