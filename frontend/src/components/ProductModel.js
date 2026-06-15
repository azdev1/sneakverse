'use client';

import { useGLTF } from '@react-three/drei';

export default function ProductModel({ modelPath, productName }) {
    const { scene } = useGLTF(modelPath);

    let scale = 1;
    let position = [0, 0, 0];

    if (productName === "SneakVerse Quantum") {
        scale = 0.07;
        position = [0, -0.5, 0];
    }

    if (productName === "AeroStratus Basketball") {
        scale = 0.9;
        position = [0, -0.5, 0];
    }

    if (productName === "HyperNebula Limited Edition") {
        scale = 0.19;
        position = [0, -0.1, 0];
    }

    return (
        <primitive
            object={scene.clone()}
            scale={scale}
            position={position}
        />
    );
}