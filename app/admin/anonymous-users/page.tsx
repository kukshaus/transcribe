'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AnonymousUser {
  _id: string
  fingerprint: string
  ip: string
  userAgent: string
  transcriptionCount: number
  isTransferUsed: boolean
  transferredToUserId?: string
  transferredAt?: Date
  createdAt: Date
  updatedAt: Date
}

interface AnonymousStats {
  totalUsers: number
  totalTranscriptions: number
  transferredUsers: number
  activeUsers: number
}

export default function AnonymousUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [anonymousUsers, setAnonymousUsers] = useState<AnonymousUser[]>([])
  const [stats, setStats] = useState<AnonymousStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Check if user is admin
    checkAdminStatus()
  }, [session, status, router])

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.status === 403) {
        setError('Admin access required')
        router.push('/')
        return
      }
      if (response.ok) {
        fetchAnonymousUsers()
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setError('Failed to verify admin status')
    }
  }

  const fetchAnonymousUsers = async (page = 1) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/anonymous-users?page=${page}&limit=50`)
      if (response.ok) {
        const data = await response.json()
        setAnonymousUsers(data.anonymousUsers)
        setStats(data.stats)
        setCurrentPage(data.pagination.page)
        setTotalPages(data.pagination.totalPages)
      } else {
        setError('Failed to fetch anonymous users')
      }
    } catch (error) {
      console.error('Error fetching anonymous users:', error)
      setError('Failed to fetch anonymous users')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchAnonymousUsers(page)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Access Denied</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Anonymous Users</h1>
              <p className="text-gray-600">Monitor anonymous user activity and transfers</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Logged in as: {session?.user?.email}
              </span>
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back to Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        {stats && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Anonymous Users Statistics</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
                  <p className="text-sm text-gray-500">Total Anonymous Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.totalTranscriptions}</p>
                  <p className="text-sm text-gray-500">Total Transcriptions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.transferredUsers}</p>
                  <p className="text-sm text-gray-500">Transferred to Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{stats.activeUsers}</p>
                  <p className="text-sm text-gray-500">Active Anonymous</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Anonymous Users List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Anonymous Users List</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-6 py-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading anonymous users...</p>
              </div>
            ) : anonymousUsers.length > 0 ? (
              <>
                {anonymousUsers.map((user) => (
                  <div key={user._id} className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            Fingerprint: {user.fingerprint.substring(0, 8)}...
                          </p>
                          {user.isTransferUsed && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Transferred
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          IP: {user.ip} • Transcriptions: {user.transcriptionCount}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {new Date(user.createdAt).toLocaleDateString()} at {new Date(user.createdAt).toLocaleTimeString()}
                        </p>
                        {user.transferredToUserId && (
                          <p className="text-xs text-blue-600 mt-1">
                            Transferred to user: {user.transferredToUserId}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{user.transcriptionCount} transcriptions</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                No anonymous users found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
