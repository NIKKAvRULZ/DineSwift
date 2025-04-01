import React, { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import AssignDelivery from './AssignDelivery';
import DeliveryMap from './DeliveryMap';
import UpdateDeliveryStatus from './UpdateDeliveryStatus';
import axios from 'axios';

const Delivery = () => {
  const { activeOrder: contextActiveOrder } = useOrder();
  const [activeOrder, setActiveOrder] = useState(contextActiveOrder);
  const [driver, setDriver] = useState(null);
  const [location, setLocation] = useState(null);
  const [deliveryId, setDeliveryId] = useState('');
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const mockOrder = {
      id: '12345',
      restaurantName: 'Example Restaurant',
      status: 'confirmed',
      driver: {
        name: 'John Smith',
        phone: '+1 (555) 123-4567',
        vehicle: 'Toyota Camry',
        plateNumber: 'ABC123',
        rating: 4.8,
      },
      location: { lat: 6.9271, lng: 79.8612 },
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      distance: '2.5 miles',
    };
    setActiveOrder(contextActiveOrder || mockOrder);
  }, [contextActiveOrder]);

  useEffect(() => {
    if (activeOrder) {
      setDriver(activeOrder.driver);
      setLocation(activeOrder.location);
    }
  }, [activeOrder]);

  const fetchDeliveryDetails = async () => {
    setError(null);
    setDeliveryDetails(null);
    try {
      const response = await axios.get(`http://localhost:5004/api/delivery/status/${deliveryId}`);
      setDeliveryDetails(response.data);
    } catch (err) {
      setError('Failed to fetch delivery details');
      console.error('Error fetching delivery:', err);
    }
  };

  if (!activeOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center transform transition-all duration-300 hover:shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900">No Active Delivery</h2>
          <p className="mt-3 text-gray-600 text-lg">You don’t have any active orders at the moment.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => ({
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    preparing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ready: 'bg-green-100 text-green-800 border-green-200',
    picked_up: 'bg-purple-100 text-purple-800 border-purple-200',
    delivering: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
  }[status] || 'bg-gray-100 text-gray-800 border-gray-200');

  const getStatusText = (status) => ({
    confirmed: 'Order Confirmed',
    preparing: 'Preparing Your Order',
    ready: 'Ready for Pickup',
    picked_up: 'Picked Up',
    delivering: 'On the Way',
    delivered: 'Delivered',
  }[status] || status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
        <div className="px-6 py-8 bg-gradient-to-r from-[#eb1900]/10 via-gray-50 to-[#eb1900]/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Order #{activeOrder.id}</h3>
              <p className="mt-2 text-sm text-gray-600">{activeOrder.restaurantName}</p>
            </div>
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium shadow-sm border ${getStatusColor(activeOrder.status)}`}>
              {getStatusText(activeOrder.status)}
            </span>
          </div>
        </div>

        <div className="px-6 py-8 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Delivery Progress</h4>
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-between">
              {['confirmed', 'preparing', 'ready', 'picked_up', 'delivering', 'delivered'].map((status, index) => {
                const isActive = activeOrder.status === status;
                const isCompleted = index < ['confirmed', 'preparing', 'ready', 'picked_up', 'delivering', 'delivered'].indexOf(activeOrder.status);
                return (
                  <div key={status} className="flex flex-col items-center group">
                    <div
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                        isActive
                          ? 'bg-[#eb1900] text-white scale-110'
                          : isCompleted
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      <span className="text-lg font-medium">{index + 1}</span>
                      {isCompleted && (
                        <svg className="absolute w-5 h-5 text-white -top-1 -right-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="mt-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
                      {getStatusText(status)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {driver && (
          <div className="px-6 py-8 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Driver Details</h4>
            <div className="flex items-center justify-between bg-gray-50 p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#eb1900]/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#eb1900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">{driver.name}</p>
                  <p className="text-sm text-gray-600">{driver.vehicle} ({driver.plateNumber})</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-900">{driver.rating}</span>
                </div>
                <a
                  href={`tel:${driver.phone}`}
                  className="inline-flex items-center px-4 py-2 bg-[#eb1900] text-white rounded-lg shadow-md hover:bg-[#c71500] focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:ring-offset-2 transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-8 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Delivery Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h5 className="text-sm font-medium text-gray-700">Estimated Delivery Time</h5>
              <p className="mt-2 text-lg font-semibold text-gray-900">{activeOrder.estimatedDeliveryTime}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h5 className="text-sm font-medium text-gray-700">Distance</h5>
              <p className="mt-2 text-lg font-semibold text-gray-900">{activeOrder.distance}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 border-b border-gray-200">
          <DeliveryMap />
        </div>

        <div className="px-6 py-8 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Control Panel</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AssignDelivery />
            <UpdateDeliveryStatus />
          </div>
        </div>

        <div className="px-6 py-8">
          <h4 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Delivery Details Lookup</h4>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              value={deliveryId}
              onChange={(e) => setDeliveryId(e.target.value)}
              placeholder="Enter Delivery ID"
              className="w-full md:w-2/3 px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
            />
            <button
              onClick={fetchDeliveryDetails}
              className="px-6 py-3 bg-[#eb1900] text-white rounded-lg shadow-md hover:bg-[#c71500] focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:ring-offset-2 transition-all duration-300 font-medium"
            >
              Fetch Details
            </button>
          </div>

          {error && (
            <p className="mt-4 text-[#eb1900] font-medium bg-[#eb1900]/10 p-3 rounded-lg">{error}</p>
          )}
          {deliveryDetails ? (
            <div className="mt-6 bg-white p-6 rounded-lg shadow-lg border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
              <h5 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Delivery Information</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Delivery ID</p>
                  <p className="text-base font-semibold text-gray-900">{deliveryDetails._id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Order ID</p>
                  <p className="text-base font-semibold text-gray-900">{deliveryDetails.orderId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Driver ID</p>
                  <p className="text-base font-semibold text-gray-900">{deliveryDetails.driverId || 'Not Assigned'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Status</p>
                  <p className={`text-base font-semibold capitalize ${getStatusColor(deliveryDetails.status).replace('bg-blue-100 text-blue-800', 'bg-[#eb1900]/10 text-[#eb1900]')}`}>
                    {deliveryDetails.status}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Location</p>
                  <p className="text-base font-semibold text-gray-900">{deliveryDetails.location.coordinates.join(', ')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Estimated Delivery</p>
                  <p className="text-base font-semibold text-gray-900">{new Date(deliveryDetails.estimatedDeliveryTime).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ) : (
            deliveryId && !error && (
              <div className="mt-6 flex justify-center">
                <svg className="animate-spin h-8 w-8 text-[#eb1900]" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Delivery;