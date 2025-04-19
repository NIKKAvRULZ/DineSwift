const express = require("express");
const { createCheckoutSession } = require("../controllers/stripecontroller");
const router = express.Router();

// POST request to create a new checkout session
router.post("/create-checkout-session", createCheckoutSession);

module.exports = router;
