import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DeliveryMap = ({ location }) => {
  const defaultPosition = [6.9271, 79.8612]; // Colombo coordinates
  const position = location && Array.isArray(location.coordinates) ? [location.coordinates[1], location.coordinates[0]] : defaultPosition;

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden shadow-md">
      <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} />
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;