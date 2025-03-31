import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Footer = () => {
  const footerAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const socialIconAnimation = {
    hover: {
      scale: 1.2,
      rotate: [0, -10, 10, 0],
      transition: {
        duration: 0.3
      }
    },
    tap: {
      scale: 0.9
    }
  };

  return (
    <motion.footer
      initial="hidden"
      animate="show"
      variants={footerAnimation}
      className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12 relative overflow-hidden"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Section */}
          <motion.div variants={itemAnimation}>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              DineSwift
            </h3>
            <p className="text-gray-400 hover:text-gray-300 transition-colors duration-300">
              Delivering happiness to your doorstep, one meal at a time. Experience the convenience of modern food delivery with DineSwift.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemAnimation}>
            <h4 className="text-xl font-semibold mb-6 text-orange-400">Quick Links</h4>
            <motion.div className="space-y-3 flex flex-col">
              {[
                { to: '/about-us', text: 'About Us' },
                { to: '/contact', text: 'Contact' },
                { to: '/faq', text: 'FAQ' },
              ].map((link, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link 
                    to={link.to}
                    className="text-gray-400 hover:text-orange-400 transition-colors duration-300 flex items-center gap-2"
                  >
                    <span>→</span>
                    {link.text}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Social Links */}
          <motion.div variants={itemAnimation}>
            <h4 className="text-xl font-semibold mb-6 text-orange-400">Connect With Us</h4>
            <div className="flex space-x-4">
              {[
                { icon: '📱', label: 'Phone' },
                { icon: '📧', label: 'Email' },
                { icon: '💬', label: 'Chat' },
              ].map((social, index) => (
                <motion.div
                  key={index}
                  variants={socialIconAnimation}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg hover:shadow-orange-500/20 transition-shadow duration-300"
                  title={social.label}
                >
                  <span className="text-xl">{social.icon}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Copyright Section */}
        <motion.div 
          variants={itemAnimation}
          className="mt-12 pt-8 border-t border-gray-800 text-center"
        >
          <p className="text-gray-400 hover:text-gray-300 transition-colors duration-300">
            © {new Date().getFullYear()} DineSwift - All Rights Reserved
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;