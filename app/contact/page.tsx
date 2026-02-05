'use client'

import dynamic from 'next/dynamic'

const Contact = dynamic(() => import('../../page-components/Contact'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black" />,
})

export default function ContactPage() {
  return <Contact />
}
