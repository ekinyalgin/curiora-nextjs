import { prisma } from '@/lib/prisma'
import { PostItem } from '@/components/PostItem'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

async function getCategory(slug: string) {
      return prisma.category.findUnique({
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
      const category = await getCategory(params.slug)

      if (!category) {
            return {
                  title: 'Category Not Found'
            }
      }

      const seoTitle = category.seoTitle || `${category.name} | Your Blog Name`
      const seoDescription =
            category.seoDescription || `Explore posts in the ${category.name} category on Your Blog Name`

      return {
            title: seoTitle,
            description: seoDescription,
            openGraph: {
                  title: seoTitle,
                  description: seoDescription,
                  url: `https://yourblog.com/categories/${category.slug}`,
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

export default async function CategoryPage({ params }: { params: { slug: string } }) {
      const category = await getCategory(params.slug)

      if (!category) {
            notFound()
      }

      return (
            <div className="container mx-auto px-4 py-8">
                  <h1 className="text-3xl font-bold mb-8">Category: {category.name}</h1>
                  {category.posts.map((post) => (
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
      )
}
