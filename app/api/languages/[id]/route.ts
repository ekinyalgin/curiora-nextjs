import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'

export async function GET(request: Request, { params }: { params: { id: string } }) {
      const session = await getServerSession(authOptions)
      if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      try {
            const language = await prisma.language.findUnique({
                  where: { id: parseInt(params.id) }
            })

            if (!language) {
                  return NextResponse.json({ error: 'Language not found' }, { status: 404 })
            }

            return NextResponse.json(language)
      } catch (error) {
            console.error('Error fetching language:', error)
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
      }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
      const session = await getServerSession(authOptions)
      if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { code, name, isDefault } = await request.json()
      if (!code || !name) {
            return NextResponse.json({ error: 'Code and name are required' }, { status: 400 })
      }

      try {
            // Eğer dil varsayılan olarak ayarlanıyorsa, diğer dillerin varsayılan durumunu kaldır
            if (isDefault) {
                  await prisma.language.updateMany({
                        where: {
                              isDefault: true,
                              id: { not: parseInt(params.id) }
                        },
                        data: { isDefault: false }
                  })
            }

            const updatedLanguage = await prisma.language.update({
                  where: { id: parseInt(params.id) },
                  data: {
                        code,
                        name,
                        isDefault: isDefault || false
                  }
            })

            return NextResponse.json(updatedLanguage)
      } catch (error) {
            console.error('Error updating language:', error)
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
      }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
      const session = await getServerSession(authOptions)
      if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      try {
            await prisma.language.delete({
                  where: { id: parseInt(params.id) }
            })

            return NextResponse.json({ message: 'Language deleted successfully' })
      } catch (error) {
            console.error('Error deleting language:', error)
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
