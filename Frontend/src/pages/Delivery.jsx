import React, { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import DeliveryMap from './DeliveryMap';
import UpdateDeliveryStatus from './UpdateDeliveryStatus';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { FaInfoCircle, FaPlus, FaMoon, FaSun, FaArrowRight, FaClock, FaMapMarkerAlt, FaUtensils, FaMapPin, FaDollarSign, FaSearch, FaTag, FaUser, FaPhone, FaEnvelope, FaTimes } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import { motion, AnimatePresence } from 'framer-motion';

// Socket.IO connection
const socket = io('http://localhost:5004', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Haversine formula to calculate distance between two coordinates in miles
const haversineDistance = (coords1, coords2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 3958.8; // Earth's radius in miles
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance.toFixed(1); // Return distance rounded to 1 decimal place
};

// Animation variants for page load
const pageLoadVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 120 },
  },
};

// Animation variants for dark/light mode
const themeVariants = {
  light: {
    background: 'linear-gradient(45deg, #f8ebdd, #f5e6d8)',
    color: '#1f2937',
    transition: {
      background: { duration: 0.5, ease: 'easeOut' },
      color: { duration: 0.3, ease: 'easeOut' },
    },
  },
  dark: {
    background: '#111827',
    color: '#f9fafb',
    transition: {
      background: { duration: 0.5, ease: 'easeOut' },
      color: { duration: 0.3, ease: 'easeOut' },
    },
  },
};

const slideInVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', type: 'spring', stiffness: 150 },
  },
};

// Animation variants for Delivery Details Lookup
const lookupContainerVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 120 },
  },
};

const headerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const underlineVariants = {
  hidden: { width: '0%' },
  visible: {
    width: '100%',
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const inputContainerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', delay: 0.2, type: 'spring', stiffness: 150 },
  },
};

const inputVariants = {
  rest: {
    scale: 1,
    boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
    borderColor: 'rgba(209, 213, 219, 1)',
  },
  focus: {
    scale: 1.03,
    boxShadow: '0 0 10px rgba(235, 25, 0, 0.4)',
    borderColor: 'rgba(235, 25, 0, 1)',
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

const buttonVariants = {
  rest: {
    scale: [1, 1.02, 1],
    boxShadow: '0 4px 8px rgba(235, 25, 0, 0.2)',
    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
  },
  hover: {
    scale: 1.1,
    boxShadow: '0 8px 16px rgba(235, 25, 0, 0.4)',
    background: 'linear-gradient(to right, #ff2a00, #e00a00)',
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  tap: {
    scale: 0.9,
    transition: { duration: 0.1 },
  },
};

const rippleVariants = {
  initial: { scale: 0, opacity: 0.6 },
  animate: {
    scale: 3,
    opacity: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const errorVariants = {
  hidden: { opacity: 0, x: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut', type: 'spring', stiffness: 100 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
};

const dismissButtonVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.3,
    rotate: 360,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  tap: {
    scale: 0.9,
    transition: { duration: 0.1 },
  },
};

// Animation variants for Delivery Information
const detailsCardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99],
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: 50,
    scale: 0.9,
    transition: { duration: 0.4, ease: 'easeIn' },
  },
};

const detailsItemVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
      type: 'spring',
      stiffness: 120,
    },
  },
  hover: {
    scale: 1.03,
    boxShadow: '0 6px 12px rgba(235, 25, 0, 0.2)',
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

const iconVariants = {
  rest: { rotate: 0, scale: 1 },
  hover: {
    rotate: 10,
    scale: 1.1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// Existing animation variants for Delivery Information
const infoContainerVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.15 },
  },
};

const infoCardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', type: 'spring', stiffness: 150 },
  },
  hover: {
    scale: 1.05,
    y: -5,
    boxShadow: '0 10px 20px rgba(235, 25, 0, 0.3)',
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

const statusCardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', type: 'spring', stiffness: 150 },
  },
  hover: {
    scale: 1.05,
    y: -5,
    boxShadow: '0 10px 20px rgba(235, 25, 0, 0.3)',
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

const infoLabelVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const infoValueVariants = {
  hidden: { opacity: 0, x: 10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut', delay: 0.1, type: 'spring', stiffness: 100 },
  },
};

const dividerVariants = {
  hidden: { width: '0%' },
  visible: {
    width: '100%',
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

// Animation variants for Delivery Progress Timeline
const timelineContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { when: 'beforeChildren', staggerChildren: 0.4, delay: 0.3 },
  },
};

// New progress line variants for dynamic loading animation
const progressLineVariants = (progress) => ({
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: progress,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.5, ease: 'easeInOut' },
      opacity: { duration: 0.3 },
    },
  },
});

const timelineItemVariants = {
  hidden: { opacity: 0, y: 50, rotate: -10 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { duration: 0.6, ease: 'easeOut', type: 'spring', stiffness: 100 },
  },
};

