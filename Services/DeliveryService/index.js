require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const deliveryRoutes = require('./routes/deliveryRoutes');
const http = require('http');
const { Server } = require('socket.io');
const Delivery = require('./models/Delivery');
const Driver = require('./models/Driver');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/delivery', deliveryRoutes);

const PORT = process.env.PORT || 5004;

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

const simulateDriverMovement = async (io) => {
  try {
    const activeDeliveries = await Delivery.find({
      status: { $in: ['assigned', 'in_progress'] },
      driverId: { $ne: null },
    }).populate('driverId');

    for (const delivery of activeDeliveries) {
      const driver = delivery.driverId;
      if (!driver) continue;

      if (!driver.location || !driver.location.coordinates || !Array.isArray(driver.location.coordinates)) {
        console.warn(`Driver ${driver._id} is missing a valid location. Skipping movement simulation.`);
        continue;
      }

      const [longitude, latitude] = driver.location.coordinates;
      const newLongitude = longitude + (Math.random() - 0.5) * 0.001;
      const newLatitude = latitude + (Math.random() - 0.5) * 0.001;

      driver.location.coordinates = [newLongitude, newLatitude];
      await driver.save();

      io.emit('driverLocationUpdate', {
        deliveryId: delivery._id,
        driverId: driver._id,
        location: {
          lat: newLatitude,
          lng: newLongitude,
        },
      });
    }
  } catch (error) {
    console.error('Error simulating driver movement:', error);
  }
};

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: '*',
      },
    });

    io.on('connection', (socket) => {
      console.log('a user connected');
      socket.on('disconnect', () => {
        console.log('user disconnected');
      });
    });

    app.set('socketio', io);

    setInterval(() => simulateDriverMovement(io), 10000);

    server.listen(PORT, () => console.log(`Delivery Service running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();