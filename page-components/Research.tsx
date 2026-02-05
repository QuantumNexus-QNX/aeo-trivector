'use client'

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Attractor } from '@/components/Attractor';
import { motion } from 'framer-motion';
import * as THREE from 'three';

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

interface SectionProps {
  title: string;
  children: React.ReactNode;
  delay: number;
}

function Section({ title, children, delay }: SectionProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <div 
        className="relative rounded-2xl p-12 md:p-16 transition-all duration-700"
        style={{
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isHovered 
            ? '0 0 40px rgba(255, 215, 0, 0.25), inset 0 0 60px rgba(255, 215, 0, 0.08)' 
            : '0 0 25px rgba(255, 215, 0, 0.15), inset 0 0 40px rgba(255, 215, 0, 0.05)',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        }}
      >
        {/* Gold edge glow */}
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-tr-2xl pointer-events-none transition-opacity duration-700"
          style={{
            background: 'radial-gradient(circle at top right, rgba(255, 215, 0, 0.2), transparent 70%)',
            opacity: isHovered ? 1 : 0.5,
          }}
        />

        {/* Breathing effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            background: [
              'linear-gradient(135deg, transparent 0%, rgba(255, 215, 0, 0.02) 50%, transparent 100%)',
              'linear-gradient(135deg, transparent 30%, rgba(255, 215, 0, 0.04) 70%, transparent 100%)',
              'linear-gradient(135deg, transparent 0%, rgba(255, 215, 0, 0.02) 50%, transparent 100%)',
            ],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="relative">
          <h2 
            className="font-serif text-3xl tracking-wide uppercase mb-8"
            style={{
              color: 'rgba(255, 215, 0, 0.9)',
              textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 4px 24px rgba(0,0,0,0.7)',
              letterSpacing: '0.12em',
              fontWeight: 300,
            }}
          >
            {title}
          </h2>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export default function Research() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
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
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
          <AttractorGroup mousePosition={mousePosition} />
        </Canvas>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 min-h-screen px-6 py-32"
      >
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="font-mono text-xs tracking-[0.3em] text-[#FFD700]/50">
              05 // RESEARCH
            </div>
            <h1 
              className="font-serif text-5xl md:text-6xl tracking-wider uppercase"
              style={{
                color: 'rgba(255, 255, 255, 0.95)',
                textShadow: '0 4px 20px rgba(0,0,0,0.9), 0 8px 40px rgba(0,0,0,0.7)',
                letterSpacing: '0.15em',
                fontWeight: 300,
              }}
            >
              The Work
            </h1>
          </div>

          {/* Publications */}
          <Section title="Publications" delay={0.2}>
            <div style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)' }}>
              <div className="font-mono text-sm text-[#9CA3AF] mb-8 tracking-wider">
                COMING 2026
              </div>
              <div className="space-y-6">
                <div className="border-l-2 border-[#FFD700]/30 pl-6">
                  <h3 className="font-serif text-xl text-white mb-2">
                    Spectral Self-Encoding and Attractor Stability
                  </h3>
                  <p className="text-sm text-[#9CA3AF]">
                    How self-encoding attractors create interpretable, geometrically stable AI systems
                  </p>
                </div>
                <div className="border-l-2 border-[#FFD700]/30 pl-6">
                  <h3 className="font-serif text-xl text-white mb-2">
                    The Triangle Theorem: Necessary Conditions for Self-Reference
                  </h3>
                  <p className="text-sm text-[#9CA3AF]">
                    Mathematical foundations for systems capable of self-reference
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* Open Source */}
          <Section title="Open Source" delay={0.4}>
            <div style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)' }}>
              <p className="text-lg text-[#D1D5DB] mb-6 leading-relaxed">
                Mathematical implementations and experimental code
              </p>
              <a
                href="https://github.com/AEO-TRIVECTOR/trivector-research"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-sm text-[#FFD700] hover:text-white transition-colors duration-300"
              >
                <span>→ GitHub Repository</span>
              </a>
            </div>
          </Section>

          {/* The Framework */}
          <Section title="The Framework" delay={0.6}>
            <div className="space-y-6" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)' }}>
              <p className="text-lg text-[#D1D5DB] leading-relaxed">
                The <span className="text-[#FFD700] font-serif">Self-Encoding Geometry (SEG)</span> framework provides geometric foundations for AI systems that are interpretable by construction—stable because they're geometrically inevitable, not reverse-engineered.
              </p>
              <div className="border-l-2 border-[#FFD700]/30 pl-6 py-4">
                <p className="font-mono text-base mb-4">
                  Core insight: Attractor-stable systems satisfy the self-encoding fixed point
                </p>
                <div className="font-mono text-2xl text-[#FFD700]">
                  μ = e<sup>−μ</sup>
                </div>
              </div>
              <p className="text-base text-[#9CA3AF]">
                This mathematical relationship captures how coherent systems encode themselves through geometric structure—interpretability by construction, not archaeology.
              </p>
            </div>
          </Section>
        </div>
      </motion.div>
    </div>
  );
}
