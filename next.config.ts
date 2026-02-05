import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  trailingSlash: false,

  // Optimize build
  reactStrictMode: true,
  poweredByHeader: false,

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Experimental optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      'recharts',
      'date-fns',
    ],
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize Three.js bundle
    config.resolve.alias = {
      ...config.resolve.alias,
      'three': 'three/src/Three.js',
    }

    // Don't parse Three.js examples (they're pre-compiled)
    config.module.noParse = /three\/examples/

    return config
  },
}

export default nextConfig
