import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import orderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import OrderCard from '../components/OrderCard';

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date-desc');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const pageAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
        />
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
        <motion.div
          variants={itemAnimation}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="relative h-48 bg-gradient-to-r from-orange-400 to-red-500">
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
              <h1 className="text-4xl font-bold text-white">Your Orders</h1>
              <p className="text-white/80 mt-2">Track and manage your orders</p>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            variants={itemAnimation}
            className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl"
          >
            {error}
          </motion.div>
        )}

        {/* Search and Sort Controls */}
        <motion.div
          variants={itemAnimation}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-auto flex gap-4">
              {['all', 'active', 'completed'].map((filterType) => (
                <motion.button
                  key={filterType}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(filterType)}
                  className={`px-6 py-2 rounded-full text-sm font-medium ${
                    filter === filterType
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-orange-50'
                  } transition-all duration-300 shadow-sm`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
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

        <motion.div variants={itemAnimation} className="space-y-6">
          {filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}

          {filteredOrders.length === 0 && (
            <motion.div
              variants={itemAnimation}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4"
                >
                  <span className="text-3xl">🍽️</span>
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? "No orders match your search criteria."
                    : filter === 'all'
                    ? "You haven't placed any orders yet."
                    : filter === 'active'
                    ? "You don't have any active orders."
                    : "You don't have any completed orders."}
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/restaurants"
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                  >
                    Browse Restaurants
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Orders;
