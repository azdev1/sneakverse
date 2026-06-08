'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

export default function Sneaker3D({
  bodyColor = '#111111',
  soleColor = '#00f0ff',
  lacesColor = '#ffffff',
  swooshColor = '#ff5500',
  autoRotate = true
}) {
  const groupRef = useRef();

  const { scene } = useGLTF(
    '/models/arnt_shoes_-_ulv_whussuphaterz.glb'
  );

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        console.log(
          'Mesh:',
          child.name,
          'Material:',
          child.material?.name
        );
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (!groupRef.current) return;

    if (autoRotate) {
      groupRef.current.rotation.y =
        state.clock.getElapsedTime() * 0.4;

      groupRef.current.position.y =
        Math.sin(state.clock.getElapsedTime() * 1.5) * 0.05;
    }
  });

  return (
    <group
      ref={groupRef}
      scale={4}
      position={[0, -1.3, 0]}
      rotation={[0, Math.PI / 2, 0]}
    >
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(
  '/models/arnt_shoes_-_ulv_whussuphaterz.glb'
);