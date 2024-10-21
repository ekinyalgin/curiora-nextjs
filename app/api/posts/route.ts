import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import slugify from 'slugify'

export async function GET(request: Request) {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get('search')

      let posts
      if (search) {
            posts = await prisma.post.findMany({
                  where: {
                        OR: [{ title: { contains: search } }, { content: { contains: search } }]
                  },
                  include: {
                        user: {
                              include: {
                                    role: true
                              }
                        },
                        category: true,
                        language: true,
                        tags: true,
                        image: true // Include the image relation
                  }
            })
      } else {
            posts = await prisma.post.findMany({
                  include: {
                        user: {
                              include: { role: true }
                        },
                        category: true,
                        language: true,
                        tags: true,
                        image: true // Include the image relation
                  }
            })
      }

      // Transform the posts to include roleName directly in the user object
      // and add the filePath from the image relation
      const transformedPosts = posts.map((post) => ({
            ...post,
            user: {
                  ...post.user,
                  roleName: post.user.role?.name || 'User'
            },
            imageFilePath: post.image?.filePath || null // Add this line
      }))

      return NextResponse.json(transformedPosts)
}

export async function POST(request: Request) {
      try {
            const body = await request.json()
            const { user, category, language, tags, imageId, ...postData } = body

            if (!user || !category || !language) {
                  return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
            }

            const post = await prisma.post.create({
                  data: {
                        ...postData,
                        imageId: imageId ? parseInt(imageId) : null,
                        userId: user.id,
                        categoryId: parseInt(category.id),
                        languageId: parseInt(language.id),
                        tags: {
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
                        user: {
                              include: { role: true }
                        },
                        category: true,
                        language: true,
                        tags: true,
                        image: true
                  }
            })
            return NextResponse.json(post, { status: 201 })
      } catch (error) {
            console.error('Error creating post:', error)
            return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
      }
}
