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

    const orderIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!orderId || !orderIdRegex.test(orderId)) {
      setError('Order ID must be a valid 24-character MongoDB ObjectId (hexadecimal)');
      setIsSubmitting(false);
      return;
    }

    if (!driverId) {
      setError('Please select a driver');
      setIsSubmitting(false);
      return;
    }

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
    <div className="min-h-screen bg-gradient-to-br from-[#f8ebdd] to-[#f5e6d8] flex items-center justify-center p-4 animate-gradient-bg">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-500 hover:shadow-3xl animate-page-load">
        <h3 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight border-b-2 border-[#ed2200] pb-2 animate-scale-in">
          Assign New Delivery
        </h3>
        {error && (
          <p className="text-white font-medium bg-[#ed2200] p-4 rounded-lg mb-6 shadow-md animate-pulse">
            {error}
          </p>
        )}
        {deliveryId && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] animate-fade-in-fast"
              onClick={handleCloseNotification}
            />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white/95 text-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-200/50 z-[1001] backdrop-blur-lg animate-pop-in">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <svg className="w-10 h-10 text-[#ed2200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h4 className="text-xl font-bold uppercase tracking-wider text-gray-900">Delivery Assigned</h4>
                  </div>
                  <button
                    onClick={handleCloseNotification}
                    className="text-gray-600 hover:text-gray-900 focus:outline-none transition-transform duration-200 hover:scale-110"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm font-medium text-gray-600">Your delivery has been successfully scheduled.</p>
                <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
                  <span className="text-base font-mono font-semibold tracking-tight text-gray-800">
                    Delivery ID: {deliveryId}
                  </span>
                  <button
                    onClick={() => copyToClipboard(deliveryId)}
                    className={`relative px-4 py-2 bg-[#ed2200] text-white rounded-lg shadow-sm hover:bg-[#c71500] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ed2200] focus:ring-offset-2 transition-all duration-300 text-sm font-medium overflow-hidden ${
                      copied ? 'animate-checkmark' : ''
                    }`}
                  >
                    <span className={copied ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
                      {copied ? 'Copied!' : 'Copy'}
                    </span>
                    {copied && (
                      <svg
                        className="absolute inset-0 m-auto w-6 h-6 text-white animate-checkmark-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="flex justify-between gap-3">
                  <button
                    onClick={() => copyToClipboard(deliveryId)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ed2200] focus:ring-offset-2 transition-all duration-300 text-sm font-semibold animate-pulse-on-hover"
                  >
                    Copy Again
                  </button>
                  <button
                    onClick={handleCloseNotification}
                    className="flex-1 px-4 py-2 bg-[#ed2200] text-white rounded-lg hover:bg-[#c71500] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ed2200] focus:ring-offset-2 transition-all duration-300 text-sm font-semibold animate-pulse-on-hover"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
              Order ID
            </label>
            <input
              id="orderId"
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:border-[#ed2200] focus:ring-2 focus:ring-[#ed2200]/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-gray-800 placeholder-gray-400 hover:border-[#ed2200]/70"
              placeholder="Enter Order ID"
            />
          </div>
          <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <label htmlFor="driverId" className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
              Select Driver
            </label>
            {isLoadingDrivers ? (
              <div className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-500 animate-pulse">
                Loading drivers...
              </div>
            ) : availableDrivers.length === 0 ? (
              <div className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-500">
                No drivers available
              </div>
            ) : (
              <select
                id="driverId"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:border-[#ed2200] focus:ring-2 focus:ring-[#ed2200]/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-gray-800 hover:border-[#ed2200]/70"
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
          <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
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
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:border-[#ed2200] focus:ring-2 focus:ring-[#ed2200]/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-gray-800 placeholder-gray-400 hover:border-[#ed2200]/70"
              placeholder="Click map or enter"
            />
          </div>
          <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
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
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:border-[#ed2200] focus:ring-2 focus:ring-[#ed2200]/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-gray-800 placeholder-gray-400 hover:border-[#ed2200]/70"
              placeholder="Click map or enter"
            />
          </div>
          <div className="md:col-span-2 space-y-2 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <p className="text-sm font-medium text-gray-700 uppercase tracking-wide">Pin Location</p>
            <div className="h-80 w-full rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-[1.01]">
              <MapContainer center={[6.9271, 79.8612]} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker />
              </MapContainer>
            </div>
          </div>
          <div className="md:col-span-2 animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingDrivers || availableDrivers.length === 0}
              className="w-full px-6 py-4 bg-[#ed2200] text-white rounded-lg shadow-md hover:bg-[#c71500] focus:outline-none focus:ring-2 focus:ring-[#ed2200] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-semibold text-lg animate-pulse-on-hover"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-6 w-6 mr-3 text-white" viewBox="0 0 24 24">
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
      <style jsx>{`
        @keyframes pageLoad {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(30px);
          }
          60% {
            opacity: 1;
            transform: scale(1.02);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeInFast {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.85) translateY(20px);
          }
          70% {
            opacity: 1;
            transform: scale(1.03);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(237, 34, 0, 0.5);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(237, 34, 0, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(237, 34, 0, 0);
          }
        }
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes checkmark {
          0% {
            opacity: 0;
            transform: scale(0) rotate(-45deg);
          }
          60% {
            opacity: 1;
            transform: scale(1.2) rotate(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }
        @keyframes checkmarkIcon {
          0% {
            opacity: 0;
            transform: scale(0) rotate(-45deg);
          }
          60% {
            opacity: 1;
            transform: scale(1.2) rotate(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }
        .animate-page-load {
          animation: pageLoad 0.7s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }
        .animate-fade-in-fast {
          animation: fadeInFast 0.3s ease-out forwards;
        }
        .animate-pop-in {
          animation: popIn 0.4s ease-out forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }
        .animate-pulse-on-hover:hover {
          animation: pulse 1s infinite;
        }
        .animate-checkmark svg {
          animation: checkmarkIcon 0.3s ease-out forwards;
        }
        .animate-gradient-bg {
          background: linear-gradient(45deg, #f8ebdd, #f5e6d8, #f8ebdd);
          background-size: 200% 200%;
          animation: gradient 12s ease infinite;
        }
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default AssignDelivery;