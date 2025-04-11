import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Group items by restaurant
  const groupedItems = cartItems.reduce((acc, item) => {
    const restaurantId = item.restaurantId;
    if (!acc[restaurantId]) {
      acc[restaurantId] = [];
    }
    acc[restaurantId].push(item);
    return acc;
  }, {});

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      navigate('/checkout', { 
        state: { 
          items: cartItems,
          total: getTotal(),
          restaurantDetails: {
            deliveryTime: groupedItems[Object.keys(groupedItems)[0]][0].deliveryTime || '35-45',
            restaurantName: groupedItems[Object.keys(groupedItems)[0]][0].restaurantName
          }
        }
      });
    } catch (error) {
      console.error('Error proceeding to checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/restaurants')}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg"
            >
              Browse Restaurants
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <h1 className="text-2xl font-bold mb-6">Your Cart ({cartItems.length} items)</h1>
          
          <AnimatePresence>
            {Object.entries(groupedItems).map(([restaurantId, items]) => (
              <motion.div 
                key={restaurantId} 
                className="mb-6 border-b pb-4"
              >
                <h3 className="font-semibold text-lg mb-3">{items[0]?.restaurantName || 'Restaurant'}</h3>
                {items.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow mb-2"
                  >
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-gray-600">Rs {item.price.toFixed(2)} each</p>
                      {item.discount > 0 && (
                        <span className="text-sm text-red-500 font-medium">
                          {item.discount}% OFF
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Cart Summary */}
          <div className="mt-8 pt-4 border-t">
            <div className="space-y-2 mb-4">
              {Object.entries(groupedItems).map(([restaurantId, items]) => (
                <div key={restaurantId} className="flex justify-between text-sm text-gray-600">
                  <span>{items[0].restaurantName} Subtotal:</span>
                  <span>Rs {items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold">Rs {getTotal().toFixed(2)}</span>
            </div>

            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                disabled={loading}
                className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearCart}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Clear Cart
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;
