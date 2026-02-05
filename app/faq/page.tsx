'use client'

import dynamic from 'next/dynamic'

const FAQ = dynamic(() => import('../../page-components/FAQ'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black" />,
})

export default function FAQPage() {
  return <FAQ />
}
