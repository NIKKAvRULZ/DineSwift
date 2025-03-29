import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {cuisines.map(cuisine => (
                <option key={cuisine || 'unknown'} value={cuisine || 'unknown'}>
                {cuisine ? cuisine.charAt(0).toUpperCase() + cuisine.slice(1) : 'Unknown'}
              </option>
              
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="rating">Sort by Rating</option>
              <option value="deliveryTime">Sort by Delivery Time</option>
              <option value="price">Sort by Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map(restaurant => (
          <Link
            key={restaurant.id}
            to={`/restaurants/${restaurant.id}/menu`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative h-48">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
              {restaurant.isOpen ? (
                <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                  Open
                </span>
              ) : (
                <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                  Closed
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-900">{restaurant.name}</h3>
              <p className="text-gray-600 mt-1">{restaurant.cuisine}</p>
              <div className="mt-2 flex items-center">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 text-gray-600">{restaurant.rating}</span>
                </div>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-gray-600">{restaurant.deliveryTime} min</span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Min. order: ${restaurant.minOrder}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredRestaurants.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No restaurants found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default Restaurants;
  