import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
      const session = await getServerSession(authOptions)

      if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const id = parseInt(params.id)
      const { status, archivedAt } = await request.json()

      try {
            const updatedComment = await prisma.comment.update({
                  where: { id },
                  data: {
                        status: status as 'pending' | 'approved' | 'archived',
                        archivedAt: status === 'archived' ? (archivedAt ? new Date(archivedAt) : new Date()) : null
                  },
                  include: { user: true }
            })

            return NextResponse.json(updatedComment)
      } catch (error) {
            console.error('Error updating comment status:', error)
            return NextResponse.json({ error: 'Failed to update comment status' }, { status: 500 })
      }
}
