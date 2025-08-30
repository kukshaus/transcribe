'use client'

import { useState, useEffect } from 'react'

const sources = [
  { text: 'YouTube', color: 'from-red-500 to-red-700' },
  { text: 'SoundCloud', color: 'from-orange-400 to-orange-500' },
  { text: 'Audio', color: 'from-blue-400 to-blue-600' },
  { text: 'Podcasts', color: 'from-purple-400 to-purple-600' }
]

export default function RotatingText() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sources.length)
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [])

  const currentSource = sources[currentIndex]

  return (
    <div className="w-[200px] sm:w-[300px] md:w-[400px] lg:w-[500px] text-center">
      <span 
        className={`bg-gradient-to-r ${currentSource.color} bg-clip-text text-transparent font-extrabold transition-all duration-500`}
      >
        {currentSource.text}
      </span>
    </div>
  )
}
