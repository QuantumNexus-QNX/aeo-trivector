'use client'

import dynamic from 'next/dynamic'

const Manifold = dynamic(() => import('../../page-components/Manifold'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black" />,
})

export default function ManifoldPage() {
  return <Manifold />
}
