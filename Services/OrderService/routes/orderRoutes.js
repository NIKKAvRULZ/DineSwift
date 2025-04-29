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

// Important: Rating routes need to be before the generic ID routes
// Support multiple methods for compatibility
router.post('/:id/rating', updateRating);
router.put('/:id/rating', updateRating);
router.patch('/:id/rating', updateRating);

// Get order by ID
router.get("/:id", getOrderById);

// Update order
router.put("/:id", updateOrder);

// Delete order
router.delete("/:id", deleteOrder);

// Debug route registration - expanded to show methods more clearly
console.log("Order routes registered:");
router.stack.forEach(r => {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods).join(',')} ${r.route.path}`);
  }
});

export default router;
