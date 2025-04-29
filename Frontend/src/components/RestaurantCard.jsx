// RestaurantCard.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import defaultImage from '../assets/placeholder-restaurant.png'
import { useState, useEffect } from 'react';

const cardAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

const RestaurantCard = ({ restaurant, isClientView = false }) => {
  // Debug logging to check restaurant menuItems and discounts
  console.log(`Restaurant ${restaurant.name} menuItems:`, restaurant.menuItems);
  const hasDiscount = restaurant.menuItems?.some(item => item.discount > 0);
  console.log(`Restaurant ${restaurant.name} has discounts:`, hasDiscount);
  
  // Add state to track favorite status
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Load favorite status from localStorage on component mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('favoriteRestaurants');
      if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites);
        setIsFavorite(!!favorites[restaurant._id]);
      }
    } catch (error) {
      console.error('Error loading favorite restaurants from localStorage:', error);
    }
  }, [restaurant._id]);
  
  // Handle favorite toggle
  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Get current favorites
      const savedFavorites = localStorage.getItem('favoriteRestaurants');
      const favorites = savedFavorites ? JSON.parse(savedFavorites) : {};
      
      // Toggle favorite status
      const newFavoriteStatus = !favorites[restaurant._id];
      const newFavorites = { 
        ...favorites,
        [restaurant._id]: newFavoriteStatus 
      };
      
      // Save to localStorage
      localStorage.setItem('favoriteRestaurants', JSON.stringify(newFavorites));
      
      // Update state
      setIsFavorite(newFavoriteStatus);
      
      // Dispatch custom event for toast notification
      window.dispatchEvent(new CustomEvent('favoriteToggled', {
        detail: {
          restaurantName: restaurant.name,
          isFavorite: newFavoriteStatus
        }
      }));
    } catch (error) {
      console.error('Error toggling favorite status:', error);
    }
  };
  
  return (
    <motion.div
      variants={cardAnimation}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-orange-100 transition-all duration-300"
    >
      <Link to={isClientView ? `/restaurant-menu/${restaurant._id}` : `/restaurants/${restaurant._id}/menu`}>
        <div className="relative h-48 overflow-hidden">
          <motion.img
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
            src={restaurant.image ?? defaultImage}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          
          {/* Today's Offer Badge */}
          {restaurant.menuItems?.some(item => item.discount > 0) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
            >
              Today's Offer
            </motion.div>
          )}
          
          {/* Favorite Heart Icon */}
          <button 
            onClick={toggleFavorite}
            className="absolute bottom-1 right-1 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-md transition-all duration-300 hover:scale-110"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? (
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

        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{restaurant.name}</h3>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute top-54 right-5 px-3 py-1 rounded-full text-sm font-medium ${
              restaurant.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {restaurant.isOpen ? 'Open' : 'Closed'}
          </motion.div>
          <p className="text-gray-600 mb-4">{restaurant.cuisine}</p>
          
          {/* Add location display */}
          <div className="flex items-center mb-4 text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm">
              {restaurant.address?.street && `${restaurant.address.street}, `}
              {restaurant.address?.city && `${restaurant.address.city}, `}
              {restaurant.address?.state && `${restaurant.address.state}`}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-yellow-400 mr-1">⭐</span>
              <span className="text-gray-700">{restaurant.rating}</span>
            </div>
            <div className="text-gray-600">{restaurant.deliveryTime} min</div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Min. order: Rs {restaurant.minOrder}</span>
          </div>

          {isClientView && (
            <div className="mt-4">
              <p className="text-sm text-orange-500 font-medium">View full menu →</p>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default RestaurantCard;