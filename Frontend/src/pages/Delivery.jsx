import React, { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import DeliveryMap from './DeliveryMap';
import UpdateDeliveryStatus from './UpdateDeliveryStatus';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInfoCircle, FaMoon, FaSun, FaPlus } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

// Socket.IO connection
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  const mapStatus = (backendStatus) => {
    const statusMap = {
      pending: 'confirmed',
      assigned: 'preparing',
      in_progress: 'picked_up',
      delivered: 'delivered',
      cancelled: 'cancelled',
    };
    return statusMap[backendStatus] || 'confirmed';
  };

  const mapToActiveOrder = (delivery) => {
    const mappedStatus = mapStatus(delivery.status || 'pending');
    const defaultLocation = { coordinates: [79.8612, 6.9271] };
    let deliveryLocation = defaultLocation;

    if (delivery.location) {
      if (delivery.location.latitude && delivery.location.longitude) {
        deliveryLocation = { coordinates: [delivery.location.longitude, delivery.location.latitude] };
      } else if (delivery.location.coordinates) {
        deliveryLocation = { coordinates: [delivery.location.coordinates[0], delivery.location.coordinates[1]] };
      }
    }

    return {
      id: delivery.orderId || 'Unknown',
      restaurantName: delivery.restaurantName || 'DineSwift Restaurant',
      status: mappedStatus,
      location: deliveryLocation,
      estimatedDeliveryTime: delivery.estimatedDeliveryTime
        ? new Date(delivery.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date(Date.now() + 30 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      distance: delivery.distance || '2.5 miles',
    };
  };

  useEffect(() => {
    const fetchActiveOrder = async () => {
      if (contextActiveOrder) {
        setActiveOrder(contextActiveOrder);
        return;
      }
      try {
        const response = await axios.get('http://localhost:5004/api/delivery/active');
        const delivery = response.data;
        if (delivery) {
          const mappedOrder = mapToActiveOrder(delivery);
          setActiveOrder(mappedOrder);
          setLocation(mappedOrder.location);
        } else {
          setActiveOrder(null);
        }
      } catch (err) {
        console.error('Error fetching active order:', err);
        setActiveOrder(null);
      }
    };
    fetchActiveOrder();
  }, [contextActiveOrder]);

  useEffect(() => {
    if (deliveryDetails) {
      const mappedOrder = mapToActiveOrder(deliveryDetails);
      setActiveOrder(mappedOrder);
      setLocation(mappedOrder.location);
    }
  }, [deliveryDetails]);

  useEffect(() => {
    socket.on('connect', () => console.log('Connected to Socket.IO server'));
    socket.on('driverLocationUpdate', (data) => {
      if (data.deliveryId === deliveryId) setDriverLocation(data.location);
    });
    socket.on('deliveryStatusUpdated', async (data) => {
      if (data.deliveryId === deliveryId || activeOrder?.id === data.orderId) {
        try {
          const response = await axios.get(`http://localhost:5004/api/delivery/track/${data.deliveryId}`);
          setDeliveryDetails(response.data);
          const mappedOrder = mapToActiveOrder(response.data);
          setActiveOrder(mappedOrder);
          setLocation(mappedOrder.location);
        } catch (err) {
          console.error('Error refreshing delivery:', err);
        }
      }
    });
    return () => {
      socket.off('connect');
      socket.off('driverLocationUpdate');
      socket.off('deliveryStatusUpdated');
    };
  }, [deliveryId, activeOrder]);

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
      setError('Invalid Delivery ID format');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5004/api/delivery/track/${deliveryId}`);
      setDeliveryDetails(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch delivery details');
    }
  };

  if (!activeOrder) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className={`w-full h-screen flex items-center justify-center ${
          isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-100 to-gray-200'
        }`}
      >
        <div
          className={`p-12 rounded-3xl shadow-2xl backdrop-blur-lg ${
            isDarkMode ? 'bg-gray-800/80 text-white' : 'bg-white/80 text-gray-800'
          } max-w-md text-center`}
        >
          <motion.h2
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold mb-4"
          >
            No Active Delivery
          </motion.h2>
          <p className="text-lg mb-6">Start a new delivery to track its progress.</p>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/assign-delivery')}
            className={`px-8 py-4 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#b91c1c] to-[#991b1b]'
                : 'bg-gradient-to-r from-[#eb1900] to-[#c71500]'
            } text-white rounded-xl shadow-lg hover:shadow-xl focus:ring-4 focus:ring-[#eb1900]/50 transition-all duration-300 font-semibold`}
          >
            Assign Delivery
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const getStatusColor = (status) => ({
    pending: 'bg-gray-100 text-gray-800 border-gray-300',
    assigned: 'bg-blue-100 text-blue-800 border-blue-300',
    in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    delivered: 'bg-green-100 text-green-800 border-gray-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  }[status] || 'bg-gray-100 text-gray-800 border-gray-300');

  const getStatusText = (status) => ({
    pending: 'Pending',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    confirmed: 'Order Confirmed',
    preparing: 'Preparing Order',
    picked_up: 'Picked Up',
    delivered: 'Delivered',
  }[status] || status);

  const statusDescriptions = {
    confirmed: 'Your order has been received and confirmed by the restaurant.',
    preparing: 'The restaurant is currently preparing your delicious meal.',
    picked_up: 'The driver has picked up your order and is on the way.',
    delivered: 'Your order has been successfully delivered to you.',
    cancelled: 'The order has been cancelled.',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className={`w-full h-screen overflow-auto ${
        isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-100 to-gray-200'
      } relative flex flex-col`}
    >
      <motion.header
        className={`sticky top-0 z-10 py-4 px-4 sm:px-6 lg:px-8 ${
          isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'
        } backdrop-blur-lg shadow-lg flex justify-between items-center`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Delivery Dashboard
        </h1>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-800'}`}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
        </motion.button>
      </motion.header>

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/assign-delivery')}
            className={`w-full sm:w-auto px-8 py-4 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#b91c1c] to-[#991b1b]'
                : 'bg-gradient-to-r from-[#eb1900] to-[#c71500]'
            } text-white rounded-xl shadow-lg hover:shadow-xl focus:ring-4 focus:ring-[#eb1900]/50 transition-all duration-300 font-semibold flex items-center justify-center`}
            data-tooltip-id="assign-delivery-tooltip"
            data-tooltip-content="Create a new delivery"
            aria-label="Assign new delivery"
          >
            <FaPlus className="mr-2" />
            Assign New Delivery
            <Tooltip
              id="assign-delivery-tooltip"
              place="top"
              className={`bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl ${
                isDarkMode ? '!bg-gray-700' : ''
              }`}
            />
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`rounded-3xl shadow-2xl overflow-hidden backdrop-blur-lg ${
            isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'
          }`}
        >
          <div className="px-8 py-10">
            <div className="flex items-center justify-between">
              <motion.div initial={{ x: -20 }} animate={{ x: 0 }} transition={{ delay: 0.2 }}>
                <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Order #{activeOrder.id}
                </h3>
                <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {activeOrder.restaurantName}
                </p>
              </motion.div>
              <span
                className={`inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold shadow-md border ${getStatusColor(
                  activeOrder.status
                )}`}
              >
                {getStatusText(activeOrder.status)}
              </span>
            </div>
          </div>

          <div className="px-8 py-10 border-t border-gray-200/50">
            <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-8`}>
              Delivery Progress
            </h4>
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className={`w-full border-t-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
              </div>
              <div className="relative flex justify-between" role="list" aria-label="Delivery progress timeline">
                {['confirmed', 'preparing', 'picked_up', 'delivered'].map((status, index) => {
                  const isActive = activeOrder.status === status;
                  const isCompleted =
                    index < ['confirmed', 'preparing', 'picked_up', 'delivered'].indexOf(activeOrder.status);
                  return (
                    <motion.div
                      key={status}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.2, duration: 0.5 }}
                      className="flex flex-col items-center relative"
                      role="listitem"
                      data-tooltip-id={`status-tooltip-${status}`}
                      data-tooltip-content={statusDescriptions[status]}
                    >
                      <div
                        className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                          isActive
                            ? isDarkMode
                              ? 'bg-gradient-to-r from-[#b91c1c] to-[#991b1b] text-white scale-110 ring-2 ring-[#b91c1c]/50'
                              : 'bg-gradient-to-r from-[#eb1900] to-[#c71500] text-white scale-110 ring-2 ring-[#eb1900]/50'
                            : isCompleted
                            ? 'bg-green-600 text-white ring-2 ring-green-600/50'
                            : isDarkMode
                            ? 'bg-gray-700 text-gray-400'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        <span className="text-lg font-semibold">{index + 1}</span>
                        {isCompleted && (
                          <svg
                            className="absolute w-6 h-6 text-white -top-1 -right-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-[#eb1900]/20"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          />
                        )}
                      </div>
                      <span
                        className={`mt-4 text-sm font-medium ${
                          isDarkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'
                        } transition-colors duration-200`}
                      >
                        {getStatusText(status)}
                      </span>
                      <Tooltip
                        id={`status-tooltip-${status}`}
                        place="top"
                        className={`bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl ${
                          isDarkMode ? '!bg-gray-700' : ''
                        }`}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="px-8 py-10 border-t border-gray-200/50">
            <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-8`}>
              Delivery Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Estimated Delivery Time', value: activeOrder.estimatedDeliveryTime || 'N/A' },
                { label: 'Distance', value: activeOrder.distance || 'N/A' },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.2 }}
                  className={`p-6 rounded-xl shadow-md ${
                    isDarkMode ? 'bg-gray-800/80' : 'bg-gray-50/80'
                  } backdrop-blur-sm hover:shadow-lg transition-all duration-300`}
                >
                  <h5
                    className={`text-sm font-medium uppercase tracking-wide ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </h5>
                  <p className={`mt-2 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="px-8 py-10 border-t border-gray-200/50">
            <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-8`}>
              Delivery Location
            </h4>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <DeliveryMap location={location} driverLocation={null} />
            </motion.div>
          </div>

          <div className="px-8 py-10 border-t border-gray-200/50">
            <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-8`}>
              Control Panel
            </h4>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <UpdateDeliveryStatus isDarkMode={isDarkMode} />
            </motion.div>
          </div>

          <div className="px-8 py-10">
            <h4 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-8`}>
              Delivery Details Lookup
            </h4>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col md:flex-row gap-4 mb-6"
            >
              <div className="relative w-full md:w-2/3">
                <motion.label
                  initial={{ y: 0 }}
                  animate={{ y: deliveryId ? -24 : 0 }}
                  className={`absolute top-4 left-4 text-sm font-medium uppercase tracking-wide ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  } transition-all duration-200`}
                  htmlFor="deliveryIdLookup"
                >
                  Delivery ID
                </motion.label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  id="deliveryIdLookup"
                  type="text"
                  value={deliveryId}
                  onChange={(e) => setDeliveryId(e.target.value)}
                  className={`w-full px-4 pt-5 pb-3 ${
                    isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-700 border-gray-300'
                  } border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:border-transparent transition-all duration-200 placeholder-transparent`}
                  placeholder="Enter Delivery ID"
                  aria-label="Delivery ID input"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchDeliveryDetails}
                className={`px-8 py-3 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#b91c1c] to-[#991b1b]'
                    : 'bg-gradient-to-r from-[#eb1900] to-[#c71500]'
                } text-white rounded-lg shadow-md hover:shadow-xl focus:ring-4 focus:ring-[#eb1900]/50 transition-all duration-300 font-semibold`}
                data-tooltip-id="fetch-details-tooltip"
                data-tooltip-content="Fetch delivery details"
                aria-label="Fetch delivery details"
              >
                Fetch Details
                <Tooltip
                  id="fetch-details-tooltip"
                  place="top"
                  className={`bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl ${
                    isDarkMode ? '!bg-gray-700' : ''
                  }`}
                />
              </motion.button>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center ${
                    isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800'
                  } font-medium p-4 rounded-lg mb-6`}
                >
                  <FaInfoCircle className="mr-2" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            {deliveryDetails ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className={`p-8 rounded-3xl shadow-lg ${
                  isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'
                } backdrop-blur-lg`}
              >
                <h5
                  className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  } pb-2`}
                >
                  Delivery Information
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Delivery ID', value: deliveryDetails.deliveryId },
                    { label: 'Order ID', value: deliveryDetails.orderId },
                    { label: 'Driver Name', value: deliveryDetails.driver?.name || 'Not Assigned' },
                    { label: 'Driver Contact', value: deliveryDetails.driver?.contact || 'N/A' },
                    { label: 'Driver Email', value: deliveryDetails.driver?.email || 'N/A' },
                    {
                      label: 'Status',
                      value: (
                        <span
                          className={`capitalize ${getStatusColor(deliveryDetails.status).replace(
                            'bg-blue-100 text-blue-800',
                            isDarkMode ? 'bg-[#b91c1c]/20 text-[#b91c1c]' : 'bg-[#eb1900]/10 text-[#eb1900]'
                          )}`}
                        >
                          {getStatusText(deliveryDetails.status)}
                        </span>
                      ),
                    },
                    {
                      label: 'Location',
                      value: deliveryDetails.location
                        ? `${deliveryDetails.location.latitude}, ${deliveryDetails.location.longitude}`
                        : 'N/A',
                    },
                    {
                      label: 'Estimated Delivery',
                      value: deliveryDetails.estimatedDeliveryTime
                        ? new Date(deliveryDetails.estimatedDeliveryTime).toLocaleString()
                        : 'N/A',
                    },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="space-y-1"
                    >
                      <p
                        className={`text-sm font-medium uppercase tracking-wide ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {item.label}
                      </p>
                      <p className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.value}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              deliveryId &&
              !error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 flex justify-center"
                >
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                </motion.div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Delivery;