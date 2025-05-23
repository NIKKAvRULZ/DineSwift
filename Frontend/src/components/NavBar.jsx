import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaMotorcycle, FaClipboardList, FaTasks, FaUserCircle, FaSearch, FaBars, FaTimes, FaUtensils, FaUser, FaSignOutAlt  } from 'react-icons/fa';
import axios from 'axios';


const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [driverStatus, setDriverStatus] = useState('offline');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [cartCount, setCartCount] = useState(3); // Replace with actual cart count from context
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navAnimation = {
    hidden: { y: -100, opacity: 0 },
    show: { 
      y: 0,
      opacity: 1,
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
      y: -2,
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
  }
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: { 
        duration: 0.2 
      }
    }
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchVisible(false);
    }
  };

  return (
    <motion.nav 
      initial="hidden"
      animate="show"
      variants={navAnimation}
      className={`${scrolled ? 'bg-white/90' : 'bg-white/80'} backdrop-blur-md shadow-lg sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-3'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <motion.div 
            className="flex"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
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

          {/* Desktop Navigation */}
          <div className=" md:flex items-center space-x-2">
            {isAuthenticated ? (
              isDeliveryDriver ? (
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
              ):(
<>
              <motion.div variants={linkHover} whileHover="hover">
                <Link
                  to="/restaurants"
                  className="px-4 py-2 rounded-full text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 flex items-center relative"
                >
                  <FaUtensils className="mr-2 text-orange-500" />
                  Restaurants
                </Link>
              </motion.div>

              <motion.div variants={linkHover} whileHover="hover">
                <Link
                  to="/orders"
                  className="px-4 py-2 rounded-full text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 flex items-center relative"
                >
                  <FaClipboardList className="mr-2 text-orange-500" />
                  Orders
                </Link>
              </motion.div>

              {/* Cart with Badge */}
              <motion.div variants={linkHover} whileHover="hover">
                <Link
                  to="/cart"
                  className="px-4 py-2 rounded-full text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 flex items-center relative"
                >
                  <FaShoppingCart className="mr-2 text-orange-500" />
                  Cart
                </Link>
              </motion.div>

              {/* User Profile Dropdown */}
              <div ref={dropdownRef} className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="ml-2 flex items-center px-3 py-2 rounded-full text-gray-700 hover:bg-orange-50 transition-all duration-300"
                >
                  <FaUserCircle className="mr-2 text-orange-500" size={30} />
                </motion.button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-10 border border-orange-100"
                    >
                      {/* Profile Link */}
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaUser className="text-orange-500" />
                        My Profile
                      </Link>

                      <div className="border-t border-gray-100 my-2"></div>

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <FaSignOutAlt className="text-red-500" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
              )
            ) : (
              // Non-authenticated Navigation
              <>
                <motion.div variants={linkHover} whileHover="hover">
                  <Link
                    to="/restaurants"
                    className="px-4 py-2 rounded-full text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300"
                  >
                    Restaurants
                  </Link>
                </motion.div>

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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-orange-50"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-4 space-y-1 mt-2 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <div className="pt-2 pb-3">
                      <form onSubmit={handleSearch} className="relative">
                        <input
                          type="text"
                          placeholder="Search restaurants..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-4 py-2 rounded-full border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                        <button 
                          type="submit"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          <FaSearch />
                        </button>
                      </form>
                    </div>
                    <Link
                      to="/restaurants"
                      className="block px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Restaurants
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    <Link
                      to="/cart"
                      className="block px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all flex items-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaShoppingCart className="mr-2" />
                      Cart
                      {cartCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/favorites"
                      className="block px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Favorites
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left block px-4 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-all"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/restaurants"
                      className="block px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Restaurants
                    </Link>
                    <div className="mt-4 space-y-3 px-4">
                      <Link
                        to="/login"
                        className="block w-full px-4 py-3 rounded-full text-center text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="block w-full px-4 py-3 rounded-full text-center text-gray-700 border border-orange-200 hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};


export default Navbar;
