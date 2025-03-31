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
        const { name, location } = req.body;
        const restaurant = new Restaurant({ name, location });
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
        const { name, location } = req.body;
        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            { name, location },
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

module.exports = {
    getAllRestaurants,
    addRestaurant,
    getRestaurant,
    updateRestaurant,
    deleteRestaurant
};
