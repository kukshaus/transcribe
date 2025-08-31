'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AnalyticsChart from '@/components/AnalyticsChart'
import AdminTranscriptionCard from '@/components/AdminTranscriptionCard'

interface User {
  _id: string
  email: string
  name: string
  tokens: number
  isAdmin: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface UserDetails {
  user: User
  transcriptions: any[]
  spendingHistory: any[]
  stats: {
    totalTranscriptions: number
    completedTranscriptions: number
    totalSpent: number
    totalEarned: number
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentForm, setPaymentForm] = useState({
    userId: '',
    tokensToGrant: 0,
    reason: '',
    stripeSessionId: ''
  })
  const [activeTab, setActiveTab] = useState<'users' | 'anonymous' | 'analytics' | 'transcriptions'>('users')
  const [anonymousUsers, setAnonymousUsers] = useState<any[]>([])
  const [anonymousStats, setAnonymousStats] = useState<any>(null)
  const [anonymousLoading, setAnonymousLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [allTranscriptions, setAllTranscriptions] = useState<any[]>([])
  const [transcriptionsStats, setTranscriptionsStats] = useState<any>(null)
  const [transcriptionsLoading, setTranscriptionsLoading] = useState(false)
  const [transcriptionsPagination, setTranscriptionsPagination] = useState<any>(null)
  const [transcriptionsFilters, setTranscriptionsFilters] = useState({
    page: 1,
    limit: 50,
    status: '',
    search: '',
    userId: '',
    userFingerprint: '',
    hasContent: ''
  })

  const impersonateUser = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      
      if (response.ok) {
        // Redirect to the main app as the impersonated user
        window.location.href = '/'
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to impersonate user')
      }
    } catch (error) {
      console.error('Error impersonating user:', error)
      setError('Failed to impersonate user')
    }
  }

