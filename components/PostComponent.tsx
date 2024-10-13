'use client'

import Image from 'next/image'
import Link from 'next/link'
import { RelativeDate } from './RelativeDate'
import UserInfo from './UserInfo'
import VoteComponent from './VoteComponent'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Archive, ArchiveRestore, Flag, MessageCircle, Settings2 } from 'lucide-react'
import CommentSection from './CommentSection'
import { ReportModal } from './ReportModal'
import { ReportCategory } from '@prisma/client'
import { Button } from './ui/button'
import Notification from './Notification'
import { Tooltip } from './ui/Tooltip'

export default function PostComponent({ post, showEditLink = false, onArchive }) {
      if (!post) return null

      const { data: session } = useSession()
      const [voteCount, setVoteCount] = useState({
            upVotes: post.voteCount?.upVotes || 0,
            downVotes: post.voteCount?.downVotes || 0
      })
      const [userVote, setUserVote] = useState(post.userVote)
      const [isArchived, setIsArchived] = useState(post.status === 'archived')
      const [isReportModalOpen, setIsReportModalOpen] = useState(false)
      const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

      const handleVote = async (voteType: 'upvote' | 'downvote' | null) => {
            if (!session || isArchived) {
                  setNotification({
                        message: 'You must be logged in to vote or this post is archived',
                        type: 'error'
                  })
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
                  setNotification({
                        message: 'Failed to vote. Please try again.',
                        type: 'error'
                  })
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
                  setNotification({
                        message: 'Failed to toggle archive status. Please try again.',
                        type: 'error'
                  })
            }
      }

      const handleReport = async (category: ReportCategory, description: string) => {
            try {
                  const response = await fetch('/api/reports', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ postId: post.id, category, description })
                  })

                  if (response.ok) {
                        setNotification({
                              message: 'Your report has been received and will be reviewed shortly.',
                              type: 'success'
                        })
                  } else {
                        throw new Error('Failed to submit report')
                  }
            } catch (error) {
                  console.error('Error submitting report:', error)
                  setNotification({
                        message: 'Failed to submit report. Please try again.',
                        type: 'error'
                  })
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
                                    <ReportModal type="post" id={post.id} />
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
                                                <Tooltip content="Edit">
                                                      <Link
                                                            href={`/admin/posts/${post.id}`}
                                                            className="text-xs bg-red-500 hover:bg-red-600 transition text-white px-1 rounded-sm"
                                                      >
                                                            <Settings2 className="w-4" />
                                                      </Link>
                                                </Tooltip>
                                          </>
                                    )}
                                    <>
                                          <Tooltip content="Archive">
                                                <button
                                                      onClick={handleArchiveToggle}
                                                      className={`text-xs ${
                                                            isArchived
                                                                  ? 'bg-green-500 hover:bg-green-600'
                                                                  : ' bg-yellow-400 hover:bg-yellow-500 '
                                                      } transition text-white px-1 rounded-sm`}
                                                >
                                                      {isArchived ? (
                                                            <Archive className="w-4" />
                                                      ) : (
                                                            <ArchiveRestore className="w-4" />
                                                      )}
                                                </button>
                                          </Tooltip>
                                          <Tooltip content="Flag">
                                                <Button
                                                      variant="none"
                                                      className="text-black py-0 px-1 rounded-sm bg-gray-100 hover:bg-gray-200 "
                                                      onClick={() => setIsReportModalOpen(true)}
                                                >
                                                      <Flag className="text-black w-4" />
                                                </Button>
                                          </Tooltip>
                                    </>
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
                              <div className="border border-yellow-700 text-yellow-700 p-4 rounded" role="alert">
                                    <div className="text-sm flex items-center space-x-4">
                                          <Archive className="w-8" />
                                          <p>
                                                This post has reached its archive status. Commenting and voting are no
                                                longer possible.
                                          </p>
                                    </div>
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
                              <span className="text-sm text-gray-800 flex items-center font-semibold">
                                    <MessageCircle className="w-4 mr-1" /> {post.commentCount}
                              </span>
                        </div>
                  </article>
                  <CommentSection
                        comments={post.comments}
                        postId={post.id}
                        isAdmin={showEditLink}
                        isArchived={isArchived}
                  />

                  <ReportModal
                        isOpen={isReportModalOpen}
                        onClose={() => setIsReportModalOpen(false)}
                        onSubmit={handleReport}
                        type="post"
                  />
                  {notification && (
                        <Notification
                              message={notification.message}
                              type={notification.type}
                              onClose={() => setNotification(null)}
                        />
                  )}
            </>
      )
}
