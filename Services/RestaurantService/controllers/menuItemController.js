const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// Get all menu items
const getAllMenuItems = async (req, res) => {
    try {
        // Only return menu items with images
        const menuItems = await MenuItem.find({ 
            image: { $exists: true, $ne: '' } 
        }).populate('restaurantId');
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all menu items for a specific restaurant
const getRestaurantMenuItems = async (req, res) => {
    try {
        console.log('Fetching menu items for restaurant:', req.params.restaurantId);
        
        const menuItems = await MenuItem.find({ 
            restaurantId: req.params.restaurantId,
            image: { $exists: true, $ne: '' } // Only return items with images
        });
        
        console.log(`Found ${menuItems.length} menu items with ratings:`, 
            menuItems.map(item => ({
                id: item._id,
                name: item.name,
                rating: item.rating,
                ratingCount: item.ratingCount
            }))
        );
        
        res.json(menuItems);
    } catch (error) {
        console.error('Error fetching restaurant menu items:', error);
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

// Rate a menu item
const rateMenuItem = async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const { rating } = req.body;
        const userId = req.user._id;

        console.log('Rating request received:', {
            menuItemId,
            rating,
            userId: userId.toString()
        });

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            console.log('Invalid rating value:', rating);
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Find the menu item
        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
            console.log('Menu item not found:', menuItemId);
            return res.status(404).json({ message: 'Menu item not found' });
        }

        console.log('Current menu item state:', {
            id: menuItem._id,
            name: menuItem.name,
            currentRating: menuItem.rating,
            ratingCount: menuItem.ratingCount,
            ratings: menuItem.ratings
        });

        // Initialize ratings array if it doesn't exist
        if (!menuItem.ratings) {
            menuItem.ratings = [];
        }

        // Find existing rating by this user
        const existingRatingIndex = menuItem.ratings.findIndex(
            r => r.user.toString() === userId.toString()
        );

        let ratingUpdated = false;
        if (existingRatingIndex >= 0) {
            // Update existing rating
            console.log('Updating existing rating:', {
                oldRating: menuItem.ratings[existingRatingIndex].value,
                newRating: rating
            });
            menuItem.ratings[existingRatingIndex].value = rating;
            ratingUpdated = true;
        } else {
            // Add new rating
            console.log('Adding new rating:', rating);
            menuItem.ratings.push({ user: userId, value: rating });
        }

        // Calculate new average rating
        const totalRating = menuItem.ratings.reduce((sum, r) => sum + r.value, 0);
        const newAverageRating = totalRating / menuItem.ratings.length;
        
        console.log('Rating calculation:', {
            totalRating,
            ratingCount: menuItem.ratings.length,
            newAverageRating
        });

        // Update menu item
        menuItem.rating = newAverageRating;
        menuItem.ratingCount = menuItem.ratings.length;

        // Save changes
        await menuItem.save();

        console.log('Menu item updated successfully:', {
            id: menuItem._id,
            name: menuItem.name,
            newRating: menuItem.rating,
            newRatingCount: menuItem.ratingCount,
            action: ratingUpdated ? 'updated' : 'added'
        });

        res.json({
            message: ratingUpdated ? 'Rating updated successfully' : 'Rating added successfully',
            menuItem: {
                _id: menuItem._id,
                name: menuItem.name,
                rating: menuItem.rating,
                ratingCount: menuItem.ratingCount
            }
        });
    } catch (error) {
        console.error('Error in rateMenuItem:', error);
        res.status(500).json({ message: 'Error updating rating', error: error.message });
    }
};

module.exports = {
    getAllMenuItems,
    getRestaurantMenuItems,
    getMenuItem,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    rateMenuItem
};