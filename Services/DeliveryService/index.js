require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const deliveryRoutes = require('./routes/deliveryRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/delivery', deliveryRoutes);

const PORT = process.env.PORT || 5004;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Delivery Service running on port ${PORT}`));
};

startServer();