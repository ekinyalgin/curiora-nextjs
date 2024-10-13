import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(req: Request) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== 1) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { searchParams } = new URL(req.url)
      const filter = searchParams.get('filter')
      const category = searchParams.get('category')

      let whereClause: any = {}

      if (filter === 'post') {
            whereClause.postId = { not: null }
      } else if (filter === 'comment') {
            whereClause.commentId = { not: null }
      }

      if (category && category !== 'all') {
            whereClause.category = category
      }

      try {
            const reports = await prisma.report.findMany({
                  where: whereClause,
                  include: {
                        post: {
                              select: {
                                    reportCount: true,
                                    id: true,
                                    title: true,
                                    slug: true,
                                    status: true
                              }
                        },
                        comment: {
                              select: {
                                    reportCount: true,
                                    id: true,
                                    commentText: true,
                                    status: true,
                                    isDeleted: true
                              }
                        },
                        reporter: {
                              select: {
                                    name: true,
                                    username: true
                              }
                        }
                  },
                  orderBy: { createdAt: 'desc' }
            })

            const formattedReports = reports.map((report) => ({
                  ...report,
                  reportCount: report.postId ? report.post?.reportCount : report.comment?.reportCount
            }))

            return NextResponse.json(formattedReports)
      } catch (error) {
            console.error('Error fetching reports:', error)
            return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
      }
}

export async function POST(req: Request) {
      const session = await getServerSession(authOptions)
      if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { postId, commentId, category, description } = await req.json()

      try {
            const report = await prisma.$transaction(async (prisma) => {
                  const newReport = await prisma.report.create({
                        data: {
                              category,
                              description,
                              reporterId: session.user.id,
                              postId: postId || null,
                              commentId: commentId || null
                        }
                  })

                  if (postId) {
                        await prisma.post.update({
                              where: { id: postId },
                              data: { reportCount: { increment: 1 } }
                        })
                  } else if (commentId) {
                        await prisma.comment.update({
                              where: { id: commentId },
                              data: { reportCount: { increment: 1 } }
                        })
                  }

                  return newReport
            })

            return NextResponse.json(report, { status: 201 })
      } catch (error) {
            console.error('Error creating report:', error)
            return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
      }
}
