const OrderCard = ({ order }) => {
  return (
    <div className="bg-white p-4 shadow-md rounded-md border">
      <h3 className="text-lg font-semibold">Restaurant: {order.restaurantId}</h3>
      <p className="text-sm text-gray-600">
        Placed on: {new Date(order.createdAt).toLocaleDateString()}
      </p>
      <ul className="mt-2 space-y-1">
        {order.items.map((item, index) => (
          <li key={index.id} className="text-sm">
            {item.quantity}x {item.name} - $
            {item.price ? item.price.toFixed(2) : "0.00"}
          </li>
        ))}
      </ul>
      <p className="text-md font-bold mt-2">
        Total: ${order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}
      </p>
      <span
        className={`text-sm font-semibold px-2 py-1 rounded-md ${
          order.status === "Delivered"
            ? "bg-green-500 text-white"
            : "bg-yellow-500 text-white"
        }`}
      >
        {order.status}
      </span>
    </div>
  );
};

export default OrderCard;
