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
  },

  // Add this method to your orderService object
  updateOrderRating: async (orderId, ratingData) => {
    try {
      console.log(`Submitting rating for order ${orderId}:`, ratingData);
      
      const token = localStorage.getItem('token');
      
      // Use axios directly to the specific endpoint with more explicit settings
      const response = await axios({
        method: 'post',
        url: `${API_URL}/orders/${orderId}/rating`,
        data: ratingData,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        validateStatus: function (status) {
          return status < 500; // Accept all response codes less than 500
        }
      });
      
      // Log more detailed successful response information
      console.log('Rating submission response:', response.status, response.statusText);
      console.log('Rating submitted successfully:', response.data);
      
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating order rating:', error);
      if (error.response) {
        console.error('Response error data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error.response?.data || { message: 'Failed to submit rating' };
    }
  }
};

export default orderService;