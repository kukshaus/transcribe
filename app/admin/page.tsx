'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">User Details</h2>
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
                    <h2 className="text-lg font-medium text-gray-900">Recent Spending History</h2>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {selectedUser.spendingHistory.length > 0 ? (
                      selectedUser.spendingHistory.map((item) => (
                        <div key={item._id} className="px-6 py-3 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.description}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`text-sm font-medium ${
                              item.tokensChanged > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {item.tokensChanged > 0 ? '+' : ''}{item.tokensChanged}
                            </span>
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
