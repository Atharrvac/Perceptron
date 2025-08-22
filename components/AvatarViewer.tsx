import { Canvas } from '@react-three/fiber';
import { 
  useGLTF, 
  OrbitControls, 
  Stage, 
  useProgress,
  Html,
  PerspectiveCamera,
  Environment
} from '@react-three/drei';
import { Suspense, useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

interface TwinProps {
  url: string;
  position?: [number, number, number];
  scale?: number;
  onError?: () => void;
  onLoad?: () => void;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center className="text-white text-center">
      <div className="bg-black bg-opacity-70 p-4 rounded-lg">
        <div className="w-48 h-1.5 bg-gray-700 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm">Loading model... {Math.round(progress)}%</p>
      </div>
    </Html>
  );
}

function Twin({ url, position = [0, -1, 0], scale = 1.5, onError, onLoad }: TwinProps) {
  const group = useRef<THREE.Group>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (group.current && onLoad) onLoad();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [onLoad]);

  try {
    const { scene } = useGLTF(url, true, undefined, (error) => {
      console.error('Error loading model:', error);
      if (onError) onError();
    });

    return (
      <group ref={group}>
        <primitive 
          object={scene} 
          scale={scale} 
          position={position}
          rotation={[0, Math.PI / 4, 0]}
        />
      </group>
    );
  } catch (e) {
    console.error('Failed to load model:', e);
    if (onError) onError();
    return null;
  }
}

interface AvatarViewerProps {
  avatarUrl: string;
  className?: string;
  scale?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export default function AvatarViewer({ 
  avatarUrl = '/assets/avatars/user-avatar.glb', 
  className = "w-full h-64",
  scale = 1.5,
  onLoad,
  onError
}: AvatarViewerProps) {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const controls = useRef<any>(null);

  const handleError = () => {
    setLoadError(true);
    if (onError) onError();
  };

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  return (
    <div className={`${className} bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden relative`}>
      {loadError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <div className="text-center p-4">
            <div className="text-red-500 text-4xl mb-2">⚠️</div>
            <h3 className="text-xl font-medium text-white mb-1">Failed to load avatar</h3>
            <p className="text-gray-400 text-sm">Please try again or use a different model</p>
          </div>
        </div>
      ) : (
        <Suspense fallback={null}>
          <Canvas 
            shadows
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
            className="bg-transparent"
          >
            <PerspectiveCamera 
              makeDefault 
              position={[0, 0, 3]} 
              fov={50} 
              near={0.1} 
              far={1000} 
            />
            
            <ambientLight intensity={0.5} />
            <directionalLight 
              position={[5, 5, 5]} 
              intensity={1} 
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <pointLight position={[-5, 5, -5]} intensity={0.5} />
            
            <Stage
              environment="city"
              intensity={0.6}
              adjustCamera={1.5}
              shadows={{ type: 'contact', opacity: 0.2, blur: 2 }}
            >
              <Twin 
                url={avatarUrl} 
                scale={scale} 
                onError={handleError}
                onLoad={handleLoad}
              />
            </Stage>
            
            <OrbitControls 
              ref={controls}
              enablePan={false}
              enableZoom={true}
              enableDamping={true}
              dampingFactor={0.05}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 1.5}
              minDistance={1.5}
              maxDistance={5}
              autoRotate={!isLoading}
              autoRotateSpeed={1}
            />
            
            {isLoading && <Loader />}
            
            <Environment preset="sunset" background={false} />
          </Canvas>
        </Suspense>
      )}
    </div>
  );
}