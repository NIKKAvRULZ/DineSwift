import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import defaultItemImage from '../assets/placeholder-menu.png';
import defaultResImage from '../assets/placeholder-restaurant.png';

const ClientMenu = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteItems, setFavoriteItems] = useState({}); // Track favorite items
  const [lastUpdate, setLastUpdate] = useState(0); // Track last update time
  const [ratingUpdateCount, setRatingUpdateCount] = useState(0); // Track rating updates

  const pageAnimation = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        // No token required for client view
        const restaurantMenu = await axios.get(`http://localhost:5002/api/restaurants/${id}/menu-items`);
        const restaurant = await axios.get(`http://localhost:5002/api/restaurants/${id}`);
        
        setRestaurant(restaurant.data);
        
        // Filter out menu items without valid images
        const menuItemsWithImages = restaurantMenu.data.filter(item => 
          item.image && item.image.trim() !== ''
        );
        
        // Check if any ratings have changed
        const hasRatingChanges = menuItemsWithImages.some((newItem, index) => {
          const currentItem = menuItems[index];
          if (!currentItem) return false;
          
          const ratingChanged = newItem.rating !== currentItem.rating;
          const countChanged = newItem.ratingCount !== currentItem.ratingCount;
          
          if (ratingChanged || countChanged) {
            console.log('Rating change detected:', {
              itemId: newItem._id,
              name: newItem.name,
              oldRating: currentItem.rating,
              newRating: newItem.rating,
              oldCount: currentItem.ratingCount,
              newCount: newItem.ratingCount
            });
            return true;
          }
          return false;
        });
        
        if (hasRatingChanges) {
          console.log('Updating menu items with new ratings');
          setRatingUpdateCount(prev => prev + 1);
        }
        
        setMenuItems(menuItemsWithImages);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(menuItemsWithImages.map(item => item.category))];
        setCategories(['all', ...uniqueCategories]);

        // Load favorites from localStorage
        const savedFavorites = localStorage.getItem('favoriteItems');
        if (savedFavorites) {
          setFavoriteItems(JSON.parse(savedFavorites));
        }

        // Update last update time
        setLastUpdate(Date.now());
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch menu data');
        console.error('Error fetching menu data:', err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchRestaurantAndMenu();

    // Set up polling every 3 seconds (more frequent to catch rating updates)
    const pollInterval = setInterval(fetchRestaurantAndMenu, 3000);

    // Clean up interval on unmount
    return () => clearInterval(pollInterval);
  }, [id]);

  // Toggle favorite status for an item
  const toggleFavorite = (itemId) => {
    setFavoriteItems(prev => {
      const newFavorites = { 
        ...prev, 
        [itemId]: !prev[itemId] 
      };
      // Save to localStorage
      localStorage.setItem('favoriteItems', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  // Filter by category and sort with favorites at the top
  const filteredAndSortedItems = selectedCategory === 'all'
    ? [...menuItems]
    : menuItems.filter(item => item.category === selectedCategory);
  
  // Sort to put favorited items at the top
  filteredAndSortedItems.sort((a, b) => {
    const aIsFavorite = favoriteItems[a._id || a.id];
    const bIsFavorite = favoriteItems[b._id || b.id];
    
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 text-center"
        >
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageAnimation}
      className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Restaurant Header */}
        <motion.div 
          variants={itemAnimation}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={restaurant?.image ?? defaultResImage}
                alt={restaurant?.name}
                className="w-24 h-24 rounded-xl object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {restaurant?.name}
              </h1>
              <p className="text-gray-600">{restaurant?.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center">
                  <span className="text-yellow-400 mr-1">⭐</span>
                  {restaurant?.rating}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">
                  {restaurant?.deliveryTime} min delivery
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400 text-sm">
                  Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
                  {ratingUpdateCount > 0 && (
                    <span className="ml-2 text-green-500">
                      (Ratings updated {ratingUpdateCount} times)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Categories */}
        {categories.length > 0 && (
          <motion.div 
            variants={itemAnimation}
            className="flex gap-4 overflow-x-auto pb-4 mb-8"
          >
            {categories.map(category => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-orange-50'
                } transition-all duration-300 shadow-sm`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Menu Items Grid */}
        <motion.div
          variants={pageAnimation}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredAndSortedItems.map(item => (
            <motion.div
              key={item.id || item._id}
              variants={itemAnimation}
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-orange-100"
            >
              <div className="relative h-60">
                <img
                  src={item.image ?? defaultItemImage}
                  alt={item.name}
                  className="w-full h-full object-contain bg-gray-50 p-2"
                />
                {item.discount > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-tr-lg rounded-bl-lg text-sm font-bold shadow-md">
                    {item.discount}% OFF
                  </div>
                )}
                
                {/* Heart Favorite Icon */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(item._id || item.id);
                  }}
                  className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-md transition-all duration-300 hover:scale-110"
                >
                  {favoriteItems[item._id || item.id] ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" className="w-6 h-6">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="red" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {item.name}
                  </h3>
                  {item.isSpicy && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                      🌶️ Spicy
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {item.description}
                </p>
                {/* Display Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => {
                      const starValue = i + 1;
                      const itemRating = item.rating || 0;
                      const isFilled = starValue <= Math.floor(itemRating);
                      const isHalfFilled = !isFilled && starValue <= itemRating + 0.5 && itemRating % 1 !== 0;
                      
                      return (
                        <span key={i} className="text-lg">
                          {isFilled ? (
                            <span className="text-yellow-400">★</span>
                          ) : isHalfFilled ? (
                            <span className="text-yellow-400 relative">
                              <span className="absolute text-yellow-400" style={{ width: '50%', overflow: 'hidden' }}>★</span>
                              <span className="text-gray-300">★</span>
                            </span>
                          ) : (
                            <span className="text-gray-300">★</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {item.rating ? `${item.rating.toFixed(1)} (${item.ratingCount || 0} ratings)` : 'Not rated yet'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    Rs {item.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredAndSortedItems.length === 0 && (
          <motion.div
            variants={itemAnimation}
            className="text-center py-12"
          >
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No items found
            </h3>
            <p className="text-gray-600">
              Try selecting a different category
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ClientMenu; 