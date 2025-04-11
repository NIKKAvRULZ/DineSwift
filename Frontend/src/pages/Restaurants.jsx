import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
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

  useEffect(() => {
    // Only require authentication if not in client view mode
    if (!isClientView && !isAuthenticated) {
      navigate('/login', { state: { from: '/restaurants' } });
      return;
    }
    fetchRestaurants();
  }, [isAuthenticated, navigate, isClientView]);

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
      
      // Filter out restaurants that have no menu items (which might happen if all items have no images)
      const restaurantsWithMenuItems = response.data.filter(restaurant => 
        restaurant.menuItems && restaurant.menuItems.length > 0
      );
      setRestaurants(restaurantsWithMenuItems);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center"><div className="text-red-600 text-xl">{error}</div></div>;

  return (
    <motion.div initial="initial" animate="animate" className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {isClientView ? "Our Restaurant Menu" : "Restaurants Near You"}
        </h1>
        <p className="text-gray-600">
          {isClientView ? "Browse our delicious menu and place your order!" : "Discover the best food & drinks in your area"}
        </p>

        {/* Search and Filter Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input type="text" placeholder="Search restaurants..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            
            <select value={selectedCuisine} onChange={(e) => setSelectedCuisine(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent">
              <option value="all">All Cuisines</option>
              {cuisines.map(cuisine => <option key={cuisine} value={cuisine}>{cuisine}</option>)}
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent">
              <option value="rating">Sort by Rating</option>
              <option value="deliveryTime">Sort by Delivery Time</option>
              <option value="price">Sort by Price</option>
            </select>
          </div>
        </div>

        {/* Restaurants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRestaurants.map(restaurant => (
            <RestaurantCard 
              key={restaurant._id} 
              restaurant={restaurant} 
              isClientView={isClientView} 
            />
          ))}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No restaurants found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Restaurants;
