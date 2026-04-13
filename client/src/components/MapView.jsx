import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
     if(center) map.setView(center, 12);
  }, [center, map]);
  return null;
}

export default function MapView({ city }) {
  const [center, setCenter] = useState([19.0760, 72.8777]);

  useEffect(() => {
    if(!city) return;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${city}`)
      .then(res => res.json())
      .then(data => {
         if(data && data.length > 0) {
            setCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
         }
      }).catch(err => console.error("Geocoding err", err));
  }, [city]);

  return (
    <div className="h-96 w-full rounded-2xl overflow-hidden shadow-md border border-gray-200 z-0 relative">
      <MapContainer center={center} zoom={12} className="h-full w-full">
        <ChangeView center={center} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap"
        />
        <CircleMarker 
            center={center} 
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.6 }} 
            radius={10}
        >
            <Popup>
                <div className="text-center">
                    <p className="font-bold text-gray-900">{city}</p>
                    <p className="text-xs text-gray-500">Live Pulse Center</p>
                </div>
            </Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
