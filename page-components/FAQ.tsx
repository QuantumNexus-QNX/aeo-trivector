'use client'

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Attractor } from '@/components/Attractor';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/Footer';
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
      <Attractor count={25000} opacity={0.85} speed={1} />
    </group>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  delay: number;
}

function FAQItem({ question, answer, isOpen, onToggle, delay }: FAQItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onToggle}
      className="cursor-pointer"
    >
      <div 
        className="relative rounded-2xl p-8 transition-all duration-700"
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isHovered 
            ? '0 0 40px rgba(255, 215, 0, 0.25), inset 0 0 60px rgba(255, 215, 0, 0.08)' 
            : '0 0 25px rgba(255, 215, 0, 0.15), inset 0 0 40px rgba(255, 215, 0, 0.05)',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        }}
      >
        <div 
          className="absolute top-0 right-0 w-24 h-24 rounded-tr-2xl pointer-events-none transition-opacity duration-700"
          style={{
            background: 'radial-gradient(circle at top right, rgba(255, 215, 0, 0.15), transparent 70%)',
            opacity: isHovered ? 1 : 0.5,
          }}
        />

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
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="relative">
          <div className="flex justify-between items-start gap-4">
            <h3 
              className="font-serif text-xl text-white flex-1"
              style={{
                textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)'
              }}
            >
              {question}
            </h3>
            <motion.div 
              className="text-[#FFD700] text-sm"
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              style={{
                textShadow: '0 2px 8px rgba(0,0,0,0.9)'
              }}
            >
              ▼
            </motion.div>
          </div>
          
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p 
                  className="text-[#D1D5DB] mt-6 leading-relaxed"
                  style={{
                    textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)'
                  }}
                >
                  {answer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function FAQ() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
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

  const faqs = [
    {
      question: "What is AEO Trivector?",
      answer: "A research company developing geometric foundations for interpretable AI. We build attractor-stable systems that are interpretable by construction—geometrically inevitable, not reverse-engineered—using spectral geometry, category theory, and noncommutative geometry."
    },
    {
      question: "Is this neuroscience? Philosophy? Mathematics?",
      answer: "Yes. The work bridges rigorous mathematics (spectral geometry, category theory) with AI interpretability research. We believe interpretable AI requires geometric foundations as precise as physics—architectures that are stable by construction, not post-hoc analysis."
    },
    {
      question: "What does 'trivector' mean?",
      answer: "In Clifford algebra, a trivector is the highest-grade element in 3D space—the piece perpendicular to everything else. In our framework, it represents integration: how separate components unify into coherent, self-encoding systems. It's the mathematical object that captures geometric stability."
    },
    {
      question: "Who is this research for?",
      answer: "Researchers working at the intersection of mathematics, physics, and AI interpretability. Anyone interested in geometric foundations for stable AI systems, self-encoding architectures, and attractor geometry."
    },
    {
      question: "When will publications be available?",
      answer: "Initial papers are planned for 2026. We're committed to publishing rigorous, peer-reviewed work that meets the standards of both mathematics and AI research."
    },
    {
      question: "How can I contribute or collaborate?",
      answer: "We welcome collaboration from researchers with expertise in spectral geometry, category theory, mathematical physics, or AI interpretability. Reach out via link@trivector.ai with your background and research interests."
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 18], fov: 75 }}>
          <AttractorGroup mousePosition={mousePosition} />
        </Canvas>
      </div>

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
        <a href="/">
          <div className="text-xl font-serif tracking-wider font-bold cursor-pointer hover:text-[#FFD700] transition-colors duration-500" style={{ color: 'rgba(255, 215, 0, 0.9)', textShadow: '0 0 20px rgba(255, 215, 0, 0.3)' }}>
            AEO TRIVECTOR
          </div>
        </a>
        <div className="flex gap-4 md:gap-8 font-mono text-xs tracking-widest uppercase" style={{ opacity: 0.85 }}>
          <a href="/manifold/" className="relative pb-1 py-2 border-b border-[#3B82F6]/50 hover:border-[#FFD700] hover:text-[#FFD700] transition-all duration-300">VISION</a>
          <a href="/research/" className="relative pb-1 py-2 border-b border-[#3B82F6]/50 hover:border-[#FFD700] hover:text-[#FFD700] transition-all duration-300">RESEARCH</a>
          <a href="/about/" className="relative pb-1 py-2 border-b border-[#3B82F6]/50 hover:border-[#FFD700] hover:text-[#FFD700] transition-all duration-300">ABOUT</a>
          <a href="/contact/" className="relative pb-1 py-2 border-b border-[#3B82F6]/50 hover:border-[#FFD700] hover:text-[#FFD700] transition-all duration-300">CONTACT</a>
        </div>
      </nav>

      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 min-h-screen px-6 py-32"
      >
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="font-mono text-xs tracking-[0.3em] text-[#FFD700]/50">
              08 // FAQ
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
              Questions
            </h1>
          </div>

          {/* FAQ Items */}
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* Additional Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center pt-8"
          >
            <p 
              className="text-[#D1D5DB] mb-4"
              style={{
                textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)'
              }}
            >
              Have another question?
            </p>
            <a 
              href="/contact"
              className="inline-block font-mono text-sm text-[#FFD700] hover:text-white transition-colors duration-300 border-b border-[#FFD700]/30 hover:border-white/50"
              style={{
                textShadow: '0 2px 8px rgba(0,0,0,0.9)'
              }}
            >
              Get in touch →
            </a>
          </motion.div>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
}
