import React, { useState } from 'react';
import axios from 'axios';

const UpdateDeliveryStatus = () => {
  const [deliveryId, setDeliveryId] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.put(`http://localhost:5004/api/delivery/status/${deliveryId}`, { status });
      setSuccess('Delivery status updated successfully!');
      setDeliveryId('');
      setStatus('');
      console.log('Status updated:', response.data);
    } catch (error) {
      setError('Error updating delivery status');
      console.error('Error updating status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
      <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Update Delivery Status</h3>
      {error && <p className="text-[#eb1900] font-medium bg-[#eb1900]/10 p-3 rounded-lg mb-4">{error}</p>}
      {success && <p className="text-green-600 font-medium bg-green-50 p-3 rounded-lg mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="deliveryId" className="block text-sm font-medium text-gray-600 uppercase tracking-wide">
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
          <label htmlFor="status" className="block text-sm font-medium text-gray-600 uppercase tracking-wide">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 appearance-none"
          >
            <option value="">Select Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-[#eb1900] text-white rounded-lg shadow-md hover:bg-[#c71500] focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-medium"
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