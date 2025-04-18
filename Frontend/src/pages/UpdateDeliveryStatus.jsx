import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaSpinner, FaArrowRight } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

const UpdateDeliveryStatus = ({ isDarkMode }) => {
  const [deliveryId, setDeliveryId] = useState('');
  const [currentStatus, setCurrentStatus] = useState(null);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const statusSequence = ['pending', 'assigned', 'in_progress', 'delivered'];

  const getAvailableStatuses = (current) => {
    if (!current || current === 'cancelled' || current === 'delivered') {
      return ['cancelled'];
    }
    const currentIndex = statusSequence.indexOf(current);
    const nextStatus = currentIndex < statusSequence.length - 1 ? statusSequence[currentIndex + 1] : null;
    return nextStatus ? [nextStatus, 'cancelled'] : ['cancelled'];
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
        setCurrentStatus(response.data.status || 'pending');
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
      pending: 'Pending',
      assigned: 'Assigned',
      in_progress: 'In Progress',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    }[status] || status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className={`p-8 rounded-3xl shadow-2xl backdrop-blur-lg ${
        isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'
      }`}
    >
      <h5 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
        Update Delivery Status
      </h5>
      {currentStatus && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mb-4 p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <span className="font-medium">Current Status: </span>
          {getStatusText(currentStatus)}
        </motion.div>
      )}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`flex items-center ${
              isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800'
            } font-medium p-4 rounded-lg mb-6`}
          >
            <FaExclamationCircle className="mr-2" />
            {error}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
              aria-label="Dismiss error"
            >
              ×
            </motion.button>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`flex items-center ${
              isDarkMode ? 'bg-green-900/50 text-green-200' : 'bg-green-100 text-green-800'
            } font-medium p-4 rounded-lg mb-6`}
          >
            <FaCheckCircle className="mr-2" />
            {success}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-600 hover:text-green-800"
              aria-label="Dismiss success"
            >
              ×
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative space-y-2">
          <motion.label
            initial={{ y: 0 }}
            animate={{ y: deliveryId ? -24 : 0 }}
            className={`absolute top-4 left-4 text-sm font-medium uppercase tracking-wide ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            } transition-all duration-200`}
            htmlFor="deliveryId"
          >
            Delivery ID
          </motion.label>
          <motion.input
            whileFocus={{ scale: 1.01 }}
            id="deliveryId"
            type="text"
            value={deliveryId}
            onChange={(e) => setDeliveryId(e.target.value)}
            required
            disabled={isSubmitting}
            className={`w-full px-4 pt-5 pb-3 ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50/50 border-gray-300 text-gray-700'
            } border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed placeholder-transparent`}
            placeholder="Enter Delivery ID"
            aria-label="Delivery ID"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="status"
            className={`block text-sm font-medium uppercase tracking-wide ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Status
          </label>
          <motion.select
            whileFocus={{ scale: 1.01 }}
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            disabled={isSubmitting || !currentStatus}
            className={`w-full px-4 py-4 ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50/50 border-gray-300 text-gray-700'
            } border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed`}
            aria-label="Select delivery status"
          >
            <option value="" disabled>
              Select status
            </option>
            {availableStatuses.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
              </option>
            ))}
          </motion.select>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isSubmitting || !currentStatus}
          className={`w-full px-8 py-4 ${
            isDarkMode
              ? 'bg-gradient-to-r from-[#b91c1c] to-[#991b1b]'
              : 'bg-gradient-to-r from-[#eb1900] to-[#c71500]'
          } text-white rounded-lg shadow-md hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#eb1900]/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-semibold`}
          data-tooltip-id="update-status-tooltip"
          data-tooltip-content={isSubmitting ? 'Updating status...' : 'Update delivery status'}
          aria-label="Update delivery status"
        >
          {isSubmitting ? (
            <FaSpinner className="animate-spin h-5 w-5 mr-2 text-white" />
          ) : (
            <FaArrowRight className="mr-2" />
          )}
          {isSubmitting ? 'Updating...' : 'Update Status'}
          <Tooltip
            id="update-status-tooltip"
            place="top"
            className={`bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl ${
              isDarkMode ? '!bg-gray-700' : ''
            }`}
          />
        </motion.button>
      </form>
    </motion.div>
  );
};

export default UpdateDeliveryStatus;