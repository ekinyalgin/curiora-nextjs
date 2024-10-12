import Image from 'next/image'
import Link from 'next/link'
import { RelativeDate } from './RelativeDate'
import UserInfoComponent from './UserInfo'

export default function PostComponent({ post, showEditLink = false }) {
      if (!post) return null // Add this line to handle cases where post might be undefined

      return (
            <article className="space-y-6">
                  <div className="flex items-center justify-between">
                        <UserInfoComponent
                              user={{
                                    name: post.user?.name || 'Unknown User',
                                    image: post.user?.image,
                                    role: post.user?.roleName || 'User'
                              }}
                        />
                        <div className="flex items-center space-x-2 text-xs">
                              <RelativeDate className="text-xs" date={post.createdAt} />

                              {post.category && (
                                    <Link
                                          href={`/categories/${post.category.slug}`}
                                          className="bg-gray-200 rounded-sm text-xs py-1 px-2 hover:underline"
                                    >
                                          {post.category.name}
                                    </Link>
                              )}
                              {showEditLink && (
                                    <Link
                                          href={`/admin/posts/${post.id}`}
                                          className="text-xs bg-red-500 hover:bg-red-600 transition text-white py-1 px-2 rounded-sm"
                                    >
                                          Edit
                                    </Link>
                              )}
                        </div>
                  </div>

                  <h1 className="text-3xl font-bold">{post.title}</h1>

                  {post.featuredImage && (
                        <Image
                              src={post.featuredImage.filePath}
                              alt={post.title}
                              width={800}
                              height={400}
                              className="mb-4 rounded-lg"
                        />
                  )}

                  <div
                        className="text-base text-gray-800 prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  <div className="space-x-2">
                        <span className="text-xs text-gray-400">Tags:</span>
                        {post.tags &&
                              post.tags.map((tag, index) => (
                                    <Link
                                          key={tag.id}
                                          href={`/tags/${tag.slug}`}
                                          className="inline-block bg-gray-100 hover:bg-gray-200 rounded-sm px-3 py-1 text-xs font-semibold text-gray-700 mb-2 transition"
                                    >
                                          {tag.name}
                                    </Link>
                              ))}
                  </div>
            </article>
      )
}
