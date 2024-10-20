import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import slugify from 'slugify'

// GET - Retrieve a single post
export async function GET(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id)

      try {
            const post = await prisma.post.findUnique({
                  where: { id },
                  include: {
                        user: {
                              include: {
                                    role: true
                              }
                        },
                        category: true,
                        language: true,
                        tags: true,
                        image: true
                  }
            })

            if (!post) {
                  return NextResponse.json({ error: 'Post not found' }, { status: 404 })
            }

            const postWithUserRole = {
                  ...post,
                  user: {
                        ...post.user,
                        roleName: post.user.role?.name || 'User'
                  }
            }

            return NextResponse.json(postWithUserRole)
      } catch (error) {
            console.error('Error fetching post:', error)
            return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
      }
}

// PUT - Update a post
export async function PUT(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id, 10) // Convert to Int

      if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
      }

      try {
            const body = await request.json()
            const { userId, categoryId, languageId, tags, imageId, ...postData } = body

            if (!userId || !categoryId || !languageId) {
                  return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
            }

            // Explicitly define the fields we want to update
            const updateData = {
                  title: postData.title,
                  slug: postData.slug,
                  content: postData.content,
                  status: postData.status,
                  type: postData.type,
                  seoTitle: postData.seoTitle,
                  seoDescription: postData.seoDescription,
                  userId: userId, // This should be a string
                  categoryId: parseInt(categoryId, 10),
                  languageId: parseInt(languageId, 10),
                  imageId: imageId ? parseInt(imageId, 10) : null
            }

            const updatedPost = await prisma.post.update({
                  where: { id },
                  data: {
                        ...updateData,
                        tags: {
                              set: [], // Clear existing tags
                              connectOrCreate: tags.map((tag: string) => ({
                                    where: { name_languageId: { name: tag, languageId: parseInt(languageId, 10) } },
                                    create: {
                                          name: tag,
                                          slug: slugify(tag, { lower: true }),
                                          languageId: parseInt(languageId, 10)
                                    }
                              }))
                        }
                  },
                  include: {
                        user: { include: { role: true } },
                        category: true,
                        language: true,
                        tags: true,
                        image: true
                  }
            })

            return NextResponse.json(updatedPost)
      } catch (error) {
            console.error('Error updating post:', error)
            return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
      }
}

// DELETE - Delete a post
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id)

      try {
            await prisma.post.delete({
                  where: { id }
            })

            return NextResponse.json({ message: 'Post deleted successfully' })
      } catch (error) {
            console.error('Error deleting post:', error)
            return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
      }
}
