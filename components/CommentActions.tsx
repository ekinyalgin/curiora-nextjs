import { useState } from 'react'
import { useSession } from 'next-auth/react'
import SignInModal from './auth/SignInModal'

interface CommentActionsProps {
      onReply: (text: string) => Promise<void>
}

export default function CommentActions({ onReply }: CommentActionsProps) {
      const { data: session } = useSession()
      const [isReplying, setIsReplying] = useState(false)
      const [replyText, setReplyText] = useState('')
      const [showSignInModal, setShowSignInModal] = useState(false)

      const handleReply = async () => {
            if (!session) {
                  setShowSignInModal(true)
                  return
            }
            setIsReplying(true)
      }

      const submitReply = async () => {
            if (replyText.trim()) {
                  await onReply(replyText)
                  setReplyText('')
                  setIsReplying(false)
            }
      }

      return (
            <div>
                  <button onClick={handleReply} className="text-blue-500 text-sm mt-2 mr-2">
                        Reply
                  </button>
                  {/* Buraya diğer butonları ekleyebilirsiniz */}

                  {isReplying && (
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
                                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                              >
                                    Submit Reply
                              </button>
                        </div>
                  )}

                  <SignInModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />
            </div>
      )
}
