import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(req: Request) {
      const session = await getServerSession(authOptions)
      if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      try {
            const reports = await prisma.report.findMany({
                  include: {
                        post: { select: { reportCount: true } },
                        comment: { select: { reportCount: true } }
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
