"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix default marker icon path issue in Leaflet
import "leaflet/dist/leaflet.css";

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

type Props = {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  currentLocation: { lat: number; lng: number } | null;
};

const MapClickHandler = ({
  onClick,
}: {
  onClick: (latlng: { lat: number; lng: number }) => void;
}) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
};

const MapClient: React.FC<Props> = ({ onLocationSelect, currentLocation }) => {
  const center = currentLocation || { lat: 20.5937, lng: 78.9629 }; // Default to center of India

  return (
    <div className="w-full h-[300px] mb-4 rounded border overflow-hidden">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />
        <MapClickHandler onClick={onLocationSelect} />
        {currentLocation && <Marker position={currentLocation} />}
      </MapContainer>
    </div>
  );
};

export default MapClient;
