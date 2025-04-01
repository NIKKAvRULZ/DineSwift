const mongoose = require('mongoose');
const Delivery = require('../models/Delivery');
const Driver = require('../models/Driver');

const assignDelivery = async (req, res) => {
  const { orderId, driverId, location } = req.body;
  try {
    const delivery = new Delivery({
      orderId,
      driverId: driverId || null,
      location: { type: 'Point', coordinates: location },
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000),
    });
    await delivery.save();

    console.log(`Delivery assigned to order ${orderId}`);
    res.status(201).json({ message: 'Delivery assigned', delivery });
  } catch (error) {
    console.error('Error in assignDelivery:', error);
    res.status(500).json({ message: 'Error assigning delivery', error: error.message });
  }
};

const updateDriverLocation = async (req, res) => {
  const { driverId, location } = req.body;
  try {
    const delivery = await Delivery.findOneAndUpdate(
      { driverId, status: 'in_progress' },
      { location: { type: 'Point', coordinates: location } },
      { new: true }
    );
    if (!delivery) return res.status(404).json({ message: 'Active delivery not found for this driver' });

    const io = req.app.get('socketio');
    io.emit('locationUpdate', { driverId, location });

    res.json({ message: 'Location updated', delivery });
  } catch (error) {
    console.error('Error in updateDriverLocation:', error);
    res.status(500).json({ message: 'Error updating location', error: error.message });
  }
};

const getDeliveryStatus = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.deliveryId);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    res.json(delivery);
  } catch (error) {
    console.error('Error in getDeliveryStatus:', error);
    res.status(500).json({ message: 'Error fetching status', error: error.message });
  }
};

const updateDeliveryStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.deliveryId,
      { status },
      { new: true }
    );
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    res.json({ message: 'Status updated', delivery });
  } catch (error) {
    console.error('Error in updateDeliveryStatus:', error);
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};

const trackDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.deliveryId);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    res.json({
      status: delivery.status,
      location: delivery.location.coordinates,
      estimatedDeliveryTime: delivery.estimatedDeliveryTime,
    });
  } catch (error) {
    console.error('Error in trackDelivery:', error);
    res.status(500).json({ message: 'Error tracking delivery', error: error.message });
  }
};

const deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndDelete(req.params.deliveryId);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    res.json({ message: 'Delivery deleted' });
  } catch (error) {
    console.error('Error in deleteDelivery:', error);
    res.status(500).json({ message: 'Error deleting delivery', error: error.message });
  }
};

const getAvailableDrivers = async (req, res) => {
  try {
    const { longitude, latitude } = req.query;
    let query = { status: 'available' };

    if (longitude && latitude) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: 10000, // 10km radius
        },
      };
    }

    const drivers = await Driver.find(query).limit(10);
    res.json({ message: 'Available drivers fetched', drivers });
  } catch (error) {
    console.error('Error in getAvailableDrivers:', error);
    res.status(500).json({ message: 'Error fetching drivers', error: error.message });
  }
};

const getAllDeliveries = async (req, res) => {
  try {
    const { orderId } = req.query; // Optional filter by orderId
    const query = orderId ? { orderId } : {};
    const deliveries = await Delivery.find(query).populate('driverId', 'name'); // Populate driver name
    res.json({ message: 'Deliveries fetched', deliveries });
  } catch (error) {
    console.error('Error in getAllDeliveries:', error);
    res.status(500).json({ message: 'Error fetching deliveries', error: error.message });
  }
};

module.exports = {
  assignDelivery,
  getDeliveryStatus,
  updateDeliveryStatus,
  trackDelivery,
  deleteDelivery,
  updateDriverLocation,
  getAvailableDrivers,
  getAllDeliveries,
};