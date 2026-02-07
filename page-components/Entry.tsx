'use client'

import { useState, useEffect, useRef } from 'react';
import AccretionDiskVisualization from '@/components/accretion-disk-visualization';

import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';

export default function Entry() {
  const [hovering, setHovering] = useState(false);
  const [approaching, setApproaching] = useState(false);
  const [ready, setReady] = useState(false);
  const [fps, setFps] = useState(60);
  const [qualityTier, setQualityTier] = useState('HIGH');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect reduced motion preference (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);
  
  // Use refs instead of setState for continuous values (kills jitter)
  const zoomRef = useRef(1.0);
  const viewYawRef = useRef(0.0);
  const viewPitchRef = useRef(0.0);
  const ringBloomRef = useRef(0.3);
  const hoverRef = useRef(0.0);
  
  // Touch gesture tracking
  const touchStartRef = useRef<{ x: number; y: number; dist: number } | null>(null);
  const lastTouchZoomRef = useRef(1.0);
  const lastTouchYawRef = useRef(0.0);
  const lastTouchPitchRef = useRef(0.0);
  
  // Camera zoom for event horizon approach
  const cameraZoom = useMotionValue(1.0);
  const ringBloom = useMotionValue(0.3);
  const hoverValue = useMotionValue(0.0);
  const darkness = useTransform(cameraZoom, [1.0, 5.0], [0, 1]);
  
  // Subscribe to motion values - update refs only (no setState)
  useEffect(() => {
    const unsubscribeZoom = cameraZoom.on('change', (latest) => {
      zoomRef.current = latest;
    });
    const unsubscribeBloom = ringBloom.on('change', (latest) => {
      ringBloomRef.current = latest;
    });
    const unsubscribeHover = hoverValue.on('change', (latest) => {
      hoverRef.current = latest;
    });
    return () => {
      unsubscribeZoom();
      unsubscribeBloom();
      unsubscribeHover();
    };
  }, [cameraZoom, ringBloom, hoverValue]);
  
  // Animate hover value smoothly when hovering state changes
  useEffect(() => {
    animate(hoverValue, hovering ? 1.0 : 0.0, {
      duration: 0.3,
      ease: "easeOut"
    });
  }, [hovering, hoverValue]);

  // Minimum dwell time before interaction activates
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 2500);
    return () => clearTimeout(timer);
  }, []);
  
  // Track mouse for view-dependent effects (2-4% Doppler micro-shift)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 0.04; // -0.02 to 0.02
      const y = (e.clientY / window.innerHeight - 0.5) * 0.04; // -0.02 to 0.02
      // Update refs only (no setState)
      viewYawRef.current = x;
      viewPitchRef.current = y;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Touch gesture handlers for mobile
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // Single touch: prepare for swipe
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          dist: 0
        };
        lastTouchYawRef.current = viewYawRef.current;
        lastTouchPitchRef.current = viewPitchRef.current;
      } else if (e.touches.length === 2) {
        // Two touches: prepare for pinch-zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        touchStartRef.current = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
          dist
        };
        lastTouchZoomRef.current = zoomRef.current;
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current || approaching) return;
      
      // Prevent default to avoid page scroll
      e.preventDefault();
      
      if (e.touches.length === 1 && touchStartRef.current.dist === 0) {
        // Single touch: swipe to rotate view
        const dx = e.touches[0].clientX - touchStartRef.current.x;
        const dy = e.touches[0].clientY - touchStartRef.current.y;
        
        // Convert pixel movement to view rotation (scaled for sensitivity)
        const yawDelta = (dx / window.innerWidth) * 0.15; // -0.075 to 0.075
        const pitchDelta = (dy / window.innerHeight) * 0.15;
        
        viewYawRef.current = lastTouchYawRef.current + yawDelta;
        viewPitchRef.current = lastTouchPitchRef.current + pitchDelta;
        
        // Clamp to reasonable ranges
        viewYawRef.current = Math.max(-0.1, Math.min(0.1, viewYawRef.current));
        viewPitchRef.current = Math.max(-0.1, Math.min(0.1, viewPitchRef.current));
      } else if (e.touches.length === 2) {
        // Two touches: pinch to zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate zoom factor from pinch distance change
        const zoomFactor = dist / touchStartRef.current.dist;
        const newZoom = lastTouchZoomRef.current * zoomFactor;
        
        // Clamp zoom to reasonable range (0.5x to 3x)
        zoomRef.current = Math.max(0.5, Math.min(3.0, newZoom));
        cameraZoom.set(zoomRef.current);
      }
    };
    
    const handleTouchEnd = () => {
      touchStartRef.current = null;
    };
    
    // Add passive: false to allow preventDefault
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [approaching, cameraZoom]);

  const handleEnter = () => {
    if (!ready || approaching) return;
    setApproaching(true);
    
    // Respect reduced motion preference
    if (prefersReducedMotion) {
      // Instant transition without animation
      setTimeout(() => {
        window.location.href = '/manifold';
      }, 150);
      return;
    }
    
    // Anticipation: ring bloom increases from 0.3 to 0.5 during 200ms pause
    animate(ringBloom, 0.5, {
      duration: 0.2,
      ease: "easeOut"
    });
    
    // 200ms anticipation pause before approach begins
    setTimeout(() => {
      // Animate camera zoom toward event horizon (deeper zoom for immersion)
      animate(cameraZoom, 12.0, {
        duration: 4.0,  // Smoother, more cinematic
        ease: [0.22, 1, 0.36, 1], // Ease-out-expo for gravitational pull feel
        onComplete: () => {
          // Hold in complete darkness before transition (600ms)
          setTimeout(() => {
            // Set flag for Manifold page fade-in
            sessionStorage.setItem('fromEventHorizon', 'true');
            window.location.href = '/manifold';
          }, 600); // Stable black hold at crossing
        }
      });
    }, 200); // Anticipation pause
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-black">
      
      {/* Darkness overlay for event horizon crossing */}
      <motion.div 
        className="absolute inset-0 bg-black pointer-events-none z-40"
        style={{ opacity: darkness }}
      />
      
      {/* Black Hole Visualization - Full Screen Background */}
      <div className="absolute inset-0">
        <AccretionDiskVisualization 
          cameraZoom={zoomRef.current} 
          viewYaw={viewYawRef.current} 
          viewPitch={viewPitchRef.current}
          hover={hoverRef.current}
          ringBloomStrength={ringBloomRef.current}
          shiftExponent={2.8}
          dopplerBlueStrength={1.4}
          redshiftWarmStrength={1.5}
        />
      </div>

      {/* Content Container - Elegant Vertical Layout */}
      <div className="absolute inset-0 flex flex-col items-center pt-8 md:pt-12 lg:pt-16">
        
        {/* Title and Subtitle Container */}
        <div className="relative z-30 text-center flex flex-col items-center gap-16 md:gap-24 lg:gap-32">
          <AnimatePresence>
            {!approaching && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              >
                {/* Main Title */}
                <h1 
                  className={`font-serif tracking-[0.2em] text-[#FCD34D] transition-all duration-1000 whitespace-nowrap ${hovering ? 'tracking-[0.25em]' : ''}`} 
                  style={{ 
                    fontSize: 'clamp(1.5rem, 5vw, 4.5rem)',
                    textShadow: '0 0 40px rgba(252, 211, 77, 0.4), 0 0 80px rgba(252, 211, 77, 0.2)',
                    fontWeight: 300,
                  }}
                >
                  AEO TRIVECTOR
                </h1>
                
                {/* Subtitle */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: ready ? 0.9 : 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <div
                    className="font-sans font-light tracking-[0.3em] md:tracking-[0.5em] text-[#3B82F6] uppercase whitespace-nowrap"
                    style={{ 
                      fontSize: 'clamp(0.6rem, 1.5vw, 1rem)',
                      textShadow: '0 0 20px rgba(96, 165, 250, 0.5)',
                      letterSpacing: '0.5em',
                    }}
                  >
                    {hovering ? "INTERPRETABILITY BY CONSTRUCTION" : "ATTRACTOR ARCHITECTURE"}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Flexible spacer */}
        <div className="flex-1 min-h-[8rem]" />

        {/* Enter CTA */}
        <div className="relative z-30 text-center mb-16 md:mb-24">
          <AnimatePresence>
            {!approaching && ready && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, delay: 1 }}
                className="flex flex-col items-center gap-8"
              >
                {/* Enter Button - Minimal, no border */}
                <button
                  onClick={handleEnter}
                  onMouseEnter={() => setHovering(true)}
                  onMouseLeave={() => setHovering(false)}
                  className="group relative pointer-events-auto bg-transparent transition-all duration-500"
                >
                  <span
                    className="block text-[#3B82F6] tracking-[0.5em] uppercase font-medium transition-all duration-500"
                    style={{
                      fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                      fontFamily: "'JetBrains Mono', monospace",
                      textShadow: hovering 
                        ? '0 0 40px rgba(96, 165, 250, 1), 0 0 80px rgba(96, 165, 250, 0.6), 0 0 120px rgba(96, 165, 250, 0.3)' 
                        : '0 0 25px rgba(96, 165, 250, 0.7), 0 0 50px rgba(96, 165, 250, 0.4)',
                      letterSpacing: '0.5em', // Fixed to prevent layout reflow
                    }}
                  >
                    ENTER
                  </span>
                  {/* Expanding underline on hover */}
                  <div 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent transition-all duration-500"
                    style={{
                      width: hovering ? '120%' : '0%',
                      boxShadow: hovering ? '0 0 10px rgba(96, 165, 250, 0.6)' : 'none',
                    }}
                  />
                </button>

                {/* Scroll Indicator */}
                <div className="flex flex-col items-center gap-2 opacity-60">
                  <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-[#3B82F6]/60 to-transparent animate-pulse" />
                  <svg
                    className="w-4 h-4 text-[#3B82F6] animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
