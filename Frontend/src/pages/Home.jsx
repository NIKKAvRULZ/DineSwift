import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';  // Import typewriter effect
import axios from 'axios';
import { useRef } from 'react';


const Home = () => {
  const { isAuthenticated, user } = useAuth();
  // State to store top-rated menu items
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch top-rated menu items on component mount
  useEffect(() => {
    const fetchTopRatedItems = async () => {
      try {
        const response = await axios.get('http://localhost:5002/api/menu-items/top-rated');
        setTopItems(response.data.slice(0, 6)); // Get top 6 items
      } catch (error) {
        console.error('Error fetching top-rated items:', error);
        // Fallback data if API fails
        setTopItems([
          {
            id: 1,
            name: 'Margherita Pizza',
            restaurant: 'Pizza Palace',
            price: 12.99,
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=1000&auto=format&fit=crop'
          },
          {
            id: 2,
            name: 'Chicken Biryani',
            restaurant: 'Spice Garden',
            price: 15.99,
            rating: 4.7,
            image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1000&auto=format&fit=crop'
          },
          {
            id: 3,
            name: 'Chocolate Cake',
            restaurant: 'Sweet Delights',
            price: 8.99,
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop'
          },
          {
            id: 4,
            name: 'Caesar Salad',
            restaurant: 'Green Fresh',
            price: 10.99,
            rating: 4.6,
            image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=1000&auto=format&fit=crop'
          },
          {
            id: 5,
            name: 'Beef Burger',
            restaurant: 'Burger Hub',
            price: 13.99,
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop'
          },
          {
            id: 6,
            name: 'Sushi Platter',
            restaurant: 'Tokyo Bites',
            price: 22.99,
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000&auto=format&fit=crop'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthenticated) {
      fetchTopRatedItems();
    }
  }, [isAuthenticated]);

  // Animation variants
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
  
  // Food item animation
  const itemAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  // Component for the top-rated menu items section
  const ExploreMenuSection = () => (
    <motion.div 
    
      initial="initial" 
      animate="animate" 
      variants={fadeIn}
      className="py-20 px-4 sm:px-6 relative z-10"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div variants={fadeIn} className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">Top-Rated</span> Menu Items
          </h2>
          <p className="text-xl text-gray-600">
            Take a peek at what our happy customers are enjoying the most
          </p>
        </motion.div>
        
        {loading ? (
          // Loading state
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
            />
          </div>
        ) : (
          // Grid of menu items
          <motion.div 
            variants={staggerContainer} 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {topItems.map((item, index) => (
              <motion.div
                key={item.id}
                variants={itemAnimation}
                whileHover={{ y: -10 }}
                className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl relative"
              >
                {/* Badge for top items */}
                {index < 3 && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-yellow-400 text-gray-900 font-bold px-3 py-1 rounded-full text-sm shadow-md flex items-center gap-1">
                      {index === 0 ? '🥇 Top Rated' : index === 1 ? '🥈 Must Try' : '🥉 Popular'}
                    </div>
                  </div>
                )}
                
                {/* Image */}
                <div className="h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-all duration-500 hover:scale-110"
                  />
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                    <div className="flex items-center bg-orange-50 px-2 py-1 rounded-full">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="font-semibold">{item.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">From {item.restaurant}</p>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-gray-900">Rs {item.price}</p>
                    <Link 
                      to="/login"
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-medium transition-all duration-300 hover:shadow-lg"
                    >
                      Order Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* View all button */}
        <motion.div 
          variants={fadeIn} 
          className="mt-12 text-center"
        >
          <Link 
            to="/login" 
            className="inline-flex items-center px-8 py-3 bg-white text-orange-600 border-2 border-orange-500 rounded-full font-semibold shadow-md hover:bg-orange-50 transition-all duration-300"
          >
            View Full Menu
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );

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
        <motion.div {...fadeIn} className="mx-auto max-w-3xl py-20 sm:py-32 lg:py-40 text-center">
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
      
      {/* Add the Explore Menu Section */}
      <ExploreMenuSection />
    </motion.div>
  );

  return isAuthenticated ? <AuthenticatedHome /> : <UnauthenticatedHome />;
};


export default Home;
