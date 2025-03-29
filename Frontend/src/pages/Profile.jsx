import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await userService.updateProfile(formData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageAnimation}
      className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          variants={itemAnimation}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="relative h-48 bg-gradient-to-r from-orange-400 to-red-500">
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
              <h1 className="text-4xl font-bold text-white">Your Profile</h1>
              <p className="text-white/80 mt-2">Manage your account settings and preferences</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Information */}
          <motion.div
            variants={itemAnimation}
            className="md:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Personal Information</h2>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg"
              >
                {success}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemAnimation}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                />
              </motion.div>

              <motion.div variants={itemAnimation}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                />
              </motion.div>

              <motion.div variants={itemAnimation}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                />
              </motion.div>

              <motion.div variants={itemAnimation}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                />
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </motion.button>
            </form>
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={itemAnimation} className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-600">Active</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2 px-4 rounded-lg text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all duration-300"
                >
                  Change Password
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2 px-4 rounded-lg text-red-600 border border-red-200 hover:bg-red-50 transition-all duration-300"
                >
                  Delete Account
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile; 