import axios from 'axios';

const API_URL = 'http://localhost:5002/api/restaurants';

const restaurantService = {
  getAllRestaurants: async (filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/restaurants`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch restaurants' };
    }
  },

  getRestaurantById: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch restaurant' };
    }
  },

  getRestaurantMenu: async (restaurantId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/restaurants/${restaurantId}/menu`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch menu' };
    }
  },

  searchRestaurants: async (searchTerm, filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/restaurants/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: searchTerm, ...filters }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Search failed' };
    }
  }
};

export default restaurantService; 