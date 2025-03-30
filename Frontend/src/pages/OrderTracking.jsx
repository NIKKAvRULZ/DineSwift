import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import orderService from '../services/orderService';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const stages = [
    { key: 'pending', label: 'Order Placed', icon: '📝' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { key: 'ready', label: 'Ready', icon: '🍽️' },
    { key: 'delivering', label: 'On the Way', icon: '🚗' },
    { key: 'delivered', label: 'Delivered', icon: '🎉' }
  ];

  useEffect(() => {
    if (!orderId) {
      navigate('/orders');
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        console.log('Fetching order with ID:', orderId); // Debug log
        const data = await orderService.getOrderById(orderId);
        console.log('Fetched order data:', data); // Debug log
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
    // Set up real-time updates here if available
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-red-600 text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const currentStageIndex = stages.findIndex(stage => stage.key === order?.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Order #{orderId}</h1>
            
            {/* Progress Timeline */}
            <div className="relative">
              <div className="absolute left-0 top-[2.4rem] w-full h-1 bg-gray-200">
                <div 
                  className="h-full bg-orange-500 transition-all duration-500"
                  style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
                />
              </div>
              
              <div className="relative flex justify-between mb-8">
                {stages.map((stage, index) => (
                  <div 
                    key={stage.key}
                    className={`flex flex-col items-center ${
                      index <= currentStageIndex ? 'text-orange-500' : 'text-gray-400'
                    }`}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl
                        ${index <= currentStageIndex ? 'bg-orange-100' : 'bg-gray-100'}`}
                    >
                      {stage.icon}
                    </motion.div>
                    <span className="mt-2 text-sm font-medium">{stage.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details */}
            <div className="mt-8 space-y-6">
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold mb-4">Order Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Restaurant</p>
                    <p className="font-medium">{order?.restaurantName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Order Date</p>
                    <p className="font-medium">
                      {new Date(order?.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-medium">${order?.total?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Items</p>
                    <p className="font-medium">{order?.items?.length} items</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order?.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderTracking;