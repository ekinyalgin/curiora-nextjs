import { prisma } from '@/lib/prisma'
import PostComponent from '@/components/PostComponent'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
import { notFound } from 'next/navigation'
import Loading from '@/components/Loading'
import { Suspense } from 'react'

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

export default async function PostPage({ params }: { params: { slug: string } }) {
      return (
            <Suspense fallback={<Loading />}>
                  <PostContent slug={params.slug} />
            </Suspense>
      )
}

async function PostContent({ slug }: { slug: string }) {
      const session = await getServerSession(authOptions)
      let post

      try {
            post = await prisma.post.findUnique({
                  where: { slug: slug },
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
                              ...(session?.user?.role === 'admin' || session?.user?.role === 'admin'
                                    ? {}
                                    : { where: { status: 'approved' } }),
                              orderBy: { createdAt: 'desc' }
                        },
                        voteCount: true,
                        votes: session
                              ? {
                                      where: { userId: session.user.id }
                                }
                              : false
                  }
            })
      } catch (error) {
            console.error('Error fetching post:', error)
            return <div>Error loading post</div>
      }

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
                              name: comment.user.name || 'Unknown User', // Varsayılan değer ekledik
                              image: comment.user.image || undefined // undefined olarak bırakıyoruz eğer null ise
                        },
                        userVote: comment.votes && comment.votes.length > 0 ? comment.votes[0].voteType : null,
                        parentCommentId: comment.parentCommentId
                  })
            )
      }

      return (
            <div className="container mx-auto px-4 py-8">
                  <PostComponent post={transformedPost} showEditLink={isAdmin} />
            </div>
      )
}
