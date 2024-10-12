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
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const id = parseInt(params.id)
      const { action } = await request.json()

      try {
            let updatedComment

            switch (action) {
                  case 'approve':
                        updatedComment = await prisma.comment.update({
                              where: { id },
                              data: { status: 'approved' }
                        })
                        break
                  case 'pending':
                        updatedComment = await prisma.comment.update({
                              where: { id },
                              data: { status: 'pending' }
                        })
                        break
                  case 'archive':
                        updatedComment = await prisma.comment.update({
                              where: { id },
                              data: { status: 'archived', archivedAt: new Date() }
                        })
                        break
                  case 'softDelete':
                        updatedComment = await prisma.comment.update({
                              where: { id },
                              data: { isDeleted: true }
                        })
                        break
                  case 'hardDelete':
                        updatedComment = await prisma.comment.delete({
                              where: { id }
                        })
                        break
                  default:
                        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
            }

            return NextResponse.json(updatedComment)
      } catch (error) {
            console.error('Error updating comment:', error)
            return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 })
      }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
      const session = await getServerSession(authOptions)

      if (!session || (session.user.role !== 'admin' && session.user.role !== 1)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const id = parseInt(params.id)
      const body = await request.json()
      const { status, isDeleted, archivedAt } = body

      try {
            const updatedComment = await prisma.comment.update({
                  where: { id },
                  data: {
                        ...(status && {
                              status: status as 'pending' | 'approved' | 'archived',
                              // Eğer status 'archived' değilse, archivedAt'i null yap
                              archivedAt:
                                    status === 'archived' ? (archivedAt ? new Date(archivedAt) : new Date()) : null
                        }),
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
            const comment = await prisma.comment.findUnique({
                  where: { id },
                  include: { childComments: true }
            })

            if (!comment) {
                  return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
            }

            const totalComments = 1 + comment.childComments.length // Parent + children

            const [deletedComment, updatedPost] = await prisma.$transaction([
                  prisma.comment.delete({
                        where: { id }
                  }),
                  prisma.post.update({
                        where: { id: comment.postId },
                        data: { commentCount: { decrement: totalComments } }
                  })
            ])

            return NextResponse.json({ message: 'Comment and its replies deleted successfully' })
      } catch (error) {
            console.error('Error deleting comment:', error)
            return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
      }
}
