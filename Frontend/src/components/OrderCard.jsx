const OrderCard = ({ order }) => {
    return (
      <div className="bg-white p-4 shadow-md rounded-md border">
        <h3 className="text-lg font-semibold">{order.restaurant}</h3>
        <p className="text-sm text-gray-600">{order.items.join(", ")}</p>
        <p className="text-md font-bold mt-2">Total: ${order.total}</p>
        <span className={`text-sm font-semibold px-2 py-1 rounded-md ${order.status === "Delivered" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}`}>
          {order.status}
        </span>
      </div>
    );
  };
  
  export default OrderCard;
  