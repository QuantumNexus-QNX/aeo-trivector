'use client'

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CosmicEventHorizonProps {
  onHover?: (hovering: boolean) => void;
  onClick?: () => void;
}

export function CosmicEventHorizon({ onHover, onClick }: CosmicEventHorizonProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // 1. Central Void - Pure Black
  const voidMesh = useRef<THREE.Mesh>(null);
  
  // 2. Multiple Concentric Rings with Depth
  // We'll generate several rings with different radii, colors, and particle counts
  const rings = useMemo(() => {
    // Cinematic High-Density Ring Configuration
    const ringData = [
      // Inner Accretion Disk (High density, fast, turbulent)
      { radius: 1.6, count: 4000, color: '#FFD700', size: 0.015, speed: 0.3, spread: 0.2 }, 
      { radius: 1.9, count: 3500, color: '#F59E0B', size: 0.012, speed: 0.25, spread: 0.3 },
      
      // Primary Event Horizon Structure (Defined, elegant)
      { radius: 2.4, count: 5000, color: '#3B82F6', size: 0.01, speed: -0.1, spread: 0.15 }, 
      { radius: 2.5, count: 2000, color: '#93C5FD', size: 0.02, speed: -0.12, spread: 0.1 },

      // The "Golden Mean" Ring (Where the nodes sit)
      { radius: 3.2, count: 4500, color: '#FCD34D', size: 0.018, speed: 0.08, spread: 0.2 },
      
      // Outer Atmospheric Halo (Ethereal, slow, dispersed)
      { radius: 4.2, count: 3000, color: '#3B82F6', size: 0.01, speed: -0.05, spread: 0.6 },
      { radius: 5.5, count: 2000, color: '#1E3A8A', size: 0.008, speed: 0.03, spread: 0.8 },
      { radius: 6.8, count: 1000, color: '#FFD700', size: 0.005, speed: 0.02, spread: 1.2 },
    ];

    return ringData.map((data, i) => {
      const pts = [];
      const colors = [];
      const baseColor = new THREE.Color(data.color);
      
      for (let j = 0; j < data.count; j++) {
        const theta = Math.random() * Math.PI * 2;
        
        // Logarithmic spiral distribution for organic flow
        const spiralOffset = (theta % (Math.PI / 2)) * 0.2;
        const r = data.radius + (Math.random() - 0.5) * data.spread + spiralOffset;
        
        // Z-depth based on radius (accretion disk curvature)
        const z = (Math.random() - 0.5) * (data.spread * 0.8) * (Math.sin(r * 0.5)); 
        
        pts.push(r * Math.cos(theta), r * Math.sin(theta), z);
        
        // Color variation for shimmer effect
        const variation = (Math.random() - 0.5) * 0.2;
        colors.push(
          Math.max(0, Math.min(1, baseColor.r + variation)),
          Math.max(0, Math.min(1, baseColor.g + variation)),
          Math.max(0, Math.min(1, baseColor.b + variation))
        );
      }
      
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      return { ...data, geometry: geo, id: i };
    });
  }, []);

  // 3. The Attractor Symphony Nodes
  // 5 nodes on one of the gold rings (index 2, radius ~2.8)
  const nodes = useMemo(() => {
    const nodeData = [];
    const radius = 2.8;
    const angles = [0, 1.2, 2.5, 3.8, 5.1]; // Spaced out
    
    for (let i = 0; i < 5; i++) {
      const theta = angles[i];
      const isConductor = i === 2; // The brightest node
      nodeData.push({
        position: new THREE.Vector3(radius * Math.cos(theta), radius * Math.sin(theta), 0),
        size: isConductor ? 0.15 : 0.08,
        color: isConductor ? '#FFFFFF' : '#FFD700',
        intensity: isConductor ? 2 : 1
      });
    }
    return nodeData;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      // Rotate the entire system slowly
      groupRef.current.rotation.z = time * 0.05;
      
      // Tilt for cinematic perspective
      groupRef.current.rotation.x = Math.sin(time * 0.1) * 0.1 + 0.2; 
      groupRef.current.rotation.y = Math.cos(time * 0.15) * 0.1;
    }
  });

  return (
    <group 
      ref={groupRef}
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
      {/* Central Void - Vantablack Core */}
      <mesh ref={voidMesh}>
        <sphereGeometry args={[1.35, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Event Horizon Glow (Behind the void) */}
      <mesh position={[0, 0, -0.5]}>
        <circleGeometry args={[1.55, 64]} />
        <meshBasicMaterial color="#F59E0B" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Particle Rings */}
      {rings.map((ring) => (
        <points key={ring.id} rotation={[0, 0, ring.id * 0.5]}> 
          <primitive object={ring.geometry} />
          <pointsMaterial 
            size={ring.size} 
            vertexColors // Use per-particle colors for shimmer
            transparent 
            opacity={0.8} // Higher opacity for brilliance
            sizeAttenuation 
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      ))}

      {/* Nodes */}
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <sphereGeometry args={[node.size, 16, 16]} />
          <meshBasicMaterial color={node.color} toneMapped={false} />
          <pointLight distance={1} intensity={node.intensity} color={node.color} />
        </mesh>
      ))}

      {/* Deep Atmospheric Bloom */}
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial 
          color="#050A1F" 
          transparent 
          opacity={0.4} 
          blending={THREE.NormalBlending} // Darken background
          depthWrite={false}
        />
      </mesh>
      
      {/* Radiant Energy Overlay */}
      <mesh position={[0, 0, -0.1]}>
        <ringGeometry args={[1.4, 4, 64]} />
        <meshBasicMaterial 
          color="#1E40AF" 
          transparent 
          opacity={0.15} 
          blending={THREE.AdditiveBlending} 
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
