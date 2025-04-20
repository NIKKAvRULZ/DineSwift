import axios from "axios";

const BASE_URL = "http://localhost:5003/api";

const orderService = {
  createOrder: async (orderData, token) => {
    try {
      const response = await axios.post(`${BASE_URL}/orders`, orderData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create order');
    }
  },

  getOrderById: async (orderId, token) => {
    try {
      const response = await axios.get(`${BASE_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch order');
    }
  }
};

export default orderService;
