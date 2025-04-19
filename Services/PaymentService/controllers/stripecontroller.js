const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); 
const express = require("express");
const router = express.Router();

// Create Checkout Session endpoint
const createCheckoutSession = async (req, res) => {
  try {
    // Create a checkout session with payment details
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],  // Payment method type
      line_items: [
        {
          price_data: {
            currency: "LKR", // Currency of the transaction
            product_data: {
              name: req.body.name, // Name of the product
              images: [req.body.image], // Image of the product
            },
            unit_amount: req.body.price * 100, // Price in cents (e.g., 25.00 USD = 2500 cents)
          },
          quantity: req.body.quantity, // Quantity of the product
        },
      ],
      mode: "payment", // Payment mode (can be subscription, payment, etc.)
      success_url: `${process.env.CLIENT_URL}/success`, // Redirect URL for successful payments
      cancel_url: `${process.env.CLIENT_URL}/cancel`,  // Redirect URL for canceled payments
    });

    // Send back the URL of the session to redirect the user to Stripe's hosted Checkout page
    res.json({ url: session.url });
  } catch (err) {
    console.error("Error creating Stripe checkout session:", err);
    res.status(500).json({ error: err.message });
  }
};

// Export the controller function
module.exports = { createCheckoutSession };
