import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs/promises'
import { format } from 'date-fns'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'

export async function POST(req: Request) {
      const session = await getServerSession(authOptions)
      if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      try {
            const formData = await req.formData()
            const file = formData.get('file') as File

            if (!file) {
                  return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
            }

            const buffer = Buffer.from(await file.arrayBuffer())
            const fileName = file.name
            const fileExtension = path.extname(fileName)

            // Benzersiz bir dosya adı oluştur
            const uniqueFileName = `${uuidv4()}${fileExtension}`

            // Yıl ve ay bazlı klasör yapısı oluştur
            const now = new Date()
            const year = format(now, 'yyyy')
            const month = format(now, 'MM')
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', year, month)
            await fs.mkdir(uploadDir, { recursive: true })

            const filePath = path.join(uploadDir, uniqueFileName)
            const publicPath = `/uploads/${year}/${month}/${uniqueFileName}`

            // Dosyayı kaydet
            await fs.writeFile(filePath, buffer)

            // Dosya boyutunu al
            const stats = await fs.stat(filePath)
            const fileSizeInBytes = stats.size

            // Veritabanına kaydet
            const media = await prisma.media.create({
                  data: {
                        fileName: uniqueFileName,
                        filePath: publicPath,
                        fileType: file.type,
                        fileSize: fileSizeInBytes,
                        userId: session.user.id
                  }
            })

            return NextResponse.json(media)
      } catch (error) {
            console.error('Error uploading image:', error)
            return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
      }
}
