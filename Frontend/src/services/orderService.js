import axios from 'axios';

const API_URL = 'http://localhost:5003/api';

const orderService = {
  createOrder: async (orderData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create order' };
    }
  },

  getAllOrders: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch orders' };
    }
  },

  getOrderById: async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch order' };
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/orders/${orderId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update order status' };
    }
  },

  cancelOrder: async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/orders/${orderId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel order' };
    }
  }
};

export default orderService; 