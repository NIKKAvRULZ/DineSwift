import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { FaMapPin, FaSpinner } from 'react-icons/fa';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// Socket.IO connection
const socket = io('http://localhost:5004', {
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icons
const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

// Animation variants
const mapContainerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 120 },
  },
};

const markerVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut', type: 'spring', stiffness: 150 },
  },
  pulse: {
    scale: [1, 1.2, 1],
    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
  },
};

const popupVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
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

const spinnerInnerVariants = {
  animate: {
    rotate: 360,
    transition: { repeat: Infinity, duration: 1, ease: 'linear' },
  },
};

const DeliveryMap = ({ location, driverLocation: initialDriverLocation, isDarkMode = false, deliveryId }) => {
  console.log('DeliveryMap Props:', { location, initialDriverLocation, deliveryId });
  const [isLoading, setIsLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState(initialDriverLocation);
  console.log('Driver Location State:', driverLocation);
  const defaultPosition = [6.9271, 79.8612]; // Colombo, Sri Lanka

  // Validate location and driverLocation
  const mapCenter = useMemo(() => {
    if (location?.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
      return [location.coordinates[1], location.coordinates[0]]; // [lat, lon]
    }
    return defaultPosition;
  }, [location]);

  const driverPosition = useMemo(() => {
    if (driverLocation?.coordinates && Array.isArray(driverLocation.coordinates) && driverLocation.coordinates.length === 2) {
      const [lon, lat] = driverLocation.coordinates; // [lon, lat]
      const pos = [lat, lon]; // [lat, lon] for Leaflet
      console.log('Driver Position:', pos);
      return pos;
    }
    return null;
  }, [driverLocation]);

  // Handle real-time driver location updates
  useEffect(() => {
    socket.on('connect', () => console.log('Socket.IO connected'));
    socket.on('connect_error', (err) => console.error('Socket.IO error:', err));
    if (deliveryId) {
      socket.on('driverLocationUpdate', (data) => {
        console.log('Received driverLocationUpdate:', data);
        // Convert ObjectId to string for comparison
        const eventDeliveryId = data.deliveryId?.toString ? data.deliveryId.toString() : data.deliveryId;
        console.log('Comparing deliveryId:', { eventDeliveryId, propDeliveryId: deliveryId });
        if (eventDeliveryId === deliveryId) {
          let coords;
          if (data.location?.coordinates) {
            coords = data.location.coordinates; // [lon, lat]
          } else if (data.location?.lat && data.location?.lng) {
            coords = [data.location.lng, data.location.lat]; // Convert [lng, lat] to [lon, lat]
          } else {
            console.warn('Invalid location format:', data.location);
            return;
          }
          console.log('Updating driverLocation with coords:', coords);
          setDriverLocation({ coordinates: coords });
        } else {
          console.log('DeliveryId mismatch, ignoring update');
        }
      });
    } else {
      console.warn('No deliveryId provided, cannot listen for updates');
    }
    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('driverLocationUpdate');
    };
  }, [deliveryId]);

  // Log driverLocation changes
  useEffect(() => {
    console.log('Driver Location Updated:', driverLocation);
  }, [driverLocation]);

  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Tile layer for dark/light mode
  const tileLayerUrl = isDarkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileLayerAttribution = isDarkMode
    ? '© <a href="https://carto.com/attributions">CARTO</a>'
    : '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <motion.div
      variants={mapContainerVariants}
      initial="hidden"
      animate="visible"
      className={`relative w-full h-[50vh] sm:h-[60vh] rounded-2xl shadow-lg overflow-hidden ${
        isDarkMode ? 'bg-gray-800/80 border-[#b91c1c]/30' : 'bg-white/80 border-[#eb1900]/30'
      } backdrop-blur-lg border transition-all duration-300`}
    >
      {isLoading ? (
        <motion.div
          variants={spinnerVariants}
          initial="hidden"
          animate="visible"
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            variants={spinnerInnerVariants}
            animate="animate"
            className={`text-4xl ${isDarkMode ? 'text-[#b91c1c]' : 'text-[#eb1900]'}`}
          >
            <FaSpinner />
          </motion.div>
        </motion.div>
      ) : (
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          zoomControl={false}
        >
          <TileLayer url={tileLayerUrl} attribution={tileLayerAttribution} />
          <ZoomControl position="bottomright" />
          {location?.coordinates && (
            <motion.div variants={markerVariants} initial="hidden" animate="visible">
              <Marker position={mapCenter} icon={deliveryIcon}>
                <motion.div variants={popupVariants} initial="hidden" animate="visible">
                  <Popup>
                    <div className={`p-2 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-md`}>
                      <div className="flex items-center space-x-2">
                        <FaMapPin className={`text-lg ${isDarkMode ? 'text-[#b91c1c]' : 'text-[#eb1900]'}`} />
                        <span className="font-semibold text-sm">Delivery Location</span>
                      </div>
                      <p className="text-xs mt-1">123 Galle Rd, Colombo</p>
                    </div>
                  </Popup>
                </motion.div>
              </Marker>
            </motion.div>
          )}
          {driverPosition && (
            <motion.div variants={markerVariants} initial="hidden" animate={['visible', 'pulse']}>
              <Marker position={driverPosition} icon={driverIcon}>
                <motion.div variants={popupVariants} initial="hidden" animate="visible">
                  <Popup>
                    <div className={`p-2 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-md`}>
                      <div className="flex items-center space-x-2">
                        <FaMapPin className={`text-lg ${isDarkMode ? 'text-[#b91c1c]' : 'text-[#eb1900]'}`} />
                        <span className="font-semibold text-sm">Driver Location</span>
                      </div>
                      <p className="text-xs mt-1">En route to delivery</p>
                    </div>
                  </Popup>
                </motion.div>
              </Marker>
            </motion.div>
          )}
        </MapContainer>
      )}
    </motion.div>
  );
};

export default DeliveryMap;