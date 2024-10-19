import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { PostItem } from '@/components/PostItem'
import Image from 'next/image'
import Loading from '@/components/Loading'
import { FollowTagButton } from '@/components/FollowTagButton'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'

async function TagContent({ slug }: { slug: string }) {
      const session = await getServerSession(authOptions)
      const tag = await prisma.tag.findUnique({
            where: { slug },
            include: {
                  posts: {
                        where: { status: 'published' },
                        orderBy: { createdAt: 'desc' },
                        include: { user: true }
                  },
                  featuredImage: true,
                  followers: session?.user
                        ? {
                                where: { userId: session.user.id }
                          }
                        : false
            }
      })

      if (!tag) {
            return <div>Tag not found</div>
      }

      const isFollowing = tag.followers && tag.followers.length > 0

      return (
            <div className="container mx-auto px-4 py-8">
                  <div className="mb-8">
                        {tag.featuredImage && (
                              <div className="mb-4">
                                    <Image
                                          src={tag.featuredImage.filePath}
                                          alt={tag.name}
                                          width={300}
                                          height={200}
                                          className="rounded-lg object-cover"
                                    />
                              </div>
                        )}
                        <h1 className="text-3xl font-bold mb-2">{tag.name}</h1>
                        {tag.description && <p className="text-gray-600 mb-4">{tag.description}</p>}
                        <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-500">{tag.followerCount} followers</p>
                              {session?.user && <FollowTagButton tagId={tag.id} initialIsFollowing={isFollowing} />}
                        </div>
                  </div>

                  <h2 className="text-2xl font-semibold mb-4">Posts with this tag:</h2>
                  {tag.posts.length > 0 ? (
                        tag.posts.map((post) => (
                              <PostItem
                                    key={post.id}
                                    post={{
                                          ...post,
                                          id: post.id.toString(),
                                          user: {
                                                ...post.user,
                                                name: post.user.name || 'Unknown User'
                                          }
                                    }}
                              />
                        ))
                  ) : (
                        <p>No posts found with this tag.</p>
                  )}
            </div>
      )
}

export default function TagPage({ params }: { params: { slug: string } }) {
      return (
            <Suspense fallback={<Loading />}>
                  <TagContent slug={params.slug} />
            </Suspense>
      )
}
