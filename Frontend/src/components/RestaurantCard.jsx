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
  const [isHovered, setIsHovered] = useState(false);
  
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
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-orange-100 transition-all duration-300 h-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link to={isClientView ? `/restaurant-menu/${restaurant._id}` : `/restaurants/${restaurant._id}/menu`} className="block h-full">
        <div className="relative h-48 overflow-hidden group">
          <motion.img
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.4 }}
            src={restaurant.image ?? defaultImage}
            alt={restaurant.name}
            className="w-full h-full object-cover transition-all duration-500"
          />
          
          {/* Enhanced overlay gradient on hover */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            animate={{ opacity: isHovered ? 0.7 : 0 }}
          />
          
          {/* Cuisine badge at top-left */}
          {restaurant.cuisine && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-800 shadow-md z-10"
            >
              {restaurant.cuisine}
            </motion.div>
          )}
          
          {/* Today's Offer Badge - Enhanced with animation */}
          {restaurant.menuItems && restaurant.menuItems.length > 0 && restaurant.menuItems.some(item => item.discount > 0) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              whileHover={{ scale: 1.1, y: -2 }}
              className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Limited Offer
              </span>
            </motion.div>
          )}
          
          {/* Enhanced Favorite Heart Icon */}
          <motion.button 
            onClick={toggleFavorite}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            animate={{ 
              scale: isFavorite ? [1, 1.2, 1] : 1,
              transition: {
                duration: isFavorite ? 0.3 : 0,
                times: isFavorite ? [0, 0.5, 1] : [0, 0, 0]
              }
            }}
            className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 z-10"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? (
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="#ff3358" 
                className="w-6 h-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </motion.svg>
            ) : (
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="#ff3358" 
                className="w-6 h-6"
                whileHover={{ scale: 1.1 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </motion.svg>
            )}
          </motion.button>
          
          {/* Delivery time badge */}
          {restaurant.deliveryTime && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-gray-800 flex items-center shadow-md z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {restaurant.deliveryTime} min
            </motion.div>
          )}
          
          {/* View menu hover overlay */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            animate={{ opacity: isHovered ? 1 : 0 }}
          >
            <motion.span 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
              transition={{ delay: 0.1 }}
              className="bg-orange-500 text-white px-4 py-2 rounded-full font-medium shadow-lg flex items-center"
            >
              View Menu
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </motion.span>
          </motion.div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                restaurant.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {restaurant.isOpen ? 'Open Now' : 'Closed'}
            </motion.div>
          </div>
          
          <motion.div 
            className="flex items-center mb-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-orange-500 mr-1">•</span>
            <p className="text-gray-600 text-sm font-medium">{restaurant.cuisine || 'Various Cuisines'}</p>
          </motion.div>
          
          {/* Add location display with enhanced styling */}
          <motion.div 
            className="flex items-center mb-4 text-gray-600"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-gray-500 truncate">
              {restaurant.address?.street && `${restaurant.address.street}, `}
              {restaurant.address?.city && `${restaurant.address.city}, `}
              {restaurant.address?.state && `${restaurant.address.state}`}
              {!restaurant.address?.street && !restaurant.address?.city && !restaurant.address?.state && 'Address not available'}
            </span>
          </motion.div>
          
          <motion.div 
            className="flex items-center justify-between mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center">
              <motion.span 
                className="text-yellow-400 mr-1"
                animate={{ rotate: isHovered ? [0, 15, 0, -15, 0] : 0 }}
                transition={{ duration: 1, repeat: isHovered ? Infinity : 0, repeatDelay: 1 }}
              >
                ⭐
              </motion.span>
              <span className="text-gray-700 font-semibold">{restaurant.rating || 'New'}</span>
              <span className="text-gray-400 text-xs ml-1">({restaurant.reviews?.length || '0'} reviews)</span>
            </div>
            
            {/* Add delivery fee badge */}
            {restaurant.deliveryFee !== undefined && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-md">
                Delivery: Rs {restaurant.deliveryFee} LKR
              </span>
            )}
          </motion.div>
          
          <motion.div 
            className="pt-4 border-t border-gray-100 flex items-center justify-between"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Updated currency format */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gray-50 rounded-lg px-3 py-2 flex items-center"
            >
              <span className="text-sm font-medium">
                <span className="text-gray-500">Min. order:</span>
                <span className="text-orange-600 font-bold ml-1">Rs {restaurant.minOrder || 0} LKR</span>
              </span>
            </motion.div>
            
            <motion.div 
              whileHover={{ x: 5 }}
              className="text-orange-500 font-medium text-sm flex items-center"
            >
              View Details
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </motion.div>
          </motion.div>
          
          {/* Add features/amenities section if available */}
          {restaurant.features && restaurant.features.length > 0 && (
            <motion.div 
              className="mt-3 flex flex-wrap gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {restaurant.features.map((feature, index) => (
                <span key={index} className="inline-block text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-1">
                  {feature}
                </span>
              ))}
            </motion.div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default RestaurantCard;