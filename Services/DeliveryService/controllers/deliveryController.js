const mongoose = require('mongoose');
const Delivery = require('../models/Delivery');

const assignDelivery = async (req, res) => {
  const { orderId, location } = req.body;
  try {
    // Logic to assign delivery without using Driver model
    const delivery = new Delivery({
      orderId,
      driverId: null, // Set to null or handle differently
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

    // Emit location update to WebSocket
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

module.exports = { assignDelivery, getDeliveryStatus, updateDeliveryStatus, trackDelivery, deleteDelivery, updateDriverLocation };