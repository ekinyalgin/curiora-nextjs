import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { RelativeDate } from './RelativeDate'
import SignInModal from './auth/SignInModal'

interface CommentItemProps {
      comment: any
      postId: number
      onReply: (parentId: number, text: string) => Promise<void>
      isChild?: boolean
}

export default function CommentItem({ comment, postId, onReply, isChild = false }: CommentItemProps) {
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
                  await onReply(comment.id, replyText)
                  setReplyText('')
                  setIsReplying(false)
            }
      }

      return (
            <div className={`mb-4 ${isChild ? 'ml-10' : ''}`}>
                  <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="font-bold">{comment.user.name}</div>
                        <div className="text-sm text-gray-600 mb-2">
                              <RelativeDate date={comment.createdAt} />
                        </div>
                        <p>{comment.commentText}</p>
                        {!isChild && (
                              <button onClick={handleReply} className="text-blue-500 text-sm mt-2">
                                    Reply
                              </button>
                        )}
                  </div>

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

                  {comment.childComments && comment.childComments.length > 0 && (
                        <div className="mt-4">
                              {comment.childComments.map((childComment) => (
                                    <CommentItem
                                          key={childComment.id}
                                          comment={childComment}
                                          postId={postId}
                                          onReply={onReply}
                                          isChild={true}
                                    />
                              ))}
                        </div>
                  )}

                  <SignInModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />
            </div>
      )
}
