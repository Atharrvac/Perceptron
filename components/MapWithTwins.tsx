import { useEffect, useState, useRef, Suspense } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Stage } from '@react-three/drei';
import { latLngToCoords } from '../utils/coordinates';

interface Twin {
  uid: string;
  lat: number;
  lng: number;
  avatarUrl: string;
}

interface MapWithTwinsProps {
  center: [number, number];
  zoom: number;
}

function Twin({ url, position }: { url: string; position: [number, number, number] }) {
  const { scene } = useGLTF(url);
  return (
    <primitive 
      object={scene} 
      scale={1.5} 
      position={position}
      rotation={[0, Math.PI, 0]} // Face forward
    />
  );
}

function MapUpdater({ onBoundsChange }: { onBoundsChange: (bounds: any) => void }) {
  const map = useMap();

  useEffect(() => {
    const updateBounds = () => {
      const bounds = map.getBounds();
      onBoundsChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
        width: 100,
        height: 100
      });
    };

    map.on('moveend', updateBounds);
    updateBounds();

    return () => {
      map.off('moveend', updateBounds);
    };
  }, [map, onBoundsChange]);

  return null;
}

export default function MapWithTwins({ center, zoom }: MapWithTwinsProps) {
  const [twins, setTwins] = useState<Twin[]>([]);
  const [bounds, setBounds] = useState({
    minLat: center[0] - 0.1,
    maxLat: center[0] + 0.1,
    minLng: center[1] - 0.1,
    maxLng: center[1] + 0.1,
    width: 100,
    height: 100
  });

  // Add your avatar for testing
  useEffect(() => {
    setTwins([
      {
        uid: 'test-user',
        lat: center[0],
        lng: center[1],
        avatarUrl: '/assets/avatars/user-avatar.glb'
      }
    ]);
  }, [center]);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapUpdater onBoundsChange={setBounds} />
      </MapContainer>

      <Canvas className="absolute inset-0 pointer-events-none">
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            {twins.map((twin) => (
              <Twin
                key={twin.uid}
                url={twin.avatarUrl}
                position={latLngToCoords(twin.lat, twin.lng, bounds)}
              />
            ))}
          </Stage>
          <OrbitControls 
            enablePan={false}
            enableRotate={false}
            enableZoom={false}
          />
        </Suspense>
      </Canvas>
    </div>
  );
} 