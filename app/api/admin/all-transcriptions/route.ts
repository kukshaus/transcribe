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
    const transcriptionsCollection = db.collection('transcriptions')
    const usersCollection = db.collection('users')
    const anonymousUsersCollection = db.collection('anonymousUsers')

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const userId = searchParams.get('userId')
    const userFingerprint = searchParams.get('userFingerprint')
    const hasContent = searchParams.get('hasContent')

    // Build match conditions
    const matchConditions: any = {}
    
    if (status) {
      matchConditions.status = status
    }
    
    if (userId) {
      matchConditions.userId = userId
    }
    
    if (userFingerprint) {
      matchConditions.userFingerprint = userFingerprint
    }
    
    if (hasContent === 'true') {
      matchConditions.content = { 
        $exists: true, 
        $nin: [null, ''] 
      }
    } else if (hasContent === 'false') {
      matchConditions.$or = [
        { content: { $exists: false } },
        { content: null },
        { content: '' }
      ]
    }
    
    if (search) {
      matchConditions.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await transcriptionsCollection.countDocuments(matchConditions)

    // Get transcriptions with user information
    const transcriptions = await transcriptionsCollection.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'anonymousUsers',
          localField: 'userFingerprint',
          foreignField: 'fingerprint',
          as: 'anonymousUser'
        }
      },
      {
        $addFields: {
          userInfo: {
            $cond: {
              if: { $gt: [{ $size: '$user' }, 0] },
              then: {
                type: 'registered',
                name: { $arrayElemAt: ['$user.name', 0] },
                email: { $arrayElemAt: ['$user.email', 0] },
                userId: { $arrayElemAt: ['$user._id', 0] }
              },
              else: {
                $cond: {
                  if: { $gt: [{ $size: '$anonymousUser' }, 0] },
                  then: {
                    type: 'anonymous',
                    fingerprint: { $arrayElemAt: ['$anonymousUser.fingerprint', 0] },
                    ip: { $arrayElemAt: ['$anonymousUser.ip', 0] }
                  },
                  else: {
                    type: 'unknown',
                    fingerprint: '$userFingerprint'
                  }
                }
              }
            }
          }
        }
      },
             {
         $project: {
           _id: 1,
           title: 1,
           status: 1,
           createdAt: 1,
           updatedAt: 1,
           duration: 1,
           processingDuration: 1,
           error: 1,
           userInfo: 1,
           isPublic: 1,
           publicId: 1,
           url: 1,
           audioFile: 1,
           thumbnail: 1,
           content: 1,
           notes: 1,
           prd: 1
         }
       },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]).toArray()

    // Get summary statistics
    const stats = await transcriptionsCollection.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          processing: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          error: { $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] } },
          public: { $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] } }
        }
      }
    ]).toArray()

    // Get user type breakdown
    const userTypeBreakdown = await transcriptionsCollection.aggregate([
      {
        $group: {
          _id: {
            hasUserId: { $cond: [{ $ne: ['$userId', null] }, true, false] },
            hasFingerprint: { $cond: [{ $ne: ['$userFingerprint', null] }, true, false] }
          },
          count: { $sum: 1 }
        }
      }
    ]).toArray()

    return NextResponse.json({
      transcriptions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats: stats[0] || {
        total: 0,
        completed: 0,
        processing: 0,
        pending: 0,
        error: 0,
        public: 0
      },
      userTypeBreakdown: userTypeBreakdown.reduce((acc, item) => {
        if (item._id.hasUserId) {
          acc.registered = item.count
        } else if (item._id.hasFingerprint) {
          acc.anonymous = item.count
        } else {
          acc.unknown = item.count
        }
        return acc
      }, { registered: 0, anonymous: 0, unknown: 0 })
    })

  } catch (error) {
    console.error('Error fetching all transcriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch transcriptions' }, { status: 500 })
  }
}
