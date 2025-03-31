import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate('/login');
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
          <motion.div 
            className="flex"
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                DineSwift
              </span>
            </Link>
          </motion.div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <><div className="flex items-center space-x-4">
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
              </div><motion.div variants={linkHover} whileHover="hover">
                  <Link
                    to="/cart"
                    className="px-4 py-2 rounded-full text-gray-700 hover:bg-orange-50 transition-all duration-300 flex items-center"
                  >
                    <FaShoppingCart className="mr-2" />
                    Cart
                  </Link>
                </motion.div></>
            ) : (
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
