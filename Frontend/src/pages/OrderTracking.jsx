import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import orderService from '../services/orderService';
import restaurantService from "../services/restaurantService";

const stageAnimations = {
    Pending: {
      scale: [1, 1.1, 1],  
      rotate: [0, -5, 5, -5, 0],  
      opacity: [1, 0.7, 1],  // Flickering effect like waiting status
      transition: { 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    confirmed: {
      scale: [1, 1.2, 1],  
      boxShadow: [
        "0 0 0 0px rgba(34, 197, 94, 0.3)",  // Green glow expands
        "0 0 0 20px rgba(34, 197, 94, 0)"  
      ],
      opacity: [1, 0.9, 1], // Slight pulse to show confirmation
      transition: { 
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    preparing: {
      rotate: [0, -30, 30, 0],  // Simulating a chef flipping food
      y: [0, -20, 0],  // Lifting movement like tossing food in a pan
      scale: [1, 1.05, 1], // Slight increase to show action
      transition: { 
        duration: 2,  
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    ready: {
      y: [0, -15, 0],  // Slight bounce like a ready meal on a counter
      scale: [1, 1.1, 1],  
      boxShadow: [
        "0 0 10px rgba(255, 165, 0, 0.4)",  // Orange glow to indicate it's ready
        "0 0 20px rgba(255, 165, 0, 0)"  
      ],
      transition: { 
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    delivering: {
      x: [0, 20, -20, 0],  // Moving side to side to simulate motion
      scale: [1, 1.1, 1],  
      rotate: [0, 5, 0, -5, 0],  
      transition: { 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    delivered: {
      scale: [1, 1.3, 1],  
      rotate: [0, 360],  // Final rotation to show completion
      opacity: [1, 0.8, 1],  // Flash effect to celebrate delivery
      transition: { 
        duration: 0.8,
        repeat: 1,
        ease: "easeOut"
      }
    }
  };
  

const blinkingAnimation = {
  initial: { scale: 0.8, opacity: 0.5 },
  animate: {
    scale: [0.8, 1.2, 0.8],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const loadingAnimation = {
  initial: { opacity: 0.3, scale: 0.9 },
  animate: {
    opacity: [0.3, 1, 0.3],
    scale: [0.9, 1.1, 0.9],
    rotate: 360,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const triggerConfetti = () => {
  const end = Date.now() + (3 * 1000);

  const colors = ['#FFA500', '#FFD700', '#FF6B6B', '#4CAF50'];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
};

const stages = [
  {
    key: 'Pending',
    label: 'Order Placed',
    icon: '📝',
    animation: stageAnimations.Pending   ,
    bgColor: 'bg-gradient-to-br from-amber-100 to-amber-200',
    activeColor: 'bg-amber-500'
  },
  {
    key: 'Accepted',
    label: 'Accepted',
    icon: '✅',
    animation: stageAnimations.confirmed,
    bgColor: 'bg-gradient-to-br from-sky-100 to-sky-200',
    activeColor: 'bg-sky-500'
  },
  {
    key: 'Preparing',
    label: 'Preparing',
    icon: '👨‍🍳',
    animation: stageAnimations.preparing,
    bgColor: 'bg-gradient-to-br from-indigo-100 to-indigo-200',
    activeColor: 'bg-indigo-500'
  },
  {
    key: 'On the Way',
    label: 'On the Way',
    icon: '🚗',
    animation: stageAnimations.delivering,
    bgColor: 'bg-gradient-to-br from-teal-100 to-teal-200',
    activeColor: 'bg-teal-500'
  },
  {
    key: 'Delivered',
    label: 'Delivered',
    icon: '🎉',
    animation: stageAnimations.delivered,
    bgColor: 'bg-gradient-to-br from-lime-100 to-lime-200',
    activeColor: 'bg-lime-500'
  }
];

const OrderTracking = () => {
  const { orderId } = useParams();
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      navigate('/orders');
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        console.log('Fetching order with ID:', orderId); // Debug log
        const data = await orderService.getOrderById(orderId);
        console.log('Fetched order data:', data); // Debug log
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
    // Set up real-time updates here if available
  }, [orderId, navigate]);

  useEffect(() => {
    if (order?.status === 'Delivered') {
      triggerConfetti();
    }
  }, [order?.status]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <motion.div
          initial="initial"
          animate="animate"
          variants={loadingAnimation}
          className="w-16 h-16 relative"
        >
          <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full" />
          <div className="absolute inset-0 border-4 border-orange-300 border-t-transparent rounded-full blur-sm" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-red-600 text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const currentStageIndex = stages.findIndex(stage => stage.key === order?.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Order #{orderId}</h1>
            
            {/* Progress Timeline */}
            <div className="relative">
              <div className="absolute left-0 top-[2.4rem] w-full h-1 bg-gray-200">
                <div 
                  className="h-full bg-orange-500 transition-all duration-500"
                  style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
                />
              </div>
              
              <div className="relative flex justify-between mb-8">
                {stages.map((stage, index) => (
                  <motion.div
                    key={stage.key}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: 1,
                      opacity: 1,
                      transition: { delay: index * 0.2 }
                    }}
                    className={`flex flex-col items-center relative ${
                      index <= currentStageIndex ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      animate={index === currentStageIndex ? stage.animation : {}}
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl
                        ${index <= currentStageIndex ? stage.bgColor : 'bg-gray-100'}
                        shadow-lg transform transition-all duration-300
                        ${index === currentStageIndex ? 'ring-4 ring-offset-4 ring-orange-300' : ''}
                        backdrop-blur-sm
                      `}
                      style={{
                        boxShadow: index <= currentStageIndex ? 
                          '0 0 20px rgba(255, 165, 0, 0.3)' : 
                          'none'
                      }}
                    >
                      {stage.icon}
                    </motion.div>
                    <motion.span 
                      className="mt-3 text-sm font-medium"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.3 }}
                    >
                      {stage.label}
                    </motion.span>
                    {index === currentStageIndex && (
                      <motion.div
                        className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
                        initial="initial"
                        animate="animate"
                        variants={blinkingAnimation}
                      >
                        <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg">
                          <div className="w-full h-full rounded-full bg-white/30 backdrop-blur-sm" />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Order Details */}
            <div className="mt-8 space-y-6">
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold mb-4">Order Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Restaurant</p>
                    <p className="font-medium">{order?.restaurant?.name || 'Not available'}</p>
                  </div>
                  <div> 
                    <p className="text-gray-600">Order Date</p>
                    <p className="font-medium">
                      {new Date(order?.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-medium">${Number(order?.totalAmount).toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Items</p>
                    <p className="font-medium">{order?.items?.length || 0} items</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order?.items?.map((item, index) => (
                    <motion.div 
                      key={index} 
                      className="flex justify-between items-center p-3 rounded-lg hover:bg-orange-50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        {item.discount > 0 && (
                          <p className="text-sm text-red-500">{item.discount}% OFF</p>
                        )}
                      </div>
                      <p className="font-medium">Rs {(item.price * item.quantity).toFixed(2)}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Rating and Feedback Section */}
              {order?.status === 'Delivered' && (
                <div className="border-t mt-6 pt-6">
                  <h2 className="text-lg font-semibold mb-4">Rate Your Experience</h2>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <RatingComponent orderId={orderId} />
                  </div>
                </div>
              )}

              {/* Contact Restaurant */}
              <div className="border-t mt-6 pt-6">
                <h2 className="text-lg font-semibold mb-4">Need Help?</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
                  onClick={() => window.open(`tel:${order?.restaurant?.phone || '123456789'}`)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Contact Restaurant
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Rating Component
const RatingComponent = ({ orderId }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { updateOrderRating } = useOrder();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateOrderRating(orderId, { rating, feedback });
      setSubmitted(true);
      triggerConfetti();
    } catch (error) {
      console.error("Failed to submit rating:", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-4"
      >
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold">Thanks for your feedback!</h3>
        <p className="text-gray-600 mt-2">Your rating helps us improve our service.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setRating(star)}
            className={`text-3xl ${
              rating >= star ? 'text-yellow-500' : 'text-gray-300'
            }`}
          >
            ★
          </motion.button>
        ))}
      </div>
      <textarea
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        rows="3"
        placeholder="Share your experience with this order..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      ></textarea>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium shadow-md disabled:opacity-50"
        onClick={handleSubmit}
        disabled={!rating || loading}
      >
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </motion.button>
    </motion.div>
  );
};

export default OrderTracking;