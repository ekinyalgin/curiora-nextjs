import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import slugify from 'slugify'

export async function GET(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id)
      const category = await prisma.category.findUnique({
            where: { id },
            include: { language: true, parent: true, image: true }
      })

      if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }

      return NextResponse.json(category)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id)
      const body = await request.json()
      const { name, slug, description, languageId, parentId, seoDescription, seoTitle, imageId } = body

      const finalSlug = slug || slugify(name, { lower: true, strict: true })

      try {
            const updatedCategory = await prisma.category.update({
                  where: { id },
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
            return NextResponse.json(updatedCategory)
      } catch (error) {
            console.error('Failed to update category:', error)
            return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
      }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id)

      try {
            await prisma.category.delete({
                  where: { id }
            })
            return NextResponse.json({ message: 'Category deleted successfully' })
      } catch (error) {
            console.error('Failed to delete category:', error)
            return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
      }
}
