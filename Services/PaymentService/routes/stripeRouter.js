// Services\PaymentService\routes\stripeRouter.js
const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripecontroller');

// Create checkout session
router.post('/create-checkout-session', stripeController.createCheckoutSession);

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

// Get payment status
router.get('/payment-status/:sessionId', stripeController.getPaymentStatus);

// Refund payment
router.post('/refund/:id', stripeController.refundPayment);

module.exports = router;