'use client'

import Logo from './Logo'
import { Github, Twitter, Heart, CheckCircle } from 'lucide-react'
import { getVersionString } from '@/lib/version'

export default function Footer() {
  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="sm:col-span-2 lg:col-span-2">
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

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">LINKS</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li>
                <a href="/pricing" className="hover:text-white transition-colors duration-200">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">LEGAL</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li>
                <a href="/terms" className="hover:text-white transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-white transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 TranscribeAI. All rights reserved.
            </p>
            <span className="text-gray-500 text-xs bg-gray-800 px-2 py-1 rounded">
              v{getVersionString()}
            </span>
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>All systems operational</span>
            </div>
          </div>
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
