import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(req: Request) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== 'ADMIN') {
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
