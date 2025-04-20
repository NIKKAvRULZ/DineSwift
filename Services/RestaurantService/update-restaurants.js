require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const connectDB = require('./config/db');

// Update all existing restaurants to have reasonable values
const updateRestaurants = async () => {
    try {
        await connectDB();
        console.log('MongoDB connected successfully');
        
        // Find all restaurants
        const restaurants = await Restaurant.find({});
        console.log(`Found ${restaurants.length} restaurants`);
        
        // Update each restaurant with missing fields
        let updatedCount = 0;
        for (const restaurant of restaurants) {
            let needsUpdate = false;
            
            // Check each field and apply a default value if it's missing or has the "Not specified" value
            if (!restaurant.description || restaurant.description === '') {
                restaurant.description = `Enjoy the delicious cuisine at ${restaurant.name} located in ${restaurant.location}.`;
                needsUpdate = true;
            }
            
            if (!restaurant.openingHours || restaurant.openingHours === 'Not specified') {
                restaurant.openingHours = '9:00 AM';
                needsUpdate = true;
            }
            
            if (!restaurant.closingHours || restaurant.closingHours === 'Not specified') {
                restaurant.closingHours = '10:00 PM';
                needsUpdate = true;
            }
            
            if (!restaurant.phoneNumber || restaurant.phoneNumber === 'Not specified') {
                restaurant.phoneNumber = '+94 11 234 5678';
                needsUpdate = true;
            }
            
            if (!restaurant.email || restaurant.email === 'Not specified') {
                restaurant.email = `info@${restaurant.name.toLowerCase().replace(/\s+/g, '')}.com`;
                needsUpdate = true;
            }
            
            if (!restaurant.address || restaurant.address === 'Not specified') {
                restaurant.address = `123 Main Street, ${restaurant.location}`;
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                await restaurant.save();
                updatedCount++;
                console.log(`Updated restaurant: ${restaurant.name}`);
            }
        }
        
        console.log(`Updated ${updatedCount} restaurants with default values`);
        console.log('All restaurants have been updated successfully');
        
        // Close the connection
        mongoose.connection.close();
    } catch (error) {
        console.error('Error updating restaurants:', error);
        process.exit(1);
    }
};

// Run the update function
updateRestaurants(); 