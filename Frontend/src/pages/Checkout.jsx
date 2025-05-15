import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../api/orderService';
import paymentService from '../api/paymentService';
import { MapPin, ShoppingCart, CreditCard, Clock, Check, X, Coffee, Pizza, Utensils, Phone, MessageSquare } from 'lucide-react';
import restaurantPlaceholder from '../assets/placeholder-restaurant.png'; 

const floatingIcons = [
  { icon: <Coffee size={32} />, color: "text-orange-500/80" },
  { icon: <Pizza size={32} />, color: "text-red-500/80" },
  { icon: <Utensils size={32} />, color: "text-yellow-500/80" }
];

const floatingAnimation = {
  initial: { y: 0, opacity: 0 },
  animate: {
    y: [-20, 20, -20],
    opacity: [0.6, 0.8, 0.6],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const backgroundAnimation = {
  initial: { scale: 1.1, opacity: 0 },
  animate: { 
    scale: 1,
    opacity: 0.1,
    transition: { duration: 1 }
  }
};

const inputAnimation = {
  initial: { scale: 0.98, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const scrollbarStyles = `
  scrollbar-thin
  scrollbar-track-gray-100
  scrollbar-thumb-orange-300
  hover:scrollbar-thumb-orange-400
  scrollbar-thumb-rounded-full
  scrollbar-track-rounded-full
`;

const formatPhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  // Add + prefix if not present
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};

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
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const { items, total, restaurantDetails } = location.state || {};
  console.log("user", user);
  

  if (!items || !items.length) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async () => {
    if (!phoneNumber) {
      setError('Please provide a contact number');
      return;
    }

    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!address) {
      setError('Please provide a delivery address');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderData = {
        customerId: user.id,
        restaurantId: items[0].restaurantId,
        items: items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          menuItemId: item.id
        })),
        totalAmount: total,
        status: 'Pending',
        paymentMethod: paymentMethod,
        deliveryAddress: address,
        phoneNumber: phoneNumber,         // Add phone number
        deliveryNotes: deliveryNotes,    // Add delivery notes
        customerDetails: {               // Add customer details section
          name: user.name,
          email: user.email,
          phone: phoneNumber,
          address: address
        }
      };

      console.log("Order data being sent:", orderData);

      const response = await orderService.createOrder(orderData, user.token);
      setIsOrderPlaced(true);
      setShowConfirmation(true);

      // Store the phone number in user context or local storage if needed
      localStorage.setItem('lastUsedPhone', phoneNumber);

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

  const handlePlaceOrderWithCard = async () => {
    if (!phoneNumber) {
      setError('Please provide a contact number');
      return;
    }

    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!address) {
      setError('Please provide a delivery address');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Create order with phone and delivery notes
      const orderData = {
        customerId: user.id,
        restaurantId: items[0].restaurantId,
        items: items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          menuItemId: item.id
        })),
        totalAmount: total,
        status: 'Pending',
        paymentMethod: paymentMethod,
        deliveryAddress: address,
        phoneNumber: phoneNumber,         // Add phone number
        deliveryNotes: deliveryNotes,    // Add delivery notes
        customerDetails: {               // Add customer details section
          name: user.name,
          email: user.email,
          phone: phoneNumber,
          address: address
        }
      };

      const orderResponse = await orderService.createOrder(orderData, user.token);
      const createdOrder = orderResponse;

      if (!createdOrder || !createdOrder._id) {
        throw new Error('Order creation failed');
      }

      // 2. Create Stripe session with updated data
      const stripeData = {
        orderId: createdOrder._id,
        customerId: user.id,
        restaurantId: items[0].restaurantId,
        items: items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: total,
        deliveryAddress: address,
        phoneNumber: phoneNumber,        // Add phone number to Stripe data
        customerDetails: {              // Add customer details to Stripe data
          name: user.name,
          email: user.email,
          phone: phoneNumber,
          address: address
        }
      };

      const stripeResponse = await paymentService.createStripeCheckoutSession(stripeData, user.token);

      if (stripeResponse.success) {
        // Store the phone number in local storage
        localStorage.setItem('lastUsedPhone', phoneNumber);
        window.location.href = stripeResponse.url;
      } else {
        throw new Error('Stripe checkout session creation failed');
      }

    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 flex justify-center items-center p-4">
      {/* Background Pattern */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={backgroundAnimation}
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFA500' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            initial="initial"
            animate="animate"
            variants={floatingAnimation}
            className={`absolute ${item.color} transform -translate-x-1/2 -translate-y-1/2`}
            style={{
              left: `${25 + index * 25}%`,
              top: `${20 + (index % 2) * 30}%`,
              filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))',
              zIndex: 1
            }}
          >
            {item.icon}
          </motion.div>
        ))}
        
        {/* Add mirrored icons for better distribution */}
        {floatingIcons.map((item, index) => (
          <motion.div
            key={`mirror-${index}`}
            initial="initial"
            animate="animate"
            variants={floatingAnimation}
            className={`absolute ${item.color} transform -translate-x-1/2 -translate-y-1/2`}
            style={{
              right: `${25 + index * 25}%`,
              bottom: `${20 + (index % 2) * 30}%`,
              filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))',
              zIndex: 1
            }}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden grid md:grid-cols-[2fr_1fr] border border-gray-100 relative z-10"
      >
        {/* Left Side - Order Details */}
        <div className="p-8 bg-white border-r border-gray-100">
          {/* Restaurant Header */}
          <div className="flex items-center mb-8">
            <img 
              src={restaurantDetails?.image || restaurantPlaceholder}
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
                  <motion.textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    whileFocus={{ scale: 1.01 }}
                    className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm
                      focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none
                      transition-all duration-300 text-gray-800 placeholder-gray-400
                      shadow-sm hover:shadow-md resize-none min-h-[80px] max-h-[120px]
                      ${scrollbarStyles}`}
                    placeholder="Enter your complete delivery address"
                    required
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
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
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
                <span className="text-lg font-semibold">Rs {(item.price * item.quantity).toFixed(2)}</span>
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
              <span className="text-gray-800">Rs {total.toFixed(2)}</span>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Payment & Delivery */}
        <div className="p-8 bg-gray-50">
          <div className="space-y-6 mt-4">
            <motion.div
              variants={inputAnimation}
              initial="initial"
              animate="animate"
              className="space-y-2"
            >
              <label className="block text-sm font-semibold text-gray-700">
                Phone Number *
              </label>
              <div className="relative">
                <motion.input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow digits, +, and spaces
                    if (/^[\d\s+]*$/.test(value)) {
                      setPhoneNumber(value);
                    }
                  }}
                  onBlur={() => {
                    // Format on blur
                    if (phoneNumber) {
                      setPhoneNumber(formatPhoneNumber(phoneNumber));
                    }
                  }}
                  whileFocus={{ scale: 1.01 }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm
                    focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none
                    transition-all duration-300 text-gray-800 placeholder-gray-400
                    shadow-sm hover:shadow-md"
                  placeholder="Enter your contact number (e.g., +1234567890)"
                  required
                />
                <motion.div
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <Phone size={18} />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              variants={inputAnimation}
              initial="initial"
              animate="animate"
              className="space-y-2"
            >
              
            </motion.div>

            <motion.div
              variants={inputAnimation}
              initial="initial"
              animate="animate"
              className="space-y-2"
            >
              <label className="block text-sm font-semibold text-gray-700">
                Delivery Notes <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="relative">
                <motion.textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  whileFocus={{ scale: 1.01 }}
                  className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm
                    focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none
                    transition-all duration-300 text-gray-800 placeholder-gray-400
                    shadow-sm hover:shadow-md resize-none min-h-[80px] max-h-[120px]
                    ${scrollbarStyles}`}
                  placeholder="Any special instructions for delivery? (e.g., Ring doorbell, Call upon arrival)"
                />
                <motion.div
                  className="absolute right-3 top-3 text-gray-400"
                >
                  <MessageSquare size={18} />
                </motion.div>
              </div>
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
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center space-x-3 p-4 rounded-xl bg-white/80 backdrop-blur-sm border-2 cursor-pointer transition-all duration-300 ${
                    paymentMethod === method 
                      ? 'border-orange-500 shadow-orange-100 shadow-lg' 
                      : 'border-gray-200 hover:border-orange-200'
                  }`}
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
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={paymentMethod === 'card' ? handlePlaceOrderWithCard : handlePlaceOrder}
              disabled={loading || !address}
              className={`w-full py-4 rounded-xl text-lg font-bold transition-all duration-300 flex items-center justify-center ${
                loading || !address
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
              }`}
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
                <motion.div className="flex flex-col items-center justify-center text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <Check size={80} className="text-green-500 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-800">Order Confirmed!</h3>
                  <p className="text-gray-600">Your delicious meal is on its way</p>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>Delivery to: {address}</p>
                    <p>Contact: {phoneNumber}</p>
                    <p>Estimated delivery: {restaurantDetails?.deliveryTime || '35-45'} mins</p>
                    {deliveryNotes && (
                      <div className="mt-2">
                        <p className="font-medium">Delivery Notes:</p>
                        <p>{deliveryNotes}</p>
                      </div>
                    )}
                  </div>
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