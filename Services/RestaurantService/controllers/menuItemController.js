const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// Get all menu items
const getAllMenuItems = async (req, res) => {
    try {
        // Only return menu items with at least one image
        const menuItems = await MenuItem.find({ 
            $or: [
                { images: { $exists: true, $ne: [] } },
                { image: { $exists: true, $ne: '' } }
            ]
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
            $or: [
                { images: { $exists: true, $ne: [] } },
                { image: { $exists: true, $ne: '' } }
            ]
        });
        
        // Log each menu item's rating data
        menuItems.forEach(item => {
            console.log('Menu item rating data:', {
                id: item._id,
                name: item.name,
                rating: item.rating,
                ratingCount: item.ratingCount,
                ratings: item.ratings
            });
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
            images,
            category,
            price,
            isSpicy,
            discount
        } = req.body;

        // Debug logging for image data
        console.log('Received image data:');
        console.log('- image:', image);
        console.log('- images:', JSON.stringify(images));
        console.log('- images is array:', Array.isArray(images));
        console.log('- images length:', images ? images.length : 0);
        console.log('- raw body images:', JSON.stringify(req.body.images));

        const restaurant = await Restaurant.findById(req.params.restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        
        // Normalize images handling
        let imageArray = [];
        
        // First, try to use the 'images' array if provided
        if (images && Array.isArray(images)) {
            imageArray = images.filter(img => img && typeof img === 'string' && img.trim() !== '');
        }
        
        // If no valid images in array but 'image' is provided, use that
        if (imageArray.length === 0 && image && typeof image === 'string' && image.trim() !== '') {
            imageArray = [image];
        }
        
        // Get primary image (first one or empty)
        const primaryImage = imageArray.length > 0 ? imageArray[0] : '';
        
        // Limit to maximum 5 images
        if (imageArray.length > 5) {
            imageArray = imageArray.slice(0, 5);
        }
        
        console.log(`Creating menu item with ${imageArray.length} images:`, imageArray);
        
        const menuItem = new MenuItem({
            name,
            description,
            image: primaryImage, // Set primary image
            images: imageArray,
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
            images,
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

        // Normalize images handling (similar to addMenuItem)
        let imageArray = [];
        
        // First, try to use the 'images' array if provided
        if (images && Array.isArray(images)) {
            imageArray = images.filter(img => img && typeof img === 'string' && img.trim() !== '');
        }
        
        // If no valid images in array but 'image' is provided, use that
        if (imageArray.length === 0 && image && typeof image === 'string' && image.trim() !== '') {
            imageArray = [image];
        }
        
        // If still no images, keep existing ones
        if (imageArray.length === 0) {
            imageArray = menuItem.images || [];
            if (imageArray.length === 0 && menuItem.image) {
                imageArray = [menuItem.image];
            }
        }
        
        // Get primary image (first one or existing or empty)
        const primaryImage = imageArray.length > 0 ? 
            imageArray[0] : 
            (menuItem.image || '');
        
        // Limit to maximum 5 images
        if (imageArray.length > 5) {
            imageArray = imageArray.slice(0, 5);
        }
        
        console.log(`Updating menu item with ${imageArray.length} images:`, imageArray);

        const updatedData = {
            name,
            description,
            image: primaryImage,
            images: imageArray,
            category,
            price,
            isSpicy: isSpicy !== undefined ? isSpicy : menuItem.isSpicy || false,
            discount: discount !== undefined ? discount : menuItem.discount || 0,
            rating: menuItem.rating
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
        const { restaurantId, id } = req.params;
        const { rating, userId = 'anonymous' } = req.body;
        
        // Validate rating
        const numericRating = typeof rating === 'number' ? rating : parseFloat(rating);
        if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
        }

        // Find the menu item
        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        // Verify restaurant ID
        if (menuItem.restaurantId.toString() !== restaurantId) {
            return res.status(400).json({ message: 'Menu item does not belong to this restaurant' });
        }

        // Initialize ratings array if needed
        if (!menuItem.ratings) {
            menuItem.ratings = [];
        }

        // Update or add rating
        let existingRatingIndex = -1;
        if (userId) {
            existingRatingIndex = menuItem.ratings.findIndex(r => 
                r.user && r.user.toString && r.user.toString() === userId.toString()
            );
        }

        if (existingRatingIndex >= 0) {
            menuItem.ratings[existingRatingIndex].value = numericRating;
            menuItem.ratings[existingRatingIndex].timestamp = new Date();
        } else {
            menuItem.ratings.push({ 
                user: userId, 
                value: numericRating,
                timestamp: new Date()
            });
        }

        // Calculate new average rating
        const totalRating = menuItem.ratings.reduce((sum, r) => sum + (parseFloat(r.value) || 0), 0);
        menuItem.rating = parseFloat((totalRating / menuItem.ratings.length).toFixed(1));
        menuItem.ratingCount = menuItem.ratings.length;

        // Save the updated menu item
        await menuItem.save();

        // Send success response with updated menu item
        res.status(200).json({
            message: 'Rating submitted successfully',
            menuItem: {
                _id: menuItem._id,
                name: menuItem.name,
                rating: menuItem.rating,
                ratingCount: menuItem.ratingCount
            }
        });
    } catch (error) {
        console.error('Error in rateMenuItem:', error);
        res.status(500).json({ message: 'Error submitting rating', error: error.message });
    }
};

// Add a comment to a menu item
const addComment = async (req, res) => {
    try {
        const { restaurantId, id } = req.params;
        const { text, userId } = req.body;

        if (!text || !userId) {
            return res.status(400).json({ message: 'Comment text and user ID are required' });
        }

        const menuItem = await MenuItem.findOne({ 
            _id: id,
            restaurantId: restaurantId
        });

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        // Add the new comment
        menuItem.comments.push({
            user: userId,
            text: text,
            timestamp: new Date()
        });

        await menuItem.save();

        res.status(200).json({
            message: 'Comment added successfully',
            menuItem: menuItem
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
};

// Get comments for a menu item
const getComments = async (req, res) => {
    try {
        const { restaurantId, id } = req.params;

        const menuItem = await MenuItem.findOne({ 
            _id: id,
            restaurantId: restaurantId
        });

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.status(200).json({
            comments: menuItem.comments
        });
    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).json({ message: 'Error getting comments', error: error.message });
    }
};

module.exports = {
    getAllMenuItems,
    getRestaurantMenuItems,
    getMenuItem,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    rateMenuItem,
    addComment,
    getComments
};