import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrder } from '../context/OrderContext';

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const { cancelOrder } = useOrder();
  const [cancelling, setCancelling] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Order status progression sequence
  const statusSequence = ['Pending', 'Accepted', 'Preparing', 'On the Way', 'Delivered'];
  const currentStatusIndex = statusSequence.indexOf(order.status);
  
  // Calculate progress percentage for the status bar
  const progressPercentage = order.status === 'Cancelled' 
    ? 0 
    : (currentStatusIndex / (statusSequence.length - 1)) * 100;

  const handleCancel = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to cancel this order?')) {
      setCancelling(true);
      try {
        await cancelOrder(order._id);
      } catch (error) {
        console.error('Error cancelling order:', error);
      } finally {
        setCancelling(false);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'Pending': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', light: 'bg-amber-50' },
      'Accepted': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200', light: 'bg-sky-50' },
      'Preparing': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200', light: 'bg-indigo-50' },
      'On the Way': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200', light: 'bg-teal-50' },
      'Delivered': { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-200', light: 'bg-lime-50' },
      'Cancelled': { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200', light: 'bg-rose-50' }
    };
    return colors[status] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', light: 'bg-gray-50' };
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      'Pending': '📝',
      'Accepted': '✅',
      'Preparing': '👨‍🍳',
      'On the Way': '🚗',
      'Delivered': '🎉',
      'Cancelled': '❌'
    };
    return icons[status] || '⏳';
  };

  const statusColor = getStatusColor(order.status);
  
  // Card animations
  const cardVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
    exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } },
    hover: { 
      scale: 1.02, 
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      borderColor: '#f97316',
      transition: { duration: 0.2 }
    }
  };

  // Content animations for expanded state
  const contentVariants = {
    closed: { 
      height: 0, 
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    open: { 
      height: "auto", 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeInOut", staggerChildren: 0.1 }
    }
  };

  // Item animations for children in expanded state
  const itemVariants = {
    closed: { y: 20, opacity: 0 },
    open: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      className={`bg-white rounded-xl border-2 transition-colors ${
        isHovering ? `${statusColor.border}` : 'border-gray-100'
      } shadow-md overflow-hidden`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      onClick={() => setExpanded(!expanded)}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      layout
    >
      {/* Card Header with Status Bar */}
      <div className={`h-2 w-full ${statusColor.bg}`}>
        <motion.div 
          className="h-full bg-gradient-to-r from-orange-400 to-red-500"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      
      {/* Card Content */}
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              {order.restaurant?.name || `Restaurant ID: ${order.restaurantId}`}
              {order.status === 'Delivered' && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="inline-block ml-2 text-lime-500"
                >
                  ✓
                </motion.span>
              )}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Placed on: {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`text-sm font-semibold px-3 py-1 rounded-full mb-2 flex items-center gap-1
                ${statusColor.bg} ${statusColor.text}`}
            >
              <span className="text-base">{getStatusIcon(order.status)}</span>
              {order.status}
            </motion.span>
            <p className="text-md font-bold">
              ${order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}
            </p>
          </div>
        </div>
        
        {/* Order Progress Tracker (simplified version that shows on collapsed card) */}
        {order.status !== 'Cancelled' && (
          <div className="mt-4">
            <div className="relative flex items-center justify-between">
              {statusSequence.map((status, index) => {
                const isCompleted = currentStatusIndex >= index;
                const isCurrent = currentStatusIndex === index;
                
                return (
                  <div key={status} className="flex flex-col items-center z-10">
                    <motion.div 
                      className={`w-4 h-4 rounded-full ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                          : 'bg-gray-200'
                      } ${isCurrent ? 'ring-2 ring-orange-300 ring-offset-2' : ''}`}
                      whileHover={{ scale: 1.2 }}
                      animate={isCurrent ? {
                        scale: [1, 1.2, 1],
                        transition: { repeat: Infinity, duration: 2 }
                      } : {}}
                    />
                    {isCurrent && (
                      <p className={`text-xs font-medium mt-1 ${statusColor.text}`}>
                        {status}
                      </p>
                    )}
                  </div>
                );
              })}
              
              {/* Progress bar behind the dots */}
              <div className="absolute left-0 top-[7px] w-full h-1 bg-gray-200 -z-0">
                <motion.div 
                  className="h-full bg-gradient-to-r from-orange-400 to-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Order Details (Expandable) */}
        <AnimatePresence>
          {expanded && (
            <motion.div 
              variants={contentVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="overflow-hidden mt-4"
            >
              {/* Detailed Order Progress (when expanded) */}
              {order.status !== 'Cancelled' && (
                <motion.div 
                  variants={itemVariants}
                  className={`p-4 rounded-lg ${statusColor.light} mb-4`}
                >
                  <h4 className="text-sm font-semibold mb-3">Order Status Progression</h4>
                  <div className="flex flex-col space-y-4">
                    {statusSequence.map((status, index) => {
                      const isCompleted = currentStatusIndex >= index;
                      const isCurrent = currentStatusIndex === index;
                      
                      return (
                        <motion.div 
                          key={status}
                          className={`flex items-center ${isCompleted ? statusColor.text : 'text-gray-400'}`}
                          variants={itemVariants}
                        >
                          <motion.div 
                            className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 
                              ${isCompleted 
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                                : 'bg-gray-200 text-gray-400'
                              }`}
                            animate={isCurrent ? {
                              scale: [1, 1.1, 1],
                              transition: { repeat: Infinity, duration: 2 }
                            } : {}}
                          >
                            {isCompleted ? '✓' : index + 1}
                          </motion.div>
                          <div className="flex-1">
                            <p className={`font-medium ${isCurrent ? 'text-lg' : 'text-sm'}`}>
                              {status}
                            </p>
                            <p className="text-xs">
                              {status === 'Pending' && 'Your order has been placed'}
                              {status === 'Accepted' && 'Restaurant confirmed your order'}
                              {status === 'Preparing' && 'Your food is being prepared'}
                              {status === 'On the Way' && 'Your order is on the way to you'}
                              {status === 'Delivered' && 'Your order has been delivered'}
                            </p>
                          </div>
                          {isCurrent && (
                            <span className="text-xl ml-2">{getStatusIcon(status)}</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
              
              {/* Order Items */}
              <motion.div 
                variants={itemVariants}
                className="border-t pt-3 mt-2"
              >
                <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items:</h4>
                <ul className="space-y-2">
                  {order.items.map((item, index) => (
                    <motion.li 
                      key={index} 
                      className="text-sm flex justify-between p-2 hover:bg-gray-50 rounded-md transition-colors"
                      variants={itemVariants}
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex items-center">
                        <span className="bg-orange-100 text-orange-800 w-6 h-6 rounded-full flex items-center justify-center mr-2">
                          {item.quantity}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">${item.price ? (item.price * item.quantity).toFixed(2) : "0.00"}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              
              {/* Order Rating (if available) */}
              {order.rating && (
                <motion.div 
                  variants={itemVariants}
                  className="mt-3 pt-3 border-t"
                >
                  <div className="flex items-center">
                    <p className="text-sm text-gray-600 mr-2">Your Rating:</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.span 
                          key={star} 
                          className={`text-lg ${star <= order.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                          initial={{ rotate: -10, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          transition={{ delay: star * 0.1 }}
                        >
                          ★
                        </motion.span>
                      ))}
                    </div>
                  </div>
                  {order.feedback && (
                    <motion.p 
                      variants={itemVariants}
                      className="text-sm text-gray-600 mt-1 italic bg-gray-50 p-2 rounded-md"
                    >
                      "{order.feedback}"
                    </motion.p>
                  )}
                </motion.div>
              )}
              
              {/* Button Actions */}
              <motion.div 
                variants={itemVariants} 
                className="mt-4 flex justify-between"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={`/tracking/${order._id}`}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Track Order
                  </Link>
                </motion.div>
                
                {['Pending', 'Accepted'].includes(order.status) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="bg-white border border-red-500 text-red-500 hover:bg-red-50 px-4 py-2 rounded-full text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Expand/Collapse Indicator */}
        <motion.div 
          className="mt-3 flex justify-center"
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center border ${
              expanded ? `${statusColor.border} ${statusColor.text}` : 'border-gray-200 text-gray-400'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OrderCard;
