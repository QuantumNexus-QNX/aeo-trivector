'use client'

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AttractorProps {
  count?: number;
  opacity?: number;
  speed?: number;
}

export function Attractor({
  count = 10000,
  opacity = 0.6,
  speed = 0.5
}: AttractorProps) {
  // SSR-safe device detection
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
      setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  // Optimize particle count for mobile devices
  const optimizedCount = isMobile ? Math.min(count, 3000) : count;
  
  const mesh = useRef<THREE.Points>(null);
  
  // Generate initial points for the Lorenz Attractor with color data
  const { points, colors } = useMemo(() => {
    const pts = [];
    const cols = [];
    let x = 0.1, y = 0, z = 0;
    const dt = 0.01;
    const sigma = 10;
    const rho = 28;
    const beta = 8/3;

    // Three colors for three dominant planes
    // Gold for XY-dominant, Cyan for XZ-dominant, Purple for YZ-dominant
    const colorXY = new THREE.Color('#FFD700'); // Gold
    const colorXZ = new THREE.Color('#3B82F6'); // Cyan/Blue
    const colorYZ = new THREE.Color('#A78BFA'); // Purple

    // RK4 Integration Helper
    const f = (x: number, y: number, z: number) => {
      return {
        dx: sigma * (y - x),
        dy: x * (rho - z) - y,
        dz: x * y - beta * z
      };
    };

    for (let i = 0; i < optimizedCount; i++) {
      // k1
      const k1 = f(x, y, z);
      
      // k2
      const k2 = f(x + k1.dx * dt * 0.5, y + k1.dy * dt * 0.5, z + k1.dz * dt * 0.5);
      
      // k3
      const k3 = f(x + k2.dx * dt * 0.5, y + k2.dy * dt * 0.5, z + k2.dz * dt * 0.5);
      
      // k4
      const k4 = f(x + k3.dx * dt, y + k3.dy * dt, z + k3.dz * dt);
      
      x += (k1.dx + 2*k2.dx + 2*k3.dx + k4.dx) * dt / 6;
      y += (k1.dy + 2*k2.dy + 2*k3.dy + k4.dy) * dt / 6;
      z += (k1.dz + 2*k2.dz + 2*k3.dz + k4.dz) * dt / 6;
      
      pts.push(new THREE.Vector3(x, y, z));
      
      // Determine color based on which plane the point is most aligned with
      // Calculate normalized distances from each plane
      const absX = Math.abs(x);
      const absY = Math.abs(y);
      const absZ = Math.abs(z);
      const total = absX + absY + absZ;
      
      // Weights for each plane based on coordinate magnitudes
      const weightXY = (absX + absY) / (2 * total); // XY plane (z is small)
      const weightXZ = (absX + absZ) / (2 * total); // XZ plane (y is small)
      const weightYZ = (absY + absZ) / (2 * total); // YZ plane (x is small)
      
      // Blend colors based on weights
      const color = new THREE.Color();
      color.r = colorXY.r * weightXY + colorXZ.r * weightXZ + colorYZ.r * weightYZ;
      color.g = colorXY.g * weightXY + colorXZ.g * weightXZ + colorYZ.g * weightYZ;
      color.b = colorXY.b * weightXY + colorXZ.b * weightXZ + colorYZ.b * weightYZ;
      
      cols.push(color.r, color.g, color.b);
    }
    return { points: pts, colors: new Float32Array(cols) };
  }, [optimizedCount]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    // Center the geometry
    geo.center();
    return geo;
  }, [points, colors]);

  useFrame((state) => {
    if (mesh.current && !prefersReducedMotion) {
      // Rotate the entire attractor slowly (disabled for reduced motion)
      mesh.current.rotation.y += 0.002 * speed;
      mesh.current.rotation.z += 0.001 * speed;
      
      // Subtle breathing effect (disabled for reduced motion)
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      mesh.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <points ref={mesh}>
      <primitive object={geometry} />
      <pointsMaterial 
        size={0.15} 
        vertexColors
        transparent 
        opacity={opacity} 
        sizeAttenuation 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        map={useMemo(() => {
          // Create circular texture for particles
          const canvas = document.createElement('canvas');
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext('2d')!;
          
          // Draw circle with soft edges
          const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 32, 32);
          
          const texture = new THREE.CanvasTexture(canvas);
          texture.needsUpdate = true;
          return texture;
        }, [])}
      />
    </points>
  );
}
