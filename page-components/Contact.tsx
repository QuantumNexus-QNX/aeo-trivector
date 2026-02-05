'use client'

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Attractor } from '@/components/Attractor';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { toast } from 'sonner';

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

export default function Contact() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHovered1, setIsHovered1] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  
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

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      toast.success('Thank you for your interest. Newsletter signup coming soon.');
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

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
        className="relative z-10 min-h-screen flex items-center justify-center px-6 py-32"
      >
        <div className="max-w-4xl w-full space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="font-mono text-xs tracking-[0.3em] text-[#FFD700]/50">
              07 // CONTACT
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
              Connect
            </h1>
          </div>

          {/* Main Contact Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onMouseEnter={() => setIsHovered1(true)}
            onMouseLeave={() => setIsHovered1(false)}
          >
            <div 
              className="relative rounded-2xl p-12 md:p-16 transition-all duration-700"
              style={{
                background: 'rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isHovered1 
                  ? '0 0 50px rgba(255, 215, 0, 0.3), inset 0 0 80px rgba(255, 215, 0, 0.08)' 
                  : '0 0 30px rgba(255, 215, 0, 0.2), inset 0 0 50px rgba(255, 215, 0, 0.05)',
                transform: isHovered1 ? 'translateY(-3px)' : 'translateY(0)',
              }}
            >
              <div 
                className="absolute bottom-0 left-0 w-40 h-40 rounded-bl-2xl pointer-events-none transition-opacity duration-700"
                style={{
                  background: 'radial-gradient(circle at bottom left, rgba(255, 215, 0, 0.25), transparent 70%)',
                  opacity: isHovered1 ? 1 : 0.6,
                }}
              />

              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
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

              <div 
                className="relative text-center space-y-8"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)' }}
              >
                <p className="text-lg text-[#D1D5DB] leading-relaxed">
                  Interested in attractor geometry research? Potential collaboration? Press inquiry?
                </p>

                <div className="border-l-2 border-[#FFD700]/30 pl-6 py-4 inline-block">
                  <a 
                    href="mailto:link@trivector.ai"
                    className="font-mono text-2xl text-[#FFD700] hover:text-white transition-colors duration-300"
                  >
                    link@trivector.ai
                  </a>
                </div>

                <div className="pt-4 space-y-1 text-sm text-[#9CA3AF]">
                  <p>AEO Trivector LLC</p>
                  <p>New Hampshire, USA</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Newsletter Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            onMouseEnter={() => setIsHovered2(true)}
            onMouseLeave={() => setIsHovered2(false)}
          >
            <div 
              className="relative rounded-2xl p-12 md:p-16 transition-all duration-700"
              style={{
                background: 'rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isHovered2 
                  ? '0 0 50px rgba(255, 215, 0, 0.3), inset 0 0 80px rgba(255, 215, 0, 0.08)' 
                  : '0 0 30px rgba(255, 215, 0, 0.2), inset 0 0 50px rgba(255, 215, 0, 0.05)',
                transform: isHovered2 ? 'translateY(-3px)' : 'translateY(0)',
              }}
            >
              <div 
                className="absolute top-0 right-0 w-40 h-40 rounded-tr-2xl pointer-events-none transition-opacity duration-700"
                style={{
                  background: 'radial-gradient(circle at top right, rgba(255, 215, 0, 0.25), transparent 70%)',
                  opacity: isHovered2 ? 1 : 0.6,
                }}
              />

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
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              <div 
                className="relative text-center space-y-8"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)' }}
              >
                <h2 className="font-serif text-3xl tracking-wide uppercase text-[#FFD700]">
                  Follow the Work
                </h2>

                <p className="text-lg text-[#D1D5DB] leading-relaxed">
                  Stay updated on publications, framework developments, and research progress.
                </p>

                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 px-6 py-3 bg-black/50 border border-[#3B82F6]/30 text-white font-mono text-sm 
                             placeholder:text-[#9CA3AF]/50 focus:outline-none focus:border-[#FFD700]/60 
                             transition-colors duration-300 rounded"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-[#FFD700]/10 border border-[#FFD700]/50 text-[#FFD700] 
                             font-mono text-sm tracking-wider uppercase hover:bg-[#FFD700]/20 
                             hover:border-[#FFD700] transition-all duration-300 disabled:opacity-50 
                             disabled:cursor-not-allowed rounded"
                  >
                    {isSubmitting ? 'SUBMITTING...' : 'SUBSCRIBE'}
                  </button>
                </form>

                <p className="text-xs text-[#9CA3AF]">
                  No spam. Updates only when there's something worth sharing.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
