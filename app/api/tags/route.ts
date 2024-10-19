import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSlug } from '@/components/ui/slug-input'

export async function GET() {
      const tags = await prisma.tag.findMany({
            include: { language: true }
      })
      return NextResponse.json(tags)
}

async function generateUniqueSlug(baseSlug: string): Promise<string> {
      let slug = baseSlug
      let counter = 1
      let isUnique = false

      while (!isUnique) {
            const existingTag = await prisma.tag.findUnique({ where: { slug } })
            if (!existingTag) {
                  isUnique = true
            } else {
                  slug = `${baseSlug}-${counter}`
                  counter++
            }
      }

      return slug
}

export async function POST(request: Request) {
      try {
            const body = await request.json()
            const { name, slug, description, language_id, featuredImageId } = body

            console.log('Received data:', { name, slug, description, language_id })

            const finalSlug = !slug ? await generateUniqueSlug(createSlug(name)) : slug

            const tag = await prisma.tag.create({
                  data: {
                        name,
                        slug: finalSlug,
                        description,
                        language_id: language_id ? parseInt(language_id) : null,
                        featuredImageId: featuredImageId ? parseInt(featuredImageId) : null
                  },
                  include: { language: true, featuredImage: true }
            })

            console.log('Created tag:', tag)

            return NextResponse.json(tag, { status: 201 })
      } catch (error) {
            console.error('Error creating tag:', error)
            return NextResponse.json(
                  { error: 'Failed to create tag', details: error instanceof Error ? error.message : 'Unknown error' },
                  { status: 500 }
            )
      }
}
