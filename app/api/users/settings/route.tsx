import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'

export async function GET() {
      const session = await getServerSession(authOptions)

      if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const userSettings = await prisma.userSettings.findUnique({
            where: { userId: session.user.id },
            include: {
                  user: true,
                  language: true
            }
      })

      if (!userSettings) {
            return NextResponse.json({ error: 'User settings not found' }, { status: 404 })
      }

      return NextResponse.json(userSettings)
}

export async function PUT(request: Request) {
      const session = await getServerSession(authOptions)

      if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const data = await request.json()

      const updatedSettings = await prisma.userSettings.upsert({
            where: { userId: session.user.id },
            update: {
                  languageId: parseInt(data.languagePreference),
                  themePreference: data.themePreference,
                  bio: data.bio
            },
            create: {
                  userId: session.user.id,
                  languageId: parseInt(data.languagePreference),
                  themePreference: data.themePreference,
                  bio: data.bio
            },
            include: {
                  language: true
            }
      })

      return NextResponse.json(updatedSettings)
}
