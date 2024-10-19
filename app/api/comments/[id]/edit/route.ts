import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
      const session = await getServerSession(authOptions)
      if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const id = parseInt(params.id)
      const { commentText } = await request.json()

      try {
            const comment = await prisma.comment.findUnique({ where: { id } })
            if (!comment) {
                  return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
            }

            if (comment.userId !== session.user.id && session.user.role !== 'admin') {
                  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }

            const updatedComment = await prisma.comment.update({
                  where: { id },
                  data: { commentText },
                  include: { user: true }
            })

            return NextResponse.json(updatedComment)
      } catch (error) {
            console.error('Error updating comment text:', error)
            return NextResponse.json({ error: 'Failed to update comment text' }, { status: 500 })
      }
}
