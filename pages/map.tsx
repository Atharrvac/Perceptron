import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const communityLocations = [/* same locations as before */];

function UserLocation({ setCoords, setAccuracy, setStatus }) {
  const map = useMap();
  const [marker, setMarker] = useState(null);
  const [circle, setCircle] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported");
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    function updatePosition(position) {
      const { latitude, longitude, accuracy } = position.coords;
      setCoords({ lat: latitude, lng: longitude });
      setAccuracy(accuracy);
      setStatus("Tracking");

      if (marker) map.removeLayer(marker);
      if (circle) map.removeLayer(circle);

      const newMarker = L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(`Your position (accuracy: ${Math.round(accuracy)}m)`)
        .openPopup();

      const newCircle = L.circle([latitude, longitude], {
        radius: accuracy,
        color: '#3388ff',
        fillOpacity: 0.2
      }).addTo(map);

      setMarker(newMarker);
      setCircle(newCircle);
      map.setView([latitude, longitude], Math.max(15, map.getZoom()));
    }

    function handleError(err: GeolocationPositionError) {
      const errorMessages: Record<number, string> = {
        1: "Please enable location access",
        2: "Location unavailable",
        3: "Request timed out"
      };
      const msg = errorMessages[err.code] || "Location error";
      setStatus(msg);
    }

    const watchId = navigator.geolocation.watchPosition(updatePosition, handleError, options);

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map]);

  return null;
}

const CommunityMap = () => {
  const [coords, setCoords] = useState({ lat: '--', lng: '--' });
  const [accuracy, setAccuracy] = useState('--');
  const [status, setStatus] = useState('Active');

  return (
    <div className="relative">
      {/* Info Panel */}
      <div className="absolute top-4 left-4 z-50 bg-white/90 backdrop-blur-md p-4 rounded-lg shadow-lg max-w-xs">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Community Support Network</h3>
        <div><span className="font-semibold text-gray-700">Your Status:</span> 
          <span className={`ml-1 font-bold ${status === 'Tracking' ? 'text-green-600' : 'text-red-600'}`}>{status}</span>
        </div>
        <div className="font-mono text-sm text-gray-800 mt-1">Lat: {coords.lat.toFixed ? coords.lat.toFixed(6) : '--'}</div>
        <div className="font-mono text-sm text-gray-800">Lng: {coords.lng.toFixed ? coords.lng.toFixed(6) : '--'}</div>
        <div className="text-sm text-gray-700">Accuracy: {Math.round(accuracy)} meters</div>
      </div>

      {/* Map */}
      <MapContainer center={[14.0860746, 100.608406]} zoom={6} scrollWheelZoom={true} className="h-screen w-full z-10">
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {communityLocations.map((loc, idx) => (
          <Marker
            key={idx}
            position={[loc.lat, loc.lng]}
            icon={L.divIcon({
              html: '<i class="fas fa-map-marker-alt text-red-600 text-2xl"></i>',
              className: 'twin-icon',
              iconSize: [30, 30],
              iconAnchor: [15, 30]
            })}
          >
            <Popup className="p-0 w-64">
              <div className="p-2">
                <h3 className="text-md font-bold text-gray-800 border-b pb-1 mb-2">{loc.name}</h3>
                <p className="text-sm mb-2"><strong>Contact:</strong> {loc.contact}</p>
                <div className="text-sm">
                  <strong>Services:</strong>
                  <ul className="mt-1 space-y-1">
                    {loc.services.map((s, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <i className="fas fa-hands-helping text-red-500"></i> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <UserLocation setCoords={setCoords} setAccuracy={setAccuracy} setStatus={setStatus} />
      </MapContainer>
    </div>
  );
};

export default CommunityMap;
