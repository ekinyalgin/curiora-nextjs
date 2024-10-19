import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'

export async function GET() {
      const session = await getServerSession(authOptions)
      if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      try {
            const languages = await prisma.language.findMany()
            return NextResponse.json(languages)
      } catch (error) {
            console.error('Error fetching languages:', error)
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
      }
}

export async function POST(request: Request) {
      const session = await getServerSession(authOptions)
      if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { code, name, isDefault } = await request.json()
      if (!code || !name) {
            return NextResponse.json({ error: 'Code and name are required' }, { status: 400 })
      }

      try {
            // Eğer yeni dil varsayılan olarak ayarlanıyorsa, diğer dillerin varsayılan durumunu kaldır
            if (isDefault) {
                  await prisma.language.updateMany({
                        where: { isDefault: true },
                        data: { isDefault: false }
                  })
            }

            const language = await prisma.language.create({
                  data: {
                        code,
                        name,
                        isDefault: isDefault || false
                  }
            })
            return NextResponse.json(language)
      } catch (error) {
            console.error('Error creating language:', error)
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
      }
}
