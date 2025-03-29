import { motion } from 'framer-motion';

const Footer = () => {
  const footerAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.footer
      initial="hidden"
      animate="show"
      variants={footerAnimation}
      className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              DineSwift
            </h3>
            <p className="text-gray-400">
              Delivering happiness to your doorstep
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <motion.div className="space-y-2" variants={footerAnimation}>
              <p className="text-gray-400 hover:text-white cursor-pointer">About Us</p>
              <p className="text-gray-400 hover:text-white cursor-pointer">Contact</p>
              <p className="text-gray-400 hover:text-white cursor-pointer">FAQ</p>
            </motion.div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer"
              >
                <span>📱</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.2, rotate: -5 }}
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer"
              >
                <span>📧</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer"
              >
                <span>💬</span>
              </motion.div>
            </div>
          </div>
        </div>
        <motion.div 
          className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400"
          variants={footerAnimation}
        >
          <p>© 2025 DineSwift - All Rights Reserved</p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
  