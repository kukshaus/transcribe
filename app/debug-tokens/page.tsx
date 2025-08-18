'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'

export default function DebugTokens() {
  const { data: session } = useSession()
  const [dbUsers, setDbUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchAllUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/users')
      if (response.ok) {
        const data = await response.json()
        setDbUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const createUser = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/create-user', {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        console.log('User creation result:', data)
        // Refresh the users list
        await fetchAllUsers()
      }
    } catch (error) {
      console.error('Error creating user:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Token Debug Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Session</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Database Users</h2>
            <div className="space-x-2">
              <button
                onClick={createUser}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Create Missing User'}
              </button>
              <button
                onClick={fetchAllUsers}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Fetch Users'}
              </button>
            </div>
          </div>
          
          {dbUsers.length > 0 && (
            <div className="space-y-4">
              {dbUsers.map((user, index) => (
                <div key={index} className="border p-4 rounded">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>ID:</strong> {user._id}</div>
                    <div><strong>Email:</strong> {user.email}</div>
                    <div><strong>Tokens:</strong> {user.tokens || 0}</div>
                    <div><strong>Created:</strong> {new Date(user.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
