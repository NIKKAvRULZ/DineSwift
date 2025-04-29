import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item, restaurantInfo) => {
    // Ensure we have valid restaurantInfo, whether it's an ID string or an object
    let restaurantId, restaurantName, deliveryTime;
    
    if (typeof restaurantInfo === 'string') {
      // If restaurantInfo is just the ID string
      restaurantId = restaurantInfo;
    } else if (typeof restaurantInfo === 'object' && restaurantInfo !== null) {
      // If restaurantInfo is an object with these properties
      restaurantId = restaurantInfo.restaurantId || restaurantInfo._id || restaurantInfo.id;
      restaurantName = restaurantInfo.restaurantName || restaurantInfo.name;
      deliveryTime = restaurantInfo.deliveryTime;
    }
    
    // Validate we have a restaurantId
    if (!restaurantId) {
      console.error("Missing restaurantId in addToCart. Item:", item, "restaurantInfo:", restaurantInfo);
      // Could show an alert or toast here
      return;
    }

    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(
        cartItem => cartItem.id === item._id || cartItem.id === item.id
      );

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += 1;
        return newItems;
      }

      // Add new item with restaurant info
      return [...prevItems, {
        id: item._id || item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
        restaurantId: restaurantId,
        restaurantName: restaurantName,
        deliveryTime: deliveryTime
      }];
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);