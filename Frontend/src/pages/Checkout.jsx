import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../api/orderService';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [address, setAddress] = useState(user?.address || '');

  const { items, total } = location.state || {};

  if (!items || !items.length) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async () => {
    if (!address) {
      setError('Please provide a delivery address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const orderData = {
        customerId: user.id,
        restaurantId: items[0].restaurantId, // Assuming all items are from same restaurant
        items: items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: total,
        status: "Pending",
        paymentMethod,
        deliveryAddress: address
      };

      const response = await orderService.createOrder(orderData, user.token);
      
      clearCart();
      navigate(`/order-confirmation/${response._id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 border rounded-lg"
                rows="3"
                placeholder="Enter your delivery address"
                required
              />
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Card Payment</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Cash on Delivery</span>
                </label>
              </div>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePlaceOrder}
              disabled={loading || !address}
              className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;