import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5003/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
      
      // Find active order if exists
      const active = response.data.find(order => 
        ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivering'].includes(order.status)
      );
      setActiveOrder(active);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const createOrder = async (orderData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5003/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(prev => [...prev, response.data]);
      setActiveOrder(response.data);
      return { success: true, order: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create order' };
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5003/api/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? response.data : order
        )
      );
      
      if (activeOrder?.id === orderId) {
        setActiveOrder(response.data);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update order status' };
    }
  };

  const getOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5003/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, order: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch order details' };
    }
  };

  const value = {
    orders,
    activeOrder,
    createOrder,
    updateOrderStatus,
    getOrderDetails,
    fetchOrders
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}; 