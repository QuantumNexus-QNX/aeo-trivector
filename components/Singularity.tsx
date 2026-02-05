'use client'

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SingularityProps {
  onHover?: (hovering: boolean) => void;
  onClick?: () => void;
}

export function Singularity({ onHover, onClick }: SingularityProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const glowMesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (mesh.current && glowMesh.current) {
      const time = state.clock.elapsedTime;
      
      // Pulse effect
      const scale = 1 + Math.sin(time * 1.5) * 0.1;
      mesh.current.scale.set(scale, scale, scale);
      
      // Glow pulse (slightly offset)
      const glowScale = 1.2 + Math.sin(time * 1.5 - 0.5) * 0.15;
      glowMesh.current.scale.set(glowScale, glowScale, glowScale);
      
      // Rotation
      mesh.current.rotation.z -= 0.005;
      mesh.current.rotation.x += 0.002;
    }
  });

  return (
    <group 
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
        onHover?.(true);
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
        onHover?.(false);
      }}
      onClick={onClick}
    >
      {/* Core Singularity - The Void */}
      <mesh ref={mesh}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial 
          color="#000000" 
          roughness={0.1}
          metalness={0.9}
          emissive="#000000"
        />
      </mesh>

      {/* Event Horizon - The Glow */}
      <mesh ref={glowMesh}>
        <sphereGeometry args={[1.05, 64, 64]} />
        <meshBasicMaterial 
          color="#FFD700" 
          transparent 
          opacity={0.15} 
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Accretion Disk - Particles */}
      <points>
        <ringGeometry args={[1.5, 3, 64]} />
        <pointsMaterial 
          size={0.05} 
          color="#3B82F6" 
          transparent 
          opacity={0.4} 
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
