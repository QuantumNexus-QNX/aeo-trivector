'use client'

import dynamic from 'next/dynamic'

const Mathematics = dynamic(() => import('../../page-components/Mathematics'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black" />,
})

export default function MathematicsPage() {
  return <Mathematics />
}
