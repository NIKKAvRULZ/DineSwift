export default function RestaurantCard({ restaurant }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        className="h-48 w-full object-cover"
        src={restaurant.image}
        alt={restaurant.name}
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
        <p className="text-sm text-gray-500">{restaurant.cuisine}</p>
        <div className="mt-2 flex items-center">
          <span className="text-yellow-400">★</span>
          <span className="ml-1 text-sm text-gray-600">{restaurant.rating}</span>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-sm text-gray-600">{restaurant.deliveryTime} mins</span>
        </div>
      </div>
    </div>
  );
} 