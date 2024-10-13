import { useState } from 'react'
import { useSession } from 'next-auth/react'
import SignInModal from './auth/SignInModal'
import { FaEdit, FaTrash, FaCheck, FaTimes, FaArchive, FaClock, FaUndoAlt } from 'react-icons/fa'
import {
      ClockArrowDown,
      Archive,
      Check,
      MessageSquareReply,
      Settings2,
      Trash,
      Trash2,
      X,
      CircleX,
      Flag
} from 'lucide-react'
import { Tooltip } from './ui/Tooltip'
import { Button } from './ui/button'
import VoteComponent from './VoteComponent'
import { ReportModal } from './ReportModal'
import { ReportCategory } from '@prisma/client'

interface CommentActionsProps {
      onReply: (text: string) => Promise<void>
      onEdit: () => void
      onSoftDelete: () => Promise<void>
      onRestore: () => Promise<void>
      onStatusChange: (newStatus: string, archivedAt?: Date) => Promise<void>
      onHardDelete: () => Promise<void>
      onVote: (voteType: 'upvote' | 'downvote' | null) => Promise<void>
      onReport: (category: ReportCategory, description: string) => Promise<void>
      commentText: string
      canEditDelete: boolean
      isAdmin: boolean
      setActiveTextarea: (id: string | null) => void
      activeTextareaId: string
      isActiveTextarea: boolean
      status: string
      isDeleted: boolean
      isArchived: boolean
      commentId: number
      initialUpVotes: number
      initialDownVotes: number
      userVote: 'upvote' | 'downvote' | null
}

