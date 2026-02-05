'use client'

import dynamic from 'next/dynamic'

const Entry = dynamic(() => import('../page-components/Entry'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black" />,
})

export default function Home() {
  return <Entry />
}
