import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssignDelivery = () => {
  const [orderId, setOrderId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await axios.get('http://localhost:5004/api/delivery/available-drivers', {
          params: longitude && latitude ? { longitude, latitude } : {},
        });
        setAvailableDrivers(response.data.drivers);
        if (response.data.drivers.length > 0) {
          setDriverId(response.data.drivers[0]._id);
        }
      } catch (err) {
        setError('Failed to fetch available drivers');
        console.error('Error fetching drivers:', err);
      }
    };
    fetchDrivers();
  }, [longitude, latitude]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5004/api/delivery/assign', {
        orderId,
        driverId: driverId || null,
        location: [parseFloat(longitude), parseFloat(latitude)],
      });
      console.log('Delivery assigned:', response.data);
      alert(`Delivery ID: ${response.data.delivery._id}`);
      setOrderId('');
      setDriverId(availableDrivers.length > 0 ? availableDrivers[0]._id : '');
      setLongitude('');
      setLatitude('');
    } catch (error) {
      setError('Error assigning delivery');
      console.error('Error assigning delivery:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
      <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Assign New Delivery</h3>
      {error && <p className="text-[#eb1900] font-medium bg-[#eb1900]/10 p-3 rounded-lg mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="orderId" className="block text-sm font-medium text-gray-600 uppercase tracking-wide">
            Order ID
          </label>
          <input
            id="orderId"
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 placeholder-gray-400"
            placeholder="Enter Order ID"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="driverId" className="block text-sm font-medium text-gray-600 uppercase tracking-wide">
            Select Driver
          </label>
          <select
            id="driverId"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            required
            disabled={isSubmitting || availableDrivers.length === 0}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 appearance-none"
          >
            {availableDrivers.length === 0 ? (
              <option value="">No drivers available</option>
            ) : (
              availableDrivers.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {driver.name} ({driver.status})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-600 uppercase tracking-wide">
            Longitude
          </label>
          <input
            id="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 placeholder-gray-400"
            placeholder="Enter Longitude"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-600 uppercase tracking-wide">
            Latitude
          </label>
          <input
            id="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 placeholder-gray-400"
            placeholder="Enter Latitude"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting || availableDrivers.length === 0}
            className="w-full px-6 py-3 bg-[#eb1900] text-white rounded-lg shadow-md hover:bg-[#c71500] focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-medium"
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : null}
            {isSubmitting ? 'Assigning...' : 'Assign Delivery'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignDelivery;