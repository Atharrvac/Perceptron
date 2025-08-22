import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

type GLBModelProps = {
  glbUrl: string;
};

function GLBModel({ glbUrl }: GLBModelProps) {
  const { scene } = useGLTF(glbUrl);
  return <primitive object={scene} />;
}

export default function wer() {
  const [glbUrl, setGlbUrl] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.glb')) {
      const url = URL.createObjectURL(file);
      setGlbUrl(url);
    } else {
      alert('Please upload a .glb file');
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <input type="file" accept=".glb" onChange={handleFileUpload} />
      <Canvas camera={{ position: [0, 1, 5], fov: 50 }}>
        <ambientLight />
        <directionalLight position={[2, 2, 2]} />
        <OrbitControls />
        <Suspense fallback={null}>
          {glbUrl && <GLBModel glbUrl={glbUrl} />}
        </Suspense>
      </Canvas>
    </div>
  );
}
