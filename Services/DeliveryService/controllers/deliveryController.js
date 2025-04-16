const Delivery = require('../models/Delivery');
const Driver = require('../models/Driver');

// Calculate distance between two points using Haversine formula (in kilometers)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

exports.assignDelivery = async (req, res) => {
  try {
    console.log('Received request to assign delivery:', req.body);
    const { orderId, driverId, location } = req.body;

    // Validate orderId (ensure it's a non-empty string)
    if (!orderId || typeof orderId !== 'string') {
      console.log('Validation failed: orderId is not a string');
      return res.status(400).json({
        message: 'Validation failed',
        errors: ['orderId must be a non-empty string'],
      });
    }

    // Validate location (GeoJSON Point)
    if (!location || !Array.isArray(location) || location.length !== 2) {
      console.log('Validation failed: invalid location');
      return res.status(400).json({
        message: 'Validation failed',
        errors: ['Location must be an array of [longitude, latitude]'],
      });
    }

    // Check if a delivery already exists for this order
    console.log('Checking for existing delivery with orderId:', orderId);
    const existingDelivery = await Delivery.findOne({ orderId });
    if (existingDelivery) {
      console.log('Delivery already exists:', existingDelivery);
      return res.status(400).json({ message: 'Delivery already exists for this order' });
    }

    let delivery;
    if (driverId) {
      console.log('Manual driver assignment with driverId:', driverId);
      const driver = await Driver.findById(driverId);
      if (!driver) {
        console.log('Driver not found for driverId:', driverId);
        return res.status(404).json({ message: 'Driver not found' });
      }
      if (driver.status !== 'available') {
        console.log('Driver is not available:', driver);
        return res.status(400).json({ message: 'Driver is not available' });
      }

      console.log('Creating delivery with driver:', driverId);
      delivery = new Delivery({
        orderId,
        driverId,
        location: {
          type: 'Point',
          coordinates: location,
        },
        status: 'assigned',
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000),
      });

      console.log('Updating driver status to assigned:', driverId);
      driver.status = 'assigned';
      await driver.save();
    } else {
      console.log('Automatic driver assignment');
      const drivers = await Driver.find({ status: 'available' });
      console.log('Found available drivers:', drivers.length);
      if (drivers.length === 0) {
        console.log('No drivers available, creating pending delivery');
        delivery = new Delivery({
          orderId,
          location: {
            type: 'Point',
            coordinates: location,
          },
          status: 'pending',
          estimatedDeliveryTime: null,
        });
      } else {
        console.log('Finding nearest driver');
        const nearestDriver = drivers.reduce((nearest, driver) => {
          if (!driver.location || !driver.location.coordinates || !Array.isArray(driver.location.coordinates) || driver.location.coordinates.length !== 2) {
            console.warn(`Driver ${driver._id} has invalid location, skipping`);
            return nearest;
          }
          console.log('Driver location:', driver.location);
          const [driverLongitude, driverLatitude] = driver.location.coordinates; // [longitude, latitude]
          const [deliveryLongitude, deliveryLatitude] = location; // [longitude, latitude]
          const distance = calculateDistance(
            deliveryLatitude, // lat1
            deliveryLongitude, // lon1
            driverLatitude, // lat2
            driverLongitude // lon2
          );
          console.log(`Distance to driver ${driver._id}:`, distance);
          return distance < nearest.distance ? { driver, distance } : nearest;
        }, { driver: null, distance: Infinity }).driver;

        if (!nearestDriver) {
          console.log('No drivers with valid locations, creating pending delivery');
          delivery = new Delivery({
            orderId,
            location: {
              type: 'Point',
              coordinates: location,
            },
            status: 'pending',
            estimatedDeliveryTime: null,
          });
        } else {
          console.log('Nearest driver found:', nearestDriver._id);
          delivery = new Delivery({
            orderId,
            driverId: nearestDriver._id,
            location: {
              type: 'Point',
              coordinates: location,
            },
            status: 'assigned',
            estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000),
          });

          console.log('Updating nearest driver status to assigned:', nearestDriver._id);
          nearestDriver.status = 'assigned';
          await nearestDriver.save();
        }
      }
    }

    console.log('Saving delivery:', delivery);
    await delivery.save();

    console.log('Emitting delivery status update');
    const io = req.app.get('socketio');
    io.emit('deliveryStatusUpdated', {
      deliveryId: delivery._id,
      status: delivery.status,
    });

    console.log('Delivery assigned successfully:', delivery);
    res.status(201).json({ message: 'Delivery assigned successfully', delivery });
  } catch (error) {
    console.error('Error assigning delivery:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Rest of the controller functions remain unchanged
exports.getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ status: 'available' });
    res.status(200).json({ drivers });
  } catch (error) {
    console.error('Error fetching available drivers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    // Validate deliveryId format
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(deliveryId)) {
      return res.status(400).json({ message: 'Invalid Delivery ID format' });
    }

    const delivery = await Delivery.findById(deliveryId).populate('driverId');
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.status(200).json(delivery);
  } catch (error) {
    console.error('Error fetching delivery status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { deliveryId } = req.params;

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

    await delivery.save();

    // Emit a Socket.IO event to notify clients about the status update
    const io = req.app.get('socketio');
    io.emit('deliveryStatusUpdated', { deliveryId, status });

    res.status(200).json({ message: 'Delivery status updated', delivery });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};