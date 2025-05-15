import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Animation variants
  const pageAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  // Mock data - replace with actual API calls
  const mockOrders = [
    { id: 1, date: '2024-03-30', total: 45.99, status: 'Delivered' },
    { id: 2, date: '2024-03-25', total: 32.50, status: 'Processing' }
  ];

  const deliverySummary = {
    totalOrders: 15,
    successfulDeliveries: 14,
    averageDeliveryTime: '25 mins',
    favoriteRestaurant: 'Pizza Palace'
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageAnimation}
      className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div variants={cardAnimation} className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-4xl text-white font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-600">{user?.email}</p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Active Member
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information Card */}
          <motion.div variants={cardAnimation} className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Phone Number</label>
                <p className="text-gray-900">{user?.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Address</label>
                <p className="text-gray-900">{user?.address || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Member Since</label>
                <p className="text-gray-900">March 2024</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 w-full py-2 px-4 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-all"
              >
                Edit Profile
              </motion.button>
            </div>
          </motion.div>

          {/* Order History Card */}
          <motion.div variants={cardAnimation} className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            <div className="space-y-4">
              {mockOrders.map(order => (
                <motion.div
                  key={order.id}
                  className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-900">Rs {order.total}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Delivery Summary Card */}
          <motion.div variants={cardAnimation} className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Delivery Summary</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {deliverySummary.totalOrders}
                  </p>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {deliverySummary.successfulDeliveries}
                  </p>
                  <p className="text-sm text-gray-600">Successful Deliveries</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Delivery Time</p>
                <p className="text-lg font-medium">{deliverySummary.averageDeliveryTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Favorite Restaurant</p>
                <p className="text-lg font-medium">{deliverySummary.favoriteRestaurant}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;