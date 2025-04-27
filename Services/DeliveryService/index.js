const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const deliveryRoutes = require('./routes/deliveryRoutes');
require('dotenv').config(); // Load .env variables

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

// Simulated driver location updates
setInterval(async () => {
  try {
    const Delivery = require('./models/Delivery'); // Import here to avoid loading before DB connection
    const Driver = require('./models/Driver');
    const delivery = await Delivery.findOne({
      status: { $in: ['assigned', 'in_progress'] },
    }).populate('driverId');
    if (delivery && delivery.driverId) {
      const newCoords = [
        delivery.driverId.location.coordinates[0] + (Math.random() - 0.5) * 0.001,
        delivery.driverId.location.coordinates[1] + (Math.random() - 0.5) * 0.001,
      ];
      await Driver.findByIdAndUpdate(delivery.driverId._id, {
        location: { type: 'Point', coordinates: newCoords },
      });
      io.emit('driverLocationUpdate', {
        deliveryId: delivery._id.toString(),
        driverId: delivery.driverId._id.toString(),
        location: { type: 'Point', coordinates: newCoords },
      });
      console.log(`Emitting driverLocationUpdate for delivery ${delivery._id}`);
    } else {
      console.log('No active delivery with assigned driver found');
    }
  } catch (error) {
    console.error('Error emitting driverLocationUpdate:', error.message);
  }
}, 10000);

// MongoDB connection with retry logic
const connectWithRetry = () => {
  console.log('Attempting to connect to MongoDB Atlas...');
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      writeConcern: { w: 'majority', wtimeout: 5000 },
    })
    .then(() => {
      console.log('Connected to MongoDB Atlas');
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error.message);
      setTimeout(connectWithRetry, 5000); // Retry every 5 seconds
    });
};

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});
mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected');
});
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err.message);
});

// Start MongoDB connection
connectWithRetry();

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