  const fetchAnonymousUsers = async () => {
    setAnonymousLoading(true)
    try {
      const response = await fetch('/api/admin/anonymous-users')
      if (response.ok) {
        const data = await response.json()
        setAnonymousUsers(data.anonymousUsers)
        setAnonymousStats(data.stats)
      } else {
        setError('Failed to fetch anonymous users')
      }
    } catch (error) {
      console.error('Error fetching anonymous users:', error)
      setError('Failed to fetch anonymous users')
    } finally {
      setAnonymousLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true)
    try {
      const response = await fetch('/api/admin/analytics?days=30')
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        setError('Failed to fetch analytics')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError('Failed to fetch analytics')
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const fetchAllTranscriptions = async () => {
    setTranscriptionsLoading(true)
    try {
      const params = new URLSearchParams({
        page: transcriptionsFilters.page.toString(),
        limit: transcriptionsFilters.limit.toString(),
        ...(transcriptionsFilters.status && { status: transcriptionsFilters.status }),
        ...(transcriptionsFilters.search && { search: transcriptionsFilters.search }),
        ...(transcriptionsFilters.userId && { userId: transcriptionsFilters.userId }),
        ...(transcriptionsFilters.userFingerprint && { userFingerprint: transcriptionsFilters.userFingerprint }),
        ...(transcriptionsFilters.hasContent && { hasContent: transcriptionsFilters.hasContent })
      })
      
      const response = await fetch(`/api/admin/all-transcriptions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAllTranscriptions(data.transcriptions)
        setTranscriptionsStats(data.stats)
        setTranscriptionsPagination(data.pagination)
      } else {
        setError('Failed to fetch transcriptions')
      }
    } catch (error) {
      console.error('Error fetching transcriptions:', error)
      setError('Failed to fetch transcriptions')
    } finally {
      setTranscriptionsLoading(false)
    }
  }


  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Check if user is admin
    checkAdminStatus()
  }, [session, status, router])

  useEffect(() => {
    if (activeTab === 'anonymous' && session?.user?.isAdmin) {
      fetchAnonymousUsers()
    }
    if (activeTab === 'analytics' && session?.user?.isAdmin) {
      fetchAnalytics()
    }
    if (activeTab === 'transcriptions' && session?.user?.isAdmin) {
      fetchAllTranscriptions()
    }
  }, [activeTab, session])

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.status === 403) {
        setError('Admin access required')
        router.push('/')
        return
      }
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setError('Failed to verify admin status')
    }
  }

  const fetchUserDetails = async (userId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedUser(data)
      } else {
        setError('Failed to fetch user details')
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
      setError('Failed to fetch user details')
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userId: string, updates: any) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        // Refresh users list
        const usersResponse = await fetch('/api/admin/users')
        if (usersResponse.ok) {
          const data = await usersResponse.json()
          setUsers(data.users)
        }
        
        // Refresh selected user if it's the same user
        if (selectedUser && selectedUser.user._id === userId) {
          await fetchUserDetails(userId)
        }
        
        return true
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update user')
        return false
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setError('Failed to update user')
      return false
    }
  }

  const handlePaymentFailure = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentForm.userId || paymentForm.tokensToGrant <= 0) {
      setError('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('/api/admin/payment-failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm)
      })
      
      if (response.ok) {
        const data = await response.json()
        alert(`Success: ${data.message}`)
        setPaymentForm({ userId: '', tokensToGrant: 0, reason: '', stripeSessionId: '' })
        
        // Refresh users list
        const usersResponse = await fetch('/api/admin/users')
        if (usersResponse.ok) {
          const data = await usersResponse.json()
          setUsers(data.users)
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to process payment failure')
      }
    } catch (error) {
      console.error('Error handling payment failure:', error)
      setError('Failed to process payment failure')
    }
  }

  const handleDownload = async (id: string, type: 'transcription' | 'notes' | 'notion' | 'prd' | 'audio') => {
    try {
      const transcription = allTranscriptions.find(t => t._id?.toString() === id)
      const title = transcription?.title || 'content'
      
      const response = await fetch(`/api/download?id=${id}&type=${type}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        
        // Get filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition')
        let filename = `${type}.txt`
        
        if (contentDisposition) {
          // Try to extract filename from Content-Disposition header
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '')
          }
        }
        
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Download failed:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const handleGeneratePRD = async (id: string) => {
    try {
      const response = await fetch('/api/generate-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcriptionId: id })
      })
      
      if (response.ok) {
        // Refresh transcriptions to show the new PRD
        await fetchAllTranscriptions()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to generate PRD')
      }
    } catch (error) {
      console.error('Error generating PRD:', error)
      setError('Failed to generate PRD')
    }
  }

  const handleGenerateNotes = async (id: string) => {
    try {
      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcriptionId: id })
      })
      
