'use client'

export default function Footer() {
  return (
    <footer 
      className="relative z-20 border-t px-6 py-12"
      style={{
        background: 'rgba(59, 130, 246, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Column 1: Company Info */}
          <div className="space-y-2">
            <div 
              className="font-serif text-lg tracking-wider font-bold"
              style={{
                color: 'rgba(255, 215, 0, 0.9)',
                textShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
              }}
            >
              AEO TRIVECTOR LLC
            </div>
            <div className="font-mono text-xs text-gray-400">
              © 2025-2026
            </div>
            <div className="font-mono text-xs text-gray-400">
              <a 
                href="mailto:link@trivector.ai" 
                className="hover:text-[#FFD700] transition-colors duration-300"
              >
                link@trivector.ai
              </a>
            </div>
            <div className="font-mono text-xs text-gray-400">
              New Hampshire, USA
            </div>
          </div>

          {/* Column 2: Links */}
          <div className="space-y-2">
            <div className="font-mono text-xs tracking-widest uppercase text-gray-400 space-y-2">
              <div>
                <a 
                  href="/about/" 
                  className="hover:text-[#FFD700] transition-colors duration-300"
                >
                  About
                </a>
              </div>
              <div>
                <a 
                  href="/research/" 
                  className="hover:text-[#FFD700] transition-colors duration-300"
                >
                  Research
                </a>
              </div>
              <div>
                <a 
                  href="/contact/" 
                  className="hover:text-[#FFD700] transition-colors duration-300"
                >
                  Contact
                </a>
              </div>
              <div>
                <a 
                  href="https://github.com/AEO-TRIVECTOR" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FFD700] transition-colors duration-300"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Tagline */}
          <div className="flex items-end justify-start md:justify-end">
            <div 
              className="font-mono text-xs tracking-[0.3em] uppercase"
              style={{
                color: 'rgba(96, 165, 250, 0.7)',
                textShadow: '0 0 20px rgba(96, 165, 250, 0.3)',
              }}
            >
              ATTRACTOR ARCHITECTURE
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
