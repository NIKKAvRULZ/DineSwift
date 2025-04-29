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

// Error handling middleware specifically for image URL issues
const handleImageUrlErrors = (err, req, res, next) => {
    if (err.message && err.message.includes('Invalid URL')) {
        return res.status(400).json({ 
            error: 'Invalid image URL provided. Please check the URL format.' 
        });
    }
    next(err);
};

router.use(handleImageUrlErrors);

// Menu item routes with proper error catching
router.post('/restaurants/:restaurantId/menu-items', (req, res, next) => {
    try {
        // Validate image URLs if present
        if (req.body.image) {
            // Basic URL validation
            new URL(req.body.image);
        }
        if (req.body.images && Array.isArray(req.body.images)) {
            req.body.images.forEach(url => {
                if (url) new URL(url);
            });
        }
        addMenuItem(req, res, next);
    } catch (error) {
        next(error);
    }
});

// Menu item routes
router.get('/menu-items', getAllMenuItems);
router.get('/restaurants/:restaurantId/menu-items', getRestaurantMenuItems);
router.get('/menu-items/:id', getMenuItem);
router.put('/menu-items/:id', updateMenuItem);
router.delete('/menu-items/:id', deleteMenuItem);
router.post('/restaurants/:restaurantId/menu-items/:id/rate', rateMenuItem);

module.exports = router;
