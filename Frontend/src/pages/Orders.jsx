import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import orderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import OrderCard from '../components/OrderCard';
import { toast } from 'react-hot-toast';

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date-desc');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  // Enhanced animation variants
  const pageAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const modalAnimation = {
    initial: { opacity: 0, scale: 0.8, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.8, y: 20, transition: { duration: 0.2 } }
  };
  
  // Background pattern elements
  const backgroundElements = [
    { icon: '🍕', size: '4rem', rotate: 15, top: '10%', left: '5%', delay: 0 },
    { icon: '🍔', size: '3.5rem', rotate: -10, top: '20%', right: '8%', delay: 0.5 },
    { icon: '🍜', size: '3rem', rotate: 25, bottom: '15%', left: '10%', delay: 1 },
    { icon: '🍦', size: '3.2rem', rotate: -5, bottom: '25%', right: '15%', delay: 1.5 },
    { icon: '🥗', size: '2.8rem', rotate: 20, top: '40%', left: '15%', delay: 2 },
    { icon: '🍷', size: '2.5rem', rotate: -15, top: '60%', right: '10%', delay: 2.5 },
    { icon: '🍱', size: '3.3rem', rotate: 5, bottom: '40%', left: '8%', delay: 3 },
    { icon: '🍉', size: '3rem', rotate: -20, top: '75%', right: '18%', delay: 3.5 },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
      setError('');
    } catch (err) {
      setError('Failed to load orders. Please try again.');
      toast.error('Could not load your orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setCancellingOrderId(orderId);
      await orderService.cancelOrder(orderId);
      
      // Update the order status locally
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: 'Cancelled' } : order
      ));
      
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error('Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
    'Pending': 'bg-amber-200 text-amber-900',     // soft orange
    'Accepted': 'bg-sky-200 text-sky-900',        // light blue
    'Preparing': 'bg-indigo-200 text-indigo-900', // medium indigo
    'On the Way': 'bg-teal-200 text-teal-900',    // calm teal
    'Delivered': 'bg-lime-200 text-lime-900',     // fresh lime green
    'Cancelled': 'bg-rose-200 text-rose-900'      // soft red
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return '⏳';
      case 'Accepted': return '✅';
      case 'Preparing': return '👨‍🍳';
      case 'On the Way': return '🚚';
      case 'Delivered': return '🎉';
      case 'Cancelled': return '❌';
      default: return '⭕';
    }
  };

  const filterOrders = (orders) => {
    // First apply status filter
    let result = orders.filter((order) => {
      if (filter === 'active') {
        return ['Pending', 'Accepted', 'Preparing', 'On the Way'].includes(order.status);
      }
      if (filter === 'completed') {
        return ['Delivered', 'Cancelled'].includes(order.status);
      }
      return true;
    });
    
    // Then apply search filter if there's a query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(order => 
        order._id.toLowerCase().includes(query) ||
        order.restaurant?.name?.toLowerCase().includes(query) ||
        order.items.some(item => item.name.toLowerCase().includes(query))
      );
    }
    
    // Finally sort the results
    result.sort((a, b) => {
      switch (sortOption) {
        case 'date-asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'date-desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'price-asc':
          return a.totalAmount - b.totalAmount;
        case 'price-desc':
          return b.totalAmount - a.totalAmount;
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
    
    return result;
  };

  const filteredOrders = filterOrders(orders);

  const renderOrderStatus = (order) => {
    const statuses = ['Pending', 'Accepted', 'Preparing', 'On the Way', 'Delivered'];
    const currentIndex = statuses.indexOf(order.status);
    
    if (order.status === 'Cancelled') {
      return (
        <motion.div 
          className="flex flex-col items-center p-6 bg-rose-50 rounded-xl border border-rose-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div 
            className="text-rose-500 text-4xl mb-3"
            animate={{ 
              rotate: [0, -10, 10, -10, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            ❌
          </motion.div>
          <div className="text-rose-600 font-medium text-lg">Order Cancelled</div>
          <p className="text-rose-500/70 text-sm mt-2 max-w-md text-center">
            This order has been cancelled and will not be processed.
          </p>
        </motion.div>
      );
    }
    
    return (
      <div className="relative py-8">
        {/* Progress bar background */}
        <motion.div 
          className="absolute h-2 bg-gray-100 rounded-full left-0 right-0 top-[2.8rem]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        />
        
        {/* Animated progress fill */}
        <motion.div 
          className="absolute h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full left-0 top-[2.8rem]"
          initial={{ width: 0 }}
          animate={{ 
            width: currentIndex === -1 ? "0%" : 
                  currentIndex === 0 ? "12.5%" : 
                  currentIndex === 1 ? "37.5%" : 
                  currentIndex === 2 ? "62.5%" : 
                  currentIndex === 3 ? "87.5%" : "100%" 
          }}
          transition={{ duration: 1, delay: 0.3, type: "spring", stiffness: 100 }}
        />
        
        {/* Status icons */}
        <div className="flex justify-between relative z-10">
          {statuses.map((status, index) => (
            <motion.div 
              key={status} 
              className="flex flex-col items-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + (index * 0.1) }}
            >
              <motion.div 
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md border-2 ${
                  index <= currentIndex 
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 border-white text-white' 
                    : 'bg-white border-gray-200 text-gray-400'
                }`}
                whileHover={index <= currentIndex ? { scale: 1.1, rotate: 5 } : {}}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {index === 0 && (
                  <motion.span 
                    className="text-xl"
                    animate={index <= currentIndex ? { rotate: [0, 360] } : {}}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    ⏳
                  </motion.span>
                )}
                {index === 1 && (
                  <motion.span 
                    className="text-xl"
                    animate={index <= currentIndex ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                  >
                    ✅
                  </motion.span>
                )}
                {index === 2 && (
                  <motion.span 
                    className="text-xl"
                    animate={index <= currentIndex ? { rotate: [0, 15, 0, -15, 0] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    👨‍🍳
                  </motion.span>
                )}
                {index === 3 && (
                  <motion.span 
                    className="text-xl"
                    animate={index <= currentIndex ? { x: [0, 5, 0, -5, 0] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    🚚
                  </motion.span>
                )}
                {index === 4 && (
                  <motion.span 
                    className="text-xl"
                    animate={index <= currentIndex ? { 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, 0, -10, 0]
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    🎉
                  </motion.span>
                )}
              </motion.div>
              
              <motion.div 
                className={`text-sm mt-3 font-medium px-3 py-1 rounded-full ${
                  index <= currentIndex 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'text-gray-500'
                }`}
                whileHover={index <= currentIndex ? { scale: 1.05 } : {}}
              >
                {status}
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        {/* Current status message */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <span className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 font-medium">
            {currentIndex === 0 && "Order received! Waiting for restaurant to accept."}
            {currentIndex === 1 && "Great news! The restaurant has accepted your order."}
            {currentIndex === 2 && "Your delicious food is being prepared right now."}
            {currentIndex === 3 && "Food is on the way to your location!"}
            {currentIndex === 4 && "Food delivered! Enjoy your meal."}
          </span>
        </motion.div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
          />
          <p className="mt-4 text-orange-600 animate-pulse">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageAnimation}
      className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {backgroundElements.map((el, index) => (
          <motion.div
            key={index}
            className="absolute text-gray-200 opacity-20 z-0"
            style={{
              fontSize: el.size,
              top: el.top,
              left: el.left,
              right: el.right,
              bottom: el.bottom,
              rotate: `${el.rotate}deg`,
            }}
            initial={{ y: 100, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 0.2,
              transition: { 
                delay: el.delay, 
                duration: 1.5 
              }
            }}
          >
            {el.icon}
          </motion.div>
        ))}
        
        {/* Floating bubbles effect */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute rounded-full bg-gradient-to-r from-orange-200 to-red-200 opacity-20"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={itemAnimation}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="relative h-48 bg-gradient-to-r from-orange-500 to-red-600 overflow-hidden">
            <div className="absolute opacity-30 -right-16 -top-16">
              <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="white" d="M45.1,-50.8C58.4,-37.8,69.6,-23.1,73.3,-6.5C77,10.2,73.2,28.8,62.1,41.8C51,54.8,32.5,62.2,14.2,65.2C-4.1,68.2,-22.2,66.9,-36.4,58.5C-50.7,50,-61.2,34.5,-67.1,16.7C-73,-1.1,-74.2,-21.2,-65.6,-35.8C-57,-50.4,-38.5,-59.6,-21.3,-67.7C-4.1,-75.8,12,-83,26.7,-77.6C41.3,-72.2,54.5,-54.4,45.1,-50.8Z" transform="translate(100 100)" />
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Your Orders</h1>
                  <p className="text-white/90 text-lg">Track and manage all your food adventures</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchOrders}
                  disabled={refreshing}
                  className="mt-4 md:mt-0 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium transition-all flex items-center gap-2 shadow-lg"
                >
                  {refreshing ? (
                    <>
                      <motion.svg 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </motion.svg>
                      <span>Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Refresh Orders</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            variants={itemAnimation}
            className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-3"
          >
            <svg className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </motion.div>
        )}

        {/* Search and Sort Controls */}
        <motion.div
          variants={itemAnimation}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-auto flex flex-wrap gap-3">
              {['all', 'active', 'completed'].map((filterType) => (
                <motion.button
                  key={filterType}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(filterType)}
                  className={`px-6 py-2 rounded-full text-sm font-medium ${
                    filter === filterType
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-orange-50'
                  } transition-all duration-300 shadow-sm`}
                >
                  {filterType === 'all' && (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      All Orders
                    </span>
                  )}
                  {filterType === 'active' && (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Active
                    </span>
                  )}
                  {filterType === 'completed' && (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </span>
                  )}
                </motion.button>
              ))}

            </div>
            
            <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-4 py-2 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Order Stats */}
        <motion.div 
          variants={itemAnimation}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-5 flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m-4 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-5 flex items-center">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Orders</p>
              <p className="text-2xl font-bold text-gray-800">
                {orders.filter(order => ['Pending', 'Accepted', 'Preparing', 'On the Way'].includes(order.status)).length}
              </p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-5 flex items-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Delivered Orders</p>
              <p className="text-2xl font-bold text-gray-800">
                {orders.filter(order => order.status === 'Delivered').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemAnimation} className="space-y-6">
          {filteredOrders.map((order) => (
            <motion.div 
              key={order._id}
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden cursor-pointer border border-gray-100 hover:border-orange-200 transition-all duration-300"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center mr-4">
                      <span className="text-xl">{getStatusIcon(order.status)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.restaurant?.name || 'Restaurant'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Order #{order._id.slice(-8).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-6">
                      <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                      <p className="text-lg font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      {item.quantity}× {item.name}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {filteredOrders.length === 0 && (
            <motion.div
              variants={itemAnimation}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-6"
                >
                  {filter === 'active' ? (
                    <span className="text-4xl">⏱️</span>
                  ) : filter === 'completed' ? (
                    <span className="text-4xl">✅</span>
                  ) : searchQuery ? (
                    <span className="text-4xl">🔍</span>
                  ) : (
                    <span className="text-4xl">🍽️</span>
                  )}
                </motion.div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {searchQuery ? "No matching orders found" : "No orders found"}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchQuery 
                    ? "We couldn't find any orders matching your search criteria. Try a different search or clear filters."
                    : filter === 'all'
                    ? "Looks like you haven't placed any orders yet. Start your food journey today!"
                    : filter === 'active'
                    ? "You don't have any active orders at the moment. Ready to order something delicious?"
                    : "You don't have any completed orders yet. Your order history will appear here."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {searchQuery && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSearchQuery('')}
                      className="px-6 py-3 rounded-full bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear Search
                    </motion.button>
                  )}
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/restaurants"
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
                    >
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Browse Restaurants
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              variants={modalAnimation}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative">
                {/* Enhanced header with pattern */}
                <div className="h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-t-2xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-30">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <pattern id="orderPattern" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
                          <rect width="100%" height="100%" fill="none"/>
                          <circle cx="20" cy="20" r="3" fill="white" fillOpacity="0.5" />
                          <path d="M0 20h40M20 0v40" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#orderPattern)" />
                    </svg>
                  </div>
                  <div className="absolute h-full w-full flex items-center justify-center">
                    <motion.div
                      initial={{ x: 100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="text-white text-xl font-bold flex items-center"
                    >
                      <span className="mr-4 text-3xl opacity-80">
                        {getStatusIcon(selectedOrder.status)}
                      </span>
                      <h2 className="text-2xl font-bold">
                        Order Details
                      </h2>
                    </motion.div>
                  </div>
                </div>
                
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -bottom-12 left-0 right-0 flex justify-center"
                >
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-white">
                    <motion.span 
                      className="text-4xl"
                      animate={{ 
                        scale: [1, 1.2, 1], 
                        rotate: [0, 5, -5, 0] 
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        repeatType: "reverse" 
                      }}
                    >
                      {getStatusIcon(selectedOrder.status)}
                    </motion.span>
                  </div>
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedOrder(null)}
                  className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors z-10"
                >
                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              
              <div className="p-8 pt-16">
                <div className="text-center mb-8">
                  <motion.h2 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl font-bold text-gray-900 mb-1"
                  >
                    Order #{selectedOrder._id.slice(-8).toUpperCase()}
                  </motion.h2>
                  <motion.p 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-600"
                  >
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </motion.p>
                </div>
                
                <motion.div 
                  className="relative my-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {renderOrderStatus(selectedOrder)}
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <svg className="w-5 h-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </motion.div>
                      Order Details
                    </h3>
                    <motion.div 
                      className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 shadow-sm border border-gray-100"
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex justify-between font-medium text-gray-800 mb-3">
                        <span>Restaurant</span>
                        <span className="font-bold text-orange-600">{selectedOrder.restaurant?.name || 'Restaurant'}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 mb-3">
                        <span>Status</span>
                        <motion.span 
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedOrder.status)}`}
                          whileHover={{ scale: 1.05 }}
                        >
                          {selectedOrder.status}
                        </motion.span>
                      </div>
                      <div className="flex justify-between text-gray-600 mb-3">
                        <span>Date</span>
                        <span>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Time</span>
                        <span>{new Date(selectedOrder.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </motion.div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <svg className="w-5 h-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </motion.div>
                      Delivery Information
                    </h3>
                    <motion.div 
                      className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 shadow-sm border border-gray-100"
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex justify-between font-medium text-gray-800 mb-3">
                        <span>Delivery Address</span>
                        <span className="text-right font-bold text-gray-700">{selectedOrder.deliveryAddress || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 mb-3">
                        <span>Phone</span>
                        <span>{selectedOrder.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Delivery Notes</span>
                        <span className="text-right">{selectedOrder.deliveryInstructions || 'None'}</span>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
                
                <motion.div 
                  className="mt-10"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <svg className="w-5 h-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </motion.div>
                    Order Items
                  </h3>
                  
                  <motion.div 
                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                    whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  >
                    <div className="divide-y divide-gray-200">
                      {selectedOrder.items.map((item, index) => (
                        <motion.div 
                          key={index} 
                          className="flex justify-between p-4 hover:bg-orange-50 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 + (index * 0.1) }}
                          whileHover={{ x: 3 }}
                        >
                          <div className="flex items-center">
                            <motion.div 
                              className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 mr-4 shadow-sm"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                              <div className="h-full w-full flex items-center justify-center text-orange-500 font-bold">
                                {item.quantity}×
                              </div>
                            </motion.div>
                            <div>
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="mt-1 text-sm text-gray-500">{item.description || ''}</p>
                            </div>
                          </div>
                          <p className="text-gray-900 font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </motion.div>
                      ))}
                    </div>
                    
                    <motion.div 
                      className="bg-gradient-to-r from-orange-100 to-red-100 p-5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.1 }}
                    >
                      <div className="flex justify-between text-gray-600 mb-2">
                        <span>Subtotal</span>
                        <span>${(selectedOrder.totalAmount - (selectedOrder.deliveryFee || 0)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 mb-3">
                        <span>Delivery Fee</span>
                        <span>${(selectedOrder.deliveryFee || 0).toFixed(2)}</span>
                      </div>
                      <motion.div 
                        className="flex justify-between font-bold text-gray-900 text-xl border-t border-orange-200 pt-3"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.2, type: "spring" }}
                      >
                        <span>Total</span>
                        <span className="text-orange-600">${selectedOrder.totalAmount.toFixed(2)}</span>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  className="mt-10 flex justify-end gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                >
                  {['Pending', 'Accepted'].includes(selectedOrder.status) && (
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: "#FEE2E2" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleCancelOrder(selectedOrder._id);
                        setSelectedOrder(null);
                      }}
                      disabled={cancellingOrderId === selectedOrder._id}
                      className="px-6 py-3 rounded-full bg-rose-100 text-rose-700 transition-all duration-300 flex items-center gap-2 shadow-sm"
                    >
                      {cancellingOrderId === selectedOrder._id ? (
                        <>
                          <motion.svg 
                            animate={{ rotate: 360 }} 
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </motion.svg>
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Cancel Order</span>
                        </>
                      )}
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedOrder(null)}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white transition-all duration-300 flex items-center gap-2 shadow-md"
                  >
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Close</span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Orders;
