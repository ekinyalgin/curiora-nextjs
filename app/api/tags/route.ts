import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')

      if (id) {
            const tag = await prisma.tag.findUnique({
                  where: { id: parseInt(id) },
                  include: { language: true, image: true }
            })
            return NextResponse.json(tag)
      }

      const tags = await prisma.tag.findMany({
            include: { language: true, image: true }
      })
      return NextResponse.json(tags)
}

export async function POST(request: Request) {
      const body = await request.json()
      const { name, slug, description, imageId, languageId, seoTitle, seoDescription } = body

      try {
            const tag = await prisma.tag.create({
                  data: {
                        name,
                        slug,
                        description,
                        imageId: imageId ? parseInt(imageId) : null,
                        languageId: languageId ? parseInt(languageId) : null,
                        seoTitle,
                        seoDescription
                  }
            })

            return NextResponse.json(tag)
      } catch (error) {
            console.error('Error creating tag:', error)
            return NextResponse.json({ error: 'Error creating tag' }, { status: 500 })
      }
}

export async function PUT(request: Request) {
      const body = await request.json()
      const { id, name, slug, description, imageId, languageId, seoTitle, seoDescription } = body

      try {
            const tag = await prisma.tag.update({
                  where: { id: parseInt(id) },
                  data: {
                        name,
                        slug,
                        description,
                        imageId: imageId ? parseInt(imageId) : null,
                        languageId: languageId ? parseInt(languageId) : null,
                        seoTitle,
                        seoDescription
                  }
            })

            return NextResponse.json(tag)
      } catch (error) {
            console.error('Error updating tag:', error)
            return NextResponse.json({ error: (error as Error).message || 'Error updating tag' }, { status: 500 })
      }
}

export async function DELETE(request: Request) {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')

      if (!id) {
            return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 })
      }

      try {
            await prisma.tag.delete({
                  where: { id: parseInt(id) }
            })

            return NextResponse.json({ message: 'Tag deleted successfully' })
      } catch (error) {
            console.error('Error deleting tag:', error)
            return NextResponse.json({ error: 'Error deleting tag' }, { status: 500 })
      }
}
