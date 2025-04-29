import React from 'react';
import { useCart } from '../../context/CartContext';

const MenuItem = ({ item }) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        src={item.imageUrl} 
        alt={item.name}
        className="w-full h-60 object-contain bg-gray-50 p-2"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
        <p className="mt-1 text-gray-500">{item.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            Rs. {Math.round(item.price)}
          </span>
          <button
            onClick={() => addToCart(item)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem; 