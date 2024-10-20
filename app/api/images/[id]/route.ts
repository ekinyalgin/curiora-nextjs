import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id)

      try {
            const media = await prisma.media.findUnique({
                  where: { id }
            })

            if (!media) {
                  return NextResponse.json({ error: 'Image not found' }, { status: 404 })
            }

            const filePath = path.join(process.cwd(), 'public', media.filePath)
            const fileBuffer = fs.readFileSync(filePath)

            return new NextResponse(fileBuffer, {
                  headers: {
                        'Content-Type': media.fileType,
                        'Cache-Control': 'public, max-age=31536000, immutable'
                  }
            })
      } catch (error) {
            console.error('Error fetching image:', error)
            return NextResponse.json({ error: 'Error fetching image' }, { status: 500 })
      }
}
