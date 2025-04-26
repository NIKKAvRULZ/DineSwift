const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const paymentRoutes = require('./routes/paymentRoutes');
const stripeRoutes = require('./routes/stripeRouter');

// Load environment variables
dotenv.config();
console.log('Environment check:');
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());

// Handle Stripe webhook raw body
app.use('/api/payment/stripe/webhook', express.raw({ type: 'application/json' }));

// Regular body parser for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up routes
app.use('/api/payment', paymentRoutes);
app.use('/api/payment/stripe', stripeRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Payment Service API is running!');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error'
  });
});

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});