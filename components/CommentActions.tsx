import { useState } from 'react'
import { useSession } from 'next-auth/react'
import SignInModal from './auth/SignInModal'
import { FaEdit, FaTrash, FaCheck, FaTimes, FaArchive, FaClock, FaUndoAlt } from 'react-icons/fa'
import { ClockArrowDown, Archive, Check, MessageSquareReply, Settings2, Trash, Trash2, X, Bomb } from 'lucide-react'
import { Tooltip } from './ui/Tooltip'
import { Button } from './ui/button'

interface CommentActionsProps {
      onReply: (text: string) => Promise<void>
      onEdit: () => void
      onSoftDelete: () => Promise<void>
      onRestore: () => Promise<void>
      onStatusChange: (newStatus: string, archivedAt?: Date) => Promise<void>
      onHardDelete: () => Promise<void>
      commentText: string
      canEditDelete: boolean
      isAdmin: boolean
      setActiveTextarea: (id: string | null) => void
      activeTextareaId: string
      isActiveTextarea: boolean
      status: string
      isDeleted: boolean
      isArchived: boolean
}

export default function CommentActions({
      onReply,
      onEdit,
      onSoftDelete,
      onRestore,
      onStatusChange,
      onHardDelete,
      commentText,
      canEditDelete,
      isAdmin,
      setActiveTextarea,
      activeTextareaId,
      isActiveTextarea,
      status,
      isDeleted,
      isArchived
}: CommentActionsProps) {
      const { data: session } = useSession()
      const [isSoftDeleteConfirm, setIsSoftDeleteConfirm] = useState(false)
      const [replyText, setReplyText] = useState('')
      const [showSignInModal, setShowSignInModal] = useState(false)

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

      const handleStatusChange = (newStatus: string) => {
            if (newStatus === 'archived') {
                  onStatusChange(newStatus, new Date())
            } else {
                  onStatusChange(newStatus, null)
            }
      }

      return (
            <div className="flex items-center space-x-2">
                  {!isDeleted && !isArchived && (
                        <Tooltip content="Reply">
                              <button onClick={handleReply} className="text-black text-sm mt-2">
                                    <MessageSquareReply className="w-4" />
                              </button>
                        </Tooltip>
                  )}
                  {canEditDelete && !isDeleted && (
                        <>
                              <Tooltip content="Edit Comment">
                                    <button onClick={onEdit} className="text-black text-sm mt-2">
                                          <Settings2 className="w-4" />
                                    </button>
                              </Tooltip>
                              <Tooltip content="Soft Delete">
                                    <button onClick={handleSoftDelete} className="mx-10 text-red-500 text-sm w-4 mt-2">
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
                  {isAdmin && isDeleted && (
                        <Tooltip content="Restore comment">
                              <button onClick={onRestore} className="text-blue-500 text-sm mt-2 mr-2">
                                    <FaUndoAlt />
                              </button>
                        </Tooltip>
                  )}
                  {isSoftDeleteConfirm && (
                        <Tooltip content="Cancel Soft Delete">
                              <button
                                    onClick={() => setIsSoftDeleteConfirm(false)}
                                    className="text-gray-500 text-sm mt-2 mr-2"
                              >
                                    <X strokeWidth={3} className="w-4" />
                              </button>
                        </Tooltip>
                  )}
                  {isAdmin && !isDeleted && (
                        <>
                              {status === 'pending' && (
                                    <>
                                          <Tooltip content="Approve">
                                                <button
                                                      onClick={() => handleStatusChange('approved')}
                                                      className="text-black flex items-center space-x-1"
                                                >
                                                      <Check className="w-4" />{' '}
                                                      <span className="text-gray-400 text-xs">Approve</span>
                                                </button>
                                          </Tooltip>
                                          <Tooltip content="Archive">
                                                <button
                                                      onClick={() => handleStatusChange('archived')}
                                                      className="text-black flex items-center space-x-1"
                                                >
                                                      <Archive className="w-4" />{' '}
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
                                                      <ClockArrowDown className="w-4" />{' '}
                                                      <span className="text-gray-400 text-xs">Pending</span>
                                                </button>
                                          </Tooltip>
                                          <Tooltip content="Archive">
                                                <button
                                                      onClick={() => handleStatusChange('archived')}
                                                      className="text-black flex items-center space-x-1"
                                                >
                                                      <Archive className="w-4" />{' '}
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
                                                      <Check className="w-4" />{' '}
                                                      <span className="text-gray-400 text-xs">Approve</span>
                                                </button>
                                          </Tooltip>
                                          <Tooltip content="Pending">
                                                <button
                                                      onClick={() => handleStatusChange('pending')}
                                                      className="text-black flex items-center space-x-1"
                                                >
                                                      <ClockArrowDown className="w-4" />{' '}
                                                      <span className="text-gray-400 text-xs">Pending</span>
                                                </button>
                                          </Tooltip>
                                    </>
                              )}
                        </>
                  )}

                  {isAdmin && (
                        <Tooltip content="Permanently Delete!">
                              <Button onClick={onHardDelete} variant="none" className="text-red-700 text-sm">
                                    <Bomb className="w-4" />
                              </Button>
                        </Tooltip>
                  )}

                  {isActiveTextarea && (
                        <div className="mt-2">
                              <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                    rows={2}
                                    placeholder="Write a reply..."
                              />
                              <button
                                    onClick={submitReply}
                                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg mr-2"
                              >
                                    Submit Reply
                              </button>
                              <button
                                    onClick={() => setActiveTextarea(null)}
                                    className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg"
                              >
                                    Cancel
                              </button>
                        </div>
                  )}

                  <SignInModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />
            </div>
      )
}
