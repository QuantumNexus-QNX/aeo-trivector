'use client'

import { useEffect, useRef } from 'react';

interface StrangeAttractorBackgroundProps {
  className?: string;
}

export default function StrangeAttractorBackground({ className = '' }: StrangeAttractorBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Lorenz attractor parameters
    const sigma = 10.0;
    const rho = 28.0;
    const beta = 8.0 / 3.0;
    const dt = 0.005;

    // Particle system
    const particleCount = 5000;
    const particles: Array<{ x: number; y: number; z: number; history: Array<{ x: number; y: number; z: number }> }> = [];

    // Initialize particles with slight random offsets around attractor
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: Math.random() * 2 - 1 + 25,
        history: []
      });
    }

    // Projection rotation angles (slowly precessing)
    let angleX = 0;
    let angleY = 0;
    let angleZ = 0;

    // Density grid for brightness calculation
    const gridSize = 40;
    const densityGrid = new Array(gridSize * gridSize * gridSize).fill(0);

    const updateDensityGrid = () => {
      densityGrid.fill(0);
      particles.forEach(p => {
        // Map particle position to grid coordinates
        const gx = Math.floor(((p.x + 20) / 40) * gridSize);
        const gy = Math.floor(((p.y + 20) / 40) * gridSize);
        const gz = Math.floor(((p.z) / 50) * gridSize);
        if (gx >= 0 && gx < gridSize && gy >= 0 && gy < gridSize && gz >= 0 && gz < gridSize) {
          const idx = gx + gy * gridSize + gz * gridSize * gridSize;
          densityGrid[idx]++;
        }
      });
    };

    const getDensity = (x: number, y: number, z: number): number => {
      const gx = Math.floor(((x + 20) / 40) * gridSize);
      const gy = Math.floor(((y + 20) / 40) * gridSize);
      const gz = Math.floor(((z) / 50) * gridSize);
      if (gx >= 0 && gx < gridSize && gy >= 0 && gy < gridSize && gz >= 0 && gz < gridSize) {
        const idx = gx + gy * gridSize + gz * gridSize * gridSize;
        return densityGrid[idx];
      }
      return 0;
    };

    let frameCount = 0;

    const animate = () => {
      // Clear completely for pure point-like particles (no trails)
      ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update rotation angles (very slow precession)
      angleX += 0.0002;
      angleY += 0.0003;
      angleZ += 0.00015;

      // Update density grid every 10 frames
      if (frameCount % 10 === 0) {
        updateDensityGrid();
      }
      frameCount++;

      // Update and render particles
      particles.forEach(p => {
        // Lorenz equations: ẋ = σ(y-x), ẏ = x(ρ-z)-y, ż = xy-βz
        const dx = sigma * (p.y - p.x);
        const dy = p.x * (rho - p.z) - p.y;
        const dz = p.x * p.y - beta * p.z;

        p.x += dx * dt;
        p.y += dy * dt;
        p.z += dz * dt;

        // Slowly rotating projection
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const cosZ = Math.cos(angleZ);
        const sinZ = Math.sin(angleZ);

        // Rotate around X axis
        let y1 = p.y * cosX - p.z * sinX;
        let z1 = p.y * sinX + p.z * cosX;

        // Rotate around Y axis
        let x2 = p.x * cosY + z1 * sinY;
        let z2 = -p.x * sinY + z1 * cosY;

        // Rotate around Z axis
        let x3 = x2 * cosZ - y1 * sinZ;
        let y3 = x2 * sinZ + y1 * cosZ;

        // Project to 2D
        const scale = 8;
        const screenX = canvas.width / 2 + x3 * scale;
        const screenY = canvas.height / 2 + y3 * scale;

        // Density-weighted brightness (enhanced contrast)
        const density = getDensity(p.x, p.y, p.z);
        const brightness = Math.min(0.15 + density * 0.015, 0.9);
        const particleSize = 1.5 + (density > 5 ? 0.5 : 0); // Slightly larger in dense regions

        // Draw particle with subtle gold tint
        ctx.fillStyle = `rgba(180, 150, 100, ${brightness})`;
        
        // Add slight glow to dense regions
        if (density > 8) {
          ctx.shadowBlur = 2;
          ctx.shadowColor = `rgba(180, 150, 100, ${brightness * 0.5})`;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fillRect(screenX - particleSize/2, screenY - particleSize/2, particleSize, particleSize);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ opacity: 0.4 }}
    />
  );
}
