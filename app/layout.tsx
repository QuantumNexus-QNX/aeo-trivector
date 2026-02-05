import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#030712',
  colorScheme: 'dark',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://trivector.ai'),
  title: {
    default: 'AEO Trivector - Attractor Architecture',
    template: '%s | AEO Trivector',
  },
  description: 'Geometric foundations for interpretable AI. AI systems that are interpretable because they\'re stable—geometrically inevitable, not reverse-engineered.',
  keywords: ['AI', 'interpretable AI', 'machine learning', 'attractor architecture', 'geometric AI', 'AI safety', 'neural networks'],
  authors: [{ name: 'Jared Dunahay' }],
  creator: 'AEO Trivector',
  publisher: 'AEO Trivector LLC',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://trivector.ai',
    siteName: 'AEO Trivector',
    title: 'AEO Trivector - Attractor Architecture',
    description: 'Geometric foundations for interpretable AI. AI systems that are interpretable because they\'re stable—geometrically inevitable, not reverse-engineered.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AEO Trivector - Attractor Architecture',
    description: 'Geometric foundations for interpretable AI.',
    creator: '@aeotrivector',
  },
  alternates: {
    canonical: 'https://trivector.ai',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Load fonts asynchronously with display=swap for performance */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
          media="print"
          // @ts-expect-error - onLoad is valid for link elements
          onLoad="this.media='all'"
        />
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap"
            rel="stylesheet"
          />
        </noscript>
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
