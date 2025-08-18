'use client'

import { Mic } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'light' | 'dark'
  showText?: boolean
}

export default function Logo({ size = 'md', variant = 'light', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }
  
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  }
  
  const iconColor = variant === 'light' ? 'text-white' : 'text-purple-600'
  const textColor = variant === 'light' ? 'text-white' : 'text-gray-900'
  
  return (
    <div className="flex items-center space-x-3">
      {/* Logo Icon */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Background gradient circle */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 rounded-full shadow-lg"></div>
        
        {/* Icon */}
        <div className="relative flex items-center justify-center h-full w-full">
          <Mic className={`${sizeClasses[size]} text-white p-1.5`} />
        </div>
        
        {/* Audio wave effect */}
        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2">
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-2 bg-gradient-to-t from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
            <div className="w-0.5 h-3 bg-gradient-to-t from-purple-400 to-pink-400 rounded-full animate-pulse delay-75"></div>
            <div className="w-0.5 h-1.5 bg-gradient-to-t from-purple-400 to-pink-400 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${textSizeClasses[size]} ${textColor} leading-tight`}>
            TranscribeAI
          </span>
          {size === 'lg' && (
            <span className={`text-sm ${variant === 'light' ? 'text-gray-300' : 'text-gray-500'} font-medium`}>
              Audio Transcript Generator
            </span>
          )}
        </div>
      )}
    </div>
  )
}
