/*const Payment = require("../models/payment");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const paymentValidationSchema = require("../validators/paymentValidator");

// 🔹 Create Payment (with Stripe)
exports.createPayment = async (req, res) => {
    const { error } = paymentValidationSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const { userId, orderId, amount, method } = req.body;

        // 🔹 Create Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency: "usd",
            payment_method_types: ["card"],
            metadata: { orderId, userId, method },
        });

        // 🔹 Save Payment in Database
        const newPayment = new Payment({
            userId,
            orderId,
            amount,
            method,
            status: "Pending",
            transactionId: paymentIntent.id,
        });

        await newPayment.save();

        res.status(201).json({
            message: "Payment initiated",
            clientSecret: paymentIntent.client_secret,
            payment: newPayment,
        });
    } catch (error) {
        console.error("❌ Payment Error:", error.message);
        res.status(500).json({ message: "Payment failed", error: error.message });
    }
};

// 🔹 Get All Payments
exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.find();
        if (!payments.length) return res.status(404).json({ message: "No payments found" });
        res.status(200).json(payments);
    } catch (error) {
        console.error("❌ Error fetching payments:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 🔹 Get Payment by ID
exports.getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: "Payment not found" });
        res.status(200).json(payment);
    } catch (error) {
        console.error("❌ Error fetching payment:", error.message);
        res.status(500).json({ error: "Invalid payment ID or server error" });
    }
};

// 🔹 Update Payment
exports.updatePayment = async (req, res) => {
    try {
        const allowedUpdates = ["status", "method"];
        const updates = Object.keys(req.body);

        const isValidUpdate = updates.every(update => allowedUpdates.includes(update));
        if (!isValidUpdate) return res.status(400).json({ message: "Invalid update fields" });

        const updatedPayment = await Payment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedPayment) return res.status(404).json({ message: "Payment not found" });

        res.status(200).json(updatedPayment);
    } catch (error) {
        console.error("❌ Error updating payment:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 🔹 Delete Payment
exports.deletePayment = async (req, res) => {
    try {
        const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
        if (!deletedPayment) return res.status(404).json({ message: "Payment not found" });
        res.status(200).json({ message: "Payment deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔹 Handle Stripe Webhook
exports.paymentWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
        const event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
        console.log("🔹 Stripe Event Received:", event.type);

        if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata.orderId;

            const updatedPayment = await Payment.findOneAndUpdate(
                { orderId },
                { status: "Completed", transactionId: paymentIntent.id },
                { new: true }
            );

            console.log("✅ Payment confirmed:", updatedPayment);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error("❌ Webhook Error:", error.message);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
};
*/



const Payment = require("../models/payment");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Set your Stripe Secret Key
const paymentValidationSchema = require("../validators/paymentValidator");

// Create Payment (with Stripe)
exports.createPayment = async (req, res) => {
    const { error } = paymentValidationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const { userId, orderId, amount, method } = req.body;

        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency: "usd",
            payment_method_types: ["card"],
            metadata: { orderId, userId, method },
        });

        // Save the payment details in MongoDB
        const newPayment = new Payment({
            userId,
            orderId,
            amount,
            method,
            status: "Pending", // Initially pending until confirmation
            transactionId: paymentIntent.id,
        });

        await newPayment.save();

        res.status(201).json({
            message: "Payment initiated",
            clientSecret: paymentIntent.client_secret,
            payment: newPayment,
        });
    } catch (error) {
        console.error("❌ Payment Error:", error.message);
        res.status(500).json({ message: "Payment failed", error: error.message });
    }
};

// Get All Payments
exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.find();
        if (!payments.length) {
            return res.status(404).json({ message: "No payments found" });
        }
        res.status(200).json(payments);
    } catch (error) {
        console.error("❌ Error fetching payments:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get Payment by ID
exports.getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: "Payment not found" });
        res.status(200).json(payment);
    } catch (error) {
        console.error("❌ Error fetching payment:", error.message);
        res.status(500).json({ error: "Invalid payment ID or server error" });
    }
};

// Update Payment
exports.updatePayment = async (req, res) => {
    try {
        const allowedUpdates = ["status", "method"];
        const updates = Object.keys(req.body);

        const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));
        if (!isValidUpdate) return res.status(400).json({ message: "Invalid update fields" });

        const updatedPayment = await Payment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedPayment) return res.status(404).json({ message: "Payment not found" });

        res.status(200).json(updatedPayment);
    } catch (error) {
        console.error("❌ Error updating payment:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete Payment
exports.deletePayment = async (req, res) => {
    try {
        const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
        if (!deletedPayment) return res.status(404).json({ message: "Payment not found" });
        res.status(200).json({ message: "Payment deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Handle Payment Confirmation via Webhook (for Stripe)
exports.paymentWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log("🔹 Stripe Event Received:", event.type);

        if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata.orderId;

            const updatedPayment = await Payment.findOneAndUpdate(
                { orderId },
                { status: "Completed", transactionId: paymentIntent.id },
                { new: true }
            );

            console.log("✅ Payment confirmed:", updatedPayment);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error("❌ Webhook Error:", error.message);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
};
