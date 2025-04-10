import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../api/orderService';
import { MapPin, ShoppingCart, CreditCard, Clock, Check, X } from 'lucide-react';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [address, setAddress] = useState(user?.address || '');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { items, total, restaurantDetails } = location.state || {};

  if (!items || !items.length) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async () => {
    if (!address) {
      setError('Please provide a delivery address');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderData = {
        customerId: user.id,
        restaurantId: items[0].restaurantId, // Assuming all items are from same restaurant
        items: items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: total,
        enum: 'pending',
        paymentMethod,
        deliveryAddress: address
      };

      const response = await orderService.createOrder(orderData, user.token);
      setIsOrderPlaced(true);
      setShowConfirmation(true);

      // Auto close after 2 seconds and redirect
      setTimeout(() => {
        clearCart();
        navigate('/restaurants');
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden grid md:grid-cols-[2fr_1fr] border border-gray-100"
      >
        {/* Left Side - Order Details */}
        <div className="p-8 bg-white border-r border-gray-100">
          {/* Restaurant Header */}
          <div className="flex items-center mb-8">
            <img 
              src={restaurantDetails?.image || "https://via.placeholder.com/100"}
              alt={restaurantDetails?.name}
              className="w-16 h-16 rounded-full mr-4 object-cover border-2 border-gray-200"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{restaurantDetails?.name}</h1>
              <div className="text-gray-500 flex items-center space-x-4">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  Delivery to:
                </span>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex-1"
                >
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows="2"
                    placeholder="Enter your delivery address"
                  />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <ShoppingCart className="mr-3 text-gray-500" />
              Your Order
            </h2>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-xl"
              >
                <div className="flex items-center space-x-4">
                  <img 
                    src={item.image || "https://via.placeholder.com/100"}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                    <p className="text-gray-500 text-sm">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <span className="text-lg font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 p-6 rounded-xl space-y-3"
          >
            <div className="border-t pt-2 mt-2 font-bold flex justify-between text-xl">
              <span className="text-gray-800">Total Amount:</span>
              <span className="text-gray-800">${total.toFixed(2)}</span>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Payment & Delivery */}
        <div className="p-8 bg-gray-50">
          <div className="space-y-6">
            <div className="flex items-center text-gray-800">
              <Clock className="mr-3 text-gray-500" />
              <span className="text-lg font-semibold">
                Estimated Delivery: {restaurantDetails?.deliveryTime || '35-45'} mins
              </span>
              <motion.div
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="ml-2 text-orange-500"
              >
                🚴‍♂️
              </motion.div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <CreditCard className="mr-3 text-gray-500" />
                Payment Method
              </h2>
              
              <motion.div className="space-y-3">
                {['card', 'cash'].map((method) => (
                  <motion.label
                    key={method}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-3 p-4 rounded-xl bg-white border-2 cursor-pointer"
                    style={{
                      borderColor: paymentMethod === method ? '#f97316' : '#e5e7eb'
                    }}
                  >
                    <input
                      type="radio"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-gray-700 font-medium">
                      {method === 'card' ? 'Card Payment' : 'Cash on Delivery'}
                    </span>
                  </motion.label>
                ))}
              </motion.div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm mt-2"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlaceOrder}
                disabled={loading || !address}
                className="w-full bg-green-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-green-700 transition flex items-center justify-center"
              >
                {loading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ⟳
                  </motion.span>
                ) : (
                  <>
                    <CreditCard className="mr-3" /> Place Order
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Order Confirmation Modal */}
        <AnimatePresence>
          {showConfirmation && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <Check size={80} className="text-green-500 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-800">Order Confirmed!</h3>
                  <p className="text-gray-600">Your delicious meal is on its way</p>
                  <p className="text-sm text-gray-500 mt-2">Estimated delivery: {restaurantDetails?.deliveryTime || '35-45'} mins</p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Checkout;