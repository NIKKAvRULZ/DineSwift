import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaRedo } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

// Custom marker with pulse effect
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const DeliveryMap = ({ location, driverLocation }) => {
  const defaultPosition = [6.9271, 79.8612]; // Colombo
  const mapRef = useRef(null);

  let deliveryPosition = defaultPosition;
  if (location) {
    if (Array.isArray(location.coordinates)) {
      deliveryPosition = [location.coordinates[1], location.coordinates[0]];
    } else if (location.lat && location.lng) {
      deliveryPosition = [location.lat, location.lng];
    }
  }

  const driverPosition = driverLocation && driverLocation.lat && driverLocation.lng
    ? [driverLocation.lat, driverLocation.lng]
    : null;

  // Reset map view
  const resetMapView = () => {
    if (mapRef.current) {
      mapRef.current.setView(deliveryPosition, 14);
    }
  };

  // Cleanup marker styles
  useEffect(() => {
    return () => {
      document.querySelectorAll('.pulse-marker').forEach((el) => el.remove());
    };
  }, []);

  if (!deliveryPosition[0] || !deliveryPosition[1]) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="h-[32rem] w-full rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
      >
        <div className="text-center p-8 bg-white/80 backdrop-blur-lg rounded-xl">
          <FaMapMarkerAlt className="text-[#eb1900] text-5xl mx-auto mb-4 animate-bounce" />
          <p className="text-gray-600 font-semibold text-lg">No Location Data Available</p>
          <p className="text-gray-500 mt-2">Please check the delivery details.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="h-[32rem] w-full rounded-2xl overflow-hidden shadow-xl relative border border-gray-200/50"
    >
      <style>
        {`
          .pulse-marker::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            background: rgba(235, 25, 0, 0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: pulse 1.5s infinite;
          }
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
          }
        `}
      </style>
      <MapContainer
        center={deliveryPosition}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        whenCreated={(map) => {
          mapRef.current = map;
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomControl position="bottomright" />
        <Marker position={deliveryPosition} icon={customIcon}>
          <div className="pulse-marker" />
        </Marker>
        {driverPosition && <Marker position={driverPosition} icon={customIcon} />}
      </MapContainer>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={resetMapView}
        className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-200"
        aria-label="Reset map view"
        data-tooltip-id="reset-map-tooltip"
        data-tooltip-content="Reset map view"
      >
        <FaRedo className="text-[#eb1900]" />
        <Tooltip
          id="reset-map-tooltip"
          place="left"
          className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl"
        />
      </motion.button>
    </motion.div>
  );
};

export default DeliveryMap;