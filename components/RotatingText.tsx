'use client'

import { useState, useEffect } from 'react'

const sources = [
  { text: 'YouTube', color: 'from-red-400 to-red-600' },
  { text: 'SoundCloud', color: 'from-orange-400 to-orange-500' },
  { text: 'Audio', color: 'from-blue-400 to-blue-600' },
  { text: 'Podcasts', color: 'from-purple-400 to-purple-600' }
]

export default function RotatingText() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % sources.length)
        setIsAnimating(false)
      }, 300)
      
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [])

  const currentSource = sources[currentIndex]

  return (
    <>
      <style jsx global>{`
        @keyframes textSlideUp {
          0% { 
            opacity: 0; 
            transform: translateY(30px) scale(0.9); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes textSlideOut {
          0% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
          100% { 
            opacity: 0; 
            transform: translateY(-30px) scale(1.1); 
          }
        }
        
        .text-slide-in {
          animation: textSlideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .text-slide-out {
          animation: textSlideOut 0.3s ease-in-out forwards;
        }
      `}</style>
      
      <span className="inline-block relative" style={{ width: '700px', height: '1.2em' }}>
        <span 
          key={currentIndex}
          className={`absolute inset-0 flex items-center justify-center bg-gradient-to-r ${currentSource.color} bg-clip-text text-transparent font-extrabold transition-all duration-300 ${
            isAnimating ? 'text-slide-out' : 'text-slide-in'
          }`}
        >
          {currentSource.text}
        </span>
      </span>
    </>
  )
}
