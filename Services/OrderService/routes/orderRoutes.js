import express from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    updateRating
} from '../controllers/orderController.js';

const router = express.Router();

// Create a new order
router.post("/", createOrder);

// Get all orders
router.get("/", getOrders);

// Rating route - MUST come before the general ID route to avoid conflicts
router.put('/:id/rating', updateRating);

// Get order by ID
router.get("/:id", getOrderById);

// Update order
router.put("/:id", updateOrder);

// Delete order
router.delete("/:id", deleteOrder);

// Debug route registration
console.log("Order routes registered:", router.stack.map(r => 
  `${Object.keys(r.route.methods).join(',')} ${r.route.path}`
).join('\n'));

export default router;
