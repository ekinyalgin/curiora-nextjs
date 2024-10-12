'use client'

import Image from 'next/image'
import Link from 'next/link'
import { RelativeDate } from './RelativeDate'
import UserInfo from './UserInfo'
import VoteComponent from './VoteComponent'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Archive, ArchiveRestore } from 'lucide-react'
import CommentSection from './CommentSection'

export default function PostComponent({ post, showEditLink = false, onArchive }) {
      if (!post) return null

      const { data: session } = useSession()
      const [voteCount, setVoteCount] = useState({
            upVotes: post.voteCount?.upVotes || 0,
            downVotes: post.voteCount?.downVotes || 0
      })
      const [userVote, setUserVote] = useState(post.userVote)
      const [isArchived, setIsArchived] = useState(post.status === 'archived')

      const handleVote = async (voteType: 'upvote' | 'downvote' | null) => {
            if (!session || isArchived) {
                  alert('You must be logged in to vote or this post is archived')
                  return
            }

            try {
                  const response = await fetch('/api/votes', {
                        method: 'POST',
                        headers: {
                              'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                              itemId: post.id,
                              itemType: 'post',
                              voteType
                        })
                  })

                  if (!response.ok) {
                        throw new Error('Failed to vote')
                  }

                  const { voteCount: newVoteCount } = await response.json()

                  setVoteCount(newVoteCount)
                  setUserVote(voteType)
            } catch (error) {
                  console.error('Error voting:', error)
                  alert('Failed to vote. Please try again.')
            }
      }

      const handleArchiveToggle = async () => {
            if (!session || !showEditLink) return

            try {
                  const response = await fetch(`/api/posts/${post.id}/archive`, {
                        method: 'POST',
                        headers: {
                              'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ isArchived: !isArchived })
                  })

                  if (!response.ok) {
                        throw new Error('Failed to toggle archive status')
                  }

                  const updatedPost = await response.json()
                  setIsArchived(updatedPost.status === 'archived')
                  if (onArchive) onArchive(updatedPost)
            } catch (error) {
                  console.error('Error toggling archive status:', error)
                  alert('Failed to toggle archive status. Please try again.')
            }
      }

      return (
            <>
                  <article className="space-y-6">
                        <div className="flex items-center justify-between">
                              <UserInfo
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
                                          <>
                                                <Link
                                                      href={`/admin/posts/${post.id}`}
                                                      className="text-xs bg-red-500 hover:bg-red-600 transition text-white py-1 px-2 rounded-sm"
                                                >
                                                      Edit
                                                </Link>
                                                <button
                                                      onClick={handleArchiveToggle}
                                                      className={`text-xs ${
                                                            isArchived
                                                                  ? 'bg-green-500 hover:bg-green-600'
                                                                  : 'bg-yellow-500 hover:bg-yellow-600'
                                                      } transition text-white py-1 px-2 rounded-sm`}
                                                >
                                                      {isArchived ? <Archive /> : <ArchiveRestore />}
                                                </button>
                                          </>
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

                        {isArchived && (
                              <div
                                    className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
                                    role="alert"
                              >
                                    <p className="font-bold">Archived post</p>
                                    <p>New comments cannot be posted and votes cannot be cast.</p>
                              </div>
                        )}

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

                        <div className="flex items-center space-x-4">
                              <VoteComponent
                                    itemId={post.id}
                                    itemType="post"
                                    initialUpVotes={voteCount.upVotes}
                                    initialDownVotes={voteCount.downVotes}
                                    userVote={userVote}
                                    onVote={handleVote}
                                    isDisabled={isArchived}
                              />
                              <span className="text-sm text-gray-500">
                                    {post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}
                              </span>
                        </div>
                  </article>
                  <CommentSection
                        comments={post.comments}
                        postId={post.id}
                        isAdmin={showEditLink}
                        isArchived={isArchived}
                  />
            </>
      )
}
