import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'

export async function GET(request: Request) {
      const { searchParams } = new URL(request.url)
      const postId = searchParams.get('postId')
      const search = searchParams.get('search') || ''
      const session = await getServerSession(authOptions)

      if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      try {
            let whereClause = {}
            if (postId) {
                  whereClause = { postId: parseInt(postId) }
            }
            if (search) {
                  whereClause = {
                        ...whereClause,
                        OR: [
                              { commentText: { contains: search, mode: 'insensitive' } },
                              { user: { name: { contains: search, mode: 'insensitive' } } },
                              { post: { title: { contains: search, mode: 'insensitive' } } }
                        ]
                  }
            }

            const comments = await prisma.comment.findMany({
                  where: whereClause,
                  include: {
                        user: {
                              select: { name: true }
                        },
                        post: {
                              select: { title: true }
                        }
                  },
                  orderBy: { createdAt: 'desc' }
            })

            return NextResponse.json(comments)
      } catch (error) {
            console.error('Error fetching comments:', error)
            return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
      }
}

export async function POST(request: Request) {
      const session = await getServerSession(authOptions)

      if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const body = await request.json()
      const { postId, userId, commentText, status, parentCommentId } = body

      if (!postId || !userId || !commentText) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      try {
            const [comment] = await prisma.$transaction([
                  prisma.comment.create({
                        data: {
                              postId: parseInt(postId),
                              userId,
                              commentText,
                              status,
                              parentCommentId: parentCommentId ? parseInt(parentCommentId) : null
                        },
                        include: {
                              user: true
                        }
                  }),
                  prisma.post.update({
                        where: { id: parseInt(postId) },
                        data: { commentCount: { increment: 1 } }
                  })
            ])

            return NextResponse.json(comment, { status: 201 })
      } catch (error) {
            console.error('Error creating comment:', error)
            return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
      }
}
