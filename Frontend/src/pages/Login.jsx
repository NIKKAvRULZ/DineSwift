import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

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

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageAnimation}
      className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.h2
          variants={itemAnimation}
          className="text-4xl font-bold text-center bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6"
        >
          Welcome Back
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
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-sm py-8 px-4 shadow-xl rounded-2xl sm:px-10">
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
                {loading ? 'Signing in...' : 'Sign in'}
              </motion.button>
            </motion.div>
          </form>

          <motion.div variants={itemAnimation} className="mt-6 text-center">
            <Link
              to="/signup"
              className="text-orange-600 hover:text-orange-700 font-medium"
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
