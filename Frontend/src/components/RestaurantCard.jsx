// RestaurantCard.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import defaultImage from '../assets/placeholder-restaurant.png'

const cardAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

const RestaurantCard = ({ restaurant }) => (
  <motion.div
    variants={cardAnimation}
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-orange-100 transition-all duration-300"
  >
    <Link to={`/restaurants/${restaurant._id}/menu`}>
      <div className="relative h-48 overflow-hidden">
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
          src={restaurant.image ?? defaultImage}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
            restaurant.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {restaurant.isOpen ? 'Open' : 'Closed'}
        </motion.div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{restaurant.name}</h3>
        <p className="text-gray-600 mb-4">{restaurant.cuisine}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-yellow-400 mr-1">⭐</span>
            <span className="text-gray-700">{restaurant.rating}</span>
          </div>
          <div className="text-gray-600">{restaurant.deliveryTime} min</div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">Min. order: ${restaurant.minOrder}</span>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default RestaurantCard;