export default function CommentActions({
      onReply,
      onEdit,
      onSoftDelete,
      onRestore,
      onStatusChange,
      onHardDelete,
      onVote,
      onReport,
      commentText,
      canEditDelete,
      isAdmin,
      setActiveTextarea,
      activeTextareaId,
      isActiveTextarea,
      status,
      isDeleted,
      isArchived,
      commentId,
      initialUpVotes,
      initialDownVotes,
      userVote
}: CommentActionsProps) {
      const { data: session } = useSession()
      const [isSoftDeleteConfirm, setIsSoftDeleteConfirm] = useState(false)
      const [isHardDeleteConfirm, setIsHardDeleteConfirm] = useState(false)
      const [replyText, setReplyText] = useState('')
      const [showSignInModal, setShowSignInModal] = useState(false)
      const [isReportModalOpen, setIsReportModalOpen] = useState(false)

      const handleReply = async () => {
            if (!session) {
                  setShowSignInModal(true)
                  return
            }
            setActiveTextarea(activeTextareaId)
      }

      const submitReply = async () => {
            if (replyText.trim()) {
                  await onReply(replyText)
                  setReplyText('')
                  setActiveTextarea(null)
            }
      }

      const handleSoftDelete = () => {
            setIsSoftDeleteConfirm(true)
      }

      const confirmSoftDelete = async () => {
            await onSoftDelete()
            setIsSoftDeleteConfirm(false)
      }

      const handleHardDelete = () => {
            if (!isHardDeleteConfirm) {
                  setIsHardDeleteConfirm(true)
            } else {
                  onHardDelete()
                  setIsHardDeleteConfirm(false)
            }
      }

      const handleStatusChange = async (newStatus: string) => {
            try {
                  const archivedAt = newStatus === 'archived' ? new Date() : null
                  await onStatusChange(newStatus, archivedAt)
            } catch (error) {
                  console.error('Error changing comment status:', error)
                  alert('Failed to change comment status. Please try again.')
            }
      }

      const handleEdit = () => {
            onEdit()
      }

      return (
            <div className="">
                  {isActiveTextarea && (
                        <div className="relative my-2">
                              <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className=" w-full p-2 border rounded-lg text-sm min-h-20"
                                    rows={2}
                                    placeholder="Write a reply..."
                              />
                              <div className="absolute bottom-4 right-1">
                                    <button
                                          onClick={submitReply}
                                          className=" px-2 py-1 bg-gray-100 text-black rounded-lg text-xs font-semibold"
                                    >
                                          Submit Reply
                                    </button>
                                    <button
                                          onClick={() => setActiveTextarea(null)}
                                          className="px-2 py-1 bg-transparent text-gray-400 rounded-lg text-xs"
                                    >
                                          Cancel
                                    </button>
                              </div>
                        </div>
                  )}
                  <div className="flex items-center mt-4 justify-between">
                        <div className="flex items-center space-x-4">
                              <VoteComponent
                                    itemId={commentId}
                                    itemType="comment"
                                    initialUpVotes={initialUpVotes}
                                    initialDownVotes={initialDownVotes}
                                    userVote={userVote}
                                    onVote={onVote}
                                    isDisabled={isArchived}
                              />

                              {!isDeleted && !isArchived && (
                                    <Tooltip content="Reply">
                                          <button onClick={handleReply} className="text-black text-sm">
                                                <MessageSquareReply className="w-4" />
                                          </button>
                                    </Tooltip>
                              )}

                              <Tooltip content="Report Comment">
                                    <Button variant="none" onClick={() => setIsReportModalOpen(true)}>
                                          <Flag className="w-4" />
                                    </Button>
                              </Tooltip>

                              {canEditDelete && !isDeleted && (
                                    <>
                                          <Tooltip content="Edit Comment">
                                                <button onClick={handleEdit} className="text-black text-sm">
                                                      <Settings2 className="w-4" />
                                                </button>
                                          </Tooltip>

                                          <Tooltip content="Soft Delete">
                                                <button onClick={handleSoftDelete} className="text-red-500 w-4">
                                                      {isSoftDeleteConfirm ? (
                                                            <Check
                                                                  className="w-4 text-green-500"
                                                                  strokeWidth={4}
                                                                  onClick={confirmSoftDelete}
                                                            />
                                                      ) : (
                                                            <Trash2 className="w-4" />
                                                      )}
                                                </button>
                                          </Tooltip>
                                    </>
                              )}
                        </div>

                        {isAdmin && isDeleted && (
                              <Tooltip content="Restore comment">
                                    <button onClick={onRestore} className="text-blue-500 text-sm">
                                          <FaUndoAlt />
                                    </button>
                              </Tooltip>
                        )}
                        {isSoftDeleteConfirm && (
                              <Tooltip content="Cancel Soft Delete">
                                    <button
                                          onClick={() => setIsSoftDeleteConfirm(false)}
                                          className="text-gray-500 text-sm"
                                    >
                                          <X strokeWidth={3} className="w-4" />
                                    </button>
                              </Tooltip>
                        )}

                        <div className="space-x-4 items-center flex">
                              {isAdmin && !isDeleted && (
                                    <>
                                          {status === 'pending' && (
                                                <>
                                                      <Tooltip content="Approve">
                                                            <button
                                                                  onClick={() => handleStatusChange('approved')}
                                                                  className="text-black flex items-center space-x-1"
                                                            >
                                                                  <Check className="w-4" />
                                                                  <span className="text-gray-400 text-xs">Approve</span>
                                                            </button>
                                                      </Tooltip>
                                                      <Tooltip content="Archive">
                                                            <button
                                                                  onClick={() => handleStatusChange('archived')}
                                                                  className="text-black flex items-center space-x-1"
                                                            >
                                                                  <Archive className="w-4" />
                                                                  <span className="text-gray-400 text-xs">Archive</span>
                                                            </button>
                                                      </Tooltip>
                                                </>
                                          )}
                                          {status === 'approved' && (
                                                <>
                                                      <Tooltip content="Pending">
                                                            <button
                                                                  onClick={() => handleStatusChange('pending')}
                                                                  className="text-black flex items-center space-x-1"
                                                            >
                                                                  <ClockArrowDown className="w-4" />
                                                                  <span className="text-gray-400 text-xs">Pending</span>
                                                            </button>
                                                      </Tooltip>
                                                      <Tooltip content="Archive">
                                                            <button
                                                                  onClick={() => handleStatusChange('archived')}
                                                                  className="text-black flex items-center space-x-1"
                                                            >
                                                                  <Archive className="w-4" />
                                                                  <span className="text-gray-400 text-xs">Archive</span>
                                                            </button>
                                                      </Tooltip>
                                                </>
                                          )}
                                          {status === 'archived' && (
                                                <>
                                                      <Tooltip content="Approve">
                                                            <button
                                                                  onClick={() => handleStatusChange('approved')}
                                                                  className="text-black flex items-center space-x-1"
                                                            >
                                                                  <Check className="w-4" />
                                                                  <span className="text-gray-400 text-xs">Approve</span>
                                                            </button>
                                                      </Tooltip>
                                                      <Tooltip content="Pending">
                                                            <button
                                                                  onClick={() => handleStatusChange('pending')}
                                                                  className="text-black flex items-center space-x-1"
                                                            >
                                                                  <ClockArrowDown className="w-4" />
                                                                  <span className="text-gray-400 text-xs">Pending</span>
                                                            </button>
                                                      </Tooltip>
                                                </>
                                          )}
                                    </>
                              )}

                              {isAdmin && (
                                    <Tooltip content="Permanently Delete!">
                                          <Button
                                                onClick={handleHardDelete}
                                                variant="none"
                                                className="text-red-700 text-sm"
                                          >
                                                {isHardDeleteConfirm ? (
                                                      <Check strokeWidth="3" className="w-4" />
                                                ) : (
                                                      <CircleX className="w-4" />
                                                )}
                                          </Button>
                                    </Tooltip>
                              )}
                        </div>
                  </div>

                  <SignInModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />
                  <ReportModal
                        isOpen={isReportModalOpen}
                        onClose={() => setIsReportModalOpen(false)}
                        onSubmit={onReport}
                        type="comment"
                  />
            </div>
      )
}
