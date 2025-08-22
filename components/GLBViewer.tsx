import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface GLBViewerProps {
  url: string;
  scale?: number;
  position?: [number, number, number];
  className?: string;
}

function Model({ url, scale = 1.5, position = [0, 0, 0] }: { url: string; scale?: number; position?: [number, number, number] }) {
  const { scene } = useGLTF(url);
  
  // Make sure the scene has proper lighting and materials
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return <primitive object={scene} scale={scale} position={position} />;
}

const GLBViewer: React.FC<GLBViewerProps> = ({ 
  url, 
  scale = 1.5, 
  position = [0, -1, 0],
  className = 'w-full h-[500px]'
}) => {
  return (
    <div className={`${className} bg-gray-900 rounded-lg overflow-hidden`}>
      <Canvas 
        shadows 
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1} 
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Suspense fallback={null}>
          <Model url={url} scale={scale} position={position} />
        </Suspense>
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableDamping={true}
          dampingFactor={0.05}
          autoRotate={true}
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  );
};

export default GLBViewer;
