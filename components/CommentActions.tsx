import { useState } from 'react'
import { useSession } from 'next-auth/react'
import SignInModal from './auth/SignInModal'
import { FaEdit, FaTrash, FaCheck, FaTimes, FaArchive, FaClock, FaUndoAlt } from 'react-icons/fa'
import { Trash } from 'lucide-react'
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
            <div>
                  {!isDeleted && !isArchived && (
                        <Tooltip content="Reply to this comment">
                              <button onClick={handleReply} className="text-blue-500 text-sm mt-2 mr-2">
                                    Reply
                              </button>
                        </Tooltip>
                  )}
                  {canEditDelete && !isDeleted && (
                        <>
                              <Tooltip content="Edit comment">
                                    <button onClick={onEdit} className="text-green-500 text-sm mt-2 mr-2">
                                          <FaEdit />
                                    </button>
                              </Tooltip>
                              <Tooltip content="Soft delete comment">
                                    <button onClick={handleSoftDelete} className="text-red-500 text-sm mt-2 mr-2">
                                          {isSoftDeleteConfirm ? <FaCheck onClick={confirmSoftDelete} /> : <FaTrash />}
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
                        <Tooltip content="Cancel soft delete">
                              <button
                                    onClick={() => setIsSoftDeleteConfirm(false)}
                                    className="text-gray-500 text-sm mt-2 mr-2"
                              >
                                    <FaTimes />
                              </button>
                        </Tooltip>
                  )}
                  {isAdmin && !isDeleted && (
                        <>
                              {status === 'pending' && (
                                    <>
                                          <Tooltip content="Approve comment">
                                                <button
                                                      onClick={() => handleStatusChange('approved')}
                                                      className="text-green-500 text-sm mt-2 mr-2"
                                                >
                                                      <FaCheck />
                                                </button>
                                          </Tooltip>
                                          <Tooltip content="Archive comment">
                                                <button
                                                      onClick={() => handleStatusChange('archived')}
                                                      className="text-gray-500 text-sm mt-2 mr-2"
                                                >
                                                      <FaArchive />
                                                </button>
                                          </Tooltip>
                                    </>
                              )}
                              {status === 'approved' && (
                                    <>
                                          <Tooltip content="Set comment as pending">
                                                <button
                                                      onClick={() => handleStatusChange('pending')}
                                                      className="text-yellow-500 text-sm mt-2 mr-2"
                                                >
                                                      <FaClock />
                                                </button>
                                          </Tooltip>
                                          <Tooltip content="Archive comment">
                                                <button
                                                      onClick={() => handleStatusChange('archived')}
                                                      className="text-gray-500 text-sm mt-2 mr-2"
                                                >
                                                      <FaArchive />
                                                </button>
                                          </Tooltip>
                                    </>
                              )}
                              {status === 'archived' && (
                                    <>
                                          <Tooltip content="Approve comment">
                                                <button
                                                      onClick={() => handleStatusChange('approved')}
                                                      className="text-green-500 text-sm mt-2 mr-2"
                                                >
                                                      <FaCheck />
                                                </button>
                                          </Tooltip>
                                          <Tooltip content="Set comment as pending">
                                                <button
                                                      onClick={() => handleStatusChange('pending')}
                                                      className="text-yellow-500 text-sm mt-2 mr-2"
                                                >
                                                      <FaClock />
                                                </button>
                                          </Tooltip>
                                    </>
                              )}
                        </>
                  )}

                  {isAdmin && (
                        <Tooltip content="Permanently delete comment">
                              <Button onClick={onHardDelete} variant="ghost" className="text-red-700 text-sm mt-2 mr-2">
                                    <Trash className="h-4 w-4" />
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