      if (response.ok) {
        // Refresh transcriptions to show the new notes
        await fetchAllTranscriptions()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to generate notes')
      }
    } catch (error) {
      console.error('Error generating notes:', error)
      setError('Failed to generate notes')
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage users, tokens, and payment issues</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Logged in as: {session?.user?.email}
              </span>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back to App
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Registered Users ({users.length})
              </button>
                             <button
                 onClick={() => setActiveTab('anonymous')}
                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
                   activeTab === 'anonymous'
                     ? 'border-blue-500 text-blue-600'
                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                 }`}
               >
                 Anonymous Users {anonymousStats && `(${anonymousStats.totalUsers})`}
               </button>
                             <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('transcriptions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transcriptions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Transcriptions {transcriptionsStats && `(${transcriptionsStats.total})`}
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Users ({users.length})</h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className={`px-6 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedUser?.user._id === user._id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => fetchUserDetails(user._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name || 'No name'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{user.tokens} tokens</p>
                        <div className="flex items-center space-x-2">
                          {user.isAdmin && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Admin
                            </span>
                          )}
                          {!user.isActive && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="lg:col-span-2">
            {selectedUser ? (
              <div className="space-y-6">
                                 {/* User Info */}
                 <div className="bg-white rounded-lg shadow">
                   <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                     <h2 className="text-lg font-medium text-gray-900">User Details</h2>
                     <button
                       onClick={() => impersonateUser(selectedUser.user._id)}
                       className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                     >
                       View as User
                     </button>
                   </div>
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          value={selectedUser.user.name || ''}
                          onChange={(e) => updateUser(selectedUser.user._id, { name: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          value={selectedUser.user.email}
                          disabled
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tokens</label>
                        <input
                          type="number"
                          value={selectedUser.user.tokens}
                          onChange={(e) => updateUser(selectedUser.user._id, { tokens: parseInt(e.target.value) })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedUser.user.isAdmin}
                            onChange={(e) => updateUser(selectedUser.user._id, { isAdmin: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Admin</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedUser.user.isActive}
                            onChange={(e) => updateUser(selectedUser.user._id, { isActive: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Active</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Statistics</h2>
                  </div>
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{selectedUser.stats.totalTranscriptions}</p>
                        <p className="text-sm text-gray-500">Total Transcriptions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{selectedUser.stats.completedTranscriptions}</p>
                        <p className="text-sm text-gray-500">Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{selectedUser.stats.totalSpent}</p>
                        <p className="text-sm text-gray-500">Tokens Spent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{selectedUser.stats.totalEarned}</p>
                        <p className="text-sm text-gray-500">Tokens Earned</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Transcriptions */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Recent Transcriptions</h2>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {selectedUser.transcriptions.length > 0 ? (
                      selectedUser.transcriptions.map((transcription) => (
                        <div key={transcription._id} className="px-6 py-3 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{transcription.title || 'Untitled'}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(transcription.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              transcription.status === 'completed' ? 'bg-green-100 text-green-800' :
                              transcription.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              transcription.status === 'error' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {transcription.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-4 text-center text-gray-500">
                        No transcriptions found
                      </div>
                    )}
                  </div>
                </div>

                {/* Spending History */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Complete Spending History ({selectedUser.spendingHistory.length} entries)</h2>
                  </div>
                  <div className="overflow-y-auto max-h-none">
                    {selectedUser.spendingHistory.length > 0 ? (
                      selectedUser.spendingHistory.map((item) => (
                        <div key={item._id} className="px-6 py-3 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.description}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`text-sm font-medium ${
                                item.tokensChanged > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {item.tokensChanged > 0 ? '+' : ''}{item.tokensChanged}
                              </span>
                              {item.balanceAfter !== undefined && (
                                <p className="text-xs text-gray-400">Balance: {item.balanceAfter}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-4 text-center text-gray-500">
                        No spending history found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">Select a user to view details</p>
                </div>
              </div>
            )}
          </div>
                 </div>
        )}

        {activeTab === 'anonymous' && (
          <div className="space-y-6">
            {/* Anonymous Users Stats */}
            {anonymousStats && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Anonymous Users Statistics</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{anonymousStats.totalUsers}</p>
                      <p className="text-sm text-gray-500">Total Anonymous Users</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{anonymousStats.totalTranscriptions}</p>
                      <p className="text-sm text-gray-500">Total Transcriptions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{anonymousStats.transferredUsers}</p>
                      <p className="text-sm text-gray-500">Transferred to Users</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{anonymousStats.activeUsers}</p>
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
                {anonymousLoading ? (
                  <div className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading anonymous users...</p>
                  </div>
                ) : anonymousUsers.length > 0 ? (
                  anonymousUsers.map((user) => (
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
                  ))
                ) : (
                  <div className="px-6 py-4 text-center text-gray-500">
                    No anonymous users found
                  </div>
                )}
              </div>
            </div>
          </div>
                 )}

         {activeTab === 'analytics' && (
           <div className="space-y-6">
                           {/* Analytics Summary */}
              {analyticsData && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Analytics Summary (Last 30 Days)</h2>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                      </div>
                      <button
                        onClick={fetchAnalytics}
                        disabled={analyticsLoading}
                        className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {analyticsLoading ? 'Refreshing...' : 'Refresh'}
                      </button>
                    </div>
                  </div>
                 <div className="px-6 py-4">
                   <div className="grid grid-cols-4 gap-4">
                     <div className="text-center">
                       <p className="text-2xl font-bold text-blue-600">{analyticsData.summary.totalNewUsers}</p>
                       <p className="text-sm text-gray-500">New Registered Users</p>
                     </div>
                     <div className="text-center">
                       <p className="text-2xl font-bold text-purple-600">{analyticsData.summary.totalNewAnonymousUsers}</p>
                       <p className="text-sm text-gray-500">New Anonymous Users</p>
                     </div>
                     <div className="text-center">
                       <p className="text-2xl font-bold text-green-600">{analyticsData.summary.totalTranscriptions}</p>
                       <p className="text-sm text-gray-500">Total Transcriptions</p>
                     </div>
                     <div className="text-center">
                       <p className="text-2xl font-bold text-orange-600">{analyticsData.summary.totalVisitors}</p>
                       <p className="text-sm text-gray-500">Total Visitors</p>
                     </div>
                   </div>
                 </div>
               </div>
                           )}

              {/* Today's Activity */}
              {analyticsData && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Today's Activity</h2>
                  </div>
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {analyticsData.dailyStats[analyticsData.dailyStats.length - 1]?.newUsers || 0}
                        </p>
                        <p className="text-sm text-gray-500">New Users Today</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {analyticsData.dailyStats[analyticsData.dailyStats.length - 1]?.newAnonymousUsers || 0}
                        </p>
                        <p className="text-sm text-gray-500">Anonymous Users Today</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {analyticsData.dailyStats[analyticsData.dailyStats.length - 1]?.transcriptions || 0}
                        </p>
                        <p className="text-sm text-gray-500">Transcriptions Today</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {analyticsData.dailyStats[analyticsData.dailyStats.length - 1]?.totalVisitors || 0}
                        </p>
                        <p className="text-sm text-gray-500">Total Visitors Today</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics Chart */}
             <div className="bg-white rounded-lg shadow">
               <div className="px-6 py-4 border-b border-gray-200">
                 <h2 className="text-lg font-medium text-gray-900">Daily Visitor Analytics</h2>
               </div>
               <div className="px-6 py-4">
                 {analyticsLoading ? (
                   <div className="flex items-center justify-center h-64">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                     <p className="ml-2 text-gray-500">Loading analytics...</p>
                   </div>
                 ) : analyticsData ? (
                   <AnalyticsChart 
                     data={analyticsData.dailyStats} 
                     title="Daily Visitor Trends"
                     height={400}
                   />
                 ) : (
                   <div className="text-center text-gray-500 h-64 flex items-center justify-center">
                     No analytics data available
                   </div>
                 )}
               </div>
             </div>

             {/* Overall Statistics */}
             {analyticsData && (
               <div className="bg-white rounded-lg shadow">
                 <div className="px-6 py-4 border-b border-gray-200">
                   <h2 className="text-lg font-medium text-gray-900">Overall Statistics</h2>
                 </div>
                 <div className="px-6 py-4">
                   <div className="grid grid-cols-3 gap-4">
                     <div className="text-center">
                       <p className="text-2xl font-bold text-blue-600">{analyticsData.summary.totalUsers}</p>
                       <p className="text-sm text-gray-500">Total Registered Users</p>
                     </div>
                     <div className="text-center">
                       <p className="text-2xl font-bold text-purple-600">{analyticsData.summary.totalAnonymousUsers}</p>
                       <p className="text-sm text-gray-500">Total Anonymous Users</p>
                     </div>
                     <div className="text-center">
                       <p className="text-2xl font-bold text-green-600">{analyticsData.summary.totalAllTranscriptions}</p>
                       <p className="text-sm text-gray-500">Total All-Time Transcriptions</p>
                     </div>
                   </div>
                 </div>
               </div>
             )}
           </div>
         )}

         {activeTab === 'transcriptions' && (
           <div className="space-y-6">
             {/* Transcriptions Statistics */}
             {transcriptionsStats && (
               <div className="bg-white rounded-lg shadow">
                 <div className="px-6 py-4 border-b border-gray-200">
                   <h2 className="text-lg font-medium text-gray-900">Transcriptions Overview</h2>
                 </div>
                 <div className="px-6 py-4">
                   <div className="grid grid-cols-6 gap-4">
                     <div className="text-center">
                       <p className="text-2xl font-bold text-blue-600">{transcriptionsStats.total}</p>
                       <p className="text-sm text-gray-500">Total</p>
                     </div>
                     <div className="text-center">
                       <p className="text-2xl font-bold text-green-600">{transcriptionsStats.completed}</p>
                       <p className="text-sm text-gray-500">Completed</p>
                     </div>
                     <div className="text-center">
                       <p className="text-2xl font-bold text-yellow-600">{transcriptionsStats.processing}</p>
                       <p className="text-sm text-gray-500">Processing</p>
                     </div>
                     <div className="text-center">
                       <p className="text-2xl font-bold text-gray-600">{transcriptionsStats.pending}</p>
                       <p className="text-sm text-gray-500">Pending</p>
                     </div>
                     <div className="text-center">
                       <p className="text-2xl font-bold text-red-600">{transcriptionsStats.error}</p>
                       <p className="text-sm text-gray-500">Error</p>
                     </div>
                     <div className="text-center">
                       <p className="text-2xl font-bold text-purple-600">{transcriptionsStats.public}</p>
                       <p className="text-sm text-gray-500">Public</p>
                     </div>
                   </div>
                 </div>
               </div>
             )}

             {/* Filters */}
             <div className="bg-white rounded-lg shadow">
               <div className="px-6 py-4 border-b border-gray-200">
                 <h2 className="text-lg font-medium text-gray-900">Filters</h2>
               </div>
               <div className="px-6 py-4">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700">Search</label>
                     <input
                       type="text"
                       value={transcriptionsFilters.search}
                       onChange={(e) => {
                         setTranscriptionsFilters({ ...transcriptionsFilters, search: e.target.value, page: 1 })
                         setTimeout(() => fetchAllTranscriptions(), 500)
                       }}
                       className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                       placeholder="Search by title or content..."
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700">Status</label>
                     <select
                       value={transcriptionsFilters.status}
                       onChange={(e) => {
                         setTranscriptionsFilters({ ...transcriptionsFilters, status: e.target.value, page: 1 })
                         setTimeout(() => fetchAllTranscriptions(), 100)
                       }}
                       className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                     >
                       <option value="">All Statuses</option>
                       <option value="completed">Completed</option>
                       <option value="processing">Processing</option>
                       <option value="pending">Pending</option>
                       <option value="error">Error</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700">User ID</label>
                     <input
                       type="text"
                       value={transcriptionsFilters.userId}
                       onChange={(e) => {
                         setTranscriptionsFilters({ ...transcriptionsFilters, userId: e.target.value, page: 1 })
                         setTimeout(() => fetchAllTranscriptions(), 500)
                       }}
                       className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                       placeholder="Filter by user ID..."
                     />
                   </div>
                                        <div>
                       <label className="block text-sm font-medium text-gray-700">Fingerprint</label>
                       <input
                         type="text"
                         value={transcriptionsFilters.userFingerprint}
                         onChange={(e) => {
                           setTranscriptionsFilters({ ...transcriptionsFilters, userFingerprint: e.target.value, page: 1 })
                           setTimeout(() => fetchAllTranscriptions(), 500)
                         }}
                         className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                         placeholder="Filter by fingerprint..."
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Has Content</label>
                       <select
                         value={transcriptionsFilters.hasContent || ''}
                         onChange={(e) => {
                           setTranscriptionsFilters({ ...transcriptionsFilters, hasContent: e.target.value, page: 1 })
                           setTimeout(() => fetchAllTranscriptions(), 100)
                         }}
                         className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                       >
                         <option value="">All</option>
                         <option value="true">With Content</option>
                         <option value="false">Without Content</option>
                       </select>
                     </div>
                 </div>
                 <div className="mt-4 flex justify-between items-center">
                   <div className="flex items-center space-x-4">
                     <label className="flex items-center">
                       <span className="text-sm text-gray-700 mr-2">Show:</span>
                       <select
                         value={transcriptionsFilters.limit}
                         onChange={(e) => {
                           setTranscriptionsFilters({ ...transcriptionsFilters, limit: parseInt(e.target.value), page: 1 })
                           setTimeout(() => fetchAllTranscriptions(), 100)
                         }}
                         className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                       >
                         <option value={25}>25</option>
                         <option value={50}>50</option>
                         <option value={100}>100</option>
                       </select>
                     </label>
                   </div>
                   <button
                     onClick={fetchAllTranscriptions}
                     disabled={transcriptionsLoading}
                     className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {transcriptionsLoading ? 'Refreshing...' : 'Refresh'}
                   </button>
                 </div>
               </div>
             </div>

                           {/* Transcriptions Cards */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">All Transcriptions</h2>
                </div>
                <div className="p-6">
                  {transcriptionsLoading ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading transcriptions...</p>
                    </div>
                  ) : allTranscriptions.length > 0 ? (
                    <div className="space-y-6">
                      {allTranscriptions.map((transcription) => (
                        <AdminTranscriptionCard
                          key={transcription._id}
                          transcription={transcription}
                          onDownload={handleDownload}
                          onGeneratePRD={handleGeneratePRD}
                          onGenerateNotes={handleGenerateNotes}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      No transcriptions found
                    </div>
                  )}
                </div>
               
               {/* Pagination */}
               {transcriptionsPagination && transcriptionsPagination.totalPages > 1 && (
                 <div className="px-6 py-4 border-t border-gray-200">
                   <div className="flex items-center justify-between">
                     <div className="text-sm text-gray-500">
                       Showing {((transcriptionsPagination.page - 1) * transcriptionsPagination.limit) + 1} to {Math.min(transcriptionsPagination.page * transcriptionsPagination.limit, transcriptionsPagination.total)} of {transcriptionsPagination.total} results
                     </div>
                     <div className="flex items-center space-x-2">
                       <button
                         onClick={() => {
                           if (transcriptionsPagination.page > 1) {
                             setTranscriptionsFilters({ ...transcriptionsFilters, page: transcriptionsPagination.page - 1 })
                             setTimeout(() => fetchAllTranscriptions(), 100)
                           }
                         }}
                         disabled={transcriptionsPagination.page <= 1}
                         className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         Previous
                       </button>
                       <span className="text-sm text-gray-500">
                         Page {transcriptionsPagination.page} of {transcriptionsPagination.totalPages}
                       </span>
                       <button
                         onClick={() => {
                           if (transcriptionsPagination.page < transcriptionsPagination.totalPages) {
                             setTranscriptionsFilters({ ...transcriptionsFilters, page: transcriptionsPagination.page + 1 })
                             setTimeout(() => fetchAllTranscriptions(), 100)
                           }
                         }}
                         disabled={transcriptionsPagination.page >= transcriptionsPagination.totalPages}
                         className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         Next
                       </button>
                     </div>
                   </div>
                 </div>
               )}
             </div>
           </div>
         )}

         {/* Payment Failure Handler */}
         <div className="mt-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Payment Failure Handler</h2>
            </div>
            <div className="px-6 py-4">
              <form onSubmit={handlePaymentFailure} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <input
                      type="text"
                      value={paymentForm.userId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, userId: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter user ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tokens to Grant</label>
                    <input
                      type="number"
                      value={paymentForm.tokensToGrant}
                      onChange={(e) => setPaymentForm({ ...paymentForm, tokensToGrant: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Number of tokens"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <input
                    type="text"
                    value={paymentForm.reason}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reason: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Payment failure reason"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stripe Session ID (Optional)</label>
                  <input
                    type="text"
                    value={paymentForm.stripeSessionId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, stripeSessionId: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Stripe session ID for reference"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Grant Tokens for Payment Failure
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
