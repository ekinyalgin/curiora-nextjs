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
      const { status } = body

      if (!['pending', 'approved', 'archived'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }

      try {
            const updatedComment = await prisma.comment.update({
                  where: { id },
                  data: { status: status as 'pending' | 'approved' | 'archived' },
                  include: { user: true }
            })

            return NextResponse.json(updatedComment)
      } catch (error) {
            console.error('Error updating comment status:', error)
            return NextResponse.json({ error: 'Failed to update comment status' }, { status: 500 })
      }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id)

      await prisma.comment.delete({ where: { id } })
      return NextResponse.json({ message: 'Comment deleted successfully' })
}
