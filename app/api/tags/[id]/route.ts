import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSlug } from '@/components/ui/slug-input'

// generateUniqueSlug fonksiyonunu burada yeniden tanımlıyoruz
async function generateUniqueSlug(baseSlug: string, existingId?: number): Promise<string> {
      let slug = baseSlug
      let counter = 1
      let isUnique = false

      while (!isUnique) {
            const existingTag = await prisma.tag.findFirst({
                  where: {
                        slug: slug,
                        ...(existingId && { id: { not: existingId } })
                  }
            })

            if (!existingTag) {
                  isUnique = true
            } else {
                  slug = `${baseSlug}-${counter}`
                  counter++
            }
      }

      return slug
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
      console.log('Received params:', params)
      console.log('Received ID:', params.id)

      if (!params.id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
      }

      const id = parseInt(params.id)
      console.log('Parsed ID:', id)

      if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
      }

      try {
            const tag = await prisma.tag.findUnique({
                  where: { id },
                  include: {
                        language: true,
                        image: true // featuredImage yerine image kullanıyoruz
                  }
            })

            if (!tag) {
                  return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
            }

            return NextResponse.json(tag)
      } catch (error) {
            console.error('Error fetching tag:', error)
            return NextResponse.json(
                  { error: 'Failed to fetch tag', details: error instanceof Error ? error.message : 'Unknown error' },
                  { status: 500 }
            )
      }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id)
      const body = await request.json()
      const { name, slug, description, languageId, imageId, seoTitle, seoDescription } = body

      let finalSlug = slug
      if (!finalSlug) {
            finalSlug = await generateUniqueSlug(createSlug(name), id)
      }

      try {
            const updatedTag = await prisma.tag.update({
                  where: { id },
                  data: {
                        name,
                        slug: finalSlug,
                        description,
                        languageId: languageId ? parseInt(languageId) : null,
                        imageId: imageId ? parseInt(imageId) : null,
                        seoTitle,
                        seoDescription
                  },
                  include: { language: true, image: true }
            })
            return NextResponse.json(updatedTag)
      } catch (error) {
            console.error('Error updating tag:', error)
            return NextResponse.json(
                  { error: 'Failed to update tag', details: error instanceof Error ? error.message : 'Unknown error' },
                  { status: 500 }
            )
      }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id)

      try {
            await prisma.tag.delete({
                  where: { id } // Sadece id kullanıyoruz
            })
            return NextResponse.json({ message: 'Tag deleted successfully' })
      } catch (error) {
            console.error('Error deleting tag:', error)
            return NextResponse.json(
                  { error: 'Failed to delete tag', details: error instanceof Error ? error.message : 'Unknown error' },
                  { status: 500 }
            )
      }
}
