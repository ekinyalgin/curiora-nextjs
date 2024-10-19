import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'

export async function POST(request: Request, { params }: { params: { id: string } }) {
      const session = await getServerSession(authOptions)

      if (!session || (session.user.role !== 'admin' && session.user.role !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const id = parseInt(params.id)
      const body = await request.json()
      const { isArchived } = body

      try {
            const updatedPost = await prisma.post.update({
                  where: { id },
                  data: {
                        status: isArchived ? 'archived' : 'published',
                        archivedAt: isArchived ? new Date() : null
                  }
            })

            return NextResponse.json(updatedPost)
      } catch (error) {
            console.error('Error toggling archive status:', error)
            return NextResponse.json({ error: 'Failed to toggle archive status' }, { status: 500 })
      }
}
