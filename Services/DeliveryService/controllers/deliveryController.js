const Delivery = require('../models/Delivery');
const Driver = require('../models/Driver');
const mongoose = require('mongoose');

// Assign a delivery
const assignDelivery = async (req, res) => {
  const { orderId, driverId, location } = req.body;
  try {
    const delivery = new Delivery({
      orderId,
      driverId: driverId ? new mongoose.Types.ObjectId(driverId) : null,
      location: { type: 'Point', coordinates: location },
      status: driverId ? 'assigned' : 'pending',
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60000), // 30 minutes from now
      restaurantName: 'DineSwift Restaurant', // Hardcoded, replace with actual data
      orderTotal: 32.59, // Hardcoded, replace with actual data
    });
    await delivery.save();
    if (driverId) {
      await Driver.findByIdAndUpdate(driverId, { status: 'busy' });
    }
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
    console.error('Error assigning delivery:', error);
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
    if (status === 'delivered' || status === 'cancelled') {
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
  try {
    const query = { status: 'available' };
    if (longitude && latitude) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: 10000, // 10km
        },
      };
    }
    const drivers = await Driver.find(query);
    res.json(drivers.map(driver => ({
      _id: driver._id.toString(),
      name: driver.name,
      contact: driver.contact,
      email: driver.email,
      location: driver.location,
    })));
    console.log(`Fetched available drivers near [${longitude}, ${latitude}]`);
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
      status: { $in: ['pending', 'assigned', 'in_progress'] },
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

module.exports = {
  assignDelivery,
  getDeliveryStatus,
  updateDeliveryStatus,
  getAvailableDrivers,
  trackDelivery,
  getActiveDelivery,
};