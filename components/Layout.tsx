'use client'

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = usePathname();
  const isEntry = location === '/';
  const isManifold = location === '/manifold';

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background text-foreground">
      {/* Navigation - Minimal and floating */}
      {!isEntry && !isManifold && (
        <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center mix-blend-difference">
          <Link href="/manifold">
            <div className="text-xl font-serif tracking-wider font-bold cursor-pointer hover:text-primary transition-colors duration-500">
              AEO TRIVECTOR
            </div>
          </Link>
          <div className="flex gap-4 md:gap-6 font-mono text-xs tracking-widest uppercase opacity-70">
            <Link 
              href="/manifold" 
              className={`relative pb-1 py-2 border-b transition-all duration-300 ${
                location === '/manifold' 
                  ? 'border-[#FFD700] text-primary' 
                  : 'border-[#3B82F6]/50 hover:border-[#FFD700] hover:text-primary'
              }`}
            >
              Vision
            </Link>
            <Link 
              href="/research" 
              className={`relative pb-1 py-2 border-b transition-all duration-300 ${
                location === '/research' 
                  ? 'border-[#FFD700] text-primary' 
                  : 'border-[#3B82F6]/50 hover:border-[#FFD700] hover:text-primary'
              }`}
            >
              Research
            </Link>
            <Link 
              href="/about" 
              className={`relative pb-1 py-2 border-b transition-all duration-300 ${
                location === '/about' 
                  ? 'border-[#FFD700] text-primary' 
                  : 'border-[#3B82F6]/50 hover:border-[#FFD700] hover:text-primary'
              }`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`relative pb-1 py-2 border-b transition-all duration-300 ${
                location === '/contact' 
                  ? 'border-[#FFD700] text-primary' 
                  : 'border-[#3B82F6]/50 hover:border-[#FFD700] hover:text-primary'
              }`}
            >
              Contact
            </Link>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        {children}
      </main>

      {/* Footer - Persistent company information */}
      {!isEntry && (
        <footer className="py-8 px-6 border-t border-white/5 backdrop-blur-sm z-10" style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              {/* Left: Company info */}
              <div className="flex flex-col gap-2">
                <span className="font-serif text-lg text-primary/80">AEO TRIVECTOR LLC</span>
                <span className="font-mono text-xs text-muted-foreground">© 2025-2026 AEO Trivector LLC</span>
                <div className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
                  <a href="mailto:link@trivector.ai" className="hover:text-primary transition-colors duration-300">
                    link@trivector.ai
                  </a>
                  <span>New Hampshire, USA</span>
                </div>
              </div>

              {/* Center: Navigation links */}
              <div className="flex flex-wrap gap-4 md:gap-6 font-mono text-xs tracking-widest uppercase opacity-70">
                <Link 
                  href="/about" 
                  className={`relative pb-1 py-2 border-b transition-all duration-300 ${
                    location === '/about' 
                      ? 'border-[#FFD700] text-primary' 
                      : 'border-[#3B82F6]/50 hover:border-[#FFD700] hover:text-primary'
                  }`}
                >
                  About
                </Link>
                <Link 
                  href="/research" 
                  className={`relative pb-1 py-2 border-b transition-all duration-300 ${
                    location === '/research' 
                      ? 'border-[#FFD700] text-primary' 
                      : 'border-[#3B82F6]/50 hover:border-[#FFD700] hover:text-primary'
                  }`}
                >
                  Research
                </Link>
                <Link 
                  href="/contact" 
                  className={`relative pb-1 py-2 border-b transition-all duration-300 ${
                    location === '/contact' 
                      ? 'border-[#FFD700] text-primary' 
                      : 'border-[#3B82F6]/50 hover:border-[#FFD700] hover:text-primary'
                  }`}
                >
                  Contact
                </Link>
                <a 
                  href="https://github.com/AEO-TRIVECTOR/trivector-research" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="relative pb-1 py-2 border-b border-[#3B82F6]/50 hover:border-[#FFD700] hover:text-primary transition-all duration-300"
                >
                  GitHub
                </a>
              </div>

              {/* Right: Tagline */}
              <div className="font-mono text-xs text-muted-foreground tracking-widest">
                ATTRACTOR ARCHITECTURE
              </div>
            </div>
          </div>
        </footer>
      )}
      
      {/* Global Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] mix-blend-overlay"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
           }}
      />
    </div>
  );
}
