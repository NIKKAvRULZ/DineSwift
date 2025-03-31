const express = require('express');
const router = express.Router();
const {
    getAllRestaurants,
    addRestaurant,
    getRestaurant,
    updateRestaurant,
    deleteRestaurant,
    findNearbyRestaurants
} = require('../controllers/restaurantController');

const {
    getAllMenuItems,
    getRestaurantMenuItems,
    getMenuItem,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
} = require('../controllers/menuItemController');

// Restaurant routes
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

module.exports = router;
