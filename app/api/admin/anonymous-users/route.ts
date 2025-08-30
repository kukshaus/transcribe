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
    const anonymousUsersCollection = db.collection('anonymousUsers')
    
    // Get all anonymous users with pagination support
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit
    
    // Get total count for pagination
    const totalCount = await anonymousUsersCollection.countDocuments()
    
    // Get anonymous users with pagination
    const anonymousUsers = await anonymousUsersCollection
      .find({})
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get some additional stats
    const stats = await anonymousUsersCollection.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalTranscriptions: { $sum: '$transcriptionCount' },
          transferredUsers: { $sum: { $cond: [{ $eq: ['$isTransferUsed', true] }, 1, 0] } },
          activeUsers: { $sum: { $cond: [{ $ne: ['$isTransferUsed', true] }, 1, 0] } }
        }
      }
    ]).toArray()

    const statsData = stats[0] || {
      totalUsers: 0,
      totalTranscriptions: 0,
      transferredUsers: 0,
      activeUsers: 0
    }

    return NextResponse.json({
      anonymousUsers: anonymousUsers.map(user => ({
        _id: user._id.toString(),
        fingerprint: user.fingerprint,
        ip: user.ip,
        userAgent: user.userAgent,
        transcriptionCount: user.transcriptionCount,
        isTransferUsed: user.isTransferUsed || false,
        transferredToUserId: user.transferredToUserId,
        transferredAt: user.transferredAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats: statsData
    })
  } catch (error) {
    console.error('Error fetching anonymous users for admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
