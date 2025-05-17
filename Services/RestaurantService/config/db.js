const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Log the connection string (remove in production)
        console.log('Attempting to connect to MongoDB...');
        
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        // Add more detailed error logging
        if (error.code === 'ENOTFOUND') {
            console.error('Could not resolve MongoDB Atlas hostname. Please check your internet connection and connection string.');
        }
        process.exit(1);
    }
};

module.exports = connectDB;