import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs/promises'
import axios from 'axios'
import { format } from 'date-fns'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'

export async function POST(req: Request) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      try {
            const { url } = await req.json()

            if (!url) {
                  return NextResponse.json({ error: 'URL is required' }, { status: 400 })
            }

            // URL'den dosya adını al
            const fileName = path.basename(new URL(url).pathname)

            // Yıl ve ay bazlı klasör yapısı oluştur
            const now = new Date()
            const year = format(now, 'yyyy')
            const month = format(now, 'MM')
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', year, month)
            await fs.mkdir(uploadDir, { recursive: true })

            const filePath = path.join(uploadDir, fileName)
            const publicPath = `/uploads/${year}/${month}/${fileName}`

            // URL'den görseli indir
            const response = await axios.get(url, { responseType: 'arraybuffer' })
            const buffer = Buffer.from(response.data, 'binary')

            // Görseli kaydet
            await fs.writeFile(filePath, buffer)

            // Dosya boyutunu al
            const stats = await fs.stat(filePath)
            const fileSizeInBytes = stats.size

            // Veritabanına kaydet
            const media = await prisma.media.create({
                  data: {
                        fileName: fileName,
                        filePath: publicPath,
                        fileType: response.headers['content-type'],
                        fileSize: fileSizeInBytes,
                        userId: session.user.id
                  }
            })

            return NextResponse.json(media)
      } catch (error) {
            console.error('Error uploading image from URL:', error)
            return NextResponse.json({ error: 'Failed to upload image from URL' }, { status: 500 })
      }
}
