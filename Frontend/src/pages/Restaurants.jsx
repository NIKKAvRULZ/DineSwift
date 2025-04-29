import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // import useLocation
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import RestaurantCard from '../components/RestaurantCard';

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

const Restaurants = ({ isClientView = false }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // get location
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  // Add toast state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Create event listener for favoriteToggled custom event
  useEffect(() => {
    const handleFavoriteToggle = (event) => {
      const { restaurantName, isFavorite } = event.detail;
      setToast({
        visible: true,
        message: isFavorite 
          ? `Added ${restaurantName} to favorites` 
          : `Removed ${restaurantName} from favorites`,
        type: 'success'
      });
    };

    // Add event listener
    window.addEventListener('favoriteToggled', handleFavoriteToggle);

    // Clean up the event listener
    return () => {
      window.removeEventListener('favoriteToggled', handleFavoriteToggle);
    };
  }, []);

  console.log("User in Restaurants:", user);

  useEffect(() => {
    // Only require authentication if not in client view mode
    if (!isClientView && !isAuthenticated) {
      navigate('/login', { state: { from: '/restaurants' } });
      return;
    }
    
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get('session_id');
    const sendSuccessEmail = async (email) => {
      try {
        await axios.post('http://localhost:5006/api/notifications/send', {
          to: email,
          subject: "DineSwift",
          message: "Payment is successful..",
          type: "email"
        });
        console.log('Success email sent!');
      } catch (err) {
        console.error('Failed to send success email:', err);
      }
    };
    if (sessionId && user?.email) {
      sendSuccessEmail(user.email);
    }

    fetchRestaurants();

  
  }, [isClientView, isAuthenticated, navigate, location.search, user]);

  const fetchRestaurants = async () => {
    try {
      // Don't require token for client view
      let response;
      if (isClientView) {
        response = await axios.get('http://localhost:5002/api/restaurants');
      } else {
        const token = localStorage.getItem('token');
        response = await axios.get('http://localhost:5002/api/restaurants', {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Log response data to check menuItems and discount information
      console.log('Restaurant API response:', response.data);
      if (response.data.length > 0) {
        console.log('First restaurant menuItems:', response.data[0].menuItems);
        const hasDiscounts = response.data.some(restaurant => 
          restaurant.menuItems && restaurant.menuItems.some(item => item.discount > 0)
        );
        console.log('Any restaurant has discounted items:', hasDiscounts);
      }
      
      // Remove this filtering that hides restaurants without menu items
      // const restaurantsWithMenuItems = response.data.filter(restaurant => 
      //   restaurant.menuItems && restaurant.menuItems.length > 0
      // );
      // setRestaurants(restaurantsWithMenuItems);
      
      // Show all restaurants
      setRestaurants(response.data);
    } catch (err) {
      if (!isClientView && err.response?.status === 401) {
        navigate('/login', { state: { from: '/restaurants' } });
      } else {
        setError('Failed to fetch restaurants');
        console.error('Error fetching restaurants:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants
    .filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCuisine = selectedCuisine === 'all' || restaurant.cuisine === selectedCuisine;
      return matchesSearch && matchesCuisine;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'deliveryTime') return a.deliveryTime - b.deliveryTime;
      if (sortBy === 'price') return a.minOrder - b.minOrder;
      return 0;
    });

  const cuisines = ['all', ...new Set(restaurants.map(r => r.cuisine))];

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
      <motion.div 
        animate={{ 
          rotate: 360,
          boxShadow: ["0px 0px 0px rgba(255, 126, 0, 0.2)", "0px 0px 30px rgba(255, 126, 0, 0.6)", "0px 0px 0px rgba(255, 126, 0, 0.2)"]
        }}
        transition={{ 
          rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
          boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
        className="w-20 h-20 rounded-full border-4 border-orange-500 border-t-transparent mb-8"
      />
      
      {/* Animated plate under the spinner */}
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-white/30 backdrop-blur-sm -z-10"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Add a "plate rim" decoration around the spinner */}
      <motion.div
        className="absolute w-36 h-36 rounded-full border-2 border-dashed border-orange-300 -z-20"
        animate={{
          rotate: 360,
          scale: [1, 1.05, 1]
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <motion.h3 
          className="text-orange-600 text-xl font-semibold mb-2"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Loading delicious options...
        </motion.h3>
        <p className="text-gray-600">Preparing your culinary experience</p>
      </motion.div>
      
      {/* Animated food emojis */}
      {['🍔', '🍕', '🍣', '🥗', '🍰', '🍜', '🍦', '🥪', '🍉'].map((emoji, index) => (
        <motion.div
          key={index}
          className="text-3xl absolute"
          initial={{ 
            x: Math.random() * 100 - 50,
            y: -100, 
            opacity: 0,
            rotate: Math.random() * 30 - 15
          }}
          animate={{ 
            y: 800,
            opacity: [0, 1, 1, 0],
            x: Math.random() * 300 - 150 + index * 40,
            rotate: Math.random() * 60 - 30
          }}
          transition={{ 
            duration: 3 + Math.random() * 2, 
            repeat: Infinity, 
            delay: index * 0.3,
            ease: "easeIn"
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          boxShadow: [
            "0px 10px 25px rgba(0, 0, 0, 0.1)",
            "0px 20px 35px rgba(255, 0, 0, 0.2)",
            "0px 10px 25px rgba(0, 0, 0, 0.1)"
          ]
        }}
        transition={{ 
          duration: 0.6,
          boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
        className="relative text-red-600 text-xl bg-white/90 backdrop-blur-md p-10 rounded-xl border border-red-100 max-w-md"
      >
        <motion.div
          className="absolute -top-4 -right-4 bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          animate={{ 
            rotate: [0, 5, 0, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          ⚠️
        </motion.div>
        
        <motion.h3
          className="text-2xl font-bold mb-3 text-red-600"
          animate={{ x: [0, -3, 0, 3, 0] }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Oops! Something went wrong
        </motion.h3>
        
        <p>{error}</p>
        
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#ef4444" }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 px-5 py-2 bg-red-500 text-white rounded-lg"
          onClick={() => window.location.reload()}
        >
          Try Again
        </motion.button>
      </motion.div>
      
      {/* Background elements */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-red-500/10"
          style={{
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
          }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0
          }}
          animate={{
            opacity: [0, 0.3, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  return (
    <motion.div 
      initial="initial" 
      animate="animate" 
      className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100 py-12 relative overflow-hidden"
    >
      {/* Enhanced decorative background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-repeat opacity-5" 
          style={{ backgroundImage: "url('https://i.imgur.com/8MmE3tY.png')", backgroundSize: '300px' }}></div>
        
        {/* Abstract food pattern overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <pattern id="foodPattern" patternUnits="userSpaceOnUse" width="100" height="100" patternTransform="rotate(10)">
            <path d="M10,10 Q30,30 50,10 T90,10" stroke="#ff6b6b" fill="none" strokeWidth="2"/>
            <circle cx="20" cy="40" r="5" fill="#ffa502"/>
            <circle cx="70" cy="60" r="8" fill="#ff6b6b"/>
            <rect x="40" y="70" width="15" height="15" fill="#ffa502" rx="2"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#foodPattern)"/>
        </svg>
        
        {/* Animated gradient overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 to-red-500/10"
          animate={{ 
            opacity: [0.3, 0.5, 0.3], 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 8,
            ease: "easeInOut" 
          }}
        />
      </div>
      
      {/* Enhanced floating food icons */}
      <motion.div 
        className="absolute top-20 right-20 text-6xl drop-shadow-md hidden md:block"
        animate={{ 
          y: [0, 15, 0], 
          rotate: [0, 5, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 5,
          ease: "easeInOut" 
        }}
      >
        🍕
      </motion.div>
      
      <motion.div 
        className="absolute bottom-40 left-20 text-6xl drop-shadow-md hidden md:block"
        animate={{ 
          y: [0, -15, 0], 
          rotate: [0, -5, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 6,
          ease: "easeInOut" 
        }}
      >
        🍔
      </motion.div>
      
      <motion.div 
        className="absolute top-1/2 right-40 text-6xl drop-shadow-md hidden md:block"
        animate={{ 
          y: [0, 20, 0], 
          rotate: [0, 8, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 7,
          ease: "easeInOut" 
        }}
      >
        🥗
      </motion.div>
      
      <motion.div 
        className="absolute bottom-20 right-1/3 text-6xl drop-shadow-md hidden md:block"
        animate={{ 
          y: [0, 10, 0], 
          rotate: [0, -3, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 4.5,
          ease: "easeInOut" 
        }}
      >
        🍷
      </motion.div>
      
      <motion.div 
        className="absolute top-40 left-1/4 text-6xl drop-shadow-md hidden md:block"
        animate={{ 
          y: [0, -10, 0], 
          rotate: [0, 6, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 5.5,
          ease: "easeInOut" 
        }}
      >
        🍰
      </motion.div>
      
      {/* Decorative circles */}
      <motion.div 
        className="absolute top-1/4 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-yellow-300/20 to-orange-300/20 blur-xl hidden lg:block"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute bottom-1/4 right-10 w-40 h-40 rounded-full bg-gradient-to-r from-red-300/20 to-pink-300/20 blur-xl hidden lg:block"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.h1 
            className="text-5xl font-bold text-gray-900 mb-4"
            animate={{ 
              textShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 2px 5px rgba(0,0,0,0.1)", "0px 0px 0px rgba(0,0,0,0)"]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {isClientView ? "Our Restaurant Menu" : "Restaurants Near You"}
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {isClientView ? "Browse our delicious menu and place your order!" : "Discover the best food & drinks in your area"}
          </motion.p>
        </motion.div>

        {/* Enhanced Search and Filter Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-6 mb-12 border border-orange-100 max-w-4xl mx-auto"
          whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <motion.div className="flex-1 relative" whileHover={{ scale: 1.02 }}>
              <motion.div 
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"
                animate={{ x: [0, 2, 0, -2, 0] }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </motion.div>
              <input 
                type="text" 
                placeholder="Search for restaurant or cuisine..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 px-4 py-3 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300" 
              />
              {searchTerm && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm('')}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              )}
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }}>
              <select 
                value={selectedCuisine} 
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white transition-all duration-300 appearance-none"
                style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%23f97316\" stroke-width=\"2\"><path d=\"M6 9l6 6 6-6\"/></svg>')", backgroundPosition: "right 10px center", backgroundRepeat: "no-repeat", backgroundSize: "16px", paddingRight: "2.5rem" }}
              >
                <option value="all">All Cuisines</option>
                {cuisines.filter(c => c !== 'all').map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white transition-all duration-300 appearance-none"
                style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%23f97316\" stroke-width=\"2\"><path d=\"M6 9l6 6 6-6\"/></svg>')", backgroundPosition: "right 10px center", backgroundRepeat: "no-repeat", backgroundSize: "16px", paddingRight: "2.5rem" }}
              >
                <option value="rating">Sort by Rating</option>
                <option value="deliveryTime">Sort by Delivery Time</option>
                <option value="price">Sort by Price</option>
              </select>
            </motion.div>
          </div>
        </motion.div>

        {/* Restaurants Grid with staggered animation */}
        <div className="mb-4 flex justify-between items-center">
          <motion.h2 
            className="text-2xl font-semibold text-gray-800"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {filteredRestaurants.length} Restaurant{filteredRestaurants.length !== 1 ? 's' : ''} Found
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-gray-500"
          >
            {searchTerm && <span>Searching for: <span className="font-medium text-orange-500">"{searchTerm}"</span></span>}
          </motion.div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {filteredRestaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant._id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    duration: 0.4,
                    ease: "easeOut"
                  }
                }
              }}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
              }}
              transition={{ duration: 0.2 }}
            >
              <RestaurantCard 
                restaurant={restaurant} 
                isClientView={isClientView} 
              />
            </motion.div>
          ))}
        </motion.div>

        {filteredRestaurants.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-xl shadow-md"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl mb-4"
            >
              🍽️
            </motion.div>
            <h3 className="text-2xl font-medium text-gray-900 mb-3">No restaurants found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#f97316" }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2 bg-orange-500 text-white rounded-lg shadow-md"
              onClick={() => {
                setSearchTerm('');
                setSelectedCuisine('all');
                setSortBy('rating');
              }}
            >
              Reset Filters
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Restaurants;
