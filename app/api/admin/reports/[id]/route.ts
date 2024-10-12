import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '../../../auth/[...nextauth]/route'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { id } = params
      const { status } = await req.json()

      try {
            const updatedReport = await prisma.report.update({
                  where: { id },
                  data: { status }
            })

            return NextResponse.json(updatedReport)
      } catch (error) {
            console.error('Error updating report:', error)
            return NextResponse.json({ error: 'Failed to update report' }, { status: 500 })
      }
}
