require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const stripeRoutes = require("./routes/stripeRouter"); 

// Import your routes

const paymentRoutes = require("./routes/paymentRoutes");


const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/payment", stripeRoutes);
app.use("/api/payment", paymentRoutes); // Endpoint for payment data
  // Endpoint for Stripe checkout sessions, etc.
// Endpoint for Stripe billing portal

// Start server
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`✅ Payment Service running on port ${PORT}`);
});
