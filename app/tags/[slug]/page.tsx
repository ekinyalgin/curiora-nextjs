import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { RelativeDate } from '@/components/RelativeDate';

export default async function TagPage({ params }: { params: { slug: string } }) {
      const tag = await prisma.tag.findUnique({
            where: { slug: params.slug },
            include: {
                  posts: {
                        where: { status: 'published' },
                        orderBy: { createdAt: 'desc' },
                        include: { user: true },
                  },
            },
      });

      if (!tag) {
            return <div>Tag not found</div>;
      }

      return (
            <div className="container mx-auto px-4 py-8">
                  <h1 className="text-3xl font-bold mb-8">Tag: {tag.name}</h1>
                  {tag.posts.map((post) => (
                        <div key={post.id} className="mb-6">
                              <Link href={`/posts/${post.slug}`} className="text-xl font-semibold hover:underline">
                                    {post.title}
                              </Link>
                              <div className="text-sm text-gray-600 mt-1">
                                    By {post.user.name} | <RelativeDate date={post.createdAt} />
                              </div>
                              <p className="mt-2">{post.content.substring(0, 150)}...</p>
                        </div>
                  ))}
            </div>
      );
}
