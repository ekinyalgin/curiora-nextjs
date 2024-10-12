import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id)
      const comment = await prisma.comment.findUnique({
            where: { id },
            include: { user: true, post: true }
      })

      if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
      }

      return NextResponse.json(comment)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id)
      const body = await request.json()

      const updatedComment = await prisma.comment.update({
            where: { id },
            data: body,
            include: { user: true, post: true }
      })

      return NextResponse.json(updatedComment)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
      const session = await getServerSession(authOptions)

      if (!session || (session.user.role !== 'admin' && session.user.role !== 1)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const id = parseInt(params.id)
      const body = await request.json()
      const { status, isDeleted } = body

      try {
            const updatedComment = await prisma.comment.update({
                  where: { id },
                  data: {
                        ...(status && { status: status as 'pending' | 'approved' | 'archived' }),
                        ...(isDeleted !== undefined && { isDeleted })
                  },
                  include: { user: true }
            })

            return NextResponse.json(updatedComment)
      } catch (error) {
            console.error('Error updating comment:', error)
            return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 })
      }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
      const session = await getServerSession(authOptions)

      if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const id = parseInt(params.id)

      try {
            // Önce alt yorumları silelim
            await prisma.comment.deleteMany({
                  where: {
                        parentCommentId: id
                  }
            })

            // Şimdi ana yorumu silelim
            await prisma.comment.delete({
                  where: { id }
            })

            return NextResponse.json({ message: 'Comment and its replies deleted successfully' })
      } catch (error) {
            console.error('Error deleting comment:', error)
            return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
      }
}