// New variants for the status circle pop-up animation
const statusCircleVariants = {
  rest: { scale: 1, y: 0, boxShadow: '0 0 0 rgba(0, 0, 0, 0)' },
  hover: {
    scale: 1.1,
    y: -5,
    boxShadow: '0 8px 16px rgba(235, 25, 0, 0.4)',
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

const checkmarkVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      scale: { duration: 0.4, ease: 'easeOut', type: 'spring', stiffness: 200, damping: 10 },
      opacity: { duration: 0.2 },
    },
  },
};

const labelVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut', delay: 0.2 },
  },
};

const spinnerVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const spinnerRingVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
    transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
  },
};

const spinnerInnerVariants = {
  animate: {
    rotate: 360,
    transition: { repeat: Infinity, duration: 1, ease: 'linear' },
  },
};

// New loading spinner variants for timeline
const timelineSpinnerVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// Toggle button animation for dark mode
const toggleButtonVariants = {
  light: {
    rotate: 0,
    scale: 1,
    background: '#e5e7eb',
    color: '#1f2937',
    boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
    transition: { duration: 0.3, ease: 'easeOut', type: 'spring', stiffness: 200, damping: 10 },
  },
  dark: {
    rotate: 180,
    scale: 1.2,
    background: '#374151',
    color: '#f9fafb',
    boxShadow: '0 0 15px rgba(234, 179, 8, 0.5)',
    transition: { duration: 0.3, ease: 'easeOut', type: 'spring', stiffness: 200, damping: 10 },
  },
};

