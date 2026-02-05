'use client'

import dynamic from 'next/dynamic'

const About = dynamic(() => import('../../page-components/About'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black" />,
})

export default function AboutPage() {
  return <About />
}
