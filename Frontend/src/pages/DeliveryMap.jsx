import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DeliveryMap = ({ location, driverLocation }) => {
  const defaultPosition = [6.9271, 79.8612]; // Colombo coordinates

  // Handle different location formats
  let deliveryPosition = defaultPosition;
  if (location) {
    if (Array.isArray(location.coordinates)) {
      deliveryPosition = [location.coordinates[1], location.coordinates[0]]; // [lat, lng]
    } else if (location.lat && location.lng) {
      deliveryPosition = [location.lat, location.lng]; // [lat, lng]
    }
  }

  const driverPosition = driverLocation && driverLocation.lat && driverLocation.lng
    ? [driverLocation.lat, driverLocation.lng]
    : null;

  // Fallback if no valid position
  if (!deliveryPosition[0] || !deliveryPosition[1]) {
    return (
      <div className="h-64 w-full rounded-lg overflow-hidden shadow-md flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">No location data available</p>
      </div>
    );
  }

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={deliveryPosition}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={deliveryPosition} />
        {driverPosition && <Marker position={driverPosition} />}
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;