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
        
        // Log parameters to help debug
        console.log('Rating request received:', {
            menuItemId: id,
            restaurantId,
            rating: typeof rating === 'number' ? rating : parseFloat(rating),
            userId,
            body: JSON.stringify(req.body)
        });

        // Validate rating - make sure it's a number between 1-5
        const numericRating = typeof rating === 'number' ? rating : parseFloat(rating);
        if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            console.log('Invalid rating value:', rating, 'Type:', typeof rating);
            return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
        }

        // Find the menu item
        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            console.log('Menu item not found:', id);
            return res.status(404).json({ message: 'Menu item not found' });
        }

        // Make sure restaurant IDs match
        if (menuItem.restaurantId.toString() !== restaurantId) {
            console.log('Restaurant ID mismatch:', {
                expectedId: menuItem.restaurantId.toString(),
                providedId: restaurantId
            });
            return res.status(400).json({ message: 'Menu item does not belong to this restaurant' });
        }

        console.log('Current menu item state before rating:', {
            id: menuItem._id,
            name: menuItem.name,
            currentRating: menuItem.rating || 0,
            ratingCount: menuItem.ratingCount || 0,
            hasRatingsArray: !!menuItem.ratings,
            ratingsCount: menuItem.ratings ? menuItem.ratings.length : 0
        });

        // Initialize ratings array if it doesn't exist
        if (!menuItem.ratings) {
            console.log('Initializing empty ratings array');
            menuItem.ratings = [];
        }

        // Find existing rating by this user if userId exists
        let existingRatingIndex = -1;
        if (userId) {
            existingRatingIndex = menuItem.ratings.findIndex(r => {
                return r.user && r.user.toString && r.user.toString() === userId.toString();
            });
        }

        let ratingUpdated = false;
        if (existingRatingIndex >= 0) {
            // Update existing rating
            console.log('Updating existing rating:', {
                oldRating: menuItem.ratings[existingRatingIndex].value,
                newRating: numericRating
            });
            menuItem.ratings[existingRatingIndex].value = numericRating;
            menuItem.ratings[existingRatingIndex].timestamp = new Date();
            ratingUpdated = true;
        } else {
            // Add new rating
            console.log('Adding new rating:', numericRating);
            menuItem.ratings.push({ 
                user: userId, 
                value: numericRating,
                timestamp: new Date()
            });
        }

        // Calculate new average rating with safeguards
        let totalRating = 0;
        try {
            totalRating = menuItem.ratings.reduce((sum, r) => sum + (parseFloat(r.value) || 0), 0);
        } catch (e) {
            console.error('Error calculating total rating:', e);
            totalRating = numericRating; // Fallback if reduce fails
        }
        
        const newAverageRating = menuItem.ratings.length > 0 
            ? totalRating / menuItem.ratings.length 
            : 0;
        
        console.log('Rating calculation:', {
            totalRating,
            ratingCount: menuItem.ratings.length,
            newAverageRating
        });

        // Update menu item with safeguards
        try {
            menuItem.rating = parseFloat(newAverageRating.toFixed(1)); // Round to 1 decimal place
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
        } catch (saveError) {
            console.error('Error saving menuItem:', saveError);
            
            // Fallback: If save fails, try updating directly without ratings array
            try {
                await MenuItem.findByIdAndUpdate(id, {
                    $set: {
                        rating: parseFloat(newAverageRating.toFixed(1)),
                        ratingCount: menuItem.ratings ? menuItem.ratings.length : 1
                    }
                });
                
                return res.json({
                    message: 'Rating saved (fallback method)',
                    menuItem: {
                        _id: menuItem._id,
                        name: menuItem.name,
                        rating: parseFloat(newAverageRating.toFixed(1)),
                        ratingCount: menuItem.ratings ? menuItem.ratings.length : 1
                    }
                });
            } catch (fallbackError) {
                console.error('Fallback update also failed:', fallbackError);
                throw fallbackError; // Re-throw to be caught by outer catch
            }
        }
    } catch (error) {
        console.error('Error in rateMenuItem:', error);
        console.error('Error stack:', error.stack);
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