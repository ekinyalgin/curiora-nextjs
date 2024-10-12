import { useState } from 'react'
import { useSession } from 'next-auth/react'
import SignInModal from './auth/SignInModal'
import { FaEdit, FaTrash, FaCheck, FaTimes, FaArchive, FaClock } from 'react-icons/fa'

interface CommentActionsProps {
      onReply: (text: string) => Promise<void>
      onEdit: () => void
      onDelete: () => Promise<void>
      onStatusChange: (newStatus: string) => Promise<void>
      commentText: string
      canEditDelete: boolean
      setActiveTextarea: (id: string | null) => void
      activeTextareaId: string
      isActiveTextarea: boolean
      status: string
}

export default function CommentActions({
      onReply,
      onEdit,
      onDelete,
      onStatusChange,
      commentText,
      canEditDelete,
      setActiveTextarea,
      activeTextareaId,
      isActiveTextarea,
      status
}: CommentActionsProps) {
      const { data: session } = useSession()
      const [isDeletingConfirm, setIsDeletingConfirm] = useState(false)
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

      const handleDelete = () => {
            setIsDeletingConfirm(true)
      }

      const confirmDelete = async () => {
            await onDelete()
            setIsDeletingConfirm(false)
      }

      return (
            <div>
                  <button onClick={handleReply} className="text-blue-500 text-sm mt-2 mr-2">
                        Reply
                  </button>
                  {canEditDelete && (
                        <>
                              <button onClick={onEdit} className="text-green-500 text-sm mt-2 mr-2">
                                    <FaEdit />
                              </button>
                              <button onClick={handleDelete} className="text-red-500 text-sm mt-2 mr-2">
                                    {isDeletingConfirm ? <FaCheck onClick={confirmDelete} /> : <FaTrash />}
                              </button>
                              {isDeletingConfirm && (
                                    <button
                                          onClick={() => setIsDeletingConfirm(false)}
                                          className="text-gray-500 text-sm mt-2 mr-2"
                                    >
                                          <FaTimes />
                                    </button>
                              )}
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
