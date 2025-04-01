import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';

const DeliveryMap = () => {
  const [location, setLocation] = useState([6.9271, 79.8612]);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const socket = io('http://localhost:5004');
    socket.on('locationUpdate', (data) => {
      setLocation(data.location);
      setMarkers((prevMarkers) => [
        ...prevMarkers.slice(-9), // Keep last 10 markers for trail effect
        { position: data.location, popupText: `Delivery Location (${new Date().toLocaleTimeString()})` },
      ]);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 transform transition-all duration-300 hover:shadow-xl">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Delivery Tracking</h3>
      <div className="relative rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={location}
          zoom={13}
          style={{ height: '450px', width: '100%' }}
          className="transition-all duration-300"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            className="filter grayscale-20 contrast-125"
          />
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={marker.position}
              opacity={1 - (markers.length - 1 - index) * 0.1} // Fade effect for trail
            >
              <Popup className="font-medium text-gray-800 bg-white shadow-md rounded-lg p-2">
                {marker.popupText}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full shadow-md text-sm text-gray-600">
          Real-time Updates
        </div>
      </div>
    </div>
  );
};

export default DeliveryMap;