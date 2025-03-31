import React from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
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

  const formVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const inputVariants = {
    focus: {
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 300
      }
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="relative min-h-screen bg-gradient-to-br from-orange-50 to-red-50"
    >
      {/* Floating Icons */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-20 left-10 text-6xl"
      >📧</motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-40 right-16 text-5xl"
      >💬</motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute bottom-24 left-24 text-6xl"
      >📱</motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute bottom-10 right-32 text-5xl"
      >📞</motion.div>

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534536281715-e28d76689b4d')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-red-100/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div {...fadeIn} className="text-center mb-16">
          <motion.h1 
            variants={fadeIn}
            className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600 mb-8"
          >
            Contact Us
          </motion.h1>

          <motion.form 
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-2xl mx-auto"
          >
            <div className="space-y-6">
              {/* Form fields with animations */}
              <motion.div whileHover="focus" variants={inputVariants}>
                <label className="block text-lg font-medium text-gray-700 mb-2">Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Your name"
                />
              </motion.div>
              <motion.div whileHover="focus" variants={inputVariants}>
                <label className="block text-lg font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="your@email.com"
                />
              </motion.div>
              <motion.div whileHover="focus" variants={inputVariants}>
                <label className="block text-lg font-medium text-gray-700 mb-2">Message</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  rows="4"
                  placeholder="Your message"
                ></textarea>
              </motion.div>
              <motion.button 
                type="submit" 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-6 py-3 rounded-full text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl"
              >
                Send Message
              </motion.button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Contact;