import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createReadStream } from 'fs'
import { join } from 'path'
import { stat, unlink, rename } from 'fs/promises'
import { Readable } from 'stream'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function GET(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id)
      const media = await prisma.media.findUnique({
            where: { id }
      })

      if (!media) {
            return NextResponse.json({ error: 'Media not found' }, { status: 404 })
      }

      const filePath = join(process.cwd(), 'public', media.filePath)

      try {
            const stats = await stat(filePath)
            const fileStream = createReadStream(filePath)
            const webReadableStream = Readable.toWeb(fileStream) as ReadableStream

            return new NextResponse(webReadableStream, {
                  headers: {
                        'Content-Type': media.fileType,
                        'Content-Length': stats.size.toString()
                  }
            })
      } catch (error) {
            console.error('Error reading file:', error)
            return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id)

      try {
            const media = await prisma.media.findUnique({ where: { id } })
            if (!media) {
                  return NextResponse.json({ error: 'Media not found' }, { status: 404 })
            }

            // Dosya yolunu oluştur
            const filePath = join(process.cwd(), 'public', media.filePath)

            // Dosyayı silmeyi dene
            try {
                  await delay(1000) // 1 second delay
                  await unlink(filePath)
            } catch (unlinkError) {
                  console.error('Error deleting file:', unlinkError)

                  // If deleting fails, try renaming
                  const newPath = `${filePath}.deleted`
                  try {
                        await rename(filePath, newPath)
                        console.log('File renamed instead of deleted')
                  } catch (renameError) {
                        console.error('Error renaming file:', renameError)
                        console.warn('Could not delete or rename file, but will remove database entry')
                  }
            }

            // Veritabanından kaydı sil
            await prisma.media.delete({ where: { id } })

            return NextResponse.json({ message: 'Media deleted successfully' })
      } catch (error) {
            console.error('Error deleting media:', error)
            return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
      }
}
