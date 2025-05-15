import axios from "axios";

const BASE_URL = "http://localhost:5003/api";

const orderService = {
  createOrder: async (orderData, token) => {
    try {
      // Validate restaurantId presence
      if (!orderData.restaurantId) {
        throw new Error("Order validation failed: restaurantId: Path `restaurantId` is required.");
      }
      
      const response = await axios.post(`${BASE_URL}/orders`, orderData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }); 
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to create order');
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
  },

  cancelOrder: async (orderId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
            `${BASE_URL}/orders/${orderId}/cancel`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Cancel order error:', error);
        throw new Error(error.response?.data?.message || 'Failed to cancel order');
    }
  }
};

export default orderService;
