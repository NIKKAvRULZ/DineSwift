import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Menu = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  // Add item to the cart
  const handleAddToCart = (item) => {
    setCart((prevCart) => {
      const itemIndex = prevCart.findIndex((i) => i.id === item.id);
      if (itemIndex === -1) {
        return [...prevCart, { ...item, quantity: 1 }];
      } else {
        const updatedCart = [...prevCart];
        updatedCart[itemIndex].quantity += 1;
        return updatedCart;
      }
    });
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Menu</h1>

        {/* Menu Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Example menu items */}
          {[
            { id: 1, name: 'Burger', description: 'Juicy beef burger', price: 5.99, image: 'burger.jpg' },
            { id: 2, name: 'Pizza', description: 'Delicious pepperoni pizza', price: 8.99, image: 'pizza.jpg' },
            { id: 3, name: 'Pasta', description: 'Classic spaghetti with marinara', price: 7.99, image: 'pasta.jpg' },
          ].map((item) => (
            <div key={item.id} className="bg-white/80 rounded-xl shadow-lg p-6">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
              <p className="text-gray-600">{item.description}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-lg font-semibold text-gray-900">${item.price.toFixed(2)}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAddToCart(item)}
                  className="px-6 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-300"
                >
                  Add to Cart
                </motion.button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Preview (linking to the CartPage) */}
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 p-4"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <span className="text-gray-600">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)} items
                </span>
                <span className="mx-2">•</span>
                <span className="font-semibold">
                  ${cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/cart')} // Navigate to cart page
                className="px-6 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-300"
              >
                View Cart
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Menu;
