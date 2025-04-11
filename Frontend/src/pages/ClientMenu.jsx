import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import defaultItemImage from '../assets/placeholder-menu.png';
import defaultResImage from '../assets/placeholder-restaurant.png';
import ImageCarousel from '../components/ImageCarousel';
import menuService from '../services/menuService';

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
  const [lastRatingUpdate, setLastRatingUpdate] = useState(null);
  const [userRatings, setUserRatings] = useState({}); // Track user's ratings
  const [isRating, setIsRating] = useState({}); // Track items being rated
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' }); // Toast notifications

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
        setLoading(true);
        // Use the menu service instead of direct axios calls
        const menuItems = await menuService.getMenuItems(id);
        const restaurant = await menuService.getRestaurant(id);
        
        setRestaurant(restaurant);
        
        // Filter out menu items without valid images
        const menuItemsWithImages = menuItems.filter(item => {
          // Check if there are multiple images
          if (item.images && item.images.length > 0) {
            return item.images.some(img => img && img.trim() !== '');
          }
          // Check for single image
          return item.image && item.image.trim() !== '';
        });
        
        // Apply user ratings to the menu items if they exist
        const savedRatings = localStorage.getItem('userRatings');
        let userRatingData = {};
        
        if (savedRatings) {
          try {
            userRatingData = JSON.parse(savedRatings);
            setUserRatings(userRatingData);
            
            // Update menu items with user ratings
            menuItemsWithImages.forEach(item => {
              const itemId = item._id || item.id;
              if (userRatingData[itemId]) {
                item.userRating = userRatingData[itemId];
              }
            });
          } catch (e) {
            console.error('Error parsing saved ratings:', e);
          }
        }
        
        setMenuItems(menuItemsWithImages);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(menuItemsWithImages.map(item => item.category))];
        setCategories(['all', ...uniqueCategories]);

        // Load favorites from localStorage
        const savedFavorites = localStorage.getItem('favoriteItems');
        if (savedFavorites) {
          try {
            setFavoriteItems(JSON.parse(savedFavorites));
          } catch (e) {
            console.error('Error parsing saved favorites:', e);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch menu data');
        console.error('Error fetching menu data:', err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch only
    fetchRestaurantAndMenu();
  }, [id]); // Only run once when component mounts or id changes

  // Set up polling mechanism to fetch updated ratings
  useEffect(() => {
    // Initial fetch
    fetchRestaurantAndMenu();
    
    // Set up polling interval to refresh data
    const intervalId = setInterval(() => {
      fetchUpdatedMenuItems();
    }, 3000); // Poll every 3 seconds
    
    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [id]);
  
  // Function to fetch only updated menu items
  const fetchUpdatedMenuItems = useCallback(async () => {
    try {
      const newMenuItems = await menuService.getMenuItems(id);
      
      // Check if there are any rating changes
      let hasUpdates = false;
      
      // Filter out items without valid images
      const newMenuItemsWithImages = newMenuItems.filter(item => {
        // Check if there are multiple images
        if (item.images && item.images.length > 0) {
          return item.images.some(img => img && img.trim() !== '');
        }
        // Check for single image
        return item.image && item.image.trim() !== '';
      });
      
      // Compare with current menu items to detect rating changes
      const updatedItems = newMenuItemsWithImages.map(newItem => {
        const currentItem = menuItems.find(item => 
          (item._id || item.id) === (newItem._id || newItem.id)
        );
        
        if (currentItem) {
          // If rating or ratingCount has changed
          if (newItem.rating !== currentItem.rating || 
              newItem.ratingCount !== currentItem.ratingCount) {
            hasUpdates = true;
            console.log(`Rating updated for ${newItem.name}: ${currentItem.rating} → ${newItem.rating}`);
          }
        }
        return newItem;
      });
      
      if (hasUpdates) {
        setMenuItems(updatedItems);
        setLastUpdate(new Date().toISOString());
        setRatingUpdateCount(prev => prev + 1);
        console.log('Menu items updated with new ratings');
      }
    } catch (err) {
      console.error('Error fetching updated menu items:', err);
    }
  }, [id, menuItems]);

  // Handle rating an item
  const handleRateItem = useCallback(async (itemId, newRating) => {
    try {
      // Set rating status for this item
      setIsRating(prev => ({ ...prev, [itemId]: true }));
      
      // Get existing item data
      const item = menuItems.find(item => (item._id || item.id) === itemId);
      if (!item) return;
      
      // Store user rating immediately for better UX
      setUserRatings(prev => {
        const newRatings = { ...prev, [itemId]: newRating };
        localStorage.setItem('userRatings', JSON.stringify(newRatings));
        return newRatings;
      });
      
      // Calculate optimistic new rating for display
      const previousRating = item.rating || 0;
      const previousRatingCount = item.ratingCount || 0;
      
      let newRatingCount = previousRatingCount;
      // Only increase count if this is new rating, not updating existing
      if (!userRatings[itemId]) newRatingCount += 1;
      
      const oldRatingTotal = previousRating * previousRatingCount;
      let newRatingTotal;
      
      if (userRatings[itemId]) {
        // Adjust when updating existing rating
        newRatingTotal = oldRatingTotal - userRatings[itemId] + newRating;
      } else {
        // Add new rating to total
        newRatingTotal = oldRatingTotal + newRating;
      }
      
      const optimisticRating = newRatingCount > 0 ? newRatingTotal / newRatingCount : 0;
      
      // Update UI immediately (optimistic)
      setMenuItems(prevItems => 
        prevItems.map(item => {
          if ((item._id || item.id) === itemId) {
            return { 
              ...item, 
              rating: optimisticRating,
              ratingCount: newRatingCount,
              userRating: newRating
            };
          }
          return item;
        })
      );
      
      // Submit to server using menuService
      const response = await menuService.submitRating(id, itemId, newRating);
      
      console.log('Rating submitted successfully:', response);
      
      // Update with actual server data if available
      if (response && response.menuItem) {
        setMenuItems(prevItems => 
          prevItems.map(item => {
            if ((item._id || item.id) === itemId) {
              return { 
                ...item, 
                rating: response.menuItem.rating,
                ratingCount: response.menuItem.ratingCount,
                userRating: newRating
              };
            }
            return item;
          })
        );
      }
      
      // Show success toast
      setToast({
        visible: true,
        message: `You rated "${item.name}" ${newRating} stars!`,
        type: 'success'
      });
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      setToast({
        visible: true,
        message: 'Error submitting rating. Please try again.',
        type: 'error'
      });
    } finally {
      // Clear rating status
      setIsRating(prev => ({ ...prev, [itemId]: false }));
    }
  }, [id, menuItems, userRatings]);

  // Toggle favorite status for an item
  const toggleFavorite = useCallback((itemId) => {
    setFavoriteItems(prev => {
      const newFavorites = { 
        ...prev, 
        [itemId]: !prev[itemId] 
      };
      // Save to localStorage
      localStorage.setItem('favoriteItems', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

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
                <ImageCarousel 
                  images={item.images || [item.image]} 
                  defaultImage={defaultItemImage}
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
                      const itemId = item._id || item.id;
                      
                      // Use user's rating if available
                      const userRating = userRatings[itemId] || item.userRating;
                      
                      // For display, prioritize user rating over item rating
                      const ratingToShow = userRating || item.rating || 0;
                      
                      // Determine star appearance: filled, half-filled, or empty
                      const isFilled = starValue <= Math.floor(ratingToShow);
                      const isHalfFilled = !isFilled && starValue <= ratingToShow + 0.5 && ratingToShow % 1 !== 0;
                      
                      return (
                        <button 
                          key={i} 
                          className="text-lg focus:outline-none"
                          onClick={() => handleRateItem(itemId, starValue)}
                          disabled={isRating[itemId]}
                        >
                          {isFilled ? (
                            <span className="text-yellow-400 hover:text-yellow-500">★</span>
                          ) : isHalfFilled ? (
                            <span className="text-yellow-400 relative hover:text-yellow-500">
                              <span className="absolute text-yellow-400" style={{ width: '50%', overflow: 'hidden' }}>★</span>
                              <span className="text-gray-300">★</span>
                            </span>
                          ) : (
                            <span className="text-gray-300 hover:text-yellow-500">★</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {isRating[item._id || item.id] 
                      ? 'Saving rating...' 
                      : userRatings[item._id || item.id] 
                        ? `Your rating: ${userRatings[item._id || item.id]}`
                        : item.rating 
                          ? `${item.rating.toFixed(1)} (${item.ratingCount || 0})`
                          : 'Click to rate'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    {item.discount > 0 ? (
                      <>
                        <span className="text-lg font-semibold text-gray-900">
                          Rs {(item.price * (1 - item.discount / 100)).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          Rs {item.price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-semibold text-gray-900">
                        Rs {item.price.toFixed(2)}
                      </span>
                    )}
                  </div>
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

      {/* Toast Notification */}
      {toast.visible && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white transition-opacity duration-300 opacity-90 z-50`}
        >
          {toast.message}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ClientMenu; 