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
  const [routeCoords, setRouteCoords] = useState([]);

  // 🚀 Fetch real route (OSRM)
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${pickupCoords[1]},${pickupCoords[0]};${dropCoords[1]},${dropCoords[0]}?overview=full&geometries=geojson`;

        const res = await fetch(url);
        const data = await res.json();

        if (!data.routes || !data.routes.length) return;

        const coords = data.routes[0].geometry.coordinates;

        // convert [lng, lat] → [lat, lng]
        const formatted = coords.map(([lng, lat]) => [lat, lng]);

        setRouteCoords(formatted);
      } catch (err) {
        console.log("Route fetch failed", err);
      }
    };

    fetchRoute();
  }, [pickupCoords, dropCoords]);

  // 🚗 Move car along route
  useEffect(() => {
    if (!routeCoords.length) return;

    let index = 0;

    const interval = setInterval(() => {
      if (index >= routeCoords.length - 1) {
        clearInterval(interval);
        return;
      }

      const [lat, lng] = routeCoords[index];
      const [nextLat, nextLng] = routeCoords[index + 1];

      // direction angle
      const dx = nextLng - lng;
      const dy = nextLat - lat;
      const theta = Math.atan2(dy, dx) * (180 / Math.PI);

      setAngle(theta);
      setCarPosition([lat, lng]);

      index++;
    }, 50);

    return () => clearInterval(interval);
  }, [routeCoords]);

  // 🚗 Car icon
  const carIcon = L.divIcon({
    html: `
      <div style="transform: rotate(${angle}deg); transition: transform 0.2s linear;">
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

        {/* 🔥 REAL ROUTE */}
        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            color="#3b82f6"
            weight={4}
          />
        )}

        {/* 🚗 Car */}
        <Marker position={carPosition} icon={carIcon} />
      </MapContainer>
    </div>
  );
}