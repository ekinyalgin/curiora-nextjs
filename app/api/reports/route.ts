import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '../auth/[...nextauth]/route'

export async function POST(req: Request) {
      const session = await getServerSession(authOptions)
      if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { postId, commentId, category, description } = await req.json()

      try {
            const report = await prisma.report.create({
                  data: {
                        category,
                        description,
                        reporterId: session.user.id,
                        postId: postId || null,
                        commentId: commentId || null
                  }
            })

            return NextResponse.json(report, { status: 201 })
      } catch (error) {
            console.error('Error creating report:', error)
            return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
      }
}
