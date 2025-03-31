import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';  // Import typewriter effect

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  console.log("User Data:", user);


  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.3
      }
    }
  };
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const cardHover = {
    hover: {
      scale: 1.1,
      transition: {
        type: "spring",
        stiffness: 300
      }
    }
  };

  const slideIn = {
    initial: { x: '-100%' },
    animate: { x: 0 },
    transition: { duration: 1, ease: "easeOut" }
  };

  const AuthenticatedHome = () => (
    <motion.div
      initial="initial"
      animate="animate"
      className="relative min-h-screen bg-gradient-to-br from-orange-50 to-red-50"
    >
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-red-100/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div {...fadeIn} className="text-center mb-16">
          <motion.h1
            variants={fadeIn}
            className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600 mb-4"
          >
            Welcome back, {user?.name || "Guest"}!
          </motion.h1>

          <motion.p
            variants={fadeIn}
            className="text-xl text-gray-600"
          >
            Ready to explore delicious food today?
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
        >
          {/* Quick Order Card */}
          <motion.div
            variants={cardHover}
            whileHover="hover"
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-orange-100"
          >
            <div className="p-8">
              <motion.div
                whileHover={{ rotate: 15 }}
                className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6"
              >
                <span className="text-2xl">🍽️</span>
              </motion.div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Quick Order</h3>
              <p className="text-gray-600 mb-6">
                Explore restaurants and place your order instantly
              </p>
              <Link
                to="/restaurants"
                className="inline-flex items-center px-6 py-3 rounded-full text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-300"
              >
                Order Now
              </Link>
            </div>
          </motion.div>

          {/* Active Orders Card */}
          <motion.div
            variants={cardHover}
            whileHover="hover"
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-orange-100"
          >
            <div className="p-8">
              <motion.div
                whileHover={{ rotate: 15 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6"
              >
                <span className="text-2xl">📋</span>
              </motion.div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Track Orders</h3>
              <p className="text-gray-600 mb-6">
                Real-time tracking of your current orders
              </p>
              <Link
                to="/orders"
                className="inline-flex items-center px-6 py-3 rounded-full text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
              >
                View Orders
              </Link>
            </div>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            variants={cardHover}
            whileHover="hover"
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-orange-100"
          >
            <div className="p-8">
              <motion.div
                whileHover={{ rotate: 15 }}
                className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6"
              >
                <span className="text-2xl">👤</span>
              </motion.div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Your Profile</h3>
              <p className="text-gray-600 mb-6">
                Customize your preferences and settings
              </p>
              <Link
                to="/profile"
                className="inline-flex items-center px-6 py-3 rounded-full text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 transition-all duration-300"
              >
                View Profile
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );

  const UnauthenticatedHome = () => (
    <motion.div
      initial="initial"
      animate="animate"
      className="min-h-screen relative bg-gradient-to-br from-orange-50 to-red-50"
    >
      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543353071-087092ec393a')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-red-100/50" />
      </div>

      {/* Floating Food Icons */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-20 left-10 text-6xl"
      >🍕</motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-40 right-16 text-5xl"
      >🍔</motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute bottom-24 left-24 text-6xl"
      >🍣</motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute bottom-10 right-32 text-5xl"
      >🥗</motion.div>

      <div className="relative z-10 px-6 pt-14 lg:px-8">
        <motion.div {...fadeIn} className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-56 text-center">
          <motion.h1
            variants={fadeIn}
            className="text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600"
          >
            <Typewriter words={["Delicious food at your doorstep!", "Order now, taste the best!", "Satisfy your cravings today!"]} loop cursor/>
          </motion.h1>
          
          <motion.p
            variants={fadeIn}
            className="text-xl text-gray-600 mb-12"
          >
            Join thousands of happy customers and enjoy the best meals from top restaurants!
          </motion.p>

          <motion.div
            variants={fadeIn}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              to="/explore"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-white bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl"
            >
              Explore Menu
            </Link>
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl"
            >
              Sign In
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );

  return isAuthenticated ? <AuthenticatedHome /> : <UnauthenticatedHome />;
};


export default Home;
