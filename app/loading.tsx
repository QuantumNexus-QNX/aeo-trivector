export default function Loading() {
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center">
      <div className="relative">
        {/* Central pulsing dot */}
        <div
          className="w-3 h-3 rounded-full animate-pulse"
          style={{
            background: '#FFD700',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3)',
          }}
        />
        {/* Orbital rings */}
        <div
          className="absolute inset-0 -m-4 border border-[#FFD700]/20 rounded-full animate-spin"
          style={{ animationDuration: '3s' }}
        />
        <div
          className="absolute inset-0 -m-8 border border-[#3B82F6]/15 rounded-full animate-spin"
          style={{ animationDuration: '5s', animationDirection: 'reverse' }}
        />
      </div>
    </div>
  )
}