const Delivery = () => {
  const navigate = useNavigate();
  const { activeOrder: contextActiveOrder } = useOrder();
  const [activeOrder, setActiveOrder] = useState(contextActiveOrder);
  const [location, setLocation] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [deliveryId, setDeliveryId] = useState('');
  const [lookupDeliveryId, setLookupDeliveryId] = useState('');
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTimelineLoading, setIsTimelineLoading] = useState(true);
  const [isLookupLoading, setIsLookupLoading] = useState(false);

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

  const mapToActiveOrder = (delivery, order = {}) => {
    console.log('Mapping delivery:', delivery);
    console.log('Mapping order:', order);
    const mappedStatus = mapStatus(delivery.status || 'pending');
    const defaultLocation = { coordinates: [79.8612, 6.9271] };
    let deliveryLocation = defaultLocation;

    if (delivery.location?.coordinates) {
      deliveryLocation = { coordinates: delivery.location.coordinates };
    }

    let driverLocation = null;
    if (delivery.driver?.location?.coordinates) {
      driverLocation = { coordinates: delivery.driver.location.coordinates };
    } else if (delivery.location?.coordinates) {
      driverLocation = { coordinates: delivery.location.coordinates };
    }

    const restaurantCoords = [79.8612, 6.9271];
    const address = order?.deliveryAddress || '123 Main St, Colombo';
    const distance = haversineDistance(restaurantCoords, deliveryLocation.coordinates);

    const mappedOrder = {
      id: delivery.orderId || 'Unknown',
      restaurantName: delivery.restaurantName || order?.restaurantId || 'DineSwift Restaurant',
      status: mappedStatus,
      location: deliveryLocation,
      driverLocation,
      estimatedDeliveryTime: delivery.estimatedDeliveryTime
        ? new Date(delivery.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date(Date.now() + 30 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      distance: `${distance} miles`,
      address,
      orderTotal: delivery.orderTotal ? `$${parseFloat(delivery.orderTotal).toFixed(2)}` : order?.totalAmount ? `$${parseFloat(order.totalAmount).toFixed(2)}` : '$25.97',
    };

    console.log('Mapped order:', mappedOrder);
    return mappedOrder;
  };

  useEffect(() => {
    const fetchActiveOrder = async () => {
      setIsTimelineLoading(true);
      if (contextActiveOrder) {
        setActiveOrder(contextActiveOrder);
        setLocation(contextActiveOrder.location);
        setDriverLocation(contextActiveOrder.driverLocation);
        setDeliveryId(contextActiveOrder.id);
        console.log('Context deliveryId:', contextActiveOrder.id);
        setIsTimelineLoading(false);
        return;
      }
      try {
        const response = await axios.get('http://localhost:5004/api/delivery/active');
        console.log('Active delivery response:', response.data);
        const delivery = response.data;
        if (delivery && (delivery.deliveryId || delivery.deliveryld)) {
          const normalizedDelivery = {
            ...delivery,
            deliveryId: delivery.deliveryId || delivery.deliveryld,
            orderTotal: delivery.orderTotal || delivery.orderTota1,
          };
          let order = {};
          if (normalizedDelivery.orderId) {
            try {
              const orderResponse = await axios.get(`http://localhost:5003/api/orders/${normalizedDelivery.orderId}`);
              order = orderResponse.data;
              console.log('Fetched order:', order);
            } catch (err) {
              console.error('Error fetching order:', err);
            }
          }
          const mappedOrder = mapToActiveOrder(normalizedDelivery, order);
          setActiveOrder(mappedOrder);
          setLocation(mappedOrder.location);
          setDriverLocation(mappedOrder.driverLocation);
          setDeliveryId(normalizedDelivery.deliveryId);
          console.log('Active deliveryId set:', normalizedDelivery.deliveryId);
        } else {
          console.log('No active delivery found or missing deliveryId');
          setActiveOrder(null);
        }
      } catch (err) {
        console.error('Error fetching active order:', err);
        setActiveOrder(null);
        setError('Failed to fetch active delivery');
      } finally {
        setIsTimelineLoading(false);
      }
    };
    fetchActiveOrder();
  }, [contextActiveOrder]);

  useEffect(() => {
    if (deliveryDetails && (deliveryDetails.deliveryId || deliveryDetails.deliveryld)) {
      setIsTimelineLoading(true);
      const normalizedDelivery = {
        ...deliveryDetails,
        deliveryId: deliveryDetails.deliveryId || deliveryDetails.deliveryld,
        orderTotal: deliveryDetails.orderTotal || deliveryDetails.orderTota1,
      };
      const mappedOrder = mapToActiveOrder(normalizedDelivery, deliveryDetails.order || {});
      setActiveOrder(mappedOrder);
      setLocation(mappedOrder.location);
      setDriverLocation(mappedOrder.driverLocation);
      setDeliveryId(normalizedDelivery.deliveryId);
      console.log('Delivery details deliveryId set:', normalizedDelivery.deliveryId);
      setIsTimelineLoading(false);
    }
  }, [deliveryDetails]);

  useEffect(() => {
    socket.on('connect', () => console.log('Connected to Socket.IO server'));
    socket.on('deliveryStatusUpdated', async (data) => {
      const eventDeliveryId = data.deliveryId?.toString ? data.deliveryId.toString() : data.deliveryId;
      if (eventDeliveryId === deliveryId || activeOrder?.id === data.orderId) {
        setIsTimelineLoading(true);
        try {
          const response = await axios.get(`http://localhost:5004/api/delivery/track/${eventDeliveryId}`);
          setDeliveryDetails(response.data);
          const normalizedDelivery = {
            ...response.data,
            deliveryId: response.data.deliveryId || response.data.deliveryld,
            orderTotal: response.data.orderTotal || response.data.orderTota1,
          };
          const mappedOrder = mapToActiveOrder(normalizedDelivery, response.data.order || {});
          setActiveOrder(mappedOrder);
          setLocation(mappedOrder.location);
          setDriverLocation(mappedOrder.driverLocation);
          setDeliveryId(normalizedDelivery.deliveryId);
          console.log('Status update deliveryId set:', normalizedDelivery.deliveryId);
        } catch (err) {
          console.error('Error refreshing delivery:', err);
          setError('Failed to refresh delivery status');
        } finally {
          setIsTimelineLoading(false);
        }
      }
    });
    socket.on('driverLocationUpdate', (data) => {
      if (data.deliveryId === deliveryId) {
        setDriverLocation({ coordinates: data.location.coordinates });
        console.log('Received driverLocationUpdate:', data);
      }
    });
    return () => {
      socket.off('connect');
      socket.off('deliveryStatusUpdated');
      socket.off('driverLocationUpdate');
    };
  }, [deliveryId, activeOrder]);

  const fetchDeliveryDetails = async () => {
    setError(null);
    setDeliveryDetails(null);
    setDriverLocation(null);
    setIsLookupLoading(true);
    if (!lookupDeliveryId) {
      setError('Please enter a Delivery ID');
      console.log('No lookupDeliveryId provided for lookup');
      setIsLookupLoading(false);
      return;
    }
    const orderIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!orderIdRegex.test(lookupDeliveryId)) {
      setError('Invalid Delivery ID format');
      console.log('Invalid lookupDeliveryId format:', lookupDeliveryId);
      setIsLookupLoading(false);
      return;
    }
    try {
      console.log(`Fetching delivery details for ID: ${lookupDeliveryId}`);
      const response = await axios.get(`http://localhost:5004/api/delivery/track/${lookupDeliveryId}`);
      console.log('API Response:', response.data);
      if (response.data && typeof response.data === 'object' && (response.data.deliveryId || response.data.deliveryld)) {
        const normalizedDelivery = {
          ...response.data,
          deliveryId: response.data.deliveryId || response.data.deliveryld,
          orderTotal: response.data.orderTotal || response.data.orderTota1,
        };
        setDeliveryDetails(normalizedDelivery);
        setDeliveryId(normalizedDelivery.deliveryId);
        console.log('Track deliveryId set:', normalizedDelivery.deliveryId);
        setError('');
      } else {
        setError('Invalid response from server');
        setDeliveryDetails(null);
        console.log('Invalid API response:', response.data);
      }
    } catch (err) {
      console.error('Error fetching delivery details:', err);
      setError(err.response?.data?.message || 'Failed to fetch delivery details.');
      setDeliveryDetails(null);
    } finally {
      setIsLookupLoading(false);
    }
  };

  if (!activeOrder) {
    return (
      <motion.div
        variants={pageLoadVariants}
        initial="hidden"
        animate="visible"
        className="w-full min-h-screen flex items-center justify-center"
        style={{ background: isDarkMode ? '#111827' : 'linear-gradient(45deg, #f8ebdd, #f5e6d8)' }}
      >
        <motion.div
          className={`p-12 rounded-3xl shadow-2xl backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/80 text-white' : 'bg-white/80 text-gray-800'} max-w-md text-center`}
          variants={slideUpVariants}
        >
          <motion.h2
            className="text-4xl font-bold mb-4"
            variants={slideInVariants}
          >
            No Active Delivery
          </motion.h2>
          <motion.p
            className="text-lg mb-6"
            variants={slideInVariants}
          >
            Start a new delivery to track its progress.
          </motion.p>
          <motion.button
            variants={buttonVariants}
            initial="rest"
            animate="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={() => navigate('/assign-delivery')}
            className={`px-8 py-4 ${isDarkMode ? 'bg-gradient-to-r from-[#b91c1c] to-[#991b1b]' : 'bg-gradient-to-r from-[#eb1900] to-[#c71500]'} text-white rounded-xl shadow-lg focus:ring-4 focus:ring-[#eb1900]/50 font-semibold relative overflow-hidden border-2 border-transparent animate-pulse-on-hover`}
          >
            <motion.div
              className="absolute inset-0 bg-white/40"
              variants={rippleVariants}
              initial="initial"
              animate="initial"
              whileTap="animate"
            />
            Assign Delivery
          </motion.button>
        </motion.div>
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

  // Calculate progress for the animated line
  const statusOrder = ['confirmed', 'preparing', 'picked_up', 'delivered'];
  const currentStatusIndex = statusOrder.indexOf(activeOrder.status);
  const progress = (currentStatusIndex + 1) / statusOrder.length;

  return (
    <motion.div
      variants={themeVariants}
      initial={isDarkMode ? 'dark' : 'light'}
      animate={isDarkMode ? 'dark' : 'light'}
      className="w-full min-h-screen overflow-auto relative flex flex-col"
    >
      <motion.header
        className="sticky top-0 z-20 pt-6 pb-4 px-4 sm:px-6 lg:px-8 lg:pr-16 backdrop-blur-lg shadow-lg flex justify-between items-start"
        variants={slideInVariants}
        style={{
          background: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          transition: 'background 0.5s ease-out',
        }}
      >
        <motion.h1
          className="text-2xl font-bold"
          variants={slideInVariants}
          style={{ color: isDarkMode ? '#f9fafb' : '#1f2937' }}
        >
          Delivery Dashboard
        </motion.h1>
        <motion.button
          variants={toggleButtonVariants}
          initial={isDarkMode ? 'dark' : 'light'}
          animate={isDarkMode ? 'dark' : 'light'}
          whileHover={{ scale: 1.3 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-3 mr-6 rounded-full flex items-center justify-center border-2 shadow-md relative overflow-hidden z-20"
          style={{
            borderColor: isDarkMode ? 'rgba(234, 179, 8, 0.5)' : 'rgba(31, 41, 55, 0.5)',
          }}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <FaSun size={24} /> : <FaMoon size={24} />}
        </motion.button>
      </motion.header>

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="mb-8"
          variants={slideInVariants}
        >
          <motion.button
            variants={buttonVariants}
            initial="rest"
            animate="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={() => navigate('/assign-delivery')}
            className={`w-full sm:w-auto px-8 py-4 ${isDarkMode ? 'bg-gradient-to-r from-[#b91c1c] to-[#991b1b]' : 'bg-gradient-to-r from-[#eb1900] to-[#c71500]'} text-white rounded-xl shadow-lg focus:ring-4 focus:ring-[#eb1900]/50 font-semibold flex items-center justify-center relative overflow-hidden border-2 border-transparent animate-pulse-on-hover`}
            data-tooltip-id="assign-delivery-tooltip"
            data-tooltip-content="Create a new delivery"
            aria-label="Assign new delivery"
          >
            <motion.div
              className="absolute inset-0 bg-white/40"
              variants={rippleVariants}
              initial="initial"
              animate="initial"
              whileTap="animate"
            />
            <FaPlus className="mr-2" />
            Assign New Delivery
            <Tooltip
              id="assign-delivery-tooltip"
              place="top"
              className={`bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl ${isDarkMode ? '!bg-gray-700' : ''}`}
            />
          </motion.button>
        </motion.div>

        <motion.div
          className="rounded-3xl shadow-2xl overflow-hidden backdrop-blur-lg"
          variants={pageLoadVariants}
          style={{
            background: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            transition: 'background 0.5s ease-out',
          }}
        >
          <motion.div
            className="px-8 py-10"
            variants={slideUpVariants}
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold" style={{ color: isDarkMode ? '#f9fafb' : '#1f2937' }}>
                  Order #{activeOrder.id}
                </h3>
                <p className="mt-2 text-sm font-medium" style={{ color: isDarkMode ? '#d1d5db' : '#4b5563' }}>
                  {activeOrder.restaurantName}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold shadow-md border ${getStatusColor(
                  activeOrder.status
                )}`}
              >
                {getStatusText(activeOrder.status)}
              </span>
            </div>
          </motion.div>

          <motion.div
            className="px-8 py-10 border-t"
            variants={slideUpVariants}
            style={{ animationDelay: '0.3s', borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)' }}
          >
            <h4 className="text-xl font-semibold mb-8" style={{ color: isDarkMode ? '#f9fafb' : '#1f2937' }}>
              Delivery Progress
            </h4>
            <motion.div
              variants={timelineContainerVariants}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              {isTimelineLoading ? (
                <motion.div
                  variants={timelineSpinnerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex justify-center py-8"
                >
                  <div className="relative h-12 w-12">
                    <motion.div
                      variants={spinnerRingVariants}
                      animate="animate"
                      className={`absolute inset-0 rounded-full border-4 ${isDarkMode ? 'border-[#b91c1c]' : 'border-[#eb1900]'} border-opacity-70`}
                      style={{ boxShadow: `0 0 10px ${isDarkMode ? 'rgba(185, 28, 28, 0.5)' : 'rgba(235, 25, 0, 0.5)'}` }}
                    />
                    <motion.div
                      variants={spinnerInnerVariants}
                      animate="animate"
                      className={`absolute inset-2 rounded-full border-2 ${isDarkMode ? 'border-[#991b1b]' : 'border-[#c71500]'}`}
                    />
                  </div>
                </motion.div>
              ) : (
                <>
                  <motion.div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <svg className="w-full h-full">
                      <motion.line
                        x1="0%"
                        y1="50%"
                        x2="100%"
                        y2="50%"
                        stroke={isDarkMode ? '#4B5563' : '#D1D5DB'}
                        strokeWidth="2"
                      />
                      <motion.line
                        x1="0%"
                        y1="50%"
                        x2="100%"
                        y2="50%"
                        stroke={isDarkMode ? '#b91c1c' : '#eb1900'}
                        strokeWidth="4"
                        variants={progressLineVariants(progress)}
                      />
                    </svg>
                  </motion.div>
                  <div
                    className="relative flex justify-between"
                    role="list"
                    aria-label="Delivery progress timeline"
                  >
                    {statusOrder.map((status, index) => {
                      const isActive = activeOrder.status === status;
                      const isCompleted = index < statusOrder.indexOf(activeOrder.status);
                      return (
                        <motion.div
                          key={status}
                          variants={timelineItemVariants}
                          initial="hidden"
                          animate="visible"
                          className="flex flex-col items-center relative"
                          role="listitem"
                        >
                          <motion.div
                            variants={statusCircleVariants}
                            initial="rest"
                            whileHover="hover"
                            className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-shadow duration-300 ${
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
                              <motion.svg
                                className="absolute w-6 h-6 -top-1 -right-1"
                                fill="none"
                                stroke={isDarkMode ? '#ffffff' : '#111827'}
                                viewBox="0 0 24 24"
                                variants={checkmarkVariants}
                                initial="hidden"
                                animate="visible"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </motion.svg>
                            )}
                          </motion.div>
                          <motion.span
                            variants={labelVariants}
                            className={`mt-4 text-sm font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            {getStatusText(status)}
                          </motion.span>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>

          <motion.div
            className="py-10 border-t"
            variants={slideUpVariants}
            style={{ animationDelay: '0.4s', borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)' }}
          >
            <motion.div
              variants={infoContainerVariants}
              initial="hidden"
              animate="visible"
              className="w-full"
            >
              <div className="px-4 sm:px-6 lg:px-8">
                <h4 className="text-3xl font-semibold mb-6 font-sans tracking-tight" style={{ color: isDarkMode ? '#f9fafb' : '#1f2937' }}>
                  Delivery Information
                </h4>
                <motion.div
                  variants={dividerVariants}
                  className="h-0.5 bg-gradient-to-r from-transparent via-[#eb1900] to-transparent mb-8"
                ></motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      label: 'Estimated Delivery Time',
                      value: activeOrder.estimatedDeliveryTime || 'N/A',
                      icon: <FaClock className={`text-2xl ${isDarkMode ? 'text-[#b91c1c]' : 'text-[#eb1900]'} mr-2`} />,
                    },
                    {
                      label: 'Distance',
                      value: activeOrder.distance || 'N/ A',
                      icon: <FaMapMarkerAlt className={`text-2xl ${isDarkMode ? 'text-[#b91c1c]' : 'text-[#eb1900]'} mr-2`} />,
                    },
                    {
                      label: 'Restaurant',
                      value: activeOrder.restaurantName || 'N/A',
                      icon: <FaUtensils className={`text-2xl ${isDarkMode ? 'text-[#b91c1c]' : 'text-[#eb1900]'} mr-2`} />,
                    },
                    {
                      label: 'Delivery Address',
                      value: activeOrder.address || 'N/A',
                      icon: <FaMapPin className={`text-2xl ${isDarkMode ? 'text-[#b91c1c]' : 'text-[#eb1900]'} mr-2`} />,
                    },
                    {
                      label: 'Order Total',
                      value: activeOrder.orderTotal || 'N/A',
                      icon: <FaDollarSign className={`text-2xl ${isDarkMode ? 'text-[#b91c1c]' : 'text-[#eb1900]'} mr-2`} />,
                    },
                    {
                      label: 'Order Status',
                      value: (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activeOrder.status)}`}
                        >
                          {getStatusText(activeOrder.status)}
                        </span>
                      ),
                      icon: <FaInfoCircle className={`text-2xl ${isDarkMode ? 'text-[#b91c1c]' : 'text-[#eb1900]'} mr-2`} />,
                    },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.label}
                      variants={infoCardVariants}
                      whileHover="hover"
                      className={`p-8 rounded-xl shadow-md backdrop-blur-md border border-transparent transition-all duration-300`}
                      style={{
                        background: isDarkMode ? 'rgba(31, 41, 55, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                        borderColor: isDarkMode ? 'rgba(185, 28, 28, 0.2)' : 'rgba(235, 25, 0, 0.2)',
                      }}
                    >
                      <div className="flex items-center">
                        <motion.div variants={iconVariants} initial="rest" whileHover="hover">
                          {item.icon}
                        </motion.div>
                        <motion.h5
                          variants={infoLabelVariants}
                          className="text-sm font-medium uppercase tracking-wider"
                          style={{ color: isDarkMode ? '#9ca3af' : '#4b5563' }}
                        >
                          {item.label}
                        </motion.h5>
                      </div>
                      <motion.p
                        variants={infoValueVariants}
                        className="mt-2 text-xl font-semibold font-sans"
                        style={{ color: isDarkMode ? '#f9fafb' : '#1f2937' }}
                      >
                        {item.value}
                      </motion.p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="px-8 py-10 border-t"
            variants={slideUpVariants}
            style={{ animationDelay: '0.5s', borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)' }}
          >
            <h4 className="text-xl font-semibold mb-8" style={{ color: isDarkMode ? '#f9fafb' : '#1f2937' }}>
              Delivery Location
            </h4>
            <div>
              <DeliveryMap location={location} driverLocation={driverLocation} isDarkMode={isDarkMode} deliveryId={deliveryId} />
            </div>
          </motion.div>

          <motion.div
            className="px-8 py-10 border-t"
            variants={slideUpVariants}
            style={{ animationDelay: '0.6s', borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)' }}
          >
            <h4 className="text-xl font-semibold mb-8" style={{ color: isDarkMode ? '#f9fafb' : '#1f2937' }}>
              Control Panel
            </h4>
            <div className="border-2 border-transparent rounded-xl overflow-hidden">
              <UpdateDeliveryStatus isDarkMode={isDarkMode} />
            </div>
          </motion.div>

          <motion.div
            className="py-10"
            variants={slideUpVariants}
            style={{ animationDelay: '0.7s' }}
          >
            <motion.div
              variants={lookupContainerVariants}
              initial="hidden"
              animate="visible"
              className="w-full p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl border border-transparent"
              style={{
                background: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: isDarkMode ? 'rgba(185, 28, 28, 0.3)' : 'rgba(235, 25, 0, 0.3)',
                transition: 'background 0.5s ease-out, border-color 0.3s ease-out',
              }}
            >
              <motion.h4
                variants={headerVariants}
                className="text-3xl font-extrabold mb-6 font-sans tracking-tight"
                style={{
                  color: isDarkMode ? '#ffffff' : '#111827',
                  textRendering: 'optimizeLegibility',
                  WebkitFontSmoothing: 'antialiased',
                }}
              >
                Delivery Details Lookup
              </motion.h4>
              <motion.div
                variants={underlineVariants}
                className="h-1 bg-gradient-to-r from-[#eb1900] to-[#c71500] mb-8 rounded-full"
              />
              <motion.div
                variants={inputContainerVariants}
                initial="hidden"
                animate="visible"
                className="p-8 rounded-2xl shadow-lg border border-transparent mb-8 backdrop-blur-sm"
                style={{
                  background: isDarkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(249, 250, 251, 0.3)',
                  borderColor: isDarkMode ? 'rgba(185, 28, 28, 0.3)' : 'rgba(235, 25, 0, 0.3)',
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <div className="relative sm:col-span-4">
                    <motion.label
                      className="absolute left-0 top-[-1.5rem] text-sm font-semibold uppercase tracking-wider"
                      htmlFor="deliveryIdLookup"
                      style={{
                        color: isDarkMode ? '#d1d5db' : '#374151',
                        textRendering: 'optimizeLegibility',
                        WebkitFontSmoothing: 'antialiased',
                      }}
                    >
                      Delivery ID
                    </motion.label>
                    <FaSearch className={`absolute left-4 top-4 text-2xl ${isDarkMode ? 'text-gray-400' : 'text-[#eb1900]'}`} />
                    <motion.input
                      variants={inputVariants}
                      initial="rest"
                      animate="rest"
                      whileFocus="focus"
                      id="deliveryIdLookup"
                      type="text"
                      value={lookupDeliveryId}
                      onChange={(e) => setLookupDeliveryId(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb1900] transition-all duration-300 font-sans text-base selection:bg-[#b91c1c] selection:text-white"
                      style={{
                        background: isDarkMode ? '#374151' : '#ffffff',
                        color: isDarkMode ? '#ffffff' : '#111827',
                        borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
                        placeholderColor: isDarkMode ? '#9ca3af' : '#9ca3af',
                        textRendering: 'optimizeLegibility',
                        WebkitFontSmoothing: 'antialiased',
                      }}
                      placeholder="Enter Delivery ID"
                      aria-label="Delivery ID input"
                    />
                  </div>
                  <motion.button
                    variants={buttonVariants}
                    initial="rest"
                    animate="rest"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={fetchDeliveryDetails}
                    className={`relative px-6 py-4 ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-[#b91c1c] to-[#991b1b]'
                        : 'bg-gradient-to-r from-[#eb1900] to-[#c71500]'
                    } text-white rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:ring-offset-2 transition-all duration-300 flex items-center justify-center text-base overflow-hidden border-2 border-transparent animate-pulse-on-hover`}
                    data-tooltip-id="fetch-details-tooltip"
                    data-tooltip-content="Fetch delivery details"
                    aria-label="Fetch delivery details"
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/40"
                      variants={rippleVariants}
                      initial="initial"
                      animate="initial"
                      whileTap="animate"
                    />
                    <FaArrowRight className="mr-2" />
                    Fetch Details
                    <Tooltip
                      id="fetch-details-tooltip"
                      place="top"
                      className={`bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg ${isDarkMode ? '!bg-gray-700' : ''}`}
                    />
                  </motion.button>
                </div>
                <AnimatePresence>
                  {isLookupLoading && (
                    <motion.div
                      variants={timelineSpinnerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex justify-center mt-6"
                    >
                      <div className="relative h-12 w-12">
                        <motion.div
                          variants={spinnerRingVariants}
                          animate="animate"
                          className={`absolute inset-0 rounded-full border-4 ${isDarkMode ? 'border-[#b91c1c]' : 'border-[#eb1900]'} border-opacity-70`}
                          style={{ boxShadow: `0 0 10px ${isDarkMode ? 'rgba(185, 28, 28, 0.5)' : 'rgba(235, 25, 0, 0.5)'}` }}
                        />
                        <motion.div
                          variants={spinnerInnerVariants}
                          animate="animate"
                          className={`absolute inset-2 rounded-full border-2 ${isDarkMode ? 'border-[#991b1b]' : 'border-[#c71500]'}`}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-center p-6 rounded-lg mb-8 shadow-lg backdrop-blur-lg border border-transparent"
                    style={{
                      background: isDarkMode ? 'rgba(153, 27, 27, 0.5)' : 'rgba(254, 226, 226, 0.8)',
                      color: isDarkMode ? '#fecaca' : '#991b1b',
                      borderColor: isDarkMode ? 'rgba(153, 27, 27, 0.5)' : 'rgba(248, 113, 113, 0.5)',
                    }}
                  >
                    <FaInfoCircle className="mr-3 text-xl" />
                    <span className="flex-1 text-base">{error}</span>
                    <motion.button
                      variants={dismissButtonVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => setError(null)}
                      className="p-2 rounded-full transition-all duration-200"
                      style={{ color: isDarkMode ? '#fecaca' : '#b91c1c' }}
                      aria-label="Dismiss error"
                    >
                      <FaTimes />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {deliveryDetails && (
                  <motion.div
                    variants={detailsCardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="p-8 rounded-2xl shadow-lg backdrop-blur-lg border border-transparent relative overflow-hidden"
                    style={{
                      background: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                      borderColor: isDarkMode ? 'rgba(185, 28, 28, 0.3)' : 'rgba(235, 25, 0, 0.3)',
                    }}
                  >
                    <h5 className="text-xl font-semibold mb-6 pb-3 border-b"
                      style={{
                        color: isDarkMode ? '#f9fafb' : '#1f2937',
                        borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
                      }}
                    >
                      Delivery Information
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        {
                          label: 'Delivery ID',
                          value: deliveryDetails?.deliveryId || 'N/A',
                          icon: <FaTag className={`text-2xl ${isDarkMode ? 'text-[#b91c1c]' : 'text-[#eb1900]'} mr-2`} />,
                        },
                        {
                          label: 'Order ID',
                          value: deliveryDetails?.orderId || 'N/A',
                          icon: <FaTag className={`text-2xl ${isDarkMode ? 'text-[#b91c1c]' : 'text-[#eb1900]'} mr-2`} />,
                        },
                        {
                          label: 'Driver Name',
                          value: deliveryDetails?.driver?.name || 'Not Assigned',
                          icon: <FaUser className={`text-2xl ${isDarkMode ? 'text-[#b91c1c]' : 'text-[#eb1900]'} mr-2`} />,
                        },
                        {
                          label: 'Driver Contact',
                          value: deliveryDetails?.driver?.contact || 'N/A',
                          icon: <FaPhone className={`text-2xl ${isDarkMode ? 'text-[#b91c1c]' : 'text-[#eb1900]'} mr-2`} />,
                        },
                        {
                          label: 'Driver Email',
                          value: deliveryDetails?.driver?.email || 'N/A',
                          icon: <FaEnvelope className={`text-2xl ${isDarkMode ? 'text-[#b91c1c]' : 'text-[#eb1900]'} mr-2`} />,
                        },
                        {
                          label: 'Status',
                          value: deliveryDetails?.status ? (
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(deliveryDetails.status).replace(
                                'bg-blue-100 text-blue-800',
                                isDarkMode ? 'bg-[#b91c1c]/20 text-[#b91c1c]' : 'bg-[#eb1900]/20 text-[#eb1900]'
                              )}`}
                            >
                              {getStatusText(deliveryDetails.status)}
                            </span>
                          ) : 'N/A',
                          icon: <FaInfoCircle className={`text-2xl ${isDarkMode ? 'text-[#b91c1c]' : 'text-[#eb1900]'} mr-2`} />,
                        },
                        {
                          label: 'Location',
                          value: deliveryDetails?.location && deliveryDetails.location.coordinates
                            ? `${deliveryDetails.location.coordinates[1]}, ${deliveryDetails.location.coordinates[0]}`
                            : 'N/A',
                          icon: <FaMapPin className={`text-2xl ${isDarkMode ? 'text-[#b91c1c]' : 'text-[#eb1900]'} mr-2`} />,
                        },
                        {
                          label: 'Estimated Delivery',
                          value: deliveryDetails?.estimatedDeliveryTime
                            ? new Date(deliveryDetails.estimatedDeliveryTime).toLocaleString()
                            : 'N/A',
                          icon: <FaClock className={`text-2xl ${isDarkMode ? 'text-[#b91c1c]' : 'text-[#eb1900]'} mr-2`} />,
                        },
                      ].map((item, idx) => (
                        <motion.div
                          key={item.label}
                          variants={detailsItemVariants}
                          whileHover="hover"
                          className="p-6 rounded-lg shadow-sm transition-all duration-300 flex items-start space-x-3"
                          style={{
                            background: isDarkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(249, 250, 251, 0.3)',
                            border: isDarkMode ? '1px solid rgba(185, 28, 28, 0.2)' : '1px solid rgba(235, 25, 0, 0.2)',
                          }}
                        >
                          <motion.div variants={iconVariants} initial="rest" whileHover="hover">
                            {item.icon}
                          </motion.div>
                          <div>
                            <motion.h6
                              variants={infoLabelVariants}
                              className="text-sm font-medium uppercase tracking-wider"
                              style={{ color: isDarkMode ? '#9ca3af' : '#4b5563' }}
                            >
                              {item.label}
                            </motion.h6>
                            <motion.p
                              variants={infoValueVariants}
                              className="text-base font-semibold"
                              style={{ color: isDarkMode ? '#f9fafb' : '#1f2937' }}
                            >
                              {item.value}
                            </motion.p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Delivery;