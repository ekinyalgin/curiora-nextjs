import { useState } from 'react'
import { useSession } from 'next-auth/react'
import SignInModal from './auth/SignInModal'
import { FaEdit, FaTrash, FaCheck, FaTimes, FaArchive, FaClock, FaSkull, FaUndoAlt } from 'react-icons/fa'

interface CommentActionsProps {
      onReply: (text: string) => Promise<void>
      onEdit: () => void
      onSoftDelete: () => Promise<void>
      onHardDelete: () => Promise<void>
      onRestore: () => Promise<void>
      onStatusChange: (newStatus: string) => Promise<void>
      commentText: string
      canEditDelete: boolean
      isAdmin: boolean
      setActiveTextarea: (id: string | null) => void
      activeTextareaId: string
      isActiveTextarea: boolean
      status: string
      isDeleted: boolean
}

export default function CommentActions({
      onReply,
      onEdit,
      onSoftDelete,
      onHardDelete,
      onRestore,
      onStatusChange,
      commentText,
      canEditDelete,
      isAdmin,
      setActiveTextarea,
      activeTextareaId,
      isActiveTextarea,
      status,
      isDeleted
}: CommentActionsProps) {
      const { data: session } = useSession()
      const [isSoftDeleteConfirm, setIsSoftDeleteConfirm] = useState(false)
      const [isHardDeleteConfirm, setIsHardDeleteConfirm] = useState(false)
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

      const handleHardDelete = () => {
            setIsHardDeleteConfirm(true)
      }

      const confirmHardDelete = async () => {
            await onHardDelete()
            setIsHardDeleteConfirm(false)
      }

      return (
            <div>
                  {!isDeleted && (
                        <button onClick={handleReply} className="text-blue-500 text-sm mt-2 mr-2">
                              Reply
                        </button>
                  )}
                  {canEditDelete && !isDeleted && (
                        <>
                              <button onClick={onEdit} className="text-green-500 text-sm mt-2 mr-2">
                                    <FaEdit />
                              </button>
                              <button onClick={handleSoftDelete} className="text-red-500 text-sm mt-2 mr-2">
                                    {isSoftDeleteConfirm ? <FaCheck onClick={confirmSoftDelete} /> : <FaTrash />}
                              </button>
                        </>
                  )}
                  {isAdmin && (
                        <>
                              {isDeleted ? (
                                    <>
                                          <button onClick={onRestore} className="text-blue-500 text-sm mt-2 mr-2">
                                                <FaUndoAlt />
                                          </button>
                                          <button onClick={handleHardDelete} className="text-red-700 text-sm mt-2 mr-2">
                                                {isHardDeleteConfirm ? (
                                                      <FaCheck onClick={confirmHardDelete} />
                                                ) : (
                                                      <FaSkull />
                                                )}
                                          </button>
                                    </>
                              ) : (
                                    <button onClick={handleHardDelete} className="text-red-700 text-sm mt-2 mr-2">
                                          {isHardDeleteConfirm ? <FaCheck onClick={confirmHardDelete} /> : <FaSkull />}
                                    </button>
                              )}
                        </>
                  )}
                  {(isSoftDeleteConfirm || isHardDeleteConfirm) && (
                        <button
                              onClick={() => {
                                    setIsSoftDeleteConfirm(false)
                                    setIsHardDeleteConfirm(false)
                              }}
                              className="text-gray-500 text-sm mt-2 mr-2"
                        >
                              <FaTimes />
                        </button>
                  )}
                  {isAdmin && !isDeleted && (
                        <>
                              {status === 'pending' && (
                                    <>
                                          <button
                                                onClick={() => onStatusChange('approved')}
                                                className="text-green-500 text-sm mt-2 mr-2"
                                          >
                                                <FaCheck />
                                          </button>
                                          <button
                                                onClick={() => onStatusChange('archived')}
                                                className="text-gray-500 text-sm mt-2 mr-2"
                                          >
                                                <FaArchive />
                                          </button>
                                    </>
                              )}
                              {status === 'approved' && (
                                    <>
                                          <button
                                                onClick={() => onStatusChange('pending')}
                                                className="text-yellow-500 text-sm mt-2 mr-2"
                                          >
                                                <FaClock />
                                          </button>
                                          <button
                                                onClick={() => onStatusChange('archived')}
                                                className="text-gray-500 text-sm mt-2 mr-2"
                                          >
                                                <FaArchive />
                                          </button>
                                    </>
                              )}
                              {status === 'archived' && (
                                    <>
                                          <button
                                                onClick={() => onStatusChange('approved')}
                                                className="text-green-500 text-sm mt-2 mr-2"
                                          >
                                                <FaCheck />
                                          </button>
                                          <button
                                                onClick={() => onStatusChange('pending')}
                                                className="text-yellow-500 text-sm mt-2 mr-2"
                                          >
                                                <FaClock />
                                          </button>
                                    </>
                              )}
                        </>
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
