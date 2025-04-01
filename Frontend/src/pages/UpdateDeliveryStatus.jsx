import React, { useState } from 'react';
import axios from 'axios';

const UpdateDeliveryStatus = () => {
  const [deliveryId, setDeliveryId] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.put(`http://localhost:5004/api/delivery/status/${deliveryId}`, { status });
      console.log('Status updated:', response.data);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Delivery Status</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="deliveryId" className="block text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-gray-900">
            Delivery ID
          </label>
          <input
            id="deliveryId"
            type="text"
            value={deliveryId}
            onChange={(e) => setDeliveryId(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="Enter Delivery ID"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-gray-900">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed appearance-none"
          >
            <option value="">Select Status</option>
            {['pending', 'assigned', 'in_progress', 'delivered', 'cancelled'].map((opt) => (
              <option key={opt} value={opt} className="capitalize">
                {opt.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
        >
          {isSubmitting ? (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
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