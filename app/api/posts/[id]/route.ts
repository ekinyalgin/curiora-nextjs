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
                        featuredImage: true
                  }
            })

            if (!post) {
                  return NextResponse.json({ error: 'Post not found' }, { status: 404 })
            }

            // Kullanıcı rolünü doğrudan içeren bir nesne oluşturalım
            const postWithUserRole = {
                  ...post,
                  user: {
                        ...post.user,
                        roleName: post.user.role?.name || 'User'
                  },
                  featuredImage: post.featuredImage?.filePath, // Bu satırı güncelleyin
                  featuredImageId: post.featuredImage?.id // Bu satırı ekleyin
            }

            return NextResponse.json(postWithUserRole)
      } catch (error) {
            console.error('Error fetching post:', error)
            return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
      }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id) // ID integer'a çevriliyor

      try {
            const body = await request.json()
            const { user, category, language, tags, featuredImage, id: postId, ...postData } = body

            if (!user || !category || !language) {
                  return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
            }

            const updatedPost = await prisma.post.update({
                  where: { id },
                  data: {
                        ...postData,
                        userId: user.id,
                        featuredImageId: featuredImage.id,
                        categoryId: parseInt(category.id),
                        languageId: parseInt(language.id),
                        tags: {
                              set: [],
                              connectOrCreate: tags.map((tag: string) => ({
                                    where: {
                                          name_language_id: {
                                                name: tag,
                                                language_id: parseInt(language.id)
                                          }
                                    },
                                    create: {
                                          name: tag,
                                          slug: slugify(tag, { lower: true }),
                                          language_id: parseInt(language.id)
                                    }
                              }))
                        }
                  },

                  include: {
                        user: { include: { role: true } },
                        category: true,
                        language: true,
                        tags: true
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
