const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// Get all menu items
const getAllMenuItems = async (req, res) => {
    try {
        const menuItems = await MenuItem.find().populate('restaurantId');
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all menu items for a specific restaurant
const getRestaurantMenuItems = async (req, res) => {
    try {
        const menuItems = await MenuItem.find({ restaurantId: req.params.restaurantId });
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single menu item
const getMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id).populate('restaurantId');
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a new menu item
const addMenuItem = async (req, res) => {
    try {
        const { 
            name,
            description,
            image,
            category,
            price,
            isSpicy,
            discount
        } = req.body;

        const restaurant = await Restaurant.findById(req.params.restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        
        const menuItem = new MenuItem({
            name,
            description,
            image,
            category,
            price,
            isSpicy: isSpicy || false,
            discount: discount || 0,
            rating: 0,  // Initialize with 0 rating
            restaurantId: restaurant._id
        });
        
        await menuItem.save();
        
        restaurant.menuItems.push(menuItem._id);
        await restaurant.save();
        
        res.status(201).json(menuItem);
    } catch (error) {
        console.error('Error adding menu item:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update a menu item
const updateMenuItem = async (req, res) => {
    try {
        const { 
            name,
            description,
            image,
            category,
            price,
            isSpicy,
            discount
        } = req.body;

        // Validate required fields
        if (!name || !category || price === undefined) {
            return res.status(400).json({ 
                message: 'Name, category, and price are required fields' 
            });
        }

        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        const updatedData = {
            name,
            description,
            image,
            category,
            price,
            isSpicy: isSpicy || false,
            discount: discount || 0,
            rating: menuItem.rating // ✅ Now menuItem is already fetched
        };

        // Update the menu item
        const updatedMenuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true, runValidators: true }
        ).populate('restaurantId');
        
        res.json(updatedMenuItem);
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ error: error.message });
    }
};


// Delete a menu item
const deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        // Remove the menu item reference from the restaurant
        const restaurant = await Restaurant.findById(menuItem.restaurantId);
        if (restaurant) {
            restaurant.menuItems = restaurant.menuItems.filter(
                item => item.toString() !== req.params.id
            );
            await restaurant.save();
        }

        await MenuItem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllMenuItems,
    getRestaurantMenuItems,
    getMenuItem,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
};