require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const restaurantRoutes = require('./routes/restaurantRoutes');

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());  // Allow all origins
app.use(bodyParser.json());
app.use(express.json());

// Database connection
connectDB()
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Check database connection on every request
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(500).json({ 
      message: 'Database connection error', 
      details: 'The server is unable to connect to the database' 
    });
  }
  next();
});

// Routes
app.use('/api', restaurantRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found', 
    path: req.path, 
    method: req.method 
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Restaurant Service is running on port ${PORT}`);
});
