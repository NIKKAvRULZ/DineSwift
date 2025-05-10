const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Get all payments
router.get('/payments', paymentController.getAllPayments);

// Get single payment
router.get('/payments/:id', paymentController.getPaymentById);

// Create new payment
router.post('/payments', paymentController.createPayment);

// Update payment
router.put('/payments/:id', paymentController.updatePayment);

// Delete payment
router.delete('/payments/:id', paymentController.deletePayment);

module.exports = router;