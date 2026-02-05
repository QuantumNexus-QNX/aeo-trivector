# AEO Trivector - Attractor Architecture

Research company website showcasing geometric foundations for interpretable AI.

## Tech Stack

- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **Three.js** for 3D visualizations (Lorenz Attractor, Black Hole)
- **shadcn/ui** components

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Deployment

This site is configured for deployment on Vercel with the following domains:

- **Primary**: aeotrivector.com
- **Redirects**: aeotrivector.ai → aeotrivector.com
- **Redirects**: trivector.ai → aeotrivector.com

## Project Structure

```
├── app/                  # Next.js App Router pages
├── page-components/      # Page-level React components
├── components/           # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── public/               # Static assets
```

## Features

- **Entry Page**: Stunning black hole visualization with accretion disk
- **Manifold Page**: Three core pillars of the framework
- **Research Page**: Publications and open source work
- **Mathematics Page**: Technical formalism and equations
- **About Page**: Founder information
- **Contact Page**: Contact form and newsletter signup
- **FAQ Page**: Common questions

## Design System

- **Color Palette**: Dark background with gold (#FFD700) and blue (#3B82F6) accents
- **Typography**: Cormorant Garamond (serif) + JetBrains Mono (monospace)
- **Aesthetic**: Selegant (serene + elegant), minimal, cinematic

## License

All rights reserved © 2025-2026 AEO Trivector LLC
