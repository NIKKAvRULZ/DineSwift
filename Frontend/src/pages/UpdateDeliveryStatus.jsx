import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UpdateDeliveryStatus = () => {
  const [deliveryId, setDeliveryId] = useState('');
  const [currentStatus, setCurrentStatus] = useState(null);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Define status sequence
  const statusSequence = ['pending', 'assigned', 'in_progress', 'delivered'];

  // Get available statuses based on current status
  const getAvailableStatuses = (current) => {
    if (!current || current === 'cancelled' || current === 'delivered') {
      return ['cancelled']; // Only cancel if delivered or cancelled
    }
    const currentIndex = statusSequence.indexOf(current);
    const nextStatus = currentIndex < statusSequence.length - 1 ? statusSequence[currentIndex + 1] : null;
    return nextStatus ? [nextStatus, 'cancelled'] : ['cancelled'];
  };

  // Fetch current status when deliveryId changes
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
        console.error('Error fetching status:', err);
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
      const response = await axios.put(`http://localhost:5004/api/delivery/status/${deliveryId}`, {
        status,
      });
      setSuccess('Delivery status updated successfully');
      setCurrentStatus(status); // Update current status
      setStatus('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update delivery status');
      console.error('Error updating delivery status:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableStatuses = currentStatus ? getAvailableStatuses(currentStatus) : [];

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
      <h5 className="text-lg font-semibold text-gray-900 mb-4">Update Delivery Status</h5>
      {error && <p className="text-[#eb1900] font-medium bg-[#eb1900]/10 p-3 rounded-lg mb-4">{error}</p>}
      {success && <p className="text-green-600 font-medium bg-green-100 p-3 rounded-lg mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="deliveryId"
            className="block text-sm font-medium text-gray-600 uppercase tracking-wide"
          >
            Delivery ID
          </label>
          <input
            id="deliveryId"
            type="text"
            value={deliveryId}
            onChange={(e) => setDeliveryId(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 placeholder-gray-400"
            placeholder="Enter Delivery ID"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-600 uppercase tracking-wide"
          >
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            disabled={isSubmitting || !currentStatus}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 appearance-none"
          >
            <option value="" disabled>
              Select status
            </option>
            {availableStatuses.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !currentStatus}
          className="w-full px-6 py-3 bg-[#eb1900] text-white rounded-lg shadow-md hover:bg-[#c71500] focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-medium"
        >
          {isSubmitting ? (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : null}
          {isSubmitting ? 'Updating...' : 'Update Status'}
        </button>
      </form>
    </div>
  );
};

export default UpdateDeliveryStatus;