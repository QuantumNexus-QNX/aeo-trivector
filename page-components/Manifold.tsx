'use client'

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Attractor } from '@/components/Attractor';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';
import * as THREE from 'three';

// 3D Group component for Attractor animation
function AttractorGroup({ mousePosition }: { mousePosition: { x: number, y: number } }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle rotation based on time
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      
      // Scale pulsing
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      groupRef.current.scale.set(scale, scale, scale);
      
      // Subtle mouse-responsive tilt (lerp for smoothness)
      const targetRotationX = mousePosition.y * 0.1;
      const targetRotationZ = mousePosition.x * 0.1;
      groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.05;
      groupRef.current.rotation.z += (targetRotationZ - groupRef.current.rotation.z) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <Attractor count={25000} opacity={0.85} speed={1} />
    </group>
  );
}

interface PillarProps {
  icon: string;
  title: string;
  descriptor: string;
  delay: number;
}

function Pillar({ icon, title, descriptor, delay }: PillarProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Translucent glass panel with gold glow */}
      <div 
        className="relative rounded-2xl p-12 transition-all duration-700 ease-out"
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isHovered 
            ? '0 0 40px rgba(255, 215, 0, 0.3), inset 0 0 60px rgba(255, 215, 0, 0.1)' 
            : '0 0 20px rgba(255, 215, 0, 0.15), inset 0 0 30px rgba(255, 215, 0, 0.05)',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        }}
      >
        {/* Gold corner glow */}
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-tr-2xl pointer-events-none transition-opacity duration-700"
          style={{
            background: 'radial-gradient(circle at top right, rgba(255, 215, 0, 0.2), transparent 70%)',
            opacity: isHovered ? 1 : 0.6,
          }}
        />
        
        {/* Breathing light band */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            background: [
              'linear-gradient(135deg, transparent 0%, rgba(255, 215, 0, 0.03) 50%, transparent 100%)',
              'linear-gradient(135deg, transparent 30%, rgba(255, 215, 0, 0.05) 70%, transparent 100%)',
              'linear-gradient(135deg, transparent 0%, rgba(255, 215, 0, 0.03) 50%, transparent 100%)',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Content */}
        <div className="relative flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <motion.div
            className="text-5xl"
            animate={{
              rotate: isHovered ? 5 : 0,
            }}
            transition={{ duration: 0.5 }}
            style={{
              color: '#FFD700',
              filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))',
              textShadow: '0 2px 12px rgba(0,0,0,0.9)',
            }}
          >
            {icon}
          </motion.div>

          {/* Title */}
          <h3 
            className="font-serif text-2xl tracking-wider uppercase"
            style={{
              color: 'rgba(255, 255, 255, 0.95)',
              letterSpacing: '0.15em',
              fontWeight: 400,
              textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 4px 24px rgba(0,0,0,0.7)',
            }}
          >
            {title}
          </h3>

          {/* Descriptor */}
          <motion.p
            className="text-base leading-relaxed max-w-xs"
            animate={{
              opacity: isHovered ? 1 : 0.7,
            }}
            transition={{ duration: 0.5 }}
            style={{
              color: 'rgba(209, 213, 219, 0.9)',
              textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)',
            }}
          >
            {descriptor}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Manifold() {
  // Check if arriving from event horizon crossing
  const fromEventHorizon = typeof window !== 'undefined' && sessionStorage.getItem('fromEventHorizon') === 'true';
  const [showGhostHorizon, setShowGhostHorizon] = useState(fromEventHorizon);
  
  // Mouse tracking for particle interaction
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Ghost horizon dissolves after 600ms, then clear flag
  useEffect(() => {
    if (fromEventHorizon) {
      const timer = setTimeout(() => {
        setShowGhostHorizon(false);
        sessionStorage.removeItem('fromEventHorizon');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [fromEventHorizon]);
  
  // Track mouse movement for particle interaction
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to 1 range
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const pillars = [
    {
      icon: "△",
      title: "Structure",
      descriptor: "Geometric foundations for stable systems."
    },
    {
      icon: "◯",
      title: "Dynamics",
      descriptor: "How attractors encode and transform."
    },
    {
      icon: "◇",
      title: "Integration",
      descriptor: "Self-encoding through spectral geometry."
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Lorenz Attractor Background */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 18], fov: 75 }}>
          <AttractorGroup mousePosition={mousePosition} />
        </Canvas>
      </div>

      {/* Ghost Horizon Effect */}
      {showGhostHorizon && (
        <motion.div
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-5 pointer-events-none flex items-center justify-center"
        >
          <div 
            className="w-96 h-96 rounded-full border-2 border-white/20"
            style={{
              boxShadow: '0 0 100px rgba(255, 255, 255, 0.3), inset 0 0 100px rgba(255, 255, 255, 0.1)'
            }}
          />
        </motion.div>
      )}

      {/* Fixed Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
        <a href="/">
          <div className="text-xl font-serif tracking-wider font-bold cursor-pointer hover:text-[#FFD700] transition-colors duration-500" style={{ color: 'rgba(255, 215, 0, 0.9)', textShadow: '0 0 20px rgba(255, 215, 0, 0.3)' }}>
            AEO TRIVECTOR
          </div>
        </a>
        <div className="flex gap-4 md:gap-8 font-mono text-xs tracking-widest uppercase opacity-70">
          <a href="/manifold" className="relative pb-1 py-2 border-b border-[#FFD700] text-[#FFD700] transition-all duration-300">VISION</a>
          <a href="/research" className="relative pb-1 py-2 border-b border-[#3B82F6]/50 hover:border-[#FFD700] hover:text-[#FFD700] transition-all duration-300">RESEARCH</a>
          <a href="/about" className="relative pb-1 py-2 border-b border-[#3B82F6]/50 hover:border-[#FFD700] hover:text-[#FFD700] transition-all duration-300">ABOUT</a>
          <a href="/contact" className="relative pb-1 py-2 border-b border-[#3B82F6]/50 hover:border-[#FFD700] hover:text-[#FFD700] transition-all duration-300">CONTACT</a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-24">
        {/* Large AEO TRIVECTOR Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <h1 
            className="font-serif text-6xl md:text-7xl lg:text-8xl tracking-wider mb-6"
            style={{
              color: 'rgba(255, 255, 255, 0.95)',
              textShadow: '0 4px 20px rgba(0,0,0,0.9), 0 8px 40px rgba(0,0,0,0.7)',
              letterSpacing: '0.1em',
              fontWeight: 300,
            }}
          >
            AEO TRIVECTOR
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="font-mono text-sm tracking-widest uppercase"
            style={{
              color: 'rgba(255, 215, 0, 0.8)',
              textShadow: '0 2px 8px rgba(0,0,0,0.9)',
              letterSpacing: '0.3em',
            }}
          >
            Attractor Architecture
          </motion.p>
        </motion.div>

        {/* Three Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full">
          {pillars.map((pillar, index) => (
            <Pillar
              key={index}
              icon={pillar.icon}
              title={pillar.title}
              descriptor={pillar.descriptor}
              delay={0.5 + index * 0.2}
            />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
