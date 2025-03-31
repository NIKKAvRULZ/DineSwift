const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// Get all restaurants
const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find().populate('menuItems');
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single restaurant
const getRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id).populate('menuItems');
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        res.json(restaurant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a new restaurant
const addRestaurant = async (req, res) => {
    try {
        const restaurantData = {
            ...req.body,
            rating: req.body.rating || 0 // Ensure rating has a default value
        };
        
        const restaurant = new Restaurant(restaurantData);
        await restaurant.save();
        res.status(201).json(restaurant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a restaurant
const updateRestaurant = async (req, res) => {
    try {
        console.log('Updating restaurant with data:', req.body);

        const updateData = {
            ...req.body,
            rating: req.body.rating !== undefined ? req.body.rating : 0 // Ensure rating is included
        };

        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('menuItems');
        
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        console.log('Updated restaurant:', restaurant);
        res.json(restaurant);
    } catch (error) {
        console.error('Error updating restaurant:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete a restaurant
const deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Delete all menu items associated with this restaurant
        await MenuItem.deleteMany({ restaurantId: req.params.id });

        // Delete the restaurant
        await Restaurant.findByIdAndDelete(req.params.id);
        res.json({ message: 'Restaurant and associated menu items deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Find nearby restaurants
const findNearbyRestaurants = async (req, res) => {
    try {
        const { longitude, latitude, maxDistance = 5000 } = req.query; // maxDistance in meters, default 5km

        if (!longitude || !latitude) {
            return res.status(400).json({ 
                message: 'Must provide longitude and latitude query parameters' 
            });
        }

        const restaurants = await Restaurant.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        }).populate('menuItems');

        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllRestaurants,
    getRestaurant,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant,
    findNearbyRestaurants
};
