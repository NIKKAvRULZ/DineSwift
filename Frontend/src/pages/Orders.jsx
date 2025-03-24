import { useState, useEffect } from "react";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:5002/api/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4">Your Orders</h2>
      {orders.map((order) => (
        <div key={order._id} className="p-4 bg-white shadow-lg rounded mb-2">
          <h3 className="text-xl">Order from Restaurant {order.restaurantId}</h3>
          <p>Status: {order.status}</p>
          <p>Total: ${order.totalPrice}</p>
        </div>
      ))}
    </div>
  );
};

export default Orders;
