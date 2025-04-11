import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useCart } from '../context/CartContext'; // Import useCart
import { useNavigate } from 'react-router-dom';
import defaultItemImage from '../assets/placeholder-menu.png' 
import defaultResImage from '../assets/placeholder-restaurant.png' 

// Toast component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      } text-white`}
    >
      {message}
    </motion.div>
  );
};

// Set up axios debug interceptors
// Add request interceptor for debugging
axios.interceptors.request.use(request => {
  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    data: request.data,
    headers: request.headers
  });
  return request;
});

// Add response interceptor for debugging
axios.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  error => {
    console.log('Response Error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      } : 'No response',
      request: error.request ? 'Request was made but no response' : 'Request setup error'
    });
    return Promise.reject(error);
  }
);

const Menu = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cartItems, getTotal } = useCart(); // Destructure cartItems and getTotal from useCart
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Destructure addToCart from useCart
  const [favoriteItems, setFavoriteItems] = useState({}); // Track favorite items
  // Add toast state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  // Track temporary ratings for immediate UI feedback
  const [tempRatings, setTempRatings] = useState({});
  // Add state to track user's saved ratings
  const [userRatings, setUserRatings] = useState({});
  // Add search functionality
  const [searchQuery, setSearchQuery] = useState('');
  // Add state to track favorite restaurants
  const [favoriteRestaurants, setFavoriteRestaurants] = useState({});

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

  // Load saved ratings from localStorage
  useEffect(() => {
    try {
      const savedRatings = localStorage.getItem('userRatings');
      if (savedRatings) {
        setUserRatings(JSON.parse(savedRatings));
      }
      
      // Load favorite restaurants from localStorage
      const savedFavoriteRestaurants = localStorage.getItem('favoriteRestaurants');
      if (savedFavoriteRestaurants) {
        setFavoriteRestaurants(JSON.parse(savedFavoriteRestaurants));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);
  
  // Try to sync any pending ratings with the server on component mount
  useEffect(() => {
    const syncPendingRatings = async () => {
      try {
        if (!id) return; // Need restaurant ID
        
        const pendingRatings = JSON.parse(localStorage.getItem('pendingRatings') || '{}');
        if (Object.keys(pendingRatings).length === 0) return; // No pending ratings
        
        console.log('Found pending ratings to sync:', pendingRatings);
        
        const token = localStorage.getItem('token');
        if (!token) return; // Need auth token
        
        // Process each pending rating
        const updatedPendingRatings = {...pendingRatings};
        
        for (const [itemId, ratingData] of Object.entries(pendingRatings)) {
          // Only process ratings for the current restaurant
          if (ratingData.restaurantId !== id) continue;
          
          try {
            const baseUrl = 'http://localhost:5002/api';
            const ratingUrl = `${baseUrl}/restaurants/${id}/menu-items/${itemId}/rate`;
            
            console.log(`Attempting to sync pending rating for item ${itemId}`);
            
            // Send rating to API
            const response = await axios.post(
              ratingUrl,
              { 
                rating: ratingData.rating,
                userId: user?.id || 'anonymous',
                timestamp: ratingData.timestamp
              },
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                }
              }
            );
            
            console.log(`Successfully synced rating for item ${itemId}:`, response.data);
            
            // Remove from pending ratings on success
            delete updatedPendingRatings[itemId];
            
            // Update menu items with server response if available
            if (response.data && response.data.menuItem) {
              setMenuItems(prevItems => 
                prevItems.map(item => {
                  if ((item._id || item.id) === itemId) {
                    return { 
                      ...item, 
                      rating: response.data.menuItem.rating,
                      ratingCount: response.data.menuItem.ratingCount
                    };
                  }
                  return item;
                })
              );
            }
          } catch (error) {
            console.error(`Failed to sync rating for item ${itemId}:`, error);
            // Keep in pending ratings for future retry
          }
        }
        
        // Update localStorage with any remaining pending ratings
        localStorage.setItem('pendingRatings', JSON.stringify(updatedPendingRatings));
        console.log('Updated pending ratings after sync attempt:', updatedPendingRatings);
      } catch (error) {
        console.error('Error syncing pending ratings:', error);
      }
    };
    
    syncPendingRatings();
  }, [id, user?.id]);

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        const token = localStorage.getItem('token');
        const restaurantMenu =  await axios.get(`http://localhost:5002/api/restaurants/${id}/menu-items`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const restaurant =  await axios.get(`http://localhost:5002/api/restaurants/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        console.log(restaurant.data)
        console.log(restaurantMenu.data)

        setRestaurant(restaurant.data);
        
        // Filter out menu items without valid images
        const menuItemsWithImages = restaurantMenu.data.filter(item => 
          item.image && item.image.trim() !== ''
        );
        
        // Apply any user ratings from localStorage to the fetched menu items
        const savedRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');
        const updatedMenuItems = menuItemsWithImages.map(item => {
          const itemId = item._id || item.id;
          // If the user has previously rated this item and it's in localStorage,
          // update the display rating
          if (savedRatings[itemId]) {
            // Don't override server rating, but mark this item as rated by user
            item.userRating = savedRatings[itemId];
          }
          return item;
        });
        
        setMenuItems(updatedMenuItems);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(updatedMenuItems.map(item => item.category))];
        setCategories(['all', ...uniqueCategories]);

        // Load favorites from localStorage
        const savedFavorites = localStorage.getItem('favoriteItems');
        if (savedFavorites) {
          setFavoriteItems(JSON.parse(savedFavorites));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch menu data');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantAndMenu();
  }, [id]); // Add id as dependency to refetch when restaurant ID changes

  // Toggle favorite status for a restaurant
  const toggleFavoriteRestaurant = (restaurantId) => {
    setFavoriteRestaurants(prev => {
      const newFavorites = { 
        ...prev, 
        [restaurantId]: !prev[restaurantId] 
      };
      // Save to localStorage
      localStorage.setItem('favoriteRestaurants', JSON.stringify(newFavorites));
      
      // Show toast
      setToast({
        visible: true,
        message: newFavorites[restaurantId] 
          ? `Added ${restaurant?.name} to favorites` 
          : `Removed ${restaurant?.name} from favorites`,
        type: 'success'
      });
      
      return newFavorites;
    });
  };

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

  // Filter by category and search query, then sort with favorites at the top
  const filteredAndSortedItems = menuItems.filter(item => {
    // Category filter
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    // Search query filter
    const matchesSearch = 
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });
  
  // Sort to put favorited items at the top
  filteredAndSortedItems.sort((a, b) => {
    const aIsFavorite = favoriteItems[a._id || a.id];
    const bIsFavorite = favoriteItems[b._id || b.id];
    
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return 0;
  });
  
  // Add item to the cart
  const handleAddToCart = (item) => {
    addToCart(item, id); // Use addToCart from CartContext
  };

  // Handle rating an item
  const handleRateItem = async (itemId, rating) => {
    try {
      // Always set temporary rating for immediate UI feedback
      setTempRatings(prev => ({ ...prev, [itemId]: rating }));
      
      // Update user ratings state
      setUserRatings(prev => {
        const newRatings = { ...prev, [itemId]: rating };
        // Save to localStorage
        localStorage.setItem('userRatings', JSON.stringify(newRatings));
        return newRatings;
      });
      
      // Immediately update UI optimistically for better UX
      setMenuItems(prevItems => 
        prevItems.map(item => {
          if ((item._id || item.id) === itemId) {
            // Calculate new rating locally for immediate feedback
            const newRatingCount = (item.ratingCount || 0) + 1;
            const newRatingSum = (item.rating || 0) * (item.ratingCount || 0) + Number(rating);
            const newRating = newRatingSum / newRatingCount;
            
            return { 
              ...item, 
              rating: newRating,
              ratingCount: newRatingCount,
              userRating: rating // Store the user's specific rating
            };
          }
          return item;
        })
      );
      
      // Show success notification immediately for better UX
      const itemName = menuItems.find(item => (item._id || item.id) === itemId)?.name;
      setToast({
        visible: true,
        message: `You rated "${itemName}" ${rating} stars!`,
        type: 'success'
      });
      
      // IMPORTANT: Send to backend first with proper error handling
      const token = localStorage.getItem('token');
      const baseUrl = 'http://localhost:5002/api';
      const ratingUrl = `${baseUrl}/restaurants/${id}/menu-items/${itemId}/rate`;
      
      // New approach: Use axios for better consistency with the rest of the app
      try {
        console.log('Sending rating to API:', {
          menuItemId: itemId,
          rating: Number(rating)
        });
        
        const response = await axios.post(
          ratingUrl,
          { 
            rating: Number(rating),
            userId: user?.id || 'anonymous', // Include user ID if available
            timestamp: new Date().toISOString() // Add timestamp for tracking
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          }
        );
        
        console.log('API response for rating:', response.data);
        
        // If API call succeeded, we can use the returned data to update our UI
        if (response.data && response.data.menuItem) {
          // Update with the server's calculated rating
          setMenuItems(prevItems => 
            prevItems.map(item => {
              if ((item._id || item.id) === itemId) {
                return { 
                  ...item, 
                  rating: response.data.menuItem.rating,
                  ratingCount: response.data.menuItem.ratingCount,
                  userRating: rating // Keep the user's rating for display purposes
                };
              }
              return item;
            })
          );
        }
      } catch (apiError) {
        console.error('Failed to submit rating to API:', apiError);
        
        // Fallback approach: Create a backup of ratings if API fails
        try {
          // Store failed ratings for potential future retry
          const pendingRatings = JSON.parse(localStorage.getItem('pendingRatings') || '{}');
          pendingRatings[itemId] = { 
            rating: Number(rating),
            restaurantId: id,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('pendingRatings', JSON.stringify(pendingRatings));
          
          console.log('Saved rating to pendingRatings for future retry:', pendingRatings);
        } catch (storageError) {
          console.error('Error storing pending rating:', storageError);
        }
      }
      
      // Clear temporary rating after a delay
      setTimeout(() => {
        setTempRatings(prev => {
          const newTempRatings = {...prev};
          delete newTempRatings[itemId];
          return newTempRatings;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error in rating flow:', error);
      
      // Clear temporary rating on error
      setTempRatings(prev => {
        const newTempRatings = {...prev};
        delete newTempRatings[itemId];
        return newTempRatings;
      });
      
      // Show error notification
      setToast({
        visible: true,
        message: `Error saving rating: ${error.message}`,
        type: 'error'
      });
    }
  };

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
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast({ visible: false })} 
          />
        )}
      </AnimatePresence>

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
              {/* Restaurant Favorite Heart Icon */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavoriteRestaurant(restaurant?._id || id);
                }}
                className="absolute bottom-1 right-1 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-md transition-all duration-300 hover:scale-110"
                aria-label={favoriteRestaurants[restaurant?._id || id] ? "Remove from favorites" : "Add to favorites"}
              >
                {favoriteRestaurants[restaurant?._id || id] ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" className="w-5 h-5">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="red" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                )}
              </button>
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
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          variants={itemAnimation}
          className="relative mb-8"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pl-12 pr-4 bg-white/90 backdrop-blur-sm border border-orange-100 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-300"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>

        {/* Categories */}
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
                
                {/* Interactive Rating System */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => {
                      const starValue = i + 1;
                      const itemId = item._id || item.id;
                      
                      // Use user's specific rating if available
                      const userRating = userRatings[itemId] || item.userRating;
                      
                      // For display, prioritize: temp rating > user rating > actual rating
                      const displayRating = tempRatings[itemId] || userRating || item.rating || 0;
                      
                      // Determine star appearance: filled, half-filled, or empty
                      let starType;
                      if (starValue <= Math.floor(displayRating)) {
                        starType = 'filled';
                      } else if (starValue <= displayRating + 0.5 && displayRating % 1 !== 0) {
                        starType = 'half';
                      } else {
                        starType = 'empty';
                      }
                      
                      // Determine if this star rating is being saved now
                      const isSubmitting = tempRatings[itemId] === starValue;
                      
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleRateItem(itemId, starValue)}
                          className={`text-2xl focus:outline-none transform transition-all duration-150 hover:scale-125 
                            ${isSubmitting ? 'animate-pulse' : ''}`}
                          title={`Rate ${starValue} stars`}
                          aria-label={`Rate ${starValue} stars`}
                          disabled={isSubmitting}
                        >
                          {starType === 'filled' ? (
                            <span className={`${isSubmitting ? 'text-green-500' : 'text-yellow-400'} hover:text-yellow-500 cursor-pointer`}>★</span>
                          ) : starType === 'half' ? (
                            <span className="text-yellow-400 hover:text-yellow-500 cursor-pointer relative">
                              <span className="absolute text-yellow-400" style={{ width: '50%', overflow: 'hidden' }}>★</span>
                              <span className="text-gray-300">★</span>
                            </span>
                          ) : (
                            <span className="text-gray-300 hover:text-yellow-300 cursor-pointer">★</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {Object.keys(tempRatings).includes(item._id || item.id) 
                      ? 'Saving rating...' 
                      : userRatings[item._id || item.id] || item.userRating
                        ? `Your rating: ${userRatings[item._id || item.id] || item.userRating}`
                        : item.rating
                          ? `${item.rating.toFixed(1)} (${item.ratingCount || 0})`
                          : 'Click to rate'
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    Rs {item.price.toFixed(2)}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAddToCart(item)}
                    className="px-4 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-300"
                  >
                    Add to Cart
                  </motion.button>
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

      {/* Cart Preview */}
      {cartItems.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 p-4"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <span className="text-gray-600">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)} items
              </span>
              <span className="mx-2">•</span>
              <span className="font-semibold">
                Rs {getTotal().toFixed(2)}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/cart')} // Navigate to cart page 
              className="px-6 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-300"
            >
              View Cart
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Menu;
