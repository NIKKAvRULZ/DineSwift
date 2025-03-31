import React from 'react';
import { motion } from 'framer-motion';

const AboutUs = () => {
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

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const paragraphVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.2,
        duration: 0.5
      }
    })
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
      >🍽️</motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-40 right-16 text-5xl"
      >👨‍🍳</motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute bottom-24 left-24 text-6xl"
      >🚚</motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute bottom-10 right-32 text-5xl"
      >⭐</motion.div>

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1498837167922-ddd27525d352')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-red-100/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div {...fadeIn} className="text-center mb-16">
          <motion.h1 
            variants={fadeIn}
            className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600 mb-8"
          >
            About DineSwift
          </motion.h1>

          <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-3xl mx-auto"
          >
            <motion.p 
              custom={0}
              variants={paragraphVariants}
              initial="hidden"
              animate="visible"
              className="text-xl text-gray-700 mb-6"
            >
              Welcome to DineSwift, where we're revolutionizing the way you experience food delivery. Our platform connects food lovers with the finest restaurants in your area.
            </motion.p>
            <motion.p 
              custom={1}
              variants={paragraphVariants}
              initial="hidden"
              animate="visible"
              className="text-xl text-gray-700 mb-6"
            >
              Founded with a passion for great food and exceptional service, DineSwift has grown to become a trusted partner for both restaurants and customers alike.
            </motion.p>
            <motion.p 
              custom={2}
              variants={paragraphVariants}
              initial="hidden"
              animate="visible"
              className="text-xl text-gray-700"
            >
              Our team is dedicated to ensuring that every meal delivered through our platform meets the highest standards of quality and satisfaction.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AboutUs;