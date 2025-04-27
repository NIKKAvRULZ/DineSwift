import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaMotorcycle, FaClipboardList, FaTasks, FaUserCircle } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [driverStatus, setDriverStatus] = useState('offline');

  const navAnimation = {
    hidden: { y: -100 },
    show: { 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  const linkHover = {
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const isDeliveryDriver = user?.role === 'delivery';

  useEffect(() => {
    if (isDeliveryDriver) {
      fetchDriverStatus();
    }
  }, [isDeliveryDriver]);

  const fetchDriverStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5004/api/delivery/driver-status', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDriverStatus(response.data.status);
    } catch (err) {
      console.error('Error fetching driver status:', err);
    }
  };

  const toggleDriverStatus = async () => {
    try {
      const newStatus = driverStatus === 'online' ? 'offline' : 'online';
      await axios.put('http://localhost:5004/api/delivery/driver-status', 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      setDriverStatus(newStatus);
    } catch (err) {
      console.error('Error updating driver status:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav 
      initial="hidden"
      animate="show"
      variants={navAnimation}
      className="bg-white/80 backdrop-blur-sm shadow-lg sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <motion.div className="flex" whileHover={{ scale: 1.05 }}>
            <Link to="/" className="flex items-center">
              {isDeliveryDriver ? (
                <>
                  <FaMotorcycle className="text-[#ed2200] text-2xl mr-2" />
                  <span className="font-semibold text-gray-900">DineSwift Delivery</span>
                </>
              ) : (
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  DineSwift
                </span>
              )}
            </Link>
          </motion.div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              isDeliveryDriver ? (
                // Delivery Driver Navigation
                <>
                  <Link
                    to="/delivery"
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                      location.pathname === '/delivery'
                        ? 'text-[#ed2200] bg-red-50'
                        : 'text-gray-700 hover:text-[#ed2200]'
                    }`}
                  >
                    <FaClipboardList className="mr-2" />
                    My Deliveries
                  </Link>
                  
                  <Link
                    to="/delivery/available"
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                      location.pathname === '/delivery/available'
                        ? 'text-[#ed2200] bg-red-50'
                        : 'text-gray-700 hover:text-[#ed2200]'
                    }`}
                  >
                    <FaTasks className="mr-2" />
                    Available Orders
                  </Link>

                  <button
                    onClick={toggleDriverStatus}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      driverStatus === 'online'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {driverStatus === 'online' ? '🟢 Online' : '⚫ Offline'}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center text-gray-700 hover:text-[#ed2200] focus:outline-none"
                    >
                      <FaUserCircle className="text-2xl" />
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Regular User Navigation
                <>
                  <div className="flex items-center space-x-4">
                    <motion.div variants={linkHover} whileHover="hover">
                      <Link
                        to="/restaurants"
                        className="px-4 py-2 rounded-full text-gray-700 hover:bg-orange-50 transition-all duration-300"
                      >
                        Restaurants
                      </Link>
                    </motion.div>
                    <motion.div variants={linkHover} whileHover="hover">
                      <Link
                        to="/orders"
                        className="px-4 py-2 rounded-full text-gray-700 hover:bg-orange-50 transition-all duration-300"
                      >
                        Orders
                      </Link>
                    </motion.div>
                    <motion.div variants={linkHover} whileHover="hover">
                      <Link
                        to="/profile"
                        className="px-4 py-2 rounded-full text-gray-700 hover:bg-orange-50 transition-all duration-300"
                      >
                        Profile
                      </Link>
                    </motion.div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="px-6 py-2 rounded-full text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Logout
                    </motion.button>
                  </div>
                  <motion.div variants={linkHover} whileHover="hover">
                    <Link
                      to="/cart"
                      className="px-4 py-2 rounded-full text-gray-700 hover:bg-orange-50 transition-all duration-300 flex items-center"
                    >
                      <FaShoppingCart className="mr-2" />
                      Cart
                    </Link>
                  </motion.div>
                </>
              )
            ) : (
              // Non-authenticated Navigation
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="px-6 py-2 rounded-full text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/signup"
                    className="px-6 py-2 rounded-full text-gray-700 border border-orange-200 hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
