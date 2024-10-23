import { prisma } from '@/lib/prisma'
import { PostItem } from '@/components/PostItem'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { env } from 'process'

async function getTag(slug: string) {
      return prisma.tag.findUnique({
            where: { slug },
            include: {
                  posts: {
                        where: { status: 'published' },
                        orderBy: { createdAt: 'desc' },
                        include: { user: true }
                  }
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

      const tagUrl = `${env.NEXT_PUBLIC_BASE_URL}${env.NEXT_PUBLIC_TAG_PATH}/${tag.slug}`

      return {
            title: seoTitle,
            description: seoDescription,
            openGraph: {
                  title: seoTitle,
                  description: seoDescription,
                  url: tagUrl,
                  siteName: 'Your Blog Name',
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

export default async function TagPage({ params }: { params: { slug: string } }) {
      const tag = await getTag(params.slug)

      if (!tag) {
            notFound()
      }

      const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            mainEntityOfPage: {
                  '@type': 'WebPage',
                  '@id': `${env.NEXT_PUBLIC_BASE_URL}${env.NEXT_PUBLIC_TAG_PATH}/${tag.slug}`
            },
            name: tag.name,
            description: tag.seoDescription || `Explore posts tagged with ${tag.name} on Your Blog Name`,
            url: `${env.NEXT_PUBLIC_BASE_URL}${env.NEXT_PUBLIC_TAG_PATH}/${tag.slug}`,
            isPartOf: {
                  '@type': 'WebSite',
                  name: 'Your Blog Name',
                  url: env.NEXT_PUBLIC_BASE_URL
            },
            inLanguage: 'en-US', // Adjust this based on your blog's language
            datePublished: tag.createdAt.toISOString(),
            dateModified: tag.updatedAt.toISOString()
      }

      return (
            <>
                  <Script
                        id="json-ld"
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                  />
                  <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold mb-8">Tag: {tag.name}</h1>
                        {tag.posts.map((post) => (
                              <PostItem
                                    key={post.id.toString()}
                                    post={{
                                          ...post,
                                          id: post.id.toString(),
                                          user: { name: post.user.name || 'Unknown User' }
                                    }}
                              />
                        ))}
                  </div>
            </>
      )
}
