const Delivery = require('../models/Delivery');
const Driver = require('../models/Driver');
const mongoose = require('mongoose');
const axios = require('axios');

// Assign a delivery
const assignDelivery = async (req, res) => {
  const { orderId, location } = req.body;
  console.log('assignDelivery Input:', { orderId, location }); // Log input
  try {
    // Fetch order details from OrderService
    const orderResponse = await axios.get(`http://localhost:5003/api/orders/${orderId}`);
    const order = orderResponse.data;
    console.log('OrderService Response:', order); // Log OrderService response
    
    // Validate order existence
    if (!order) {
      return res.status(404).json({ message: 'Order not found in OrderService' });
    }

    // Validate order status
    if (!['Pending', 'Accepted', 'Preparing'].includes(order.status)) {
      return res.status(400).json({ message: `Cannot assign delivery for order in status: ${order.status}` });
    }

    // Validate location
    if (!location || !location.type || location.type !== 'Point' || !location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({ message: 'Valid GeoJSON Point location is required' });
    }

    // Check available drivers
    const availableDrivers = await Driver.find({ status: 'available' });
    console.log('Available Drivers:', availableDrivers); // Log all available drivers

    // Find the nearest available driver
    let driver = null;
    try {
      driver = await Driver.findOne({
        status: 'available',
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: location.coordinates },
            $maxDistance: 10000, // 10km radius
          },
        },
      });
      console.log('Nearest Driver Found:', driver); // Log driver result
    } catch (err) {
      console.error('Error finding nearest driver:', err.message);
    }

    let delivery;
    if (driver) {
      // Update driver status and location
      driver.status = 'busy';
      driver.location = location; // Use delivery location as initial driver location
      await driver.save();

      // Create delivery with assigned driver
      delivery = new Delivery({
        orderId,
        driverId: driver._id,
        location, // Use location directly as GeoJSON
        status: 'Accepted',
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60000), // 30 minutes from now
        restaurantName: order.restaurantId, // Use restaurantId as placeholder
        orderTotal: order.totalAmount, // Use actual order total
      });

      await delivery.save();

      // Emit driverLocationUpdate
      req.io.emit('driverLocationUpdate', {
        deliveryId: delivery._id.toString(),
        driverId: driver._id.toString(),
        location: location, // Use delivery location
      });
      console.log(`Emitted driverLocationUpdate for delivery ${delivery._id}`);
    } else {
      // Create delivery without driver
      delivery = new Delivery({
        orderId,
        driverId: null,
        location, // Use location directly as GeoJSON
        status: 'Pending',
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60000), // 30 minutes from now
        restaurantName: order.restaurantId, // Use restaurantId as placeholder
        orderTotal: order.totalAmount, // Use actual order total
      });
      await delivery.save();
    }

    console.log('Delivery Saved:', delivery); // Log saved delivery

    res.status(201).json({
      deliveryId: delivery._id.toString(),
      orderId: delivery.orderId,
      status: delivery.status,
      location: delivery.location,
      driverId: delivery.driverId ? delivery.driverId.toString() : null,
      estimatedDeliveryTime: delivery.estimatedDeliveryTime,
      restaurantName: delivery.restaurantName,
      orderTotal: delivery.orderTotal,
    });
    console.log(`Assigned delivery ${delivery._id} for order ${orderId}`);
  } catch (error) {
    console.error('Error assigning delivery:', error.message);
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'Order not found in OrderService' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get delivery status
const getDeliveryStatus = async (req, res) => {
  const { deliveryId } = req.params;
  try {
    const delivery = await Delivery.findById(deliveryId).populate('driverId');
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    res.json({
      deliveryId: delivery._id.toString(),
      orderId: delivery.orderId,
      status: delivery.status,
      location: delivery.location,
      driver: delivery.driverId ? {
        _id: delivery.driverId._id.toString(),
        name: delivery.driverId.name,
        contact: delivery.driverId.contact,
        email: delivery.driverId.email,
        location: delivery.driverId.location,
      } : null,
      estimatedDeliveryTime: delivery.estimatedDeliveryTime,
      restaurantName: delivery.restaurantName,
      orderTotal: delivery.orderTotal,
    });
    console.log(`Fetched status for delivery ${deliveryId}`);
  } catch (error) {
    console.error('Error fetching delivery status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update delivery status
const updateDeliveryStatus = async (req, res) => {
  const { deliveryId } = req.params;
  const { status } = req.body;
  try {
    const delivery = await Delivery.findById(deliveryId).populate('driverId');
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    delivery.status = status;
    if (status === 'Delivered') {
      if (delivery.driverId) {
        await Driver.findByIdAndUpdate(delivery.driverId, { status: 'available' });
      }
    }
    await delivery.save();
    res.json({
      deliveryId: delivery._id.toString(),
      orderId: delivery.orderId,
      status: delivery.status,
      location: delivery.location,
      driver: delivery.driverId ? {
        _id: delivery.driverId._id.toString(),
        name: delivery.driverId.name,
        contact: delivery.driverId.contact,
        email: delivery.driverId.email,
        location: delivery.driverId.location,
      } : null,
      estimatedDeliveryTime: delivery.estimatedDeliveryTime,
      restaurantName: delivery.restaurantName,
      orderTotal: delivery.orderTotal,
    });
    console.log(`Updated status for delivery ${deliveryId} to ${status}`);
    req.io.emit('deliveryStatusUpdated', {
      deliveryId: delivery._id.toString(),
      status,
      orderId: delivery.orderId,
    });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get available drivers
const getAvailableDrivers = async (req, res) => {
  const { longitude, latitude } = req.query;
  console.log('Query parameters:', { longitude, latitude });
  try {
    // Find drivers who are available and not assigned to active deliveries
    const activeDeliveries = await Delivery.find({
      status: { $in: ['Pending', 'Accepted', 'Preparing', 'On the Way'] },
    }).select('driverId');
    const busyDriverIds = activeDeliveries
      .filter(delivery => delivery.driverId)
      .map(delivery => delivery.driverId.toString());

    const query = {
      status: 'available',
      _id: { $nin: busyDriverIds }, // Exclude drivers with active deliveries
    };
    if (longitude && latitude) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: 10000,
        },
      };
    }
    console.log('MongoDB query:', query);
    const drivers = await Driver.find(query);
    console.log('Found drivers:', drivers);
    res.json(drivers.map(driver => ({
      _id: driver._id.toString(),
      name: driver.name,
      contact: driver.contact,
      email: driver.email,
      location: driver.location,
    })));
    console.log(`Fetched available drivers near [${longitude || 'none'}, ${latitude || 'none'}]`);
  } catch (error) {
    console.error('Error fetching available drivers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Track delivery
const trackDelivery = async (req, res) => {
  const { deliveryId } = req.params;
  try {
    const delivery = await Delivery.findById(deliveryId).populate('driverId');
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    res.json({
      deliveryId: delivery._id.toString(),
      orderId: delivery.orderId,
      status: delivery.status, // Fixed: driver.status -> delivery.status
      location: delivery.location,
      driver: delivery.driverId ? {
        _id: delivery.driverId._id.toString(),
        name: delivery.driverId.name,
        contact: delivery.driverId.contact,
        email: delivery.driverId.email,
        location: delivery.driverId.location,
      } : null,
      estimatedDeliveryTime: delivery.estimatedDeliveryTime,
      restaurantName: delivery.restaurantName,
      orderTotal: delivery.orderTotal,
    });
    console.log(`Tracked delivery ${deliveryId}`);
  } catch (error) {
    console.error('Error tracking delivery:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get active delivery
const getActiveDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({
      status: { $in: ['Pending', 'Accepted', 'On the Way'] },
    }).populate('driverId');
    if (!delivery) {
      return res.status(404).json({ message: 'No active delivery found' });
    }
    res.json({
      deliveryId: delivery._id.toString(),
      orderId: delivery.orderId,
      status: delivery.status,
      location: delivery.location,
      driver: delivery.driverId ? {
        _id: delivery.driverId._id.toString(),
        name: delivery.driverId.name,
        contact: delivery.driverId.contact,
        email: delivery.driverId.email,
        location: delivery.driverId.location,
      } : null,
      estimatedDeliveryTime: delivery.estimatedDeliveryTime,
      restaurantName: delivery.restaurantName,
      orderTotal: delivery.orderTotal,
    });
    console.log(`Fetched active delivery ${delivery._id}`);
  } catch (error) {
    console.error('Error fetching active delivery:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get available orders
const getAvailableOrders = async (req, res) => {
  try {
    // Fetch all pending deliveries without assigned drivers
    const deliveries = await Delivery.find({
      status: 'Pending',
      driverId: null
    }).sort({ createdAt: -1 });

    // Map delivery IDs to fetch corresponding orders
    const deliveryOrders = await Promise.all(deliveries.map(async (delivery) => {
      try {
        // Fetch order details from OrderService
        const orderResponse = await axios.get(`http://localhost:5003/api/orders/${delivery.orderId}`);
        const order = orderResponse.data;

        return {
          deliveryId: delivery._id,
          orderId: delivery.orderId,
          status: delivery.status,
          location: delivery.location,
          estimatedDeliveryTime: delivery.estimatedDeliveryTime,
          restaurantName: order.restaurantId || delivery.restaurantName,
          orderTotal: order.totalAmount || delivery.orderTotal,
          address: order.deliveryAddress || '123 Main St, Colombo'
        };
      } catch (err) {
        console.error(`Error fetching order ${delivery.orderId}:`, err);
        return null;
      }
    }));

    // Filter out any failed order fetches
    const validOrders = deliveryOrders.filter(order => order !== null);

    res.json(validOrders);
  } catch (error) {
    console.error('Error getting available orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a delivery
const deleteDelivery = async (req, res) => {
  const { deliveryId } = req.params;
  try {
    const delivery = await Delivery.findByIdAndDelete(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    // If a driver was assigned, update their status to available
    if (delivery.driverId) {
      await Driver.findByIdAndUpdate(delivery.driverId, { status: 'available' });
    }
    res.status(200).json({ message: 'Delivery deleted successfully' });
    console.log(`Deleted delivery ${deliveryId}`);
  } catch (error) {
    console.error('Error deleting delivery:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  assignDelivery,
  getDeliveryStatus,
  updateDeliveryStatus,
  getAvailableDrivers,
  trackDelivery,
  getActiveDelivery,
  getAvailableOrders,
  deleteDelivery,
};