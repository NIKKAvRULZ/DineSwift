import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, useScroll, useTransform } from 'framer-motion';  // Added useScroll and useTransform
import { Typewriter } from 'react-simple-typewriter';
import axios from 'axios';
import { useRef } from 'react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Refs for scroll-triggered animations
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  
  // Scroll-based animations
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.2]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  
  // Add testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Food Enthusiast",
      image: "https://randomuser.me/api/portraits/women/32.jpg",
      quote: "DineSwift has completely changed how I order food. The variety of restaurants is amazing!"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Busy Professional",
      image: "https://randomuser.me/api/portraits/men/54.jpg",
      quote: "The delivery is always on time and the food arrives hot and fresh. Couldn't ask for more."
    },
    {
      id: 3,
      name: "Priya Sharma",
      role: "Regular Customer",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      quote: "I love the exclusive deals and discounts. My favorite restaurants are just a click away!"
    }
  ];

  // Stats for the platform
  const stats = [
    { label: "Happy Customers", value: "50K+", icon: "😊" },
    { label: "Restaurant Partners", value: "500+", icon: "🍽️" },
    { label: "Cities", value: "25+", icon: "🏙️" },
    { label: "Daily Orders", value: "10K+", icon: "📦" }
  ];

  // Feature highlights
  const features = [
    {
      title: "Fast Delivery",
      description: "Get your food delivered in 30 minutes or less",
      icon: "⚡",
      color: "from-yellow-400 to-orange-500"
    },
    {
      title: "Live Tracking",
      description: "Know exactly when your food will arrive",
      icon: "🔍",
      color: "from-blue-400 to-indigo-500"
    },
    {
      title: "Special Offers",
      description: "Exclusive deals and discounts just for you",
      icon: "🎁",
      color: "from-green-400 to-emerald-500"
    }
  ];

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

  // Enhanced animation variants
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
      scale: 1.05,
      boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
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
  
  // More engaging button hover effect
  const buttonHover = {
    hover: { 
      scale: 1.05, 
      boxShadow: "0px 8px 20px rgba(0,0,0,0.15)",
      textShadow: "0px 0px 8px rgba(255,255,255,0.5)" 
    }
  };
  
  // Food item animation
  const itemAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };
  
  // Scroll reveal animation
  const revealAnimation = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8 }
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

  // New Feature Highlights Component for unauthenticated home
  const FeatureHighlights = () => (
    <motion.div
      ref={featuresRef}
      variants={revealAnimation}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true, margin: "-100px" }}
      className="py-20 px-4 sm:px-6 relative z-10 bg-gradient-to-b from-white/20 to-orange-50/50 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div variants={fadeIn} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">DineSwift</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the convenience of modern food delivery with features designed for you
          </p>
        </motion.div>
        
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardHover}
              whileHover="hover"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-orange-100 p-8"
            >
              <motion.div
                whileHover={{ rotate: 15, scale: 1.2 }}
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br ${feature.color} text-white`}
              >
                <span className="text-2xl">{feature.icon}</span>
              </motion.div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );

  // New Testimonials Component
  const TestimonialsSection = () => (
    <motion.div
      variants={revealAnimation}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true }}
      className="py-20 px-4 sm:px-6 relative z-10 bg-gradient-to-b from-orange-50/50 to-white/20"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div variants={fadeIn} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">Customers Say</span>
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of satisfied customers enjoying their favorite meals
          </p>
        </motion.div>
        
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              variants={cardHover}
              whileHover="hover"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-orange-100 p-8 relative"
            >
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-orange-100 rounded-full opacity-50" />
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-red-100 rounded-full opacity-50" />
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-orange-300 mr-4"
                  />
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                
                <div className="mt-4 text-yellow-500 text-xl">
                  ★★★★★
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );

  // New Stats Component
  const StatsSection = () => (
    <motion.div
      ref={statsRef}
      variants={revealAnimation}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true }}
      className="py-16 px-4 sm:px-6 relative z-10 bg-gradient-to-r from-orange-500 to-red-500"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          variants={staggerContainer} 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <motion.div 
                whileHover={{ scale: 1.2, rotate: 5 }}
                className="text-5xl mb-2"
              >
                {stat.icon}
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="text-4xl font-bold mb-1"
              >
                {stat.value}
              </motion.div>
              <p className="text-white/80">{stat.label}</p>
            </motion.div>
          ))}
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
      {/* Hero Background with parallax effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          style={{ scale, opacity }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836')] bg-cover bg-center opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-red-100/50" />
        
        {/* Animated particles */}
        <motion.div
          animate={{ 
            rotate: 360,
            y: [0, -100, 0],
            x: [0, 100, 0]
          }}
          transition={{ duration:
          25, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-orange-300/20 blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            y: [0, 100, 0],
            x: [0, -100, 0]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full bg-red-300/20 blur-3xl"
        />
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
          {/* Quick Order Card - Enhanced */}
          <motion.div
            variants={cardHover}
            whileHover="hover"
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-orange-100 relative"
          >
            <div className="absolute top-0 right-0 h-24 w-24 bg-orange-100/50 rounded-bl-full z-0" />
            <div className="p-8 relative z-10">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.2 }}
                className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center mb-6 text-white shadow-lg"
              >
                <span className="text-2xl">🍽️</span>
              </motion.div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Quick Order</h3>
              <p className="text-gray-600 mb-6">
                Explore restaurants and place your order instantly
              </p>
              <motion.div>
                <Link
                  to="/restaurants"
                  className="inline-flex items-center px-6 py-3 rounded-full text-white bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300 shadow-md"
                  whileHover={{ 
                    scale: 1.03,
                    backgroundImage: "linear-gradient(to right, #ff5f6d, #ff8e53)",
                    boxShadow: "0px 8px 20px rgba(255, 120, 50, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 15 
                  }}
                >
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: -4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="flex items-center"
                  >
                    Order Now
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H3a1 1 0 110-2h9.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </motion.svg>
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Active Orders Card - Enhanced */}
          <motion.div
            variants={cardHover}
            whileHover="hover"
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-green-100 relative"
          >
            <div className="absolute top-0 right-0 h-24 w-24 bg-green-100/50 rounded-bl-full z-0" />
            <div className="p-8 relative z-10">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.2 }}
                className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center mb-6 text-white shadow-lg"
              >
                <span className="text-2xl">📋</span>
              </motion.div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Track Orders</h3>
              <p className="text-gray-600 mb-6">
                Real-time tracking of your current orders
              </p>
              <motion.div>
                <Link
                  to="/orders"
                  className="inline-flex items-center px-6 py-3 rounded-full text-white bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 shadow-md"
                  whileHover={{ 
                    scale: 1.03,
                    backgroundImage: "linear-gradient(to right, #2ecc71, #1abc9c)",
                    boxShadow: "0px 8px 20px rgba(46, 204, 113, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 15 
                  }}
                >
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: -4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="flex items-center"
                  >
                    View Orders
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H3a1 1 0 110-2h9.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </motion.svg>
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Profile Card - Enhanced */}
          <motion.div
            variants={cardHover}
            whileHover="hover"
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-purple-100 relative"
          >
            <div className="absolute top-0 right-0 h-24 w-24 bg-purple-100/50 rounded-bl-full z-0" />
            <div className="p-8 relative z-10">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.2 }}
                className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full flex items-center justify-center mb-6 text-white shadow-lg"
              >
                <span className="text-2xl">👤</span>
              </motion.div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Your Profile</h3>
              <p className="text-gray-600 mb-6">
                Customize your preferences and settings
              </p>
              <motion.div>
                <Link
                  to="/profile"
                  className="inline-flex items-center px-6 py-3 rounded-full text-white bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 shadow-md"
                  whileHover={{ 
                    scale: 1.03,
                    backgroundImage: "linear-gradient(to right, #9b59b6, #8e44ad)",
                    boxShadow: "0px 8px 20px rgba(155, 89, 182, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 15 
                  }}
                >
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: -4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="flex items-center"
                  >
                    View Profile
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H3a1 1 0 110-2h9.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </motion.svg>
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Interactive Food Ordering Components */}
        <motion.div
          variants={revealAnimation}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Quick Meal Ideas */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-orange-100 overflow-hidden relative"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-100 rounded-full opacity-50" />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Quick Meal Ideas</h3>
                <motion.div 
                  className="text-3xl"
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🍳
                </motion.div>
              </div>
              
              <div className="space-y-4">
                { [
                  { emoji: "🍕", meal: "Pizza Night", description: "Perfect for family dinner" },
                  { emoji: "🥗", meal: "Healthy Bowls", description: "Nutrient-packed options" },
                  { emoji: "🍜", meal: "Ramen Special", description: "Warm and comforting" }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                    className="flex items-center p-3 bg-gradient-to-r from-orange-50 to-white rounded-xl cursor-pointer group"
                  >
                    <motion.div 
                      whileHover={{ rotate: 20, scale: 1.2 }}
                      className="text-2xl mr-3"
                    >
                      {item.emoji}
                    </motion.div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 group-hover:text-orange-500 transition-colors">{item.meal}</h4>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="bg-orange-100 hover:bg-orange-200 p-2 rounded-full text-orange-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H3a1 1 0 110-2h9.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
              
              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  backgroundImage: "linear-gradient(to right, #ff5f6d, #ff8e53)",
                  boxShadow: "0px 8px 20px rgba(255, 120, 50, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 15 
                }}
                className="mt-6 w-full py-3 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-xl font-medium flex items-center justify-center shadow-md"
              >
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: -4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="flex items-center"
                >
                  Explore All Meal Ideas
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 ml-2" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H3a1 1 0 110-2h9.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </motion.svg>
                </motion.span>
              </motion.button>
            </div>
          </motion.div>

          {/* Food Mood Interactive Component */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-purple-100 overflow-hidden relative"
          >
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-100 rounded-full opacity-50" />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">What's Your Food Mood?</h3>
                <motion.div 
                  className="text-3xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🍽️
                </motion.div>
              </div>
              
              <p className="text-gray-600 mb-6">Tap your current mood and get personalized recommendations!</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                { [
                  { emoji: "😋", mood: "Craving", color: "from-orange-400 to-red-400" },
                  { emoji: "🥗", mood: "Healthy", color: "from-green-400 to-teal-400" },
                  { emoji: "🎉", mood: "Celebration", color: "from-purple-400 to-pink-400" },
                  { emoji: "💼", mood: "Quick Lunch", color: "from-blue-400 to-indigo-400" },
                  { emoji: "😌", mood: "Comfort", color: "from-yellow-400 to-amber-400" },
                  { emoji: "🌶️", mood: "Spicy", color: "from-red-500 to-pink-500" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`bg-gradient-to-r ${item.color} rounded-2xl p-4 text-center cursor-pointer shadow-md text-white`}
                  >
                    <motion.div 
                      className="text-3xl mb-1"
                      animate={{ rotate: [0, 10, 0, -10, 0] }}
                      transition={{ duration: 2, delay: index * 0.2, repeat: Infinity }}
                    >
                      {item.emoji}
                    </motion.div>
                    <p className="font-medium">{item.mood}</p>
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                whileInView={{ opacity: 1, height: 'auto' }}
                className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100"
              >
                <div className="flex items-center mb-3">
                  <motion.div 
                    className="text-2xl mr-3"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  >
                    ✨
                  </motion.div>
                  <h4 className="font-semibold text-purple-700">Today's Special Recommendation</h4>
                </div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center bg-white rounded-xl p-3 shadow-sm"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=100&auto=format&fit=crop" 
                    alt="Dish" 
                    className="w-16 h-16 rounded-lg object-cover mr-4"
                  />
                  <div>
                    <h5 className="font-bold text-gray-900">Buddha Bowl</h5>
                    <p className="text-sm text-gray-500">Perfect blend of flavors & nutrition</p>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500 mr-1">★★★★★</span>
                      <span className="text-xs text-gray-500">(4.9)</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
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
      className="min-h-screen relative bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden"
    >
      {/* Enhanced Background with animated gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543353071-087092ec393a')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-red-100/50" />
        
        {/* Animated gradient blobs */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: 360
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-r from-yellow-300/20 to-orange-300/20 blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: -360
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-r from-red-300/20 to-pink-300/20 blur-3xl"
        />
      </div>

      {/* Enhanced Floating Food Icons with parallax effect */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-[10%] left-[5%] text-7xl opacity-80 rotate-12"
        style={{ filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.1))" }}
      >🍕</motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-[20%] right-[8%] text-6xl opacity-80 -rotate-6"
        style={{ filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.1))" }}
      >🍔</motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute bottom-[15%] left-[12%] text-7xl opacity-80 rotate-6"
        style={{ filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.1))" }}
      >🍣</motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute bottom-[5%] right-[15%] text-6xl opacity-80 -rotate-12"
        style={{ filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.1))" }}
      >🥗</motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-[40%] left-[20%] text-5xl opacity-70 rotate-12"
        style={{ filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.1))" }}
      >🍰</motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-[60%] right-[10%] text-5xl opacity-70 -rotate-12"
        style={{ filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.1))" }}
      >🍜</motion.div>

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
            <motion.div
              whileHover="hover"
              variants={buttonHover}
            >
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-full text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Get Started
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H3a1 1 0 110-2h9.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </motion.svg>
              </Link>
            </motion.div>
            <motion.div
              whileHover="hover"
              variants={buttonHover}
            >
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl border border-gray-200"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Add the Feature Highlights Section */}
      <FeatureHighlights />
      
      {/* Add the Stats Section */}
      <StatsSection />
      
      {/* Add the Testimonials Section */}
      <TestimonialsSection />
      
      {/* Add the Explore Menu Section */}
      <ExploreMenuSection />
    </motion.div>
  );

  return isAuthenticated ? <AuthenticatedHome /> : <UnauthenticatedHome />;
};

export default Home;
