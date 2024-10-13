import Image from 'next/image'
import Avatar from 'react-avatar'
import { RelativeDate } from './RelativeDate'
import CommentActions from './CommentActions'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { ReportCategory } from '@prisma/client'
import Notification from './Notification'

interface CommentItemProps {
      comment: any
      postId: number
      onReply: (parentId: number, text: string) => Promise<void>
      onEdit: (commentId: number, text: string) => Promise<void>
      onDelete: (commentId: number) => Promise<void>
      onStatusChange: (commentId: number, newStatus: string, archivedAt?: Date) => Promise<void>
      onSoftDelete: (commentId: number) => Promise<void>
      onRestore: (commentId: number) => Promise<void>
      onHardDelete: (commentId: number) => Promise<void>
      isChild?: boolean
      topLevelParentId?: number
      activeTextarea: string | null
      setActiveTextarea: (id: string | null) => void
      updateComment: (commentId: number, updatedComment: any) => void
      isAdmin: boolean
      isArchived: boolean
}

export default function CommentItem({
      comment,
      postId,
      onReply,
      onEdit,
      onDelete,
      onStatusChange,
      onSoftDelete,
      onRestore,
      onHardDelete,
      isChild = false,
      topLevelParentId,
      activeTextarea,
      setActiveTextarea,
      updateComment,
      isAdmin,
      isArchived
}: CommentItemProps) {
      const { data: session } = useSession()
      const [editText, setEditText] = useState(comment.commentText)
      const [voteCount, setVoteCount] = useState({
            upVotes: comment.voteCount?.upVotes || 0,
            downVotes: comment.voteCount?.downVotes || 0
      })
      const [userVote, setUserVote] = useState(comment.userVote)
      const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

      const handleReply = async (text: string) => {
            const parentId = isChild ? topLevelParentId : comment.id
            await onReply(parentId, text)
            setActiveTextarea(null)
      }

      const handleEdit = async (text: string) => {
            await onEdit(comment.id, text)
            updateComment(comment.id, { ...comment, commentText: text })
            setActiveTextarea(null)
      }

      const handleDelete = async () => {
            await onDelete(comment.id)
      }

      const handleStatusChange = async (newStatus: string, archivedAt?: Date) => {
            await onStatusChange(comment.id, newStatus, archivedAt)
            updateComment(comment.id, { ...comment, status: newStatus, archivedAt })
      }

      const handleSoftDelete = async () => {
            await onSoftDelete(comment.id)
      }

      const handleRestore = async () => {
            await onRestore(comment.id)
            updateComment(comment.id, { ...comment, isDeleted: false })
      }

      const handleHardDelete = async () => {
            await onHardDelete(comment.id)
      }

      const canEditDelete = isAdmin || (session && session.user.id === comment.userId)

      const getCommentStyle = () => {
            switch (comment.status) {
                  case 'pending':
                        return 'border-l-2 border-yellow-500'
                  case 'archived':
                        return 'border-l-2 border-red-500'
                  default:
                        return ''
            }
      }

      const handleVote = async (voteType: 'upvote' | 'downvote' | null) => {
            if (!session) {
                  alert('You must be logged in to vote')
                  return
            }

            try {
                  const response = await fetch('/api/votes', {
                        method: 'POST',
                        headers: {
                              'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                              itemId: comment.id,
                              itemType: 'comment',
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

      const handleReport = async (category: ReportCategory, description: string) => {
            try {
                  const response = await fetch('/api/reports', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ commentId: comment.id, category, description })
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
            <div className={`mb-4 ${isChild ? 'ml-10' : ''}`}>
                  <div className={`bg-gray-50 p-4 rounded-lg ${getCommentStyle()}`}>
                        <div className="flex items-center space-x-2 mb-2">
                              {comment.user.image ? (
                                    <Image
                                          src={comment.user.image}
                                          alt={comment.user.name}
                                          width={20}
                                          height={20}
                                          className="rounded-full"
                                    />
                              ) : (
                                    <Avatar name={comment.user.name} size="26" round={true} textSizeRatio={3} />
                              )}

                              <div className="font-semibold text-sm">{comment.user.name}</div>
                              <div className="text-sm text-gray-300">|</div>
                              <div className="text-xs text-gray-500">
                                    <RelativeDate date={comment.createdAt} />
                              </div>
                        </div>
                        {activeTextarea === `edit-${comment.id}` ? (
                              <div className="relative">
                                    <textarea
                                          value={editText}
                                          onChange={(e) => setEditText(e.target.value)}
                                          className="text-sm w-full p-2 border rounded-lg"
                                          rows={3}
                                    />
                                    <div className="absolute bottom-4 right-1">
                                          <button
                                                onClick={() => handleEdit(editText)}
                                                className=" px-2 py-1 border-b-2 border-green-400 text-green-500 hover:bg-green-100 transition rounded-lg text-xs font-semibold"
                                          >
                                                Save
                                          </button>
                                          <button
                                                onClick={() => setActiveTextarea(null)}
                                                className="px-2 py-1 bg-transparent text-gray-400 rounded-lg text-xs"
                                          >
                                                Cancel
                                          </button>
                                    </div>
                              </div>
                        ) : (
                              <>
                                    {comment.isDeleted ? (
                                          <div>
                                                <p className="italic text-gray-500">This comment has been deleted.</p>
                                                {isAdmin && (
                                                      <p className="text-sm text-gray-400 mt-1">
                                                            Original comment: {comment.commentText}
                                                      </p>
                                                )}
                                          </div>
                                    ) : (
                                          <p className="text-sm">{comment.commentText}</p>
                                    )}
                                    <CommentActions
                                          onReply={handleReply}
                                          onEdit={() => setActiveTextarea(`edit-${comment.id}`)}
                                          onDelete={handleDelete}
                                          onStatusChange={handleStatusChange}
                                          onSoftDelete={handleSoftDelete}
                                          onRestore={handleRestore}
                                          onHardDelete={handleHardDelete}
                                          onVote={handleVote}
                                          onReport={handleReport}
                                          commentText={comment.commentText}
                                          canEditDelete={canEditDelete}
                                          isAdmin={isAdmin}
                                          setActiveTextarea={setActiveTextarea}
                                          activeTextareaId={`reply-${comment.id}`}
                                          isActiveTextarea={activeTextarea === `reply-${comment.id}`}
                                          status={comment.status}
                                          isDeleted={comment.isDeleted}
                                          isArchived={isArchived}
                                          commentId={comment.id}
                                          initialUpVotes={voteCount.upVotes}
                                          initialDownVotes={voteCount.downVotes}
                                          userVote={userVote}
                                    />
                              </>
                        )}
                        {notification && (
                              <Notification
                                    message={notification.message}
                                    type={notification.type}
                                    onClose={() => setNotification(null)}
                              />
                        )}
                  </div>

                  {comment.childComments && comment.childComments.length > 0 && (
                        <div className="mt-4">
                              {comment.childComments
                                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                                    .map((childComment) => (
                                          <CommentItem
                                                key={childComment.id}
                                                comment={childComment}
                                                postId={postId}
                                                onReply={onReply}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                                onStatusChange={onStatusChange}
                                                onSoftDelete={onSoftDelete}
                                                onRestore={onRestore}
                                                onHardDelete={onHardDelete}
                                                isChild={true}
                                                topLevelParentId={isChild ? topLevelParentId : comment.id}
                                                activeTextarea={activeTextarea}
                                                setActiveTextarea={setActiveTextarea}
                                                updateComment={updateComment}
                                                isAdmin={isAdmin}
                                                isArchived={isArchived}
                                          />
                                    ))}
                        </div>
                  )}
            </div>
      )
}
