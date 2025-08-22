import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei';
import { READY_PLAYER_ME_AVATAR_URL } from '../constants';
import type { PrimitiveProps, AmbientLightProps, DirectionalLightProps } from '@react-three/fiber';

// This declaration block helps TypeScript recognize R3F's intrinsic elements
// if the global type augmentation isn't working correctly in the project setup.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      primitive: PrimitiveProps;
      ambientLight: AmbientLightProps;
      directionalLight: DirectionalLightProps;
    }
  }
}

// Define AvatarModel component outside of ProfilePage
const AvatarModel: React.FC<{ url: string }> = ({ url }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.5} position={[0, -1.7, 0]} />;
};

const ProfilePage: React.FC = () => {
  return (
    <div className="p-6 bg-slate-800 rounded-lg shadow-xl h-full flex flex-col">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">My Digital Twin</h1>
      <div className="flex-grow bg-slate-700 rounded-md relative" style={{ minHeight: '400px' }}>
        <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }}>
          <Suspense fallback={
            <Html center>
              <div className="text-white text-lg">Loading Avatar...</div>
            </Html>
          }>
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
            <Environment preset="city" />
            <AvatarModel url={READY_PLAYER_ME_AVATAR_URL} />
          </Suspense>
          <OrbitControls enableZoom={true} enablePan={true} target={[0, -0.5, 0]} />
        </Canvas>
      </div>
      <div className="mt-6 p-4 bg-slate-700 rounded-md">
        <h2 className="text-2xl font-semibold text-cyan-300 mb-2">Vedant Raut (Mock User)</h2>
        <p className="text-slate-300 mb-4">
          Passionate developer exploring the frontiers of web technology and digital identity. 
          This is a preview of my digital avatar.
        </p>
        <button 
          onClick={() => {
            // This will open the avatar in a new tab
            window.open(READY_PLAYER_ME_AVATAR_URL, '_blank');
          }}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors duration-200"
        >
          View My Avatar
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
