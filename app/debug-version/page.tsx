'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getVersionInfo } from '@/lib/version'
import { RefreshCw, Info, Server, Clock, Code } from 'lucide-react'

interface ServerVersionInfo {
  version: string
  fullVersion: string
  major: number
  minor: number
  patch: number
  build: string
  releaseDate: string
  uptime: number
  timestamp: string
  environment: string
}

export default function DebugVersionPage() {
  const [serverInfo, setServerInfo] = useState<ServerVersionInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clientInfo = getVersionInfo()

  const fetchServerInfo = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/version')
      if (!response.ok) {
        throw new Error('Failed to fetch server version info')
      }
      const data = await response.json()
      setServerInfo(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServerInfo()
  }, [])

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Info className="h-8 w-8" />
                Version Information
              </h1>
              <button
                onClick={fetchServerInfo}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Client Version */}
              <div className="bg-black/20 rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Client Version
                </h2>
                <div className="space-y-3 text-gray-300">
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <span className="font-mono text-green-400">{clientInfo.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Full Version:</span>
                    <span className="font-mono text-blue-400">{clientInfo.fullVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Build:</span>
                    <span className="font-mono text-yellow-400">{clientInfo.build}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Release Date:</span>
                    <span className="font-mono">{clientInfo.releaseDate}</span>
                  </div>
                </div>
              </div>

              {/* Server Version */}
              <div className="bg-black/20 rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Server Information
                </h2>
                {error ? (
                  <div className="text-red-400 text-center py-4">
                    <p>Error: {error}</p>
                  </div>
                ) : serverInfo ? (
                  <div className="space-y-3 text-gray-300">
                    <div className="flex justify-between">
                      <span>Version:</span>
                      <span className="font-mono text-green-400">{serverInfo.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Environment:</span>
                      <span className={`font-mono capitalize ${
                        serverInfo.environment === 'production' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {serverInfo.environment}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span className="font-mono text-blue-400">{formatUptime(serverInfo.uptime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span className="font-mono text-xs">{new Date(serverInfo.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Version Comparison */}
            {serverInfo && (
              <div className="mt-8 bg-black/20 rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Version Status
                </h2>
                <div className="flex items-center justify-center">
                  {clientInfo.version === serverInfo.version ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <div className="h-3 w-3 bg-green-400 rounded-full"></div>
                      <span>Client and server versions are synchronized</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <div className="h-3 w-3 bg-yellow-400 rounded-full"></div>
                      <span>Version mismatch detected</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Build Information */}
            <div className="mt-8 bg-black/20 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Build Details</h2>
              <div className="grid md:grid-cols-3 gap-6 text-gray-300">
                <div>
                  <span className="text-sm text-gray-400">Major Version</span>
                  <p className="text-2xl font-mono text-blue-400">{clientInfo.major}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Minor Version</span>
                  <p className="text-2xl font-mono text-green-400">{clientInfo.minor}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Patch Version</span>
                  <p className="text-2xl font-mono text-yellow-400">{clientInfo.patch}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
