'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

export default function Sneaker3D({
  bodyColor = '#111111',
  soleColor = '#00f0ff',
  lacesColor = '#ffffff',
  swooshColor = '#ff5500',
  autoRotate = true,
}) {
  const groupRef = useRef();

  const { scene } = useGLTF('/models/adidas_sneakers.glb');

  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh || !child.material) return;

      child.material = child.material.clone();

      // Main shoe body
      if (child.material.name === 'Material_40') {
        child.material.color.set(bodyColor);
      }

      // Adidas stripes
      if (child.material.name === 'Material_42') {
        child.material.color.set(swooshColor);
      }

      // Laces
      if (child.material.name === 'Material_32') {
        child.material.color.set(lacesColor);
      }

      // Side pod block
      if (child.material.name === 'Material_33') {
        child.material.color.set(soleColor);
      }
    });
  }, [scene, bodyColor, soleColor, lacesColor, swooshColor]);

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

useGLTF.preload('/models/adidas_sneakers.glb');