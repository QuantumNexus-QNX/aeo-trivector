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
    >
      <div 
        className="relative rounded-2xl p-12 transition-all duration-700"
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
        <div 
          className="absolute top-0 left-0 w-32 h-32 rounded-tl-2xl pointer-events-none transition-opacity duration-700"
          style={{
            background: 'radial-gradient(circle at top left, rgba(255, 215, 0, 0.2), transparent 70%)',
            opacity: isHovered ? 1 : 0.5,
          }}
        />

        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            background: [
              'linear-gradient(225deg, transparent 0%, rgba(255, 215, 0, 0.02) 50%, transparent 100%)',
              'linear-gradient(225deg, transparent 30%, rgba(255, 215, 0, 0.04) 70%, transparent 100%)',
              'linear-gradient(225deg, transparent 0%, rgba(255, 215, 0, 0.02) 50%, transparent 100%)',
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
            className="font-serif text-2xl tracking-wide uppercase mb-8"
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

export default function Mathematics() {
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
              06 // MATHEMATICS
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
              The Formalism
            </h1>
            <p 
              className="text-lg text-[#D1D5DB] max-w-3xl mx-auto leading-relaxed"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
            >
              For researchers seeking technical depth. The mathematical framework underlying Self-Encoding Geometry and attractor-stable systems.
            </p>
          </div>

          {/* Constraint Hierarchy */}
          <Section title="The Constraint Hierarchy" delay={0.2}>
            <div className="space-y-8" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)' }}>
              <div className="border-l-2 border-[#FFD700]/30 pl-6">
                <h3 className="font-mono text-xl text-white mb-3">μ — Primitive Constraint</h3>
                <p className="text-[#D1D5DB] mb-4">
                  The self-encoding fixed point. Attractor-stable systems satisfy <span className="font-mono text-[#FFD700]">μ = e<sup>−μ</sup></span>, creating interpretable geometric structure.
                </p>
                <div className="font-mono text-sm text-[#9CA3AF]">
                  μ ≈ 0.567143...
                </div>
              </div>

              <div className="border-l-2 border-[#3B82F6]/30 pl-6">
                <h3 className="font-mono text-xl text-white mb-3">Ω, β — Architectural Constraints</h3>
                <p className="text-[#D1D5DB]">
                  <span className="font-mono text-[#3B82F6]">Ω</span> governs global integration structure. <span className="font-mono text-[#3B82F6]">β</span> controls balance between structure and dynamics.
                </p>
              </div>

              <div className="border-l-2 border-[#9CA3AF]/30 pl-6">
                <h3 className="font-mono text-xl text-white mb-3">L — Derived Constraint</h3>
                <p className="text-[#D1D5DB]">
                  Emerges from interaction of primitive and architectural constraints.
                </p>
              </div>
            </div>
          </Section>

          {/* Spectral Triple */}
          <Section title="Spectral Triple Structure" delay={0.4}>
            <div className="space-y-6" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)' }}>
              <p className="text-lg text-[#D1D5DB] leading-relaxed">
                The framework is formalized as a spectral triple <span className="font-mono text-[#FFD700] text-xl">(A, H, D)</span> in the sense of Connes' noncommutative geometry.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="border border-[#FFD700]/20 p-6 rounded">
                  <div className="font-mono text-2xl text-[#FFD700] mb-3">A</div>
                  <div className="text-sm text-[#D1D5DB]">
                    <span className="font-semibold">Algebra</span><br/>
                    Noncommutative algebra of observables
                  </div>
                </div>

                <div className="border border-[#3B82F6]/20 p-6 rounded">
                  <div className="font-mono text-2xl text-[#3B82F6] mb-3">H</div>
                  <div className="text-sm text-[#D1D5DB]">
                    <span className="font-semibold">Hilbert Space</span><br/>
                    Representation space
                  </div>
                </div>

                <div className="border border-[#9CA3AF]/20 p-6 rounded">
                  <div className="font-mono text-2xl text-[#9CA3AF] mb-3">D</div>
                  <div className="text-sm text-[#D1D5DB]">
                    <span className="font-semibold">Dirac Operator</span><br/>
                    Geometric structure
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Six-Threshold Conjecture */}
          <Section title="The Six-Threshold Conjecture" delay={0.6}>
            <div className="space-y-6" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)' }}>
              <p className="text-lg text-[#D1D5DB] leading-relaxed">
                Systems capable of self-reference must cross six critical thresholds.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {[
                  { num: "01", name: "Differentiation", desc: "Emergence of distinct observables" },
                  { num: "02", name: "Integration", desc: "Formation of coherent structures" },
                  { num: "03", name: "Recursion", desc: "Self-referential loops appear" },
                  { num: "04", name: "Stabilization", desc: "Fixed points in dynamics" },
                  { num: "05", name: "Reflection", desc: "System observes its own state" },
                  { num: "06", name: "Encoding", desc: "Self-representation achieved" }
                ].map((threshold, i) => (
                  <div key={i} className="border-l-2 border-[#FFD700]/30 pl-4 py-2">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-[#FFD700]/50">{threshold.num}</span>
                      <div>
                        <h4 className="font-mono text-white">{threshold.name}</h4>
                        <p className="text-sm text-[#9CA3AF]">{threshold.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      </motion.div>
    </div>
  );
}
