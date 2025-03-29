import axios from 'axios';

const API_URL = 'http://localhost:5003/api';

const cartService = {
  getCart: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch cart' };
    }
  },

  addToCart: async (itemData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/cart/items`, itemData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add item to cart' };
    }
  },

  updateCartItem: async (itemId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/cart/items/${itemId}`,
        { quantity },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update cart item' };
    }
  },

  removeFromCart: async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/cart/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to remove item from cart' };
    }
  },

  clearCart: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to clear cart' };
    }
  }
};

export default cartService; 