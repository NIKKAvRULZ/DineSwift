import Order from '../models/Order.js';

// Create a new order
export const createOrder = async (req, res) => {
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
            paymentMethod,    
            deliveryAddress,  
            status: status || 'Pending', // <-- use status from body if given, else 'Pending'
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
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get order by ID
export const getOrderById = async (req, res) => {
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
export const updateOrder = async (req, res) => {
    try {
        const { customerId, restaurantId, items, totalAmount, status, paymentMethod, deliveryAddress } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.customerId = customerId;
        order.restaurantId = restaurantId;
        order.items = items;
        order.totalAmount = totalAmount;
        order.status = status;
        
        // Check if these fields are in the request body before updating
        if (paymentMethod) order.paymentMethod = paymentMethod;       
        if (deliveryAddress) order.deliveryAddress = deliveryAddress;
        
        // Save the updated order
        const updatedOrder = await order.save();
           
        res.json(updatedOrder);
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ error: error.message });
    }
};

// Delete order
export const deleteOrder = async (req, res) => {
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

// Update the updateRating method with better debugging
export const updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;
    
    console.log(`Received rating request for order ${id}:`, req.body);
    
    // Validate the request
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Find the order
    const order = await Order.findById(id);
    
    // Check if order exists
    if (!order) {
      console.log(`Order not found with ID: ${id}`);
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log(`Found order: ${order._id}`);
    
    // Update the rating
    order.rating = {
      score: rating,
      feedback: feedback || '',
      createdAt: new Date()
    };
    
    // Save the updated order
    await order.save();
    console.log(`Rating saved for order ${id}`);
    
    res.status(200).json({ 
      message: 'Rating updated successfully',
      order: {
        id: order._id,
        rating: order.rating
      }
    });
  } catch (error) {
    console.error('Error updating order rating:', error);
    res.status(500).json({ message: 'Failed to update rating', error: error.message });
  }
};
