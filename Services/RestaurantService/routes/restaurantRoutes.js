const express = require('express');
const router = express.Router();
const {
    getAllRestaurants,
    addRestaurant,
    getRestaurant,
    updateRestaurant,
    deleteRestaurant,
    findNearbyRestaurants,
    getCuisineTypes
} = require('../controllers/restaurantController');

const {
    getAllMenuItems,
    getRestaurantMenuItems,
    getMenuItem,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    rateMenuItem
} = require('../controllers/menuItemController');

const mongoose = require('mongoose');

// Enhanced health check endpoint for connectivity testing
router.get('/health', (req, res) => {
    try {
        // Check database connection through mongoose
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        
        // Return detailed health status
        res.status(200).json({ 
            status: 'ok', 
            message: 'Server is running',
            timestamp: new Date().toISOString(),
            database: dbStatus,
            version: '1.0.0'
        });
    } catch (error) {
        // Still return 200 to show the server is up, even if some components have issues
        res.status(200).json({ 
            status: 'degraded',
            message: 'Server is running with issues',
            error: error.message
        });
    }
});

// Simple ping endpoint (very lightweight) - no database check
router.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

// Restaurant routes
router.get('/restaurants/cuisines', getCuisineTypes);
router.get('/restaurants', getAllRestaurants);
router.post('/restaurants', addRestaurant);
router.get('/restaurants/nearby', findNearbyRestaurants);
router.get('/restaurants/:id', getRestaurant);
router.put('/restaurants/:id', updateRestaurant);
router.delete('/restaurants/:id', deleteRestaurant);

// Menu item routes
router.get('/menu-items', getAllMenuItems);
router.get('/restaurants/:restaurantId/menu-items', getRestaurantMenuItems);
router.get('/menu-items/:id', getMenuItem);
router.post('/restaurants/:restaurantId/menu-items', addMenuItem);
router.put('/menu-items/:id', updateMenuItem);
router.delete('/menu-items/:id', deleteMenuItem);
router.post('/restaurants/:restaurantId/menu-items/:id/rate', rateMenuItem);

module.exports = router;
