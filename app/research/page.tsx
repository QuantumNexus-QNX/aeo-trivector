'use client'

import dynamic from 'next/dynamic'

const Research = dynamic(() => import('../../page-components/Research'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black" />,
})

export default function ResearchPage() {
  return <Research />
}
