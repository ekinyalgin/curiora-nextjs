import { NextResponse } from 'next/server'
import { mkdir, readdir } from 'fs/promises'
import { join, parse } from 'path'
import sharp from 'sharp'
import slugify from 'slugify'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'

const prisma = new PrismaClient()

export async function POST(request: Request) {
      const session = await getServerSession(authOptions)
      if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const data = await request.formData()
      const file: File | null = data.get('file') as unknown as File

      if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Dosya adını oluştur
      const originalName = file.name.split('.').slice(0, -1).join('.')
      const fileExtension = 'webp'
      const fileName = `${slugify(originalName, { lower: true, strict: true })}.${fileExtension}`

      // Yıl ve ay klasörlerini oluştur
      const now = new Date()
      const year = now.getFullYear().toString()
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      const uploadDir = join(process.cwd(), 'public', 'uploads', year, month)

      try {
            await mkdir(uploadDir, { recursive: true })
      } catch (error) {
            console.error('Error creating directory:', error)
            return NextResponse.json({ error: 'Failed to create upload directory' }, { status: 500 })
      }

      // Dosya yolunu oluştur ve varsa numaralandır
      let filePath = join(uploadDir, fileName)
      const fileNameWithoutExt = parse(fileName).name
      let fileNumber = 1

      while (true) {
            try {
                  await readdir(filePath)
                  filePath = join(uploadDir, `${fileNameWithoutExt}-${fileNumber}.${fileExtension}`)
                  fileNumber++
            } catch {
                  // Dosya bulunamadı, bu isimle kaydedebiliriz
                  break
            }
      }

      // Görüntüyü WebP formatına dönüştür ve kaydet
      try {
            await sharp(buffer).webp({ quality: 80 }).toFile(filePath)
      } catch (error) {
            console.error('Error processing image:', error)
            return NextResponse.json({ error: 'Failed to process image' }, { status: 500 })
      }

      // Dosya boyutunu al
      const { size } = await sharp(filePath).metadata()

      // Veritabanına kaydet
      try {
            const media = await prisma.media.create({
                  data: {
                        fileName: parse(filePath).base,
                        filePath: `/uploads/${year}/${month}/${parse(filePath).base}`,
                        fileType: 'image/webp',
                        fileSize: size || 0,
                        userId: session.user.id
                  }
            })

            return NextResponse.json(media)
      } catch (error) {
            console.error('Error saving to database:', error)
            return NextResponse.json({ error: 'Failed to save file information' }, { status: 500 })
      }
}
