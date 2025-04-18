import React, { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import DeliveryMap from './DeliveryMap';
import UpdateDeliveryStatus from './UpdateDeliveryStatus';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

// Connect to the backend Socket.IO server
const socket = io('http://localhost:5004', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

const Delivery = () => {
  const navigate = useNavigate();
  const { activeOrder: contextActiveOrder } = useOrder();
  const [activeOrder, setActiveOrder] = useState(contextActiveOrder);
  const [location, setLocation] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [deliveryId, setDeliveryId] = useState('');
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const mockOrder = {
      id: '12345',
      restaurantName: 'Example Restaurant',
      status: 'confirmed',
      location: { lat: 6.9271, lng: 79.8612 },
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      distance: '2.5 miles',
    };
    setActiveOrder(contextActiveOrder || mockOrder);
  }, [contextActiveOrder]);

  useEffect(() => {
    if (activeOrder) {
      setLocation(activeOrder.location);
    }
  }, [activeOrder]);

  // Set up Socket.IO listeners
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('driverLocationUpdate', (data) => {
      console.log('Driver location update:', data);
      if (data.deliveryId === deliveryId) {
        setDriverLocation(data.location);
      }
    });

    socket.on('deliveryStatusUpdated', (data) => {
      console.log('Delivery status updated:', data);
      if (data.deliveryId === deliveryId) {
        fetchDeliveryDetails();
      }
    });

    return () => {
      socket.off('connect');
      socket.off('driverLocationUpdate');
      socket.off('deliveryStatusUpdated');
    };
  }, [deliveryId]);

  const fetchDeliveryDetails = async () => {
    setError(null);
    setDeliveryDetails(null);
    setDriverLocation(null);
    if (!deliveryId) {
      setError('Please enter a Delivery ID');
      return;
    }

    const orderIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!orderIdRegex.test(deliveryId)) {
      setError('Delivery ID must be a valid 24-character MongoDB ObjectId (hexadecimal)');
      setDeliveryDetails(null);
      setDriverLocation(null);
      return;
    }

    try {
      console.log(`Fetching delivery details for ID: ${deliveryId}`);
      const response = await axios.get(`http://localhost:5004/api/delivery/track/${deliveryId}`);
      console.log('Delivery details response:', response.data);
      setDeliveryDetails(response.data);

      if (response.data.driver && response.data.driver.currentLocation) {
        setDriverLocation({
          lat: response.data.driver.currentLocation.latitude,
          lng: response.data.driver.currentLocation.longitude,
        });
      }
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch delivery details';
      setError(errorMessage);
      setDeliveryDetails(null);
      setDriverLocation(null);
      console.error('Error fetching delivery:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: `http://localhost:5004/api/delivery/track/${deliveryId}`,
      });
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
    pending: 'bg-gray-100 text-gray-800 border-gray-200',
    assigned: 'bg-blue-100 text-blue-800 border-blue-200',
    in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  }[status] || 'bg-gray-100 text-gray-800 border-gray-200');

  const getStatusText = (status) => ({
    pending: 'Pending',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    picked_up: 'Picked Up',
    delivering: 'Delivering',
  }[status] || status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <button
          onClick={() => navigate('/assign-delivery')}
          className="w-full md:w-auto px-6 py-3 bg-[#eb1900] text-white rounded-lg shadow-md hover:bg-[#c71500] focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:ring-offset-2 transition-all duration-300 flex items-center justify-center font-medium"
        >
          Assign New Delivery
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
        <div className="px-6 py-8 bg-gradient-to-r from-[#eb1900]/10 via-gray-50 to-[#eb1900]/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Order #{activeOrder.id}</h3>
              <p className="mt-2 text-sm text-gray-600">{activeOrder.restaurantName}</p>
            </div>
            <span
              className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium shadow-sm border ${getStatusColor(
                activeOrder.status
              )}`}
            >
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
                const isCompleted =
                  index <
                  ['confirmed', 'preparing', 'ready', 'picked_up', 'delivering', 'delivered'].indexOf(
                    activeOrder.status
                  );
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
                        <svg
                          className="absolute w-5 h-5 text-white -top-1 -right-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
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
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Delivery Location</h4>
          <DeliveryMap location={deliveryDetails?.location} driverLocation={driverLocation} />
        </div>

        <div className="px-6 py-8 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Control Panel</h4>
          <div className="grid grid-cols-1 gap-8">
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
              <h5 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Delivery Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Delivery ID</p>
                  <p className="text-base font-semibold text-gray-900">{deliveryDetails.deliveryId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Order ID</p>
                  <p className="text-base font-semibold text-gray-900">{deliveryDetails.orderId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Driver Name</p>
                  <p className="text-base font-semibold text-gray-900">
                    {deliveryDetails.driver?.name || 'Not Assigned'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Driver Contact</p>
                  <p className="text-base font-semibold text-gray-900">
                    {deliveryDetails.driver?.contact || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Driver Email</p>
                  <p className="text-base font-semibold text-gray-900">
                    {deliveryDetails.driver?.email || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Status</p>
                  <p
                    className={`text-base font-semibold capitalize ${getStatusColor(deliveryDetails.status).replace(
                      'bg-blue-100 text-blue-800',
                      'bg-[#eb1900]/10 text-[#eb1900]'
                    )}`}
                  >
                    {getStatusText(deliveryDetails.status)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Location</p>
                  <p className="text-base font-semibold text-gray-900">
                    {deliveryDetails.location ? `${deliveryDetails.location.latitude}, ${deliveryDetails.location.longitude}` : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Estimated Delivery</p>
                  <p className="text-base font-semibold text-gray-900">
                    {deliveryDetails.estimatedDeliveryTime
                      ? new Date(deliveryDetails.estimatedDeliveryTime).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            deliveryId &&
            !error && (
              <div className="mt-6 flex justify-center">
                <svg className="animate-spin h-8 w-8 text-[#eb1900]" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 12h4z"
                  />
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