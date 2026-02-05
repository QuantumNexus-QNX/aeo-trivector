'use client'

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Attractor } from '@/components/Attractor';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// 3D Group component for Attractor animation
function AttractorGroup({ mousePosition }: { mousePosition: { x: number, y: number } }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      groupRef.current.scale.set(scale, scale, scale);
      
      const targetRotationX = mousePosition.y * 0.1;
      const targetRotationZ = mousePosition.x * 0.1;
      groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.05;
      groupRef.current.rotation.z += (targetRotationZ - groupRef.current.rotation.z) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <Attractor count={15000} opacity={0.6} speed={1} />
    </group>
  );
}

export default function About() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Lorenz Attractor Background */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
          <AttractorGroup mousePosition={mousePosition} />
        </Canvas>
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 min-h-screen flex items-center justify-center px-6 py-32"
      >
        <div className="max-w-4xl w-full">
          {/* Section Number */}
          <div className="font-mono text-xs tracking-[0.3em] text-[#FFD700]/50 mb-8 text-center">
            04 // ABOUT
          </div>

          {/* Translucent Glass Panel */}
          <div 
            className="relative rounded-3xl p-16 md:p-20 transition-all duration-700"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              background: 'rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: isHovered 
                ? '0 0 50px rgba(255, 215, 0, 0.3), inset 0 0 80px rgba(255, 215, 0, 0.08)' 
                : '0 0 30px rgba(255, 215, 0, 0.2), inset 0 0 50px rgba(255, 215, 0, 0.05)',
              transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
            }}
          >
            {/* Gold corner glow */}
            <div 
              className="absolute bottom-0 left-0 w-40 h-40 rounded-bl-3xl pointer-events-none transition-opacity duration-700"
              style={{
                background: 'radial-gradient(circle at bottom left, rgba(255, 215, 0, 0.25), transparent 70%)',
                opacity: isHovered ? 1 : 0.6,
              }}
            />

            {/* Breathing light band */}
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              animate={{
                background: [
                  'linear-gradient(45deg, transparent 0%, rgba(255, 215, 0, 0.03) 50%, transparent 100%)',
                  'linear-gradient(45deg, transparent 30%, rgba(255, 215, 0, 0.05) 70%, transparent 100%)',
                  'linear-gradient(45deg, transparent 0%, rgba(255, 215, 0, 0.03) 50%, transparent 100%)',
                ],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Content */}
            <div className="relative text-center space-y-12">
              {/* Header */}
              <h1 
                className="font-serif text-4xl md:text-5xl tracking-wider uppercase"
                style={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  textShadow: '0 4px 20px rgba(0,0,0,0.9), 0 8px 40px rgba(0,0,0,0.7)',
                  letterSpacing: '0.15em',
                  fontWeight: 300,
                }}
              >
                The Founder
              </h1>

              {/* Bio Content */}
              <div className="space-y-8 max-w-2xl mx-auto">
                <h2 
                  className="font-serif text-2xl tracking-wide"
                  style={{
                    color: 'rgba(255, 215, 0, 0.9)',
                    textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 4px 24px rgba(0,0,0,0.7)',
                    letterSpacing: '0.1em',
                  }}
                >
                  Jared Dunahay
                </h2>
                <p 
                  className="text-lg leading-relaxed"
                  style={{
                    color: 'rgba(209, 213, 219, 0.85)',
                    textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)',
                  }}
                >
                  Researcher working at the intersection of spectral geometry, category theory, and geometric foundations for interpretable AI.
                </p>
              </div>

              {/* Geometric Motif */}
              <div className="flex justify-center pt-12">
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  {/* Central node */}
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: '#FFD700',
                      boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.4)',
                    }}
                  />
                  
                  {/* Orbital rings */}
                  <div className="absolute inset-0 -m-6 border border-[#FFD700]/30 rounded-full" />
                  <div className="absolute inset-0 -m-10 border border-[#FFD700]/20 rounded-full" />
                  <div className="absolute inset-0 -m-14 border border-[#FFD700]/10 rounded-full" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
