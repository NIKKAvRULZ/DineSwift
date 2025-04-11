import axios from 'axios';

const API_BASE_URL = 'http://localhost:5002/api';

const menuService = {
  // Get restaurant menu items
  getMenuItems: async (restaurantId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants/${restaurantId}/menu-items`);
      return response.data;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  },

  // Get restaurant details
  getRestaurant: async (restaurantId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      throw error;
    }
  },

  // Submit a rating for a menu item
  submitRating: async (restaurantId, menuItemId, rating) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/restaurants/${restaurantId}/menu-items/${menuItemId}/rate`,
        { rating }
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  }
};

export default menuService; 