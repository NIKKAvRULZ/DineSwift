import { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';

const Delivery = () => {
  const { activeOrder, updateOrderStatus } = useOrder();
  const [driver, setDriver] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (activeOrder) {
      // Simulate fetching driver and location data
      const fetchDriverData = async () => {
        try {
          // In a real app, this would be an API call
          const driverData = {
            name: 'John Smith',
            phone: '+1 (555) 123-4567',
            vehicle: 'Toyota Camry',
            plateNumber: 'ABC123',
            rating: 4.8
          };
          setDriver(driverData);

          // Simulate location updates
          const interval = setInterval(() => {
            setLocation({
              lat: Math.random() * 0.01 + 40.7128,
              lng: Math.random() * 0.01 - 74.0060
            });
          }, 5000);

          return () => clearInterval(interval);
        } catch (error) {
          console.error('Error fetching driver data:', error);
        }
      };

      fetchDriverData();
    }
  }, [activeOrder]);

  if (!activeOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">No active delivery</h2>
          <p className="mt-2 text-gray-600">You don't have any active orders at the moment.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'picked_up':
        return 'bg-purple-100 text-purple-800';
      case 'delivering':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Preparing Your Order';
      case 'ready':
        return 'Ready for Pickup';
      case 'picked_up':
        return 'Picked Up';
      case 'delivering':
        return 'On the Way';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Order Status */}
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Order #{activeOrder.id}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {activeOrder.restaurantName}
              </p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activeOrder.status)}`}>
              {getStatusText(activeOrder.status)}
            </span>
          </div>
        </div>

        {/* Delivery Progress */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-between">
              {['confirmed', 'preparing', 'ready', 'picked_up', 'delivering', 'delivered'].map((status, index) => (
                <div key={status} className="flex flex-col items-center">
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                    activeOrder.status === status
                      ? 'bg-blue-600 text-white'
                      : index < ['confirmed', 'preparing', 'ready', 'picked_up', 'delivering', 'delivered'].indexOf(activeOrder.status)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    <span className="text-sm">{index + 1}</span>
                  </div>
                  <span className="mt-2 text-xs text-gray-500">{getStatusText(status)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Driver Information */}
        {driver && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Your Driver</h4>
                <div className="mt-1">
                  <p className="text-sm text-gray-900">{driver.name}</p>
                  <p className="text-sm text-gray-500">{driver.vehicle} ({driver.plateNumber})</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 text-sm text-gray-900">{driver.rating}</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <a
                href={`tel:${driver.phone}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Driver
              </a>
            </div>
          </div>
        )}

        {/* Estimated Time */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Estimated Delivery Time</h4>
              <p className="mt-1 text-sm text-gray-500">
                {new Date(Date.now() + 30 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="text-right">
              <h4 className="text-sm font-medium text-gray-900">Distance</h4>
              <p className="mt-1 text-sm text-gray-500">2.5 miles</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
  