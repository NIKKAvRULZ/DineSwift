import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  MapPin, 
  CreditCard, 
  Clock, 
  Check, 
  X 
} from 'lucide-react';

const PremiumFoodDeliveryCheckout = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  const restaurantDetails = {
    name: "Urban Harvest Kitchen",
    logo: "/api/placeholder/100/100"
  };

  const orderItems = [
    { 
      name: "Quinoa Power Bowl", 
      description: "Grilled chicken, mixed greens, quinoa",
      price: 16.99, 
      quantity: 1,
      image: "/api/placeholder/100/100"
    },
    { 
      name: "Wellness Smoothie", 
      description: "Kale, banana, almond milk, chia seeds",
      price: 8.50, 
      quantity: 1,
      image: "/api/placeholder/100/100"
    }
  ];

  const calculateTotal = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 3.50;
    const serviceFee = 1.50;
    return {
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      total: (subtotal + deliveryFee + serviceFee).toFixed(2)
    };
  };

  const handlePayNow = async () => {
    try {
      const response = await fetch("http://localhost:5002/api/payments/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: orderItems[0].name, // Use first item’s name
          price: calculateTotal().total, // Total amount
          quantity: 1, // Hardcoded, modify if needed
          image: orderItems[0].image, // First item’s image
          id: "ORDER123", // Replace with actual order ID
          userId: "USER456", // Replace with actual user ID
        }),
      });
  
      const data = await response.json();
  
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        console.error("Error processing payment:", data.error);
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden grid md:grid-cols-[2fr_1fr] border border-gray-100"
      >
        {/* Left Side - Order Details */}
        <div className="p-8 bg-white border-r border-gray-100">
          {/* Restaurant Header */}
          <div className="flex items-center mb-8">
          <img 
  src="https://meshaunjourneys.com/wp-content/uploads/2024/08/sri-lanka-rice-and-curry-v2.webp" 
  alt={restaurantDetails.name} 
  className="w-16 h-16 rounded-full mr-4 object-cover border-2 border-gray-200"
/>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{restaurantDetails.name}</h1>
              <p className="text-gray-500 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                Delivery to: 123 Urban Street
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <ShoppingCart className="mr-3 text-gray-500" />
              Your Order
            </h2>
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center space-x-4">
                  <img 
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHJpDqKpBywdV7MLrDZzJ-jW_794O-7X9ZZQ&s"
                    alt={item.name} 
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                    <p className="text-gray-500 text-sm">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold">${item.price.toFixed(2)}</span>
                  <div className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
                    x{item.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-6 rounded-xl space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">${calculateTotal().subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-semibold">${calculateTotal().deliveryFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service Fee</span>
              <span className="font-semibold">${calculateTotal().serviceFee}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="text-xl font-bold text-gray-800">Total</span>
              <span className="text-xl font-bold text-gray-800">${calculateTotal().total}</span>
            </div>
          </div>
        </div>

        {/* Right Side - Payment & Delivery */}
        <div className="p-8 bg-gray-50">
          <div className="space-y-6">
            <div className="flex items-center text-gray-800">
              <Clock className="mr-3 text-gray-500" />
              <span className="text-lg font-semibold">Estimated Delivery: 35-45 mins</span>
            </div>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePayNow} // Updated function
              className="w-full bg-green-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-green-700 transition flex items-center justify-center"
>
              <CreditCard className="mr-3" /> Proceed to Payment
            </motion.button>
            </div>
        </div>

        {/* Payment Modal */}
        <AnimatePresence>
          {isPaymentModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative"
              >
                <button 
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                  <X size={24} />
                </button>

                {!isOrderPlaced ? (
                  <>
                    <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Payment Details</h3>
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="Card Number" 
                        className="w-full p-3 border rounded-xl focus:border-green-500 transition"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          type="text" 
                          placeholder="MM/YY" 
                          className="w-full p-3 border rounded-xl focus:border-green-500 transition"
                        />
                        <input 
                          type="text" 
                          placeholder="CVV" 
                          className="w-full p-3 border rounded-xl focus:border-green-500 transition"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePayNow}
                        className="w-full bg-green-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-green-700 transition"
                      >
                        Pay ${calculateTotal().total}
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <Check size={80} className="text-green-500 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-800">Order Confirmed!</h3>
                    <p className="text-gray-600">Your delicious meal is on its way</p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PremiumFoodDeliveryCheckout;