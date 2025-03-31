import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ = () => {
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

  const questionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.2,
        duration: 0.5
      }
    })
  };

  const answerVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const [openQuestion, setOpenQuestion] = useState(null);

  const questions = [
    {
      question: "How does DineSwift work?",
      answer: "DineSwift connects you with local restaurants. Simply browse menus, place your order, and track delivery in real-time."
    },
    {
      question: "What are the delivery hours?",
      answer: "Our delivery hours are from 10 AM to 10 PM, seven days a week. Hours may vary by restaurant."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order is confirmed, you can track it in real-time through our app or website in the 'Track Orders' section."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, digital wallets, and cash on delivery in selected areas."
    }
  ];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="relative min-h-screen bg-gradient-to-br from-orange-50 to-red-50"
    >
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

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1495195129352-aeb325a55b65')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-red-100/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div {...fadeIn} className="text-center mb-16">
          <motion.h1 
            variants={fadeIn}
            className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600 mb-8"
          >
            Frequently Asked Questions
          </motion.h1>

          <motion.div 
            variants={fadeIn}
            className="max-w-3xl mx-auto space-y-4"
          >
            {questions.map((item, index) => (
              <motion.div 
                key={index}
                variants={questionVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <button
                  className="w-full px-6 py-4 text-left transition-all duration-300 hover:bg-orange-50"
                  onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">{item.question}</h3>
                    <motion.span 
                      animate={{ rotate: openQuestion === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-2xl text-orange-500"
                    >
                      ⌄
                    </motion.span>
                  </div>
                </button>
                <AnimatePresence>
                  {openQuestion === index && (
                    <motion.div 
                      variants={answerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="px-6 py-4 bg-orange-50/50"
                    >
                      <p className="text-lg text-gray-700">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FAQ;