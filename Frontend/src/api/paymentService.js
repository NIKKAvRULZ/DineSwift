import axios from "axios";

const BASE_URL = "http://localhost:5005/api/";

const paymentService = {

  createStripeCheckoutSession: async (stripeData, token) => {
    try {
      const response = await axios.post(`${BASE_URL}payment/stripe/create-checkout-session`, stripeData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create Stripe checkout session');
    }
  }

};

export default paymentService;
