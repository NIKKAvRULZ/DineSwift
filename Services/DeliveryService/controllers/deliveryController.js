const Delivery = require('../models/Delivery');
const Driver = require('../models/Driver');

// Assign a new delivery
exports.assignDelivery = async (req, res) => {
  try {
    const { orderId, driverId, location } = req.body;

    // Validate input
    if (!orderId || !location || !Array.isArray(location) || location.length !== 2) {
      return res.status(400).json({ message: 'Order ID and location (longitude, latitude) are required' });
    }

    // Validate driverId if provided
    if (driverId) {
      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }
    }

    console.log('Assigning delivery with driverId:', driverId); // Debug

    // Create new delivery
    const delivery = new Delivery({
      orderId,
      driverId, // Save driverId as-is (could be null if not provided)
      location: {
        type: 'Point',
        coordinates: location, // [longitude, latitude]
      },
      status: 'assigned',
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    });

    // Save the delivery to the database
    await delivery.save();

    // If a driver is assigned, update their status to 'assigned'
    if (driverId) {
      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }
      driver.status = 'assigned';
      await driver.save();
    }

    res.status(201).json({ message: 'Delivery assigned successfully', delivery });
  } catch (error) {
    console.error('Error assigning delivery:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get available drivers
exports.getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ status: 'available' });
    res.status(200).json({ drivers });
  } catch (error) {
    console.error('Error fetching available drivers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get delivery status
exports.getDeliveryStatus = async (req, res) => {
  try {
    // Populate the driverId field to include driver details
    const delivery = await Delivery.findById(req.params.deliveryId).populate('driverId');
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    console.log('Fetched delivery:', delivery); // Debug
    res.status(200).json(delivery);
  } catch (error) {
    console.error('Error fetching delivery status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { deliveryId } = req.params; // Get deliveryId from URL params

    // Validate input
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Find the delivery
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Update the status
    delivery.status = status;

    // If the delivery is marked as 'delivered', set the driver's status back to 'available'
    if (status === 'delivered' && delivery.driverId) {
      const driver = await Driver.findById(delivery.driverId);
      if (driver) {
        driver.status = 'available';
        await driver.save();
      }
    }

    // Save the updated delivery
    await delivery.save();
    res.status(200).json({ message: 'Delivery status updated', delivery });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};