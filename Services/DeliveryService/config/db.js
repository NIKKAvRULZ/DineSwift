const mongoose = require('mongoose');

const connectDB = async () => {
  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('Mongoose disconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err.message);
  });

  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      writeConcern: {
        w: 'majority',
        wtimeout: 5000,
      },
    });
    console.log('MongoDB connection successful');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;