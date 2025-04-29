import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { config } from 'dotenv';

const app = express();
config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make sure CORS is configured to allow all required methods
app.use(cors({
  origin: [
    'http://localhost:5173', // Frontend development server
    'http://localhost:3000', // Any other frontend
    // Add any other allowed origins
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add this before registering routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Add this after registering routes to catch undefined routes
app.use((req, res, next) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected');
    // Start the server only after successful DB connection
    const PORT = process.env.PORT || 5003;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.log(`DB connection error: ${error.message}`));