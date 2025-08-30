import { NextRequest, NextResponse } from 'next/server'
import { checkAdminPermission } from '@/lib/admin'
import { getDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminPermission()
    
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection('users')
    const anonymousUsersCollection = db.collection('anonymousUsers')
    const transcriptionsCollection = db.collection('transcriptions')

    // Get analytics for the last 30 days
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    const endDate = new Date()
    // Set end date to end of today to include today's data
    endDate.setHours(23, 59, 59, 999)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Generate date range for the last N days
    const dateRange = []
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      dateRange.push({
        date: date.toISOString().split('T')[0],
        timestamp: date
      })
    }

    // Get daily user registrations
    const userRegistrations = await usersCollection.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      }
    ]).toArray()

    // Get daily anonymous user creations
    const anonymousUserCreations = await anonymousUsersCollection.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      }
    ]).toArray()

    // Get daily transcription counts
    const transcriptionCounts = await transcriptionsCollection.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      }
    ]).toArray()

    // Combine data into daily statistics
    const dailyStats = dateRange.map(({ date, timestamp }) => {
      const userReg = userRegistrations.find(r => r._id === date)?.count || 0
      const anonUser = anonymousUserCreations.find(r => r._id === date)?.count || 0
      const transcriptions = transcriptionCounts.find(r => r._id === date)?.count || 0
      
      return {
        date,
        timestamp,
        newUsers: userReg,
        newAnonymousUsers: anonUser,
        totalVisitors: userReg + anonUser,
        transcriptions
      }
    })

    // Calculate summary statistics
    const totalNewUsers = dailyStats.reduce((sum, day) => sum + day.newUsers, 0)
    const totalNewAnonymousUsers = dailyStats.reduce((sum, day) => sum + day.newAnonymousUsers, 0)
    const totalVisitors = dailyStats.reduce((sum, day) => sum + day.totalVisitors, 0)
    const totalTranscriptions = dailyStats.reduce((sum, day) => sum + day.transcriptions, 0)

    // Get current totals
    const totalUsers = await usersCollection.countDocuments()
    const totalAnonymousUsers = await anonymousUsersCollection.countDocuments()
    const totalAllTranscriptions = await transcriptionsCollection.countDocuments()

    return NextResponse.json({
      dailyStats,
      summary: {
        totalNewUsers,
        totalNewAnonymousUsers,
        totalVisitors,
        totalTranscriptions,
        totalUsers,
        totalAnonymousUsers,
        totalAllTranscriptions
      }
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
