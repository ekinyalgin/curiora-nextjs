import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'

export async function GET(request: Request) {
      const { searchParams } = new URL(request.url)
      const postId = searchParams.get('postId')
      const session = await getServerSession(authOptions)

      if (!postId) {
            return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
      }

      const isAdmin = session?.user?.role === 'admin'

      const comments = await prisma.comment.findMany({
            where: {
                  postId: parseInt(postId),
                  parentCommentId: null, // Only fetch top-level comments
                  ...(isAdmin ? {} : { status: 'approved' }) // If not admin, only fetch approved comments
            },
            include: {
                  user: true,
                  childComments: {
                        include: {
                              user: true,
                              childComments: {
                                    include: {
                                          user: true
                                    }
                              },
                              ...(isAdmin ? {} : { where: { status: 'approved' } }) // If not admin, only fetch approved child comments
                        }
                  }
            },
            orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json(comments)
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
