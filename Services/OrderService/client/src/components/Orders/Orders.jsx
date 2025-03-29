import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Orders.module.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    
    try {
      const response = await fetch(`http://localhost:5003/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete order');
      setOrders(orders.filter(order => order._id !== orderId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Orders</h1>
        <Link to="/orders/new" className={styles.createButton}>
          Create New Order
        </Link>
      </div>
      
      <div className={styles.ordersGrid}>
        {orders.map(order => (
          <div key={order._id} className={styles.orderCard}>
            <h3>Order #{order._id.slice(-6)}</h3>
            <p>Customer ID: {order.customerId}</p>
            <p>Restaurant ID: {order.restaurantId}</p>
            <p>Total Amount: ${order.totalAmount}</p>
            <p>Status: <span className={styles[order.status.toLowerCase()]}>{order.status}</span></p>
            <div className={styles.actions}>
              <Link to={`/orders/${order._id}/edit`} className={styles.editButton}>
                Edit
              </Link>
              <button 
                onClick={() => handleDelete(order._id)}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders; 