import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'

export async function GET(request: Request) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { searchParams } = new URL(request.url)
      const search = searchParams.get('search') || ''
      const date = searchParams.get('date') || 'all'
      const folder = searchParams.get('folder') || ''

      const whereClause: {
            userId: string
            fileName?: { contains: string }
            createdAt?: { gte: Date }
            filePath?: { startsWith: string }
      } = {
            userId: session.user.id
      }

      if (search) {
            whereClause.fileName = { contains: search }
      }

      if (date !== 'all') {
            const monthsAgo = parseInt(date)
            const dateLimit = new Date()
            dateLimit.setMonth(dateLimit.getMonth() - monthsAgo)
            whereClause.createdAt = { gte: dateLimit }
      }

      if (folder) {
            whereClause.filePath = { startsWith: `/uploads/${folder}` }
      }

      const media = await prisma.media.findMany({
            where: whereClause,
            include: { user: true },
            orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json(media)
}
