import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useCart } from '../context/CartContext'; // Import useCart
import { useNavigate } from 'react-router-dom';
import defaultItemImage from '../assets/placeholder-menu.png' 
import defaultResImage from '../assets/placeholder-restaurant.png' 
import ImageCarousel from '../components/ImageCarousel';
import API from '../api/apiHandler'; // Import the new API handler
import menuService from '../services/menuService'; // Import menuService

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
  const [isOffline, setIsOffline] = useState(false); // Track online/offline status
  // Add animation control state
  const [animateCards, setAnimateCards] = useState(false);
  // Add hover state for menu items
  const [hoveredItem, setHoveredItem] = useState(null);
  // Add state for comments and comment UI
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [isSubmittingComment, setIsSubmittingComment] = useState({});

  const pageAnimation = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // Staggered animation for menu items
  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const cardAnimation = {
    hidden: { y: 50, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
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
  
  // Track online/offline status
  useEffect(() => {
    // Add network status events
    const handleOnline = () => {
      console.log('🟢 Device is now online');
      setIsOffline(false);
      setToast({
        visible: true,
        message: 'Back online! Syncing your ratings...',
        type: 'success'
      });
      // Try to sync pending ratings when we get back online
      syncPendingRatings();
    };
    
    const handleOffline = () => {
      console.log('🔴 Device is now offline');
      setIsOffline(true);
      setToast({
        visible: true,
        message: 'You are offline. Ratings will be saved locally.',
        type: 'warning'
      });
    };
    
    // Check initial state
    setIsOffline(!navigator.onLine);
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Make syncPendingRatings accessible via useCallback
  const syncPendingRatings = useCallback(async () => {
    try {
      // Skip syncing if we're offline
      if (isOffline) {
        console.log('Device is offline, skipping sync');
        return;
      }
      
      // Get pending ratings
      const pendingRatings = API.getPendingRatings();
      if (Object.keys(pendingRatings).length === 0) return;
      
      console.log('Found pending ratings to sync:', pendingRatings);
      
      // Get token for API requests
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No auth token found, skipping sync of pending ratings');
        return;
      }
      
      // Check if server is reachable first
      const isServerReachable = await API.checkServerConnectivity();
      if (!isServerReachable) {
        console.log('Server not reachable, skipping sync of pending ratings');
        return;
      }
      
      // Try to sync each rating
      let syncedCount = 0;
      
      for (const [itemId, ratingData] of Object.entries(pendingRatings)) {
        try {
          // Only process ratings for the current restaurant
          if (ratingData.restaurantId !== id) continue;
          
          // Submit the rating
          const response = await API.submitRating({
            restaurantId: ratingData.restaurantId,
            menuItemId: itemId,
            rating: ratingData.rating,
            userId: ratingData.userId,
            token
          });
          
          console.log(`Successfully synced rating for item ${itemId}:`, response);
          
          // Remove from pending ratings
          API.removePendingRating(itemId);
          
          // Update menu items
          if (response && response.menuItem) {
            setMenuItems(prevItems => 
              prevItems.map(item => {
                if ((item._id || item.id) === itemId) {
                  return { 
                    ...item, 
                    rating: response.menuItem.rating,
                    ratingCount: response.menuItem.ratingCount,
                    userRating: ratingData.rating
                  };
                }
                return item;
              })
            );
          }
          
          syncedCount++;
        } catch (error) {
          console.error(`Failed to sync rating for item ${itemId}:`, error);
          // Keep in pending ratings for future retry
        }
      }
      
      // Show success notification if any ratings were synced
      if (syncedCount > 0) {
        setToast({
          visible: true,
          message: `${syncedCount} pending ${syncedCount === 1 ? 'rating' : 'ratings'} synced successfully`,
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error syncing pending ratings:', error);
    }
  }, [id, isOffline]); // Add dependencies for useCallback

  // Sync pending ratings when component mounts or when we come back online
  useEffect(() => {
    // Run the sync function
    syncPendingRatings();
    
    // Set up interval to retry every minute
    const intervalId = setInterval(syncPendingRatings, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [syncPendingRatings]); // Use the callback version

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
        const menuItemsWithImages = restaurantMenu.data.filter(item => {
          // Check if there are multiple images
          if (item.images && item.images.length > 0) {
            return item.images.some(img => img && img.trim() !== '');
          }
          // Check for single image
          return item.image && item.image.trim() !== '';
        });
        
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

  // Load comments for a menu item
  const loadComments = useCallback(async (itemId) => {
    try {
      const response = await menuService.getComments(id, itemId);
      setComments(prev => ({
        ...prev,
        [itemId]: response.comments
      }));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }, [id]);

  // Load comments when component mounts
  useEffect(() => {
    if (menuItems.length > 0) {
      menuItems.forEach(item => {
        loadComments(item._id || item.id);
      });
    }
  }, [menuItems, loadComments]);

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
      
      // Find the menu item to get its name
      const menuItem = menuItems.find(item => (item._id || item.id) === itemId);
      if (menuItem) {
        // Show toast
        setToast({
          visible: true,
          message: newFavorites[itemId]
            ? `${menuItem.name} added to favorites`
            : `${menuItem.name} removed from favorites`,
          type: newFavorites[itemId] ? 'success' : 'error'
        });
      }
      
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
  
  // Add to cart handler
  const handleAddToCart = (item) => {
    // Create a complete restaurant info object to ensure restaurantId is passed
    const restaurantInfo = {
      restaurantId: restaurant?._id || id, // Use _id or fallback to route param id
      restaurantName: restaurant?.name,
      deliveryTime: restaurant?.deliveryTime
    };
    
    console.log("Adding to cart with restaurant info:", restaurantInfo);
    
    const itemToAdd = {
      id: item._id || item.id,
      name: item.name,
      price: item.price,
      image: item.image || item.images?.[0],
      specialInstructions: ''
    };
    
    addToCart(itemToAdd, restaurantInfo);
    
    // Show success toast
    setToast({
      visible: true,
      message: `Added ${item.name} to cart`,
      type: 'success'
    });
  };

  // Handle rating item
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
              userRating: rating
            };
          }
          return item;
        })
      );
      
      // If we're offline, save for later and don't attempt API call
      if (isOffline || !navigator.onLine) {
        console.log('Device is offline, saving rating locally only');
        // Save the rating as pending for later sync
        API.savePendingRating({
          menuItemId: itemId,
          rating,
          userId: API.getUserId(user),
          restaurantId: id
        });
        return;
      }
      
      // If we're online, try to submit to server
      const token = localStorage.getItem('token');
      
      // Get user ID
      const userId = API.getUserId(user);
      
      // Submit rating to server using the API handler
      try {
        const response = await API.submitRating({
          restaurantId: id,
          menuItemId: itemId,
          rating,
          userId,
          token
        });
        
        console.log('Rating submitted successfully:', response);
        
        // Update with accurate server data if available
        if (response && response.menuItem) {
          setMenuItems(prevItems => 
            prevItems.map(item => {
              if ((item._id || item.id) === itemId) {
                return { 
                  ...item, 
                  rating: response.menuItem.rating,
                  ratingCount: response.menuItem.ratingCount,
                  userRating: rating
                };
              }
              return item;
            })
          );
          
          // Remove from pending ratings if it was there
          API.removePendingRating(itemId);
        }
      } catch (error) {
        // Handle error for rating submission
        console.log('Error submitting rating:', error);
        
        // If it's a network error, save for later sync
        if (!error.response) {
          // Save the rating as pending for later sync
          API.savePendingRating({
            menuItemId: itemId,
            rating,
            userId,
            restaurantId: id
          });
          
          // Try to sync again after a delay
          setTimeout(() => {
            syncPendingRatings();
          }, 15000); // Try again after 15 seconds
        }
      }
    } catch (error) {
      console.error('Error in rating flow:', error);
    } finally {
      // Clear temporary rating status after 1 second
      setTimeout(() => {
        setTempRatings(prev => {
          const newTemp = { ...prev };
          delete newTemp[itemId];
          return newTemp;
        });
      }, 1000);
    }
  };

  // Handle adding a comment
  const handleAddComment = useCallback(async (itemId) => {
    const commentText = newComments[itemId]?.trim();
    if (!commentText) return;

    try {
      setIsSubmittingComment(prev => ({ ...prev, [itemId]: true }));
      const userId = localStorage.getItem('userId') || 'anonymous';
      
      const response = await menuService.addComment(restaurant._id || id, itemId, {
        text: commentText,
        userId
      });

      if (response && response.menuItem && response.menuItem.comments) {
        // Update comments in state with the new complete comments array
        setComments(prev => ({
          ...prev,
          [itemId]: response.menuItem.comments
        }));

        // Clear comment input
        setNewComments(prev => ({ ...prev, [itemId]: '' }));
        
        // Show success toast
        setToast({
          visible: true,
          message: 'Comment added successfully',
          type: 'success'
        });
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setToast({
        visible: true,
        message: error.message || 'Failed to add comment',
        type: 'error'
      });
    } finally {
      setIsSubmittingComment(prev => ({ ...prev, [itemId]: false }));
    }
  }, [id, restaurant]);

  // Set animate cards true after initial load
  useEffect(() => {
    if (!loading && restaurant) {
      setTimeout(() => {
        setAnimateCards(true);
      }, 300);
    }
  }, [loading, restaurant]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1615719413546-198b25453f85?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1936&q=80')` }}>
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mb-4"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white font-medium text-lg"
          >
            Loading delicious menu...
          </motion.p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1615719413546-198b25453f85?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1936&q=80')` }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl text-center"
        >
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ type: "spring" }}
            className="flex justify-center mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-bold mb-2 text-white">Oops! Something went wrong</h2>
          <p className="text-white/80">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-fixed bg-cover bg-center min-h-screen" style={{ backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.85)), url('https://images.unsplash.com/photo-1615719413546-198b25453f85?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8MHx8&auto=format&fit=crop&w=1936&q=80')` }}>
      <motion.div
        initial="initial"
        animate="animate"
        variants={pageAnimation}
        className="min-h-screen py-12 relative"
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

        {/* Animated food icons in the background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {['🍕', '🍔', '🥗', '🍣', '🍦', '🍷', '🍰'].map((emoji, index) => (
            <motion.div
              key={index}
              initial={{ 
                top: `${Math.random() * 100}%`, 
                left: `${Math.random() * 100}%`,
                opacity: 0,
                scale: 0
              }}
              animate={{ 
                top: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                left: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                opacity: [0, 0.7, 0],
                scale: [0, 1.5, 0],
                rotate: [0, 360]
              }}
              transition={{ 
                duration: 20 + Math.random() * 30,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              className="absolute text-4xl"
              style={{ filter: "blur(1px)" }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        {/* Offline Indicator */}
        <AnimatePresence>
          {isOffline && (
            <motion.div 
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: -50 }}
              className="fixed top-0 left-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-center py-3 z-50 shadow-lg"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>You are currently offline. Your ratings will be saved locally and synced when you're back online.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Restaurant Header */}
          <motion.div 
            variants={itemAnimation}
            className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-8 border border-white"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="relative group">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative overflow-hidden rounded-xl"
                >
                  <img
                    src={restaurant?.image ?? defaultResImage}
                    alt={restaurant?.name}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover transform transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.div>
                
                {/* Restaurant Favorite Heart Icon with enhanced animation */}
                <motion.button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavoriteRestaurant(restaurant?._id || id);
                  }}
                  className="absolute bottom-2 right-2 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 z-10"
                  whileTap={{ scale: 0.8 }}
                  animate={favoriteRestaurants[restaurant?._id || id] ? {
                    scale: [1, 1.3, 1],
                    transition: { duration: 0.4 }
                  } : {}}
                  aria-label={favoriteRestaurants[restaurant?._id || id] ? "Remove from favorites" : "Add to favorites"}
                >
                  {favoriteRestaurants[restaurant?._id || id] ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" className="w-6 h-6">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="red" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  )}
                </motion.button>
              </div>
              
              <div className="flex-1">
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600 mb-2"
                >
                  {restaurant?.name}
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600 max-w-2xl"
                >
                  {restaurant?.description}
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center mb-4 text-gray-600 mt-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>
                    {restaurant?.address?.street && `${restaurant.address.street}, `}
                    {restaurant?.address?.city && `${restaurant.address.city}, `}
                    {restaurant?.address?.state && `${restaurant.address.state}`}
                  </span>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap items-center gap-4 mt-2"
                >
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    <span className="flex items-center text-yellow-600">
                      <span className="text-yellow-500 mr-1">⭐</span>
                      <span className="font-semibold">{restaurant?.rating || "New"}</span>
                    </span>
                  </div>
                  
                  <span className="text-gray-300">•</span>
                  
                  <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-green-700 font-medium">
                      {restaurant?.deliveryTime} min delivery
                    </span>
                  </div>
                  
                  {restaurant?.cuisine && (
                    <>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
                        <span className="text-blue-700 font-medium">
                          {restaurant?.cuisine}
                        </span>
                      </div>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Search Bar with enhanced animation */}
          <motion.div
            variants={itemAnimation}
            className="relative mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-4 pl-14 pr-12 bg-white/90 backdrop-blur-md border border-orange-100 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-300 text-lg"
              />
              <motion.div 
                initial={{ x: 5 }}
                animate={{ x: 0 }}
                className="absolute left-5 top-1/2 transform -translate-y-1/2 text-orange-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </motion.div>
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Categories with enhanced scrollbar and animations */}
          <motion.div 
            variants={itemAnimation}
            className="mb-8 relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
          >
            <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-orange-100">
              <div className="flex gap-3 min-w-max p-1">
                {categories.map(category => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 shadow-sm
                      ${selectedCategory === category
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-200'
                        : 'bg-white text-gray-700 hover:bg-orange-50 border border-orange-100'
                      }`}
                  >
                    {category === 'all' 
                      ? 'All Items' 
                      : category.charAt(0).toUpperCase() + category.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Menu Items Grid with staggered animation */}
          <motion.div
            variants={containerAnimation}
            initial="hidden"
            animate={animateCards ? "show" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredAndSortedItems.map((item, index) => (
              <motion.div
                key={item.id || item._id}
                variants={cardAnimation}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className={`group bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden 
                border-2 ${hoveredItem === (item.id || item._id) ? 'border-orange-400' : 'border-orange-100'} transform transition-all duration-300
                ${hoveredItem === (item.id || item._id) ? 'shadow-2xl shadow-orange-200/40' : 'shadow-lg'}`}
                onMouseEnter={() => setHoveredItem(item.id || item._id)}
                onMouseLeave={() => setHoveredItem(null)}
                layout
              >
                <div className="relative aspect-w-16 aspect-h-12 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-30 group-hover:opacity-60 transition-opacity duration-300 z-10"></div>
                  
                  <motion.div 
                    animate={
                      hoveredItem === (item.id || item._id) 
                        ? { scale: 1.05 } 
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.5 }}
                    className="w-full h-full flex items-center justify-center bg-gray-100"
                  >
                    <ImageCarousel 
                      images={item.images || [item.image]} 
                      defaultImage={defaultItemImage}
                      autoplay={hoveredItem === (item.id || item._id)}
                    />
                  </motion.div>
                  
                  <AnimatePresence>
                    {item.discount > 0 && (
                      <motion.div 
                        initial={{ x: -100 }}
                        animate={{ x: 0 }}
                        className="absolute top-4 left-0 bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-r-lg text-sm font-bold shadow-lg flex items-center z-20"
                        style={{
                          clipPath: "polygon(0 0, 100% 0%, 90% 100%, 0% 100%)"
                        }}
                      >
                        <span className="mr-1">🔥</span>
                        <span>{item.discount}% OFF</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Item Quick Actions - appears on hover with improved design */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: hoveredItem === (item.id || item._id) ? 1 : 0,
                      y: hoveredItem === (item.id || item._id) ? 0 : 20
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20"
                  >
                    <motion.div className="flex justify-between items-center">
                      <span className="text-white font-medium text-lg">{item.name}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAddToCart(item)}
                        className="px-4 py-2 bg-white/90 backdrop-blur-sm text-orange-600 rounded-full shadow-md flex items-center space-x-1 font-medium hover:bg-orange-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Add to Cart</span>
                      </motion.button>
                    </motion.div>
                  </motion.div>
                  
                  {/* Heart Favorite Icon with enhanced animation and positioning */}
                  <motion.button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(item._id || item.id);
                    }}
                    className="absolute top-3 right-3 w-12 h-12 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 z-20 hover:bg-pink-50"
                    whileTap={{ scale: 0.8 }}
                    animate={favoriteItems[item._id || item.id] ? {
                      scale: [1, 1.3, 1],
                      transition: { duration: 0.4 }
                    } : {}}
                  >
                    {favoriteItems[item._id || item.id] ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" className="w-7 h-7">
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="red" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    )}
                  </motion.button>
                </div>
                
                <div className="p-6 relative">
                  {/* Fun food emoji indicator based on category */}
                  <div className="absolute -top-7 left-6 w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center text-2xl">
                    {item.category === 'appetizer' && '🍽️'}
                    {item.category === 'main' && '🍛'}
                    {item.category === 'dessert' && '🍰'}
                    {item.category === 'drink' && '🍹'}
                    {item.category === 'breakfast' && '🍳'}
                    {item.category === 'lunch' && '🥪'}
                    {item.category === 'dinner' && '🍲'}
                    {item.category === 'vegetarian' && '🥗'}
                    {item.category === 'non-vegetarian' && '🥩'}
                    {!['appetizer', 'main', 'dessert', 'drink', 'breakfast', 'lunch', 'dinner', 'vegetarian', 'non-vegetarian'].includes(item.category) && '🍴'}
                  </div>
                  
                  <div className="flex items-center justify-between mb-3 mt-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                        {item.name}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowComments(prev => ({ ...prev, [item._id || item.id]: !prev[item._id || item.id] }));
                        }}
                        className="flex items-center gap-2 px-3 py-1 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-sm font-medium">
                          {comments[item._id || item.id]?.length || 0} Comments
                        </span>
                      </button>
                    </div>
                    <AnimatePresence>
                      {item.isSpicy && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-1 rounded-full text-xs flex items-center shadow-md"
                        >
                          🌶️ Spicy
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {showComments[item._id || item.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 bg-gray-50 rounded-lg p-4"
                      >
                        {/* Comments List */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-gray-700">Comments</h3>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowComments(prev => ({
                                  ...prev,
                                  [item._id || item.id]: {
                                    ...prev[item._id || item.id],
                                    expanded: !prev[item._id || item.id]?.expanded
                                  }
                                }));
                              }}
                              className="text-sm text-orange-500 hover:text-orange-600"
                            >
                              {showComments[item._id || item.id]?.expanded ? 'Show Less' : 'View All Comments'}
                            </button>
                          </div>
                          
                          <div className={`space-y-2 overflow-y-auto transition-all duration-300 ${
                            showComments[item._id || item.id]?.expanded ? 'max-h-96' : 'max-h-40'
                          }`}>
                            {comments[item._id || item.id]?.map((comment, index) => (
                              <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                                <p className="text-gray-700">{comment.text}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {comment.user === 'anonymous' ? 'Anonymous User' : `User ${comment.user}`} • 
                                  {new Date(comment.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                            {(!comments[item._id || item.id] || comments[item._id || item.id].length === 0) && (
                              <p className="text-gray-500 text-center py-2">No comments yet</p>
                            )}
                          </div>

                          {/* Comment Input */}
                          <div className="flex gap-2 mt-4">
                            <input
                              type="text"
                              value={newComments[item._id || item.id] || ''}
                              onChange={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setNewComments(prev => ({
                                  ...prev,
                                  [item._id || item.id]: e.target.value
                                }));
                              }}
                              placeholder="Write a comment..."
                              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddComment(item._id || item.id);
                              }}
                              disabled={isSubmittingComment[item._id || item.id] || !newComments[item._id || item.id]?.trim()}
                              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {isSubmittingComment[item._id || item.id] ? 'Posting...' : 'Post'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="text-gray-600 mb-4 line-clamp-2 min-h-[48px]">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex flex-col">
                      {item.discount > 0 ? (
                        <>
                          <motion.span 
                            className="text-2xl font-bold text-orange-600 flex items-center"
                            animate={{
                              scale: [1, 1.05, 1],
                              transition: { repeat: 0, duration: 0.5 }
                            }}
                          >
                            Rs {(item.price * (1 - item.discount / 100)).toFixed(2)}
                            <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2">Save {item.discount}%</span>
                          </motion.span>
                          <span className="text-sm text-gray-500 line-through">
                            Rs {item.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                          Rs {item.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddToCart(item)}
                      className="px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredAndSortedItems.length === 0 && (
            <motion.div
              variants={itemAnimation}
              className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-xl shadow-md"
            >
              <motion.div 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-400 mb-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </motion.div>
              <motion.h3 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-medium text-gray-900 mb-2"
              >
                No items found
              </motion.h3>
              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600"
              >
                Try selecting a different category or search term
              </motion.p>
              <motion.button
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-md"
              >
                Reset Filters
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Cart Preview with enhanced animation */}
        <AnimatePresence>
          {cartItems.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-orange-100 p-4 z-20"
            >
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center">
                    <div className="relative mr-4">
                      <motion.div
                        className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"
                        whileHover={{ rotate: 10 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </motion.div>
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      >
                        {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                      </motion.div>
                    </div>
                    <div>
                      <div className="text-gray-800 font-medium">Your Order</div>
                      <div className="text-2xl font-bold text-orange-600">
                        Rs {getTotal().toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/cart')}
                    className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>View Cart</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Menu;

