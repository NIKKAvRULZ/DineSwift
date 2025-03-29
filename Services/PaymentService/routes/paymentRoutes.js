const express = require("express");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

// Payment CRUD Routes
router.post("/webhook", express.raw({ type: "application/json" }), paymentController.paymentWebhook);
router.post("/webhook", paymentController.paymentWebhook); 
router.post("/", paymentController.createPayment);
router.get("/", paymentController.getPayments);
router.get("/:id", paymentController.getPaymentById);
router.put("/:id", paymentController.updatePayment);
router.delete("/:id", paymentController.deletePayment);

// Stripe Webhook Route


module.exports = router;
