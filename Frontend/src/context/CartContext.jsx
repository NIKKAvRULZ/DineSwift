import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Initialize from localStorage
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart).items : [];
  });
  const [restaurantId, setRestaurantId] = useState(() => {
    // Initialize restaurant ID from localStorage
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart).restaurant : null;
  });
  const { user } = useAuth();

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify({
        items: cartItems,
        restaurant: restaurantId
      }));
    } else {
      localStorage.removeItem('cart');
      setRestaurantId(null);
    }
    
    // Debug log
    console.log('Cart updated:', { cartItems, restaurantId });
  }, [cartItems, restaurantId]);

  const addToCart = (item, restaurant_id) => {
    console.log('Adding to cart:', item); // Debug log

    if (cartItems.length > 0 && restaurant_id !== restaurantId) {
      if (!window.confirm('Adding items from a different restaurant will clear your current cart. Continue?')) {
        return;
      }
      setCartItems([]);
    }

    setRestaurantId(restaurant_id);
    setCartItems(prev => {
      const exists = prev.find(x => x.id === item.id);
      if (exists) {
        return prev.map(x => 
          x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    if (cartItems.length === 1) {
      setRestaurantId(null);
    }
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) return;
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
    localStorage.removeItem('cart');
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      restaurantId,
      addToCart, 
      removeFromCart, 
      updateQuantity,
      clearCart,
      getTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};