const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const deliveryRoutes = require('./routes/deliveryRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Pass Socket.IO instance to controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/delivery', deliveryRoutes);

// Simulated driver location updates (replace with real driver updates)
setInterval(async () => {
  try {
    const delivery = await mongoose.model('Delivery').findOne({
      status: { $in: ['assigned', 'in_progress'] },
    }).populate('driverId');
    if (delivery && delivery.driverId) {
      // Simulate driver movement
      const newCoords = [
        delivery.driverId.location.coordinates[0] + (Math.random() - 0.5) * 0.001,
        delivery.driverId.location.coordinates[1] + (Math.random() - 0.5) * 0.001,
      ];
      await mongoose.model('Driver').findByIdAndUpdate(delivery.driverId._id, {
        location: { type: 'Point', coordinates: newCoords },
      });
      io.emit('driverLocationUpdate', {
        deliveryId: delivery._id.toString(),
        driverId: delivery.driverId._id.toString(),
        location: { type: 'Point', coordinates: newCoords },
      });
      console.log(`Emitting driverLocationUpdate for delivery ${delivery._id}`);
    }
  } catch (error) {
    console.error('Error emitting driverLocationUpdate:', error);
  }
}, 10000); // Every 10 seconds

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/DineSwift', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Start server
const PORT = process.env.PORT || 5004;
server.listen(PORT, () => {
  console.log(`DeliveryService running on port ${PORT}`);
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected to Socket.IO');
  socket.on('disconnect', () => {
    console.log('Client disconnected from Socket.IO');
  });
});