import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';  // Import typewriter effect


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      // Redirect to the previous page or restaurants page
      const from = location.state?.from || '/';
      navigate(from);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const pageAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const formAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
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

  const buttonHover = {
    hover: { 
      scale: 1.05, 
      boxShadow: "0px 8px 20px rgba(0,0,0,0.15)",
      textShadow: "0px 0px 8px rgba(255,255,255,0.5)" 
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageAnimation}
      className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1604329760661-e71dc83f8f26')] bg-cover bg-center opacity-10" />
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

      {/* Floating Food Icons */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-[15%] left-[7%] text-5xl opacity-80 rotate-12"
        style={{ filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.1))" }}
      >☕</motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-[25%] right-[10%] text-5xl opacity-80 -rotate-6"
        style={{ filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.1))" }}
      >🍩</motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute bottom-[20%] left-[12%] text-5xl opacity-80 rotate-6"
        style={{ filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.1))" }}
      >🍦</motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute bottom-[10%] right-[15%] text-5xl opacity-80 -rotate-12"
        style={{ filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.1))" }}
      >🥤</motion.div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.h2
          variants={itemAnimation}
          className="text-4xl font-bold text-center bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6"
        >
          <Typewriter words={["Welcome Back!", "Sign in to continue", "Access your account"]} loop={false} cursor />
        </motion.h2>
        <motion.p
          variants={itemAnimation}
          className="text-center text-gray-600 mb-8"
        >
          Sign in to your account to continue
        </motion.p>
      </div>

      <motion.div
        variants={formAnimation}
        initial="hidden"
        animate="show"
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-sm py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-orange-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <motion.div variants={itemAnimation}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                required
              />
            </motion.div>

            <motion.div variants={itemAnimation}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                required
              />
            </motion.div>

            <motion.div variants={itemAnimation}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 
                  'Signing in...' : 
                  <motion.span 
                    animate={{ scale: [1, 1.03, 1] }} 
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Sign in
                  </motion.span>
                }
              </motion.button>
            </motion.div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-300"
                >
                  <span className="sr-only">Sign in with Google</span>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                    />
                  </svg>
                </button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-300"
                >
                  <span className="sr-only">Sign in with Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </motion.div>
            </div>
          </div>

          <motion.div 
            variants={itemAnimation} 
            className="mt-6 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <Link
              to="/signup"
              className="text-orange-600 hover:text-orange-700 font-medium transition-colors duration-300"
            >
              Don't have an account? Sign up
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
