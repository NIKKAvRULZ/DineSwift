import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}`);
        if (!response.ok) throw new Error('Failed to fetch order details');
        const data = await response.json();
        setOrderDetails(data);
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8 max-w-2xl"
    >
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900">Order Confirmed!</h1>
          <p className="text-gray-600 mt-2">Order ID: {orderId}</p>
        </div>

        {orderDetails && (
          <div className="space-y-4">
            <div className="border-t border-b border-gray-200 py-4">
              <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div>
                    <span>{item.name} x {item.quantity}</span>
                    {item.discount > 0 && (
                      <span className="ml-2 text-red-500 text-xs">{item.discount}% OFF</span>
                    )}
                  </div>
                  <span>Rs {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold">
              <span>Total Amount:</span>
              <span>Rs {orderDetails.totalAmount.toFixed(2)}</span>
            </div>

            <div className="mt-8 space-x-4 flex justify-center">
              <button
                onClick={() => navigate('/profile')}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
              >
                View Order Status
              </button>
              <button
                onClick={() => navigate('/menu')}
                className="bg-gray-100 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-200"
              >
                Order More
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderConfirmation;