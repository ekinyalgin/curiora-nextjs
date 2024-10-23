import { prisma } from '@/lib/prisma'
import PostComponent from '@/components/PostComponent'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
import { notFound } from 'next/navigation'
import Loading from '@/components/Loading'
import { Suspense } from 'react'
import { Metadata } from 'next'
import Script from 'next/script'

// Comment tipini güncelleyelim
interface Comment {
      id: number
      content: string // Bu alanı ekledik
      createdAt: string
      user: {
            id: string
            name: string
            image?: string
      }
      userVote?: 'upvote' | 'downvote' | null
      commentText: string
      status: string
      isDeleted: boolean
      parentCommentId: number | null
}

async function getPost(slug: string) {
      return prisma.post.findUnique({
            where: { slug },
            include: {
                  user: true,
                  tags: true,
                  image: true
            }
      })
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
      const post = await getPost(params.slug)

      if (!post) {
            return {
                  title: 'Post Not Found'
            }
      }

      const seoTitle = post.seoTitle || `${post.title} | Your Blog Name`
      const seoDescription = post.seoDescription || post.excerpt || `Read about ${post.title} on Your Blog Name`
      const seoKeywords = post.tags ? post.tags.map((tag) => tag.name).join(', ') : ''
      const canonicalUrl = `https://yourblog.com/posts/${post.slug}`

      return {
            title: seoTitle,
            description: seoDescription,
            keywords: seoKeywords,
            authors: [{ name: post.user.name || 'Unknown Author' }],
            openGraph: {
                  title: seoTitle,
                  description: seoDescription,
                  url: canonicalUrl,
                  siteName: 'Your Blog Name',
                  images: [
                        {
                              url: post.image?.filePath || 'https://yourblog.com/default-og-image.jpg',
                              width: 1200,
                              height: 630,
                              alt: post.title
                        }
                  ],
                  type: 'article'
            },
            twitter: {
                  card: 'summary_large_image',
                  title: seoTitle,
                  description: seoDescription,
                  creator: '@yourtwitterhandle'
            },
            // Canonical URL'yi ekleyin
            alternates: {
                  canonical: canonicalUrl,
            }
      }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
      return (
            <Suspense fallback={<Loading />}>
                  <PostContent slug={params.slug} />
            </Suspense>
      )
}

async function PostContent({ slug }: { slug: string }) {
      const session = await getServerSession(authOptions)
      const post = await prisma.post.findUnique({
            where: { slug },
            include: {
                  user: {
                        include: {
                              role: true
                        }
                  },
                  category: true,
                  language: true,
                  tags: true,
                  comments: {
                        include: {
                              user: true,
                              voteCount: true,
                              votes: session
                                    ? {
                                            where: { userId: session.user.id }
                                      }
                                    : false
                        },
                        ...(session?.user?.role === 'admin' ? {} : { where: { status: 'approved' } }),
                        orderBy: { createdAt: 'desc' }
                  },
                  voteCount: true,
                  votes: session
                        ? {
                                where: { userId: session.user.id }
                          }
                        : false,
                  image: true
            }
      })

      if (!post) {
            notFound()
      }

      const isAdmin = session?.user?.role === 'admin'

      const transformedPost = {
            ...post,
            id: post.id,
            createdAt: post.createdAt.toISOString(),
            user: {
                  name: post.user.name || 'Unknown User',
                  image: post.user.image || undefined,
                  roleName: post.user.role?.name || 'User'
            },
            category: post.category ? { slug: post.category.slug, name: post.category.name } : undefined,
            voteCount: post.voteCount
                  ? { upVotes: post.voteCount.upVotes, downVotes: post.voteCount.downVotes }
                  : undefined,
            userVote: post.votes && post.votes.length > 0 ? post.votes[0].voteType : null,
            comments: post.comments.map(
                  (comment): Comment => ({
                        id: comment.id,
                        content: comment.commentText,
                        commentText: comment.commentText,
                        status: comment.status,
                        isDeleted: comment.isDeleted,
                        createdAt: comment.createdAt.toISOString(),
                        user: {
                              id: comment.user.id,
                              name: comment.user.name || 'Unknown User',
                              image: comment.user.image || undefined
                        },
                        userVote: comment.votes && comment.votes.length > 0 ? comment.votes[0].voteType : null,
                        parentCommentId: comment.parentCommentId
                  })
            ),
            coverImage: post.image?.filePath
      }

      const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: transformedPost.title,
            image: transformedPost.coverImage,
            datePublished: transformedPost.createdAt,
            dateModified: transformedPost.updatedAt,
            author: {
                  '@type': 'Person',
                  name: transformedPost.user.name
            },
            publisher: {
                  '@type': 'Organization',
                  name: 'Your Blog Name',
                  logo: {
                        '@type': 'ImageObject',
                        url: 'https://yourblog.com/logo.png'
                  }
            },
            description: transformedPost.excerpt,
            keywords: transformedPost.tags.map((tag) => tag.name).join(', '),
            mainEntityOfPage: {
                  '@type': 'WebPage',
                  '@id': `https://yourblog.com/posts/${transformedPost.slug}`
            }
      }

      return (
            <>
                  <Script
                        id="json-ld"
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                  />
                  <div className="container mx-auto px-4 py-8">
                        <PostComponent post={transformedPost} showEditLink={isAdmin} />
                  </div>
            </>
      )
}
