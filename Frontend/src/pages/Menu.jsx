import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useCart } from '../context/CartContext'; // Import useCart
import { useNavigate } from 'react-router-dom';
import defaultItemImage from '../assets/placeholder-menu.png' 
import defaultResImage from '../assets/placeholder-restaurant.png' 
import toast from 'react-hot-toast';

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
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

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
        setMenuItems(restaurantMenu.data);
        
        // Extract unique categories
        // const uniqueCategories = [...new Set(res.data.map(item => item.category))];
        // setCategories(['all', ...uniqueCategories]);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch menu data');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantAndMenu();
  }, []);

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  
  // Add item to the cart
  const handleAddToCart = (item) => {
    addToCart(item,{
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      deliveryTime: restaurant.deliveryTime || '35-45',
    });
  };

  const openRatingModal = (item) => {
    if (!user) {
      toast.error("Please login to rate items");
      return;
    }
    setSelectedItem(item);
    setUserRating(0);
    setRatingModalOpen(true);
  };

  const closeRatingModal = () => {
    setRatingModalOpen(false);
    setSelectedItem(null);
    setUserRating(0);
  };

  const submitRating = async () => {
    if (!userRating || !selectedItem) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5002/api/menu-items/${selectedItem.id}/rate`, 
        { rating: userRating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local menu items array with new rating
      setMenuItems(prev => prev.map(item => 
        item.id === selectedItem.id 
          ? { ...item, rating: (item.rating || 0) + userRating / 2 } // Simple update formula, your backend logic may differ
          : item
      ));
      
      toast.success("Rating submitted successfully!");
      closeRatingModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit rating");
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Restaurant Header */}
        <motion.div 
          variants={itemAnimation}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center gap-6">
            <img
              src={restaurant?.image ?? {defaultResImage}}
              alt={restaurant?.name}
              className="w-24 h-24 rounded-xl object-cover"
            />
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
          {filteredItems.map(item => (
            <motion.div
              key={item.id}
              variants={itemAnimation}
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-orange-100"
            >
              <div className="relative h-48">
                <img
                  src={item.image ?? defaultItemImage}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {item.isSpicy && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                    🌶️ Spicy
                  </span>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {item.description}
                </p>
                {/* Display Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-lg">
                        {i < Math.floor(item.rating || 0) ? (
                          <span className="text-yellow-400">★</span>
                        ) : (
                          <span className="text-gray-300">★</span>
                        )}
                      </span>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {item.rating ? `${item.rating.toFixed(1)}` : 'No ratings yet'}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openRatingModal(item);
                    }}
                    className="ml-2 text-sm text-orange-500 hover:text-orange-700"
                  >
                    Rate
                  </button>
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

        {filteredItems.length === 0 && (
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

      {/* Rating Modal */}
      <AnimatePresence>
        {ratingModalOpen && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeRatingModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Rate this item</h3>
              <div className="flex flex-col items-center mb-6">
                <img
                  src={selectedItem.image ?? defaultItemImage}
                  alt={selectedItem.name}
                  className="w-24 h-24 object-cover rounded-lg mb-3"
                />
                <h4 className="font-medium">{selectedItem.name}</h4>
              </div>

              <div className="flex justify-center mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="text-3xl focus:outline-none mx-1"
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <span className={
                      (hoverRating || userRating) >= star
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }>
                      ★
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  onClick={closeRatingModal}
                >
                  Cancel
                </button>
                <button
                  className={`px-6 py-2 rounded-lg ${
                    userRating
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                  onClick={submitRating}
                  disabled={!userRating}
                >
                  Submit Rating
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Menu;