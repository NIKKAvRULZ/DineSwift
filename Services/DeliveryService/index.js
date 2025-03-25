const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const deliveryRoutes = require('./routes/deliveryRoutes');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/delivery', deliveryRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Delivery Service running on port ${PORT}`);
});