/*const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const paymentRoutes = require("./routes/paymentRoutes");

dotenv.config();  // Load environment variables from .env

const app = express();

// Connect to MongoDB with error handling
connectDB().catch((err) => {
  console.error("MongoDB Connection Failed:", err);
  process.exit(1); // Exit if DB connection fails
});

// Middleware
app.use(cors());
app.use(express.json());  // Parse incoming JSON requests

// Routes
app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`✅ PaymentService running on port ${PORT}`));
*/


require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); // Import DB connection
const paymentRoutes = require("./routes/paymentRoutes"); // Import routes

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/payments", paymentRoutes);

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`✅ Payment Service running on port ${PORT}`);
});
