import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import orderService from '../services/orderService';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

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
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-indigo-100 text-indigo-800',
      delivering: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') {
      return ['pending', 'confirmed', 'preparing', 'ready', 'delivering'].includes(order.status);
    }
    if (filter === 'completed') {
      return ['delivered', 'cancelled'].includes(order.status);
    }
    return true;
  });

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

        <motion.div 
          variants={itemAnimation}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex gap-4">
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
        </motion.div>

        <motion.div variants={itemAnimation} className="space-y-6">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-orange-100"
            >
              <Link to={`/tracking/${order.id}`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        src={order.restaurantImage}
                        alt={order.restaurantName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {order.restaurantName}
                        </h3>
                        <p className="text-gray-600">
                          Order #{order.id} • {order.items?.length} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        ${order.total?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
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
                  {filter === 'all'
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
