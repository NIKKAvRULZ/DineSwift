const Order = require("../models/Order");

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const { customerId, restaurantId, items, totalAmount, status, paymentMethod, deliveryAddress } = req.body;
        console.log("Incoming order payload:", req.body);

        // Validate required fields
        if (!customerId || !restaurantId || !items || !totalAmount || !paymentMethod || !deliveryAddress) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['customerId', 'restaurantId', 'items', 'totalAmount', 'paymentMethod', 'deliveryAddress']
            });
        }

        // Validate items array
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Items must be a non-empty array' });
        }

        const newOrder = new Order({
            customerId,
            restaurantId,
            items,
            totalAmount,
            status: status || "pending",
            paymentMethod,
            deliveryAddress
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ 
            error: 'Failed to create order',
            details: error.message 
        });
    }
};

// Get all orders
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update order
exports.updateOrder = async (req, res) => {
    try {
        const { customerId, restaurantId, items, totalAmount, status } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.customerId = customerId;
        order.restaurantId = restaurantId;
        order.items = items;
        order.totalAmount = totalAmount;
        order.status = status;

        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete order
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        await order.deleteOne();
        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
