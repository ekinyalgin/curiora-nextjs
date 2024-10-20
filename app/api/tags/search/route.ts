import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
      const { searchParams } = new URL(request.url)
      const term = searchParams.get('term')

      if (!term) {
            return NextResponse.json({ error: 'Search term is required' }, { status: 400 })
      }

      try {
            const tags = await prisma.tag.findMany({
                  where: {
                        OR: [{ name: { contains: term } }, { description: { contains: term } }]
                  },
                  include: { language: true }
            })
            return NextResponse.json(tags)
      } catch (error) {
            console.error('Error searching tags:', error)
            return NextResponse.json({ error: 'Error searching tags' }, { status: 500 })
      }
}
