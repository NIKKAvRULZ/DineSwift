require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const deliveryRoutes = require('./routes/deliveryRoutes');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/delivery', deliveryRoutes);

const PORT = process.env.PORT || 5004;

const startServer = async () => {
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

  server.listen(PORT, () => console.log(`Delivery Service running on port ${PORT}`));
};

startServer();