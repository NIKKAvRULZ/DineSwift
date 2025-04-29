import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaArrowRight, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
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

  const buttonAnimation = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 400,
      }
    },
    tap: { scale: 0.95 }
  };

  const linkAnimation = {
    initial: { x: 0 },
    hover: { 
      x: 8,
      color: "#f97316",
      transition: { type: "spring", stiffness: 400 }
    }
  };

  const glowAnimation = {
    animate: {
      boxShadow: ["0 0 0px rgba(249, 115, 22, 0)", "0 0 20px rgba(249, 115, 22, 0.5)", "0 0 0px rgba(249, 115, 22, 0)"],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // Here you would typically send the email to your backend
      console.log("Subscribed with: ", email);
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
      setEmail('');
    }
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={footerAnimation}
      className="bg-gradient-to-r from-gray-900 to-gray-800 text-white pt-16 pb-8 relative overflow-hidden"
    >
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-orange-500/30"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: ["-10%", "110%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-600/5 to-red-600/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <motion.div 
            variants={itemAnimation}
            className="col-span-1 lg:col-span-1"
          >
            <Link to="/">
              <motion.h3 
                className="text-3xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent inline-block"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                DineSwift
              </motion.h3>
            </Link>
            <p className="text-gray-300 mb-6">
              Delivering happiness to your doorstep, one meal at a time. Experience the convenience of modern food delivery.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: <FaFacebookF />, color: "bg-blue-600" },
                { icon: <FaTwitter />, color: "bg-sky-500" },
                { icon: <FaInstagram />, color: "bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500" },
                { icon: <FaLinkedinIn />, color: "bg-blue-700" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href="#"
                  variants={socialIconAnimation}
                  whileHover="hover"
                  whileTap="tap"
                  className={`w-10 h-10 ${social.color} rounded-full flex items-center justify-center text-white shadow-lg`}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemAnimation} className="col-span-1">
            <h4 className="text-xl font-semibold mb-6 text-white relative inline-block">
              Quick Links
              <motion.span 
                className="absolute bottom-0 left-0 bg-orange-500 h-0.5 w-full"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </h4>
            <ul className="space-y-3">
              {[
                { to: '/restaurants', text: 'Restaurants' },
                { to: '/about-us', text: 'About Us' },
                { to: '/blog', text: 'Food Blog' },
                { to: '/faq', text: 'FAQ' },
                { to: '/contact', text: 'Contact Us' },
              ].map((link, index) => (
                <motion.li
                  key={index}
                  initial="initial"
                  whileHover="hover"
                >
                  <Link to={link.to}>
                    <motion.div 
                      className="flex items-center text-gray-300 hover:text-orange-400 transition-colors duration-300"
                      variants={linkAnimation}
                    >
                      <FaArrowRight className="text-orange-500 mr-2 text-sm" />
                      {link.text}
                    </motion.div>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Section */}
          <motion.div variants={itemAnimation} className="col-span-1">
            <h4 className="text-xl font-semibold mb-6 text-white relative inline-block">
              Contact Us
              <motion.span 
                className="absolute bottom-0 left-0 bg-orange-500 h-0.5 w-full"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </h4>
            <ul className="space-y-4">
              {[
                { icon: <FaPhoneAlt />, text: '+94 76 0394 961 ', animation: { x: 0 } },
                { icon: <FaEnvelope />, text: 'support@dineswift.com', animation: { y: 0 } },
                { icon: <FaMapMarkerAlt />, text: '123 Foodie Street, Colombo', animation: { rotate: 0 } },
              ].map((item, index) => (
                <motion.li key={index} className="flex items-start space-x-3">
                  <motion.div 
                    className="text-orange-500 mt-1"
                    whileHover={{ 
                      ...item.animation, 
                      scale: 1.2,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                  >
                    {item.icon}
                  </motion.div>
                  <span className="text-gray-300">{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={itemAnimation} className="col-span-1 lg:col-span-1">
            <h4 className="text-xl font-semibold mb-6 text-white relative inline-block">
              Subscribe
              <motion.span 
                className="absolute bottom-0 left-0 bg-orange-500 h-0.5 w-full"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 0.5, delay: 0.4 }}
              />
            </h4>
            <p className="text-gray-300 mb-4">
              Get the latest updates and exclusive offers directly to your inbox.
            </p>
            
            <motion.form 
              onSubmit={handleSubmit}
              className="relative mt-4"
              animate={isSubmitted ? "animate" : "initial"}
              variants={glowAnimation}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                required
              />
              <motion.button
                type="submit"
                variants={buttonAnimation}
                whileHover="hover"
                whileTap="tap"
                className="mt-3 w-full bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-orange-500/20 transition-all duration-300 flex items-center justify-center"
              >
                {isSubmitted ? "Thank you!" : (
                  <>
                    Subscribe <FaArrowRight className="ml-2" />
                  </>
                )}
              </motion.button>
            </motion.form>
          </motion.div>
        </div>

        {/* Separator */}
        <motion.div 
          variants={itemAnimation}
          className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-8"
        />

        {/* Bottom Section */}
        <motion.div 
          variants={itemAnimation}
          className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm"
        >
          <p>© {new Date().getFullYear()} DineSwift - All Rights Reserved</p>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <motion.a 
              href="#" 
              whileHover={{ color: "#f97316" }}
              className="hover:text-orange-500 transition-colors duration-300"
            >
              Privacy Policy
            </motion.a>
            <motion.a 
              href="#" 
              whileHover={{ color: "#f97316" }}
              className="hover:text-orange-500 transition-colors duration-300"
            >
              Terms of Service
            </motion.a>
            <motion.a 
              href="#" 
              whileHover={{ color: "#f97316" }}
              className="hover:text-orange-500 transition-colors duration-300"
            >
              Cookies Settings
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;