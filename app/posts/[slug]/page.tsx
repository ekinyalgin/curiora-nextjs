import { prisma } from '@/lib/prisma'
import PostComponent from '@/components/PostComponent'
import CommentSection from '@/components/CommentSection'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { notFound } from 'next/navigation'
import Loading from '@/components/Loading'
import { Suspense } from 'react'

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
                              ...(session?.user?.role === 'admin' || session?.user?.role === 1
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

      const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 1
      const isArchived = post.status === 'archived'

      // Transform the post to include roleName and userVote
      const transformedPost = {
            ...post,
            user: {
                  ...post.user,
                  roleName: post.user.role?.name || 'User'
            },
            userVote: post.votes && post.votes.length > 0 ? post.votes[0].voteType : null,
            comments: post.comments.map((comment) => ({
                  ...comment,
                  userVote: comment.votes && comment.votes.length > 0 ? comment.votes[0].voteType : null
            }))
      }

      return (
            <div className="container mx-auto px-4 py-8">
                  <PostComponent post={transformedPost} showEditLink={isAdmin} />
                  <CommentSection
                        comments={transformedPost.comments}
                        postId={post.id}
                        isAdmin={isAdmin}
                        isArchived={isArchived}
                  />
            </div>
      )
}
