import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaSpinner, FaArrowRight } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const formSectionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut', delay: 0.2 },
  },
};

const inputVariants = {
  rest: { scale: 1, boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)' },
  focus: {
    scale: 1.01,
    boxShadow: '0 0 8px rgba(235, 25, 0, 0.3)',
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

const buttonVariants = {
  rest: { scale: 1, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
  hover: {
    scale: 1.05,
    boxShadow: '0 6px 12px rgba(235, 25, 0, 0.2)',
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};

const statusBadgeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

const notificationVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: 'easeIn' } },
};

const UpdateDeliveryStatus = ({ isDarkMode }) => {
  const [deliveryId, setDeliveryId] = useState('');
  const [currentStatus, setCurrentStatus] = useState(null);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const statusSequence = ['Pending', 'Accepted', 'Preparing', 'On the Way', 'Delivered'];

  const getAvailableStatuses = (current) => {
    if (!current || current === 'Delivered') {
      return [];
    }
    const currentIndex = statusSequence.indexOf(current);
    if (currentIndex === -1) {
      return [];
    }
    const nextStatus = currentIndex < statusSequence.length - 1 ? statusSequence[currentIndex + 1] : null;
    return nextStatus ? [nextStatus] : [];
  };

  useEffect(() => {
    const fetchCurrentStatus = async () => {
      if (!deliveryId) {
        setCurrentStatus(null);
        setStatus('');
        return;
      }
      const orderIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!orderIdRegex.test(deliveryId)) {
        setError('Invalid Delivery ID format');
        setCurrentStatus(null);
        setStatus('');
        return;
      }
      try {
        const response = await axios.get(`http://localhost:5004/api/delivery/track/${deliveryId}`);
        setCurrentStatus(response.data.status || 'Pending');
        setStatus('');
        setError(null);
      } catch (err) {
        setError('Failed to fetch delivery status');
        setCurrentStatus(null);
        setStatus('');
      }
    };
    fetchCurrentStatus();
  }, [deliveryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!status) {
      setError('Please select a status');
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.put(`http://localhost:5004/api/delivery/status/${deliveryId}`, { status });
      setSuccess('Delivery status updated successfully');
      setCurrentStatus(status);
      setStatus('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update delivery status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableStatuses = currentStatus ? getAvailableStatuses(currentStatus) : [];

  const getStatusText = (status) =>
    ({
      Pending: 'Pending',
      Accepted: 'Accepted',
      Preparing: 'Preparing',
      'On the Way': 'On the Way',
      Delivered: 'Delivered',
    }[status] || status);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`w-full max-w-3xl mx-auto px-8 py-8 rounded-xl shadow-lg backdrop-blur-md border ${
        isDarkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white/70 border-gray-200'
      }`}
    >
      {/* Header */}
      <h2
        className={`text-3xl font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        } mb-6 font-sans tracking-tight`}
      >
        Update Delivery Status
      </h2>
      <div className={`border-b mb-6 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}></div>

      {/* Current Status Badge */}
      {currentStatus && (
        <motion.div
          variants={statusBadgeVariants}
          initial="hidden"
          animate={['visible', 'pulse']}
          className={`inline-flex items-center px-4 py-2 mb-6 rounded-full text-sm font-medium shadow-sm ${
            isDarkMode
              ? 'bg-gray-700 text-gray-200 border-gray-600'
              : 'bg-gray-100 text-gray-700 border-gray-300'
          } border`}
        >
          <span className="mr-2">Current Status:</span>
          <span className="font-semibold">{getStatusText(currentStatus)}</span>
        </motion.div>
      )}

      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div
            variants={notificationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`flex items-center ${
              isDarkMode ? 'bg-red-900/40 text-red-100' : 'bg-red-100 text-red-800'
            } p-4 rounded-lg mb-6 border ${
              isDarkMode ? 'border-red-800/50' : 'border-red-300'
            }`}
          >
            <FaExclamationCircle className="mr-3 text-lg" />
            <span className="flex-1">{error}</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setError(null)}
              className={`p-1 rounded-full ${
                isDarkMode ? 'text-red-300 hover:text-red-100' : 'text-red-600 hover:text-red-800'
              }`}
              aria-label="Dismiss error"
            >
              ×
            </motion.button>
          </motion.div>
        )}
        {success && (
          <motion.div
            variants={notificationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`flex items-center ${
              isDarkMode ? 'bg-green-900/40 text-green-100' : 'bg-green-100 text-green-800'
            } p-4 rounded-lg mb-6 border ${
              isDarkMode ? 'border-green-800/50' : 'border-green-300'
            }`}
          >
            <FaCheckCircle className="mr-3 text-lg" />
            <span className="flex-1">{success}</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSuccess(null)}
              className={`p-1 rounded-full ${
                isDarkMode ? 'text-green-300 hover:text-green-100' : 'text-green-600 hover:text-green-800'
              }`}
              aria-label="Dismiss success"
            >
              ×
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <motion.div
        variants={formSectionVariants}
        initial="hidden"
        animate="visible"
        className={`p-6 rounded-lg ${
          isDarkMode ? 'bg-gray-900/30' : 'bg-gray-50/50'
        }`}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Delivery ID Input */}
          <div className="relative">
            <motion.label
              className={`absolute left-3 text-sm font-medium uppercase tracking-wide ${
                deliveryId
                  ? '-top-5 text-xs ' + (isDarkMode ? 'text-gray-300' : 'text-gray-700')
                  : 'top-3 ' + (isDarkMode ? 'text-gray-400' : 'text-gray-500')
              } transition-all duration-300`}
              htmlFor="deliveryId"
            >
              Delivery ID
            </motion.label>
            <motion.input
              variants={inputVariants}
              initial="rest"
              animate="rest"
              whileFocus="focus"
              id="deliveryId"
              type="text"
              value={deliveryId}
              onChange={(e) => setDeliveryId(e.target.value)}
              required
              disabled={isSubmitting}
              className={`w-full px-3 py-2.5 ${
                isDarkMode
                  ? 'bg-gray-900/50 text-white border-gray-700'
                  : 'bg-white text-gray-900 border-gray-200'
              } border rounded-md focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:border-[#eb1900] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed placeholder-transparent font-sans sm:text-sm`}
              placeholder="Enter Delivery ID"
              aria-label="Delivery ID"
            />
          </div>

          {/* Status Select */}
          <div className="relative">
            <label
              className={`block text-sm font-medium uppercase tracking-wide ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              } mb-2`}
              htmlFor="status"
            >
              Status
            </label>
            <motion.select
              variants={inputVariants}
              initial="rest"
              animate="rest"
              whileFocus="focus"
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              disabled={isSubmitting || !currentStatus}
              className={`w-full px-3 py-2.5 ${
                isDarkMode
                  ? 'bg-gray-900/50 text-white border-gray-700'
                  : 'bg-white text-gray-900 border-gray-200'
              } border rounded-md focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:border-[#eb1900] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-sans sm:text-sm appearance-none`}
              aria-label="Select delivery status"
            >
              <option value="" disabled>
                Select status
              </option>
              {availableStatuses.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {getStatusText(statusOption)}
                </option>
              ))}
            </motion.select>
          </div>

          {/* Submit Button */}
          <motion.button
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            type="submit"
            disabled={isSubmitting || !currentStatus}
            className={`w-full py-3 px-6 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#b91c1c] to-[#991b1b]'
                : 'bg-gradient-to-r from-[#eb1900] to-[#c71500]'
            } text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center sm:text-sm`}
            data-tooltip-id="update-status-tooltip"
            data-tooltip-content={isSubmitting ? 'Updating status...' : 'Update delivery status'}
            aria-label="Update delivery status"
          >
            {isSubmitting ? (
              <FaSpinner className="animate-spin h-5 w-5 mr-2" />
            ) : (
              <FaArrowRight className="mr-2" />
            )}
            {isSubmitting ? 'Updating...' : 'Update Status'}
            <Tooltip
              id="update-status-tooltip"
              place="top"
              className={`bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg ${
                isDarkMode ? '!bg-gray-700' : ''
              }`}
            />
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default UpdateDeliveryStatus;