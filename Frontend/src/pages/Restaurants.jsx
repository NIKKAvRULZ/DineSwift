import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';

const Restaurants = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/restaurants' } });
      return;
    }

    fetchRestaurants();
  }, [isAuthenticated, navigate]);

  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5002/api/restaurants', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRestaurants(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
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
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (sortBy === 'deliveryTime') {
        return a.deliveryTime - b.deliveryTime;
      } else if (sortBy === 'price') {
        return a.minOrder - b.minOrder;
      }
      return 0;
    });

  const cuisines = ['all', ...new Set(restaurants.map(r => r.cuisine))];

  const pageAnimation = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  const RestaurantCard = ({ restaurant }) => (
    <motion.div
      variants={cardAnimation}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-orange-100 transition-all duration-300"
    >
      <Link to={`/restaurants/${restaurant.id}/menu`}>
        <div className="relative h-48 overflow-hidden">
          <motion.img
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
              restaurant.isOpen
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {restaurant.isOpen ? 'Open' : 'Closed'}
          </motion.div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {restaurant.name}
          </h3>
          <p className="text-gray-600 mb-4">{restaurant.cuisine}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-yellow-400 mr-1">⭐</span>
              <span className="text-gray-700">{restaurant.rating}</span>
            </div>
            <div className="text-gray-600">
              {restaurant.deliveryTime} min
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Min. order: ${restaurant.minOrder}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-xl">{error}</div>
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
        <motion.div variants={cardAnimation} className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Restaurants Near You
          </h1>
          <p className="text-gray-600">
            Discover the best food & drinks in your area
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          variants={cardAnimation}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            
            <motion.select
              whileFocus={{ scale: 1.02 }}
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Cuisines</option>
              {cuisines.map(cuisine => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </motion.select>

            <motion.select
              whileFocus={{ scale: 1.02 }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="rating">Sort by Rating</option>
              <option value="deliveryTime">Sort by Delivery Time</option>
              <option value="price">Sort by Price</option>
            </motion.select>
          </div>
        </motion.div>

        {/* Restaurants Grid */}
        <motion.div
          variants={pageAnimation}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredRestaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </motion.div>

        {filteredRestaurants.length === 0 && (
          <motion.div
            variants={cardAnimation}
            className="text-center py-12"
          >
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No restaurants found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Restaurants;
  