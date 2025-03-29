import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const authService = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
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
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Profile update failed' };
    }
  }
};

export default authService; 