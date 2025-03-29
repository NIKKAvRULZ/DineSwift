import { useEffect, useState } from "react";
import axios from "../api/orderService";
import OrderCard from "../components/OrderCard";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5003/api/orders").then((res) => setOrders(res.data));
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold">My Orders</h2>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default Orders;
