import { prisma } from '@/lib/prisma'
import { PostItem } from '@/components/PostItem'

export default async function CategoryPage({ params }: { params: { slug: string } }) {
      const category = await prisma.category.findUnique({
            where: { slug: params.slug },
            include: {
                  posts: {
                        where: { status: 'published' },
                        orderBy: { createdAt: 'desc' },
                        include: { user: true }
                  }
            }
      })

      if (!category) {
            return <div>Category not found</div>
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
