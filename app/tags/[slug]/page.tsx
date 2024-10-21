import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { PostItem } from '@/components/PostItem'
import Image from 'next/image'
import Loading from '@/components/Loading'
import { FollowTagButton } from '@/components/FollowTagButton'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

async function getTag(slug: string) {
      return prisma.tag.findUnique({
            where: { slug },
            include: {
                  posts: {
                        where: { status: 'published' },
                        orderBy: { createdAt: 'desc' },
                        include: { user: true }
                  },
                  image: true
            }
      })
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
      const tag = await getTag(params.slug)

      if (!tag) {
            return {
                  title: 'Tag Not Found'
            }
      }

      const seoTitle = tag.seoTitle || `${tag.name} | Your Blog Name`
      const seoDescription = tag.seoDescription || `Explore posts tagged with ${tag.name} on Your Blog Name`

      return {
            title: seoTitle,
            description: seoDescription,
            openGraph: {
                  title: seoTitle,
                  description: seoDescription,
                  url: `https://yourblog.com/tags/${tag.slug}`,
                  siteName: 'Your Blog Name',
                  images: [
                        {
                              url: tag.image?.filePath || 'https://yourblog.com/default-og-image.jpg',
                              width: 1200,
                              height: 630,
                              alt: tag.name
                        }
                  ],
                  type: 'website'
            },
            twitter: {
                  card: 'summary_large_image',
                  title: seoTitle,
                  description: seoDescription,
                  creator: '@yourtwitterhandle'
            }
      }
}

async function TagContent({ slug }: { slug: string }) {
      const session = await getServerSession(authOptions)
      const tag = await getTag(slug)

      if (!tag) {
            notFound()
      }

      const isFollowing = tag.followers && tag.followers.length > 0

      return (
            <div className="container mx-auto px-4 py-8">
                  <div className="mb-8">
                        {tag.image && (
                              <div className="mb-4">
                                    <Image
                                          src={tag.image.filePath}
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
