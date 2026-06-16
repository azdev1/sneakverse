'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

export default function Sneaker3D({
  modelPath,
  bodyColor = '#111111',
  soleColor = '#00f0ff',
  lacesColor = '#ffffff',
  swooshColor = '#ff5500',
  autoRotate = true,
}) {
  const groupRef = useRef();

  const { scene } = useGLTF(
    modelPath || "/models/adidas_sneakers.glb"
  );
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
  const modelSettings = {
    "/models/adidas_sneakers.glb": {
      scale: 5,
      position: [0, -1.3, 0],
      rotation: [0, Math.PI / 2, 0],
    },
    "/models/rtfkt_creator_one.glb": {
      scale: 0.06,
      position: [0, -1.5, 0],
      rotation: [0, 0, 0],
    },

    "/models/basketball_shoe.glb": {
      scale: 1,
      position: [0, -1.0, 0],
      rotation: [0, 0, 0],
    },

    "/models/free_shoe_model.glb": {
      scale: 0.4,
      position: [0, -1.0, 0],
      rotation: [0, Math.PI / 2, 0],
    },
  };

  const settings =
    modelSettings[modelPath] ||
    modelSettings["/models/adidas_sneakers.glb"];
  return (
    <group
      ref={groupRef}
      scale={settings.scale}
      position={settings.position}
      rotation={settings.rotation}
    >
      <primitive object={scene} />
    </group>
  );
}
useGLTF.preload('/models/adidas_sneakers.glb');