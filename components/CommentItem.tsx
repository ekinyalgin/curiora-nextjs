import Image from 'next/image'
import Avatar from 'react-avatar'
import { RelativeDate } from './RelativeDate'
import CommentActions from './CommentActions'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import VoteComponent from './VoteComponent'
import { Flag } from 'lucide-react'
import { ReportModal } from './ReportModal'
import { ReportCategory } from '@prisma/client'
import Notification from './Notification'
import { Button } from './ui/button'

interface CommentItemProps {
      comment: any
      postId: number
      onReply: (parentId: number, text: string) => Promise<void>
      onEdit: (commentId: number, text: string) => Promise<void>
      onDelete: (commentId: number) => Promise<void>
      onStatusChange: (commentId: number, newStatus: string, archivedAt?: Date) => Promise<void>
      onSoftDelete: (commentId: number) => Promise<void>
      onHardDelete: (commentId: number) => Promise<void>
      onRestore: (commentId: number) => Promise<void>
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
      onHardDelete,
      onRestore,
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
      const [isReportModalOpen, setIsReportModalOpen] = useState(false)
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

      const handleHardDelete = async () => {
            await onHardDelete(comment.id)
      }

      const handleRestore = async () => {
            await onRestore(comment.id)
            updateComment(comment.id, { ...comment, isDeleted: false })
      }

      const canEditDelete = isAdmin || (session && session.user.id === comment.userId)

      const getCommentStyle = () => {
            switch (comment.status) {
                  case 'pending':
                        return 'opacity-50'
                  case 'archived':
                        return 'border-red-500 border-2'
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
                  <div className={`bg-gray-100 p-4 rounded-lg ${getCommentStyle()}`}>
                        <ReportModal type="comment" id={comment.id} />
                        <div className="flex items-center space-x-2 mb-2">
                              {comment.user.image ? (
                                    <Image
                                          src={comment.user.image}
                                          alt={comment.user.name}
                                          width={40}
                                          height={40}
                                          className="rounded-full"
                                    />
                              ) : (
                                    <Avatar name={comment.user.name} size="40" round={true} textSizeRatio={3} />
                              )}
                              <div>
                                    <div className="font-bold">{comment.user.name}</div>
                                    <div className="text-sm text-gray-600">
                                          <RelativeDate date={comment.createdAt} />
                                    </div>
                              </div>
                        </div>
                        {activeTextarea === `edit-${comment.id}` ? (
                              <div>
                                    <textarea
                                          value={editText}
                                          onChange={(e) => setEditText(e.target.value)}
                                          className="w-full p-2 border rounded-lg"
                                          rows={3}
                                    />
                                    <button
                                          onClick={() => handleEdit(editText)}
                                          className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg mr-2"
                                    >
                                          Save
                                    </button>
                                    <button
                                          onClick={() => setActiveTextarea(null)}
                                          className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg"
                                    >
                                          Cancel
                                    </button>
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
                                          <p>{comment.commentText}</p>
                                    )}
                                    <CommentActions
                                          onReply={handleReply}
                                          onEdit={() => setActiveTextarea(`edit-${comment.id}`)}
                                          onDelete={handleDelete}
                                          onStatusChange={handleStatusChange}
                                          onSoftDelete={handleSoftDelete}
                                          onHardDelete={handleHardDelete}
                                          onRestore={handleRestore}
                                          commentText={comment.commentText}
                                          canEditDelete={canEditDelete}
                                          isAdmin={isAdmin}
                                          setActiveTextarea={setActiveTextarea}
                                          activeTextareaId={`reply-${comment.id}`}
                                          isActiveTextarea={activeTextarea === `reply-${comment.id}`}
                                          status={comment.status}
                                          isDeleted={comment.isDeleted}
                                          isArchived={isArchived}
                                    />
                                    <VoteComponent
                                          itemId={comment.id}
                                          itemType="comment"
                                          initialUpVotes={voteCount.upVotes}
                                          initialDownVotes={voteCount.downVotes}
                                          userVote={userVote}
                                          onVote={handleVote}
                                          isDisabled={isArchived}
                                    />
                                    <Button variant="ghost" onClick={() => setIsReportModalOpen(true)}>
                                          <Flag className="h-4 w-4 mr-2" />
                                          Report
                                    </Button>
                                    <ReportModal
                                          isOpen={isReportModalOpen}
                                          onClose={() => setIsReportModalOpen(false)}
                                          onSubmit={handleReport}
                                          type="comment"
                                    />
                                    {notification && (
                                          <Notification
                                                message={notification.message}
                                                type={notification.type}
                                                onClose={() => setNotification(null)}
                                          />
                                    )}
                              </>
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
                                                onHardDelete={onHardDelete}
                                                onRestore={onRestore}
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
