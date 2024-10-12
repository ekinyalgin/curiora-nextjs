import Image from 'next/image'
import { RelativeDate } from './RelativeDate'
import CommentActions from './CommentActions'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

interface CommentItemProps {
      comment: any
      postId: number
      onReply: (parentId: number, text: string) => Promise<void>
      onEdit: (commentId: number, text: string) => Promise<void>
      onDelete: (commentId: number) => Promise<void>
      isChild?: boolean
      topLevelParentId?: number
      activeTextarea: string | null
      setActiveTextarea: (id: string | null) => void
}

export default function CommentItem({
      comment,
      postId,
      onReply,
      onEdit,
      onDelete,
      isChild = false,
      topLevelParentId,
      activeTextarea,
      setActiveTextarea
}: CommentItemProps) {
      const { data: session } = useSession()
      const [editText, setEditText] = useState(comment.commentText)

      const handleReply = async (text: string) => {
            const parentId = isChild ? topLevelParentId : comment.id
            await onReply(parentId, text)
            setActiveTextarea(null)
      }

      const handleEdit = async (text: string) => {
            await onEdit(comment.id, text)
            setActiveTextarea(null)
      }

      const handleDelete = async () => {
            await onDelete(comment.id)
      }

      const canEditDelete = session && (session.user.id === comment.userId || session.user.role === 'admin')

      return (
            <div className={`mb-4 ${isChild ? 'ml-10' : ''}`}>
                  <div className="bg-gray-100 p-4 rounded-lg">
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
                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                          <span className="text-xl font-bold text-white">{comment.user.name[0]}</span>
                                    </div>
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
                                    <p>{comment.commentText}</p>
                                    <CommentActions
                                          onReply={handleReply}
                                          onEdit={() => setActiveTextarea(`edit-${comment.id}`)}
                                          onDelete={handleDelete}
                                          commentText={comment.commentText}
                                          canEditDelete={canEditDelete}
                                          setActiveTextarea={setActiveTextarea}
                                          activeTextareaId={`reply-${comment.id}`}
                                          isActiveTextarea={activeTextarea === `reply-${comment.id}`}
                                    />
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
                                                isChild={true}
                                                topLevelParentId={isChild ? topLevelParentId : comment.id}
                                                activeTextarea={activeTextarea}
                                                setActiveTextarea={setActiveTextarea}
                                          />
                                    ))}
                        </div>
                  )}
            </div>
      )
}
