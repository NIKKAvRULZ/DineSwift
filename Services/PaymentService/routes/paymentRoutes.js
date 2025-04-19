// paymentRoutes.js
const express = require("express");
const { getPayments } = require("../controllers/paymentController"); // Ensure this is the correct path


const router = express.Router();

// Route to fetch payments (admin dashboard)
router.get("/payments", getPayments);  // Ensure this is calling the correct controller function

module.exports = router;
