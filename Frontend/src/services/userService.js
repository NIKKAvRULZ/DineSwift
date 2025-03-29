import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const userService = {
  getProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  updateProfile: async (userData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/users/profile`,
        userData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  updatePassword: async (passwordData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/users/password`,
        passwordData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update password' };
    }
  },

  deleteAccount: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/users/account`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete account' };
    }
  },

  getAddresses: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch addresses' };
    }
  },

  addAddress: async (addressData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/users/addresses`,
        addressData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add address' };
    }
  }
};

export default userService; 