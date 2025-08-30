'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AnalyticsChart from '@/components/AnalyticsChart'

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
  const [activeTab, setActiveTab] = useState<'users' | 'anonymous' | 'analytics'>('users')
  const [anonymousUsers, setAnonymousUsers] = useState<any[]>([])
  const [anonymousStats, setAnonymousStats] = useState<any>(null)
  const [anonymousLoading, setAnonymousLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

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

  const grantTokens = async () => {
    if (!paymentForm.userId || paymentForm.tokensToGrant <= 0) {
      setError('Please select a user and enter a valid token amount')
      return
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: paymentForm.userId,
          tokens: paymentForm.tokensToGrant,
          reason: paymentForm.reason,
          stripeSessionId: paymentForm.stripeSessionId
        })
      })

      if (response.ok) {
        // Reset form
        setPaymentForm({
          userId: '',
          tokensToGrant: 0,
          reason: '',
          stripeSessionId: ''
        })
        
        // Refresh users list
        const usersResponse = await fetch('/api/admin/users')
        if (usersResponse.ok) {
          const data = await usersResponse.json()
          setUsers(data.users)
        }
        
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to grant tokens')
      }
    } catch (error) {
      console.error('Error granting tokens:', error)
      setError('Failed to grant tokens')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage users, tokens, and system analytics</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('anonymous')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'anonymous'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Anonymous Users
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Users List */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Users</h2>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.name?.charAt(0) || user.email.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.name || 'No name'}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-400 font-medium">{user.tokens} tokens</span>
                        <button
                          onClick={() => fetchUserDetails(user._id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => impersonateUser(user._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Impersonate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grant Tokens Form */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Grant Tokens</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select User
                    </label>
                    <select
                      value={paymentForm.userId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, userId: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="">Choose a user...</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name || user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tokens to Grant
                    </label>
                    <input
                      type="number"
                      value={paymentForm.tokensToGrant}
                      onChange={(e) => setPaymentForm({ ...paymentForm, tokensToGrant: parseInt(e.target.value) || 0 })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      placeholder="Enter token amount"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reason (Optional)
                    </label>
                    <input
                      type="text"
                      value={paymentForm.reason}
                      onChange={(e) => setPaymentForm({ ...paymentForm, reason: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      placeholder="e.g., Customer support, Promotional"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Stripe Session ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={paymentForm.stripeSessionId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, stripeSessionId: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      placeholder="cs_test_..."
                    />
                  </div>
                  
                  <button
                    onClick={grantTokens}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Grant Tokens
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Anonymous Users Tab */}
        {activeTab === 'anonymous' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Anonymous Users</h2>
            {anonymousLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading anonymous users...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {anonymousStats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-400">{anonymousStats.totalUsers}</div>
                      <div className="text-gray-400 text-sm">Total Anonymous Users</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-400">{anonymousStats.totalTranscriptions}</div>
                      <div className="text-gray-400 text-sm">Total Transcriptions</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400">{anonymousStats.totalDuration}</div>
                      <div className="text-gray-400 text-sm">Total Duration (min)</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-400">{anonymousStats.avgTranscriptionsPerUser}</div>
                      <div className="text-gray-400 text-sm">Avg Transcriptions/User</div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  {anonymousUsers.map((user, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Anonymous User {index + 1}</p>
                        <p className="text-gray-400 text-sm">Fingerprint: {user.fingerprint}</p>
                        <p className="text-gray-400 text-sm">Transcriptions: {user.transcriptionCount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-medium">{user.totalDuration} min</p>
                        <p className="text-gray-400 text-sm">{user.lastActivity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Analytics (Last 30 Days)</h2>
            {analyticsLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading analytics...</div>
              </div>
            ) : analyticsData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-400">{analyticsData.totalUsers}</div>
                    <div className="text-gray-400 text-sm">Total Users</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400">{analyticsData.totalTranscriptions}</div>
                    <div className="text-gray-400 text-sm">Total Transcriptions</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">{analyticsData.totalRevenue}</div>
                    <div className="text-gray-400 text-sm">Total Revenue ($)</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-yellow-400">{analyticsData.avgTranscriptionsPerUser}</div>
                    <div className="text-gray-400 text-sm">Avg Transcriptions/User</div>
                  </div>
                </div>
                
                {analyticsData.chartData && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Transcription Activity</h3>
                    <AnalyticsChart data={analyticsData.chartData} />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400">No analytics data available</div>
              </div>
            )}
          </div>
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">User Details</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">User Information</h3>
                  <p><strong>Name:</strong> {selectedUser.user.name || 'No name'}</p>
                  <p><strong>Email:</strong> {selectedUser.user.email}</p>
                  <p><strong>Tokens:</strong> {selectedUser.user.tokens}</p>
                  <p><strong>Admin:</strong> {selectedUser.user.isAdmin ? 'Yes' : 'No'}</p>
                  <p><strong>Active:</strong> {selectedUser.user.isActive ? 'Yes' : 'No'}</p>
                  <p><strong>Created:</strong> {new Date(selectedUser.user.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Statistics</h3>
                  <p><strong>Total Transcriptions:</strong> {selectedUser.stats.totalTranscriptions}</p>
                  <p><strong>Completed Transcriptions:</strong> {selectedUser.stats.completedTranscriptions}</p>
                  <p><strong>Total Spent:</strong> ${selectedUser.stats.totalSpent}</p>
                  <p><strong>Total Earned:</strong> ${selectedUser.stats.totalEarned}</p>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Recent Transcriptions</h3>
                  <div className="space-y-2">
                    {selectedUser.transcriptions.slice(0, 5).map((transcription: any) => (
                      <div key={transcription._id} className="flex items-center justify-between">
                        <span className="text-sm">{transcription.title || 'Untitled'}</span>
                        <span className="text-sm text-gray-400">{transcription.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Recent Spending</h3>
                  <div className="space-y-2">
                    {selectedUser.spendingHistory.slice(0, 5).map((spending: any) => (
                      <div key={spending._id} className="flex items-center justify-between">
                        <span className="text-sm">{spending.description}</span>
                        <span className="text-sm text-gray-400">${spending.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
