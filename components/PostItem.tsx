import Link from 'next/link'
import { RelativeDate } from '@/components/RelativeDate'
import { stripMarkdown } from '@/lib/stripMarkdown'

interface PostItemProps {
      post: {
            id: string
            slug: string
            title: string
            content: string
            createdAt: Date
            user: {
                  name: string
            }
      }
}

export function PostItem({ post }: PostItemProps) {
      const strippedContent = stripMarkdown(post.content)

      return (
            <div className="mb-6">
                  <Link href={`/posts/${post.slug}`} className="text-xl font-semibold hover:underline">
                        {post.title}
                  </Link>
                  <div className="text-sm text-gray-600 mt-1">
                        By {post.user.name} | <RelativeDate date={post.createdAt} />
                  </div>
                  <p className="mt-2">{strippedContent.substring(0, 150)}...</p>
            </div>
      )
}
