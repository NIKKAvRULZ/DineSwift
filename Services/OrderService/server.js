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
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add enhanced request logging for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Request Headers:', req.headers);
  next();
});

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Add this after registering routes but before the catch-all to log all routes
console.log('Registered routes:');
app._router.stack.forEach(function(middleware){
  if(middleware.route){
    // routes registered directly on the app
    const methods = Object.keys(middleware.route.methods)
      .filter(method => middleware.route.methods[method])
      .join(',');
    console.log(`${methods.toUpperCase()} ${middleware.route.path}`);
  } else if(middleware.name === 'router'){
    // router middleware
    middleware.handle.stack.forEach(function(handler){
      if(handler.route){
        const methods = Object.keys(handler.route.methods)
          .filter(method => handler.route.methods[method])
          .join(',');
        const routePath = handler.route.path;
        const fullPath = `${routePath}`;
        console.log(`${methods.toUpperCase()} ${fullPath}`);
      }
    });
  }
});

// Add a specific catching middleware for undefined routes
app.use((req, res, next) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    message: `Cannot ${req.method} ${req.url}`,
    availableRoutes: 'Check server logs for available routes'
  });
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