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

const addRestaurant = async (req, res) => {
    try {
        const { 
            name,
            cuisine,
            image,
            deliveryTime,
            minOrder,
            isOpen,
            address,
            location,
            operatingHours
        } = req.body;
        
        // Validate location data
        if (!location || !location.type || !location.coordinates || 
            location.coordinates.length !== 2) {
            return res.status(400).json({ 
                message: 'Invalid location data. Must provide type "Point" and [longitude, latitude] coordinates'
            });
        }

        // Create new restaurant
        const restaurant = new Restaurant({ 
            name,
            cuisine,
            image,
            deliveryTime,
            minOrder,
            isOpen,
            address,
            location,
            operatingHours
        });
        
        await restaurant.save();
        res.status(201).json(restaurant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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

const updateRestaurant = async (req, res) => {
    try {
        const { 
            name,
            cuisine,
            image,
            deliveryTime,
            minOrder,
            isOpen,
            address,
            location,
            operatingHours
        } = req.body;
        
        // Validate location data if provided
        if (location && (!location.type || !location.coordinates || 
            location.coordinates.length !== 2)) {
            return res.status(400).json({ 
                message: 'Invalid location data. Must provide type "Point" and [longitude, latitude] coordinates'
            });
        }

        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            { 
                name,
                cuisine,
                image,
                deliveryTime,
                minOrder,
                isOpen,
                address,
                location,
                operatingHours
            },
            { new: true }
        ).populate('menuItems');
        
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        res.json(restaurant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        // Delete all menu items associated with this restaurant
        await MenuItem.deleteMany({ restaurantId: req.params.id });
        res.json({ message: 'Restaurant deleted successfully' });
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
    addRestaurant,
    getRestaurant,
    updateRestaurant,
    deleteRestaurant,
    findNearbyRestaurants
};
