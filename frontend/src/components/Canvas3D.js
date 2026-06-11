'use client';

import React, { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import Sneaker3D from './Sneaker3D';
import * as THREE from 'three';

function CameraController({ cameraPreset }) {
  const { camera } = useThree();

  useEffect(() => {
    const positions = {
      side: { pos: [0, 0.1, 4.5], look: [0, 0, 0] },
      top: { pos: [0.01, 4.2, 0.1], look: [0, 0, 0] },
      front: { pos: [4.2, 0.1, 0], look: [0, 0, 0] },
      back: { pos: [-4.2, 0.1, 0], look: [0, 0, 0] }
    };

    const target = positions[cameraPreset] || positions.side;

    let steps = 0;
    const duration = 25;

    const startX = camera.position.x;
    const startY = camera.position.y;
    const startZ = camera.position.z;

    const diffX = target.pos[0] - startX;
    const diffY = target.pos[1] - startY;
    const diffZ = target.pos[2] - startZ;

    const animateCamera = () => {
      if (steps < duration) {
        steps++;

        const progress = steps / duration;
        const ease =
          progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;

        camera.position.set(
          startX + diffX * ease,
          startY + diffY * ease,
          startZ + diffZ * ease
        );

        camera.lookAt(new THREE.Vector3(...target.look));

        requestAnimationFrame(animateCamera);
      }
    };

    animateCamera();
  }, [cameraPreset, camera]);

  return null;
}

export default function Canvas3D({
  bodyColor,
  soleColor,
  lacesColor,
  swooshColor,
  autoRotate = true,
  cameraPreset = 'side'
}) {
  return (
    <div className="w-full h-full min-h-[300px] relative">
      <Canvas
        shadows
        camera={{ position: [0, 0.5, 3], fov: 35 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={1.4} />

        <spotLight
          position={[6, 12, 6]}
          angle={0.4}
          penumbra={0.8}
          intensity={18}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        <directionalLight
          position={[4, 5, 8]}
          intensity={6}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        <directionalLight
          position={[-6, 6, -6]}
          intensity={4}
          color="#ffffff"
        />

        <pointLight
          position={[0, -1.2, 0]}
          color={soleColor || '#00f0ff'}
          intensity={8}
          distance={4.5}
        />

        <Suspense fallback={null}>
          <group position={[0, 0.2, 0]}>
            <Sneaker3D
              bodyColor={bodyColor}
              soleColor={soleColor}
              lacesColor={lacesColor}
              swooshColor={swooshColor}
              autoRotate={autoRotate}
            />
          </group>
        </Suspense>

        <ContactShadows
          position={[0, -0.6, 0]}
          opacity={0.7}
          scale={5}
          blur={1.8}
          far={1.5}
        />

        <CameraController cameraPreset={cameraPreset} />

        <OrbitControls
          enableZoom
          enablePan={false}
          minDistance={2.5}
          maxDistance={7}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minPolarAngle={0.1}
          makeDefault
        />
      </Canvas>
    </div>
  );
}