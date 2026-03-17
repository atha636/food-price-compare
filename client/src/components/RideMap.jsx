import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

// 🔧 Fix marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// 📍 Auto zoom
function FitBounds({ pickupCoords, dropCoords }) {
  const map = useMap();

  useEffect(() => {
    if (pickupCoords && dropCoords) {
      map.fitBounds([pickupCoords, dropCoords], {
        padding: [50, 50],
      });
    }
  }, [pickupCoords, dropCoords]);

  return null;
}

export default function RideMap({ pickupCoords, dropCoords }) {
  if (!pickupCoords || !dropCoords) return null;

  const center = [
    (pickupCoords[0] + dropCoords[0]) / 2,
    (pickupCoords[1] + dropCoords[1]) / 2,
  ];

  const [carPosition, setCarPosition] = useState(pickupCoords);
  const [angle, setAngle] = useState(0);

  useEffect(() => {
  let progress = 0;

  let prevLat = pickupCoords[0];
  let prevLng = pickupCoords[1];

  const interval = setInterval(() => {
    progress += 0.01;

    if (progress >= 1) {
      clearInterval(interval);
      setCarPosition(dropCoords);
      return;
    }

    const lat =
      pickupCoords[0] +
      (dropCoords[0] - pickupCoords[0]) * progress;

    const lng =
      pickupCoords[1] +
      (dropCoords[1] - pickupCoords[1]) * progress;

    // ✅ USE PREVIOUS POSITION (NO JITTER)
    const dx = lng - prevLng;
    const dy = lat - prevLat;

    const theta = Math.atan2(dy, dx) * (180 / Math.PI);

    setAngle(theta);
    setCarPosition([lat, lng]);

    // update previous values
    prevLat = lat;
    prevLng = lng;

  }, 80);

  return () => clearInterval(interval);
}, [pickupCoords, dropCoords]);

  // 🚗 Car icon
  const carIcon = L.divIcon({
    html: `
      <div style="transform: rotate(${angle}deg);">
        <img 
          src="https://cdn-icons-png.flaticon.com/512/744/744465.png" 
          style="width:34px;height:34px;" 
        />
      </div>
    `,
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

  return (
    <div className="w-full h-[320px] rounded-2xl overflow-hidden shadow-lg">
      <MapContainer center={center} zoom={13} className="w-full h-full">
        
        <FitBounds pickupCoords={pickupCoords} dropCoords={dropCoords} />

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* 📍 Pickup */}
        <Marker position={pickupCoords} />

        {/* 📍 Drop */}
        <Marker position={dropCoords} />

        {/* 🔵 Route */}
        <Polyline positions={[pickupCoords, dropCoords]} color="blue" />

        {/* 🚗 Car */}
        <Marker position={carPosition} icon={carIcon} />
      </MapContainer>
    </div>
  );
}