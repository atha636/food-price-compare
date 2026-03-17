import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";

// Fix default marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function RideMap({ pickupCoords, dropCoords }) {
  if (!pickupCoords || !dropCoords) return null;

  const center = [
    (pickupCoords[0] + dropCoords[0]) / 2,
    (pickupCoords[1] + dropCoords[1]) / 2,
  ];

  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden">
      <MapContainer center={center} zoom={13} className="w-full h-full">
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pickup Marker */}
        <Marker position={pickupCoords} />

        {/* Drop Marker */}
        <Marker position={dropCoords} />

        {/* Route Line */}
        <Polyline positions={[pickupCoords, dropCoords]} />
      </MapContainer>
    </div>
  );
}