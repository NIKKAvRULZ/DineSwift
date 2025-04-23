import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

const AssignDelivery = () => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState(null);
  const [deliveryId, setDeliveryId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setIsLoadingDrivers(true);
        const response = await axios.get('http://localhost:5004/api/delivery/available-drivers');
        // Handle different possible response structures
        const drivers = Array.isArray(response.data)
          ? response.data
          : response.data.drivers || response.data.data || response.data.availableDrivers || [];
        if (!Array.isArray(drivers)) {
          throw new Error('Invalid drivers data format');
        }
        setAvailableDrivers(drivers);
        if (drivers.length > 0) {
          setDriverId(drivers[0]._id);
        }
      } catch (err) {
        setError('Failed to fetch available drivers. Please try again.');
        console.error('Error fetching drivers:', err);
        setAvailableDrivers([]);
      } finally {
        setIsLoadingDrivers(false);
      }
    };
    fetchDrivers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setDeliveryId(null);
    setCopied(false);

    // Validate orderId
    const orderIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!orderId || !orderIdRegex.test(orderId)) {
      setError('Order ID must be a valid 24-character MongoDB ObjectId (hexadecimal)');
      setIsSubmitting(false);
      return;
    }

    // Validate driverId
    if (!driverId) {
      setError('Please select a driver');
      setIsSubmitting(false);
      return;
    }

    // Validate longitude and latitude
    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(lon) || lon < -180 || lon > 180) {
      setError('Longitude must be a valid number between -180 and 180');
      setIsSubmitting(false);
      return;
    }

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('Latitude must be a valid number between -90 and 90');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5004/api/delivery/assign', {
        orderId,
        driverId,
        location: { type: 'Point', coordinates: [lon, lat] },
      });
      console.log('Delivery assigned:', response.data);
      setDeliveryId(response.data.deliveryId);
      setOrderId('');
      setDriverId(availableDrivers.length > 0 ? availableDrivers[0]._id : '');
      setLongitude('');
      setLatitude('');
      setPosition(null);
    } catch (error) {
      if (error.response?.data?.errors) {
        setError(error.response.data.errors.join(', '));
      } else {
        setError(error.response?.data?.message || 'Error assigning delivery');
      }
      console.error('Error assigning delivery:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseNotification = () => {
    setDeliveryId(null);
    navigate('/delivery');
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setLatitude(lat.toFixed(4));
        setLongitude(lng.toFixed(4));
        setPosition([lat, lng]);
      },
    });
    return position === null ? null : <Marker position={position} />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl relative">
        <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Assign New Delivery</h3>
        {error && <p className="text-[#eb1900] font-medium bg-[#eb1900]/10 p-3 rounded-lg mb-4">{error}</p>}
        {deliveryId && (
          <>
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-lg z-[1000]"
              onClick={handleCloseNotification}
            />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-gradient-to-br from-[#eb1900]/90 to-[#ff4d4d]/90 text-white p-6 rounded-2xl shadow-2xl border border-[#ff6666]/20 z-[1001] animate-pop-in glow-effect">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h4 className="text-lg font-bold uppercase tracking-wider">Delivery Assigned</h4>
                  </div>
                  <button
                    onClick={handleCloseNotification}
                    className="text-white hover:text-gray-200 focus:outline-none transition-transform duration-200 hover:scale-110"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm font-medium text-white/80">Your delivery has been successfully scheduled.</p>
                <div className="bg-white/10 p-3 rounded-lg flex items-center justify-between">
                  <span className="text-base font-mono font-semibold tracking-tight">
                    Delivery ID: {deliveryId}
                  </span>
                  <button
                    onClick={() => copyToClipboard(deliveryId)}
                    className="ml-2 px-3 py-1 bg-[#eb1900] text-white rounded-md shadow-sm hover:bg-[#ff4d4d] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:ring-offset-2 transition-all duration-300 text-sm font-medium"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="flex justify-between gap-2">
                  <button
                    onClick={() => copyToClipboard(deliveryId)}
                    className="flex-1 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#eb1900] transition-all duration-300 text-sm font-semibold"
                  >
                    Copy Again
                  </button>
                  <button
                    onClick={handleCloseNotification}
                    className="flex-1 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#eb1900] transition-all duration-300 text-sm font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
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
            {isLoadingDrivers ? (
              <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500">
                Loading drivers...
              </div>
            ) : availableDrivers.length === 0 ? (
              <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500">
                No drivers available
              </div>
            ) : (
              <select
                id="driverId"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 appearance-none"
              >
                <option value="" disabled>
                  Select a driver
                </option>
                {availableDrivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name} ({driver.status})
                  </option>
                ))}
              </select>
            )}
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
              onChange={(e) => {
                setLongitude(e.target.value);
                if (e.target.value && latitude) setPosition([parseFloat(latitude), parseFloat(e.target.value)]);
              }}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 placeholder-gray-400"
              placeholder="Click map or enter"
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
              onChange={(e) => {
                setLatitude(e.target.value);
                if (e.target.value && longitude) setPosition([parseFloat(e.target.value), parseFloat(longitude)]);
              }}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eb1900] focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 placeholder-gray-400"
              placeholder="Click map or enter"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Pin Location</p>
            <div className="h-64 w-full rounded-lg overflow-hidden shadow-md">
              <MapContainer center={[6.9271, 79.8612]} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker />
              </MapContainer>
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting || isLoadingDrivers || availableDrivers.length === 0}
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
              {isSubmitting ? 'Assigning...' : 'Assign Delivery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignDelivery;