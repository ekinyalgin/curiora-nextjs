import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import slugify from 'slugify'

export async function GET(request: Request) {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get('search')

      let categories

      if (search) {
            const searchLower = search.toLowerCase()
            categories = await prisma.category.findMany({
                  where: {
                        OR: [
                              { name: { contains: searchLower } },
                              { slug: { contains: searchLower } },
                              { description: { contains: searchLower } }
                        ]
                  },
                  include: { language: true, parent: true, children: true, image: true }
            })
      } else {
            categories = await prisma.category.findMany({
                  include: { language: true, parent: true, children: true, image: true }
            })
      }

      return NextResponse.json(categories)
}

export async function POST(request: Request) {
      try {
            const body = await request.json()
            const { name, slug, description, languageId, parentId, seoDescription, seoTitle, imageId } = body

            const finalSlug = slug || slugify(name, { lower: true, strict: true })

            const category = await prisma.category.create({
                  data: {
                        name,
                        slug: finalSlug,
                        description,
                        languageId: languageId ? parseInt(languageId) : null,
                        parentId: parentId ? parseInt(parentId) : null,
                        seoDescription,
                        seoTitle,
                        imageId: imageId ? parseInt(imageId) : null
                  },
                  include: { language: true, parent: true, image: true }
            })

            return NextResponse.json(category, { status: 201 })
      } catch (error) {
            console.error('Error creating category:', error)
            return NextResponse.json(
                  {
                        error: 'Failed to create category',
                        details: error instanceof Error ? error.message : 'Unknown error'
                  },
                  { status: 500 }
            )
      }
}
