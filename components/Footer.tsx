'use client'

import Logo from './Logo'
import { Github, Twitter, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <Logo size="sm" variant="light" showText={true} />
            <p className="mt-4 text-gray-300 max-w-md">
              Transform audio content from any platform into searchable text and organized notes. 
              Free, fast, and no signup required.
            </p>
            <div className="flex items-center space-x-4 mt-6">
              <a
                href="https://github.com/yourusername/transcriber"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Features */}
          <div>
            <h3 className="text-white font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-gray-300">
              <li>YouTube Transcription</li>
              <li>Spotify Transcription</li>
              <li>SoundCloud Support</li>
              <li>AI-Powered Notes</li>
              <li>Export Options</li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors duration-200">
                  How it Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors duration-200">
                  Features
                </a>
              </li>
              <li>
                <a href="https://github.com/yourusername/transcriber" className="hover:text-white transition-colors duration-200">
                  GitHub
                </a>
              </li>
              <li>
                <button className="hover:text-white transition-colors duration-200 text-left">
                  Setup Guide
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm">
            © 2024 TranscribeAI. All rights reserved.
          </p>
          <div className="flex items-center space-x-1 text-gray-400 text-sm mt-4 md:mt-0">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-400" />
            <span>for creators worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
