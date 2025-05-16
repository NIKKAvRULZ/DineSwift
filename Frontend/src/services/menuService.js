import axios from 'axios';

// Make sure this matches the backend API URL
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
      console.log('Submitting rating:', { restaurantId, menuItemId, rating });
      
      // Ensure all parameters are valid before making the request
      if (!restaurantId || !menuItemId || !rating) {
        console.error('Missing required parameters for rating:', { restaurantId, menuItemId, rating });
        throw new Error('Missing required parameters for rating');
      }
      
      // Log the full URL being called for debugging
      const url = `${API_BASE_URL}/restaurants/${restaurantId}/menu-items/${menuItemId}/rate`;
      console.log('Submitting rating to URL:', url);
      
      const response = await axios.post(url, { rating });
      
      console.log('Rating submitted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error submitting rating:', error);
      // Provide more detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error.response?.data || { message: 'Failed to submit rating' };
    }
  },

  // Add a comment to a menu item
  addComment: async (restaurantId, menuItemId, comment) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/restaurants/${restaurantId}/menu-items/${menuItemId}/comments`,
        comment
      );
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Get comments for a menu item
  getComments: async (restaurantId, menuItemId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/restaurants/${restaurantId}/menu-items/${menuItemId}/comments`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }
};

export default menuService;