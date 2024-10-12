import { RelativeDate } from './RelativeDate'
import CommentActions from './CommentActions'

interface CommentItemProps {
      comment: any
      postId: number
      onReply: (parentId: number, text: string) => Promise<void>
      isChild?: boolean
      topLevelParentId?: number
}

export default function CommentItem({ comment, postId, onReply, isChild = false, topLevelParentId }: CommentItemProps) {
      const handleReply = async (text: string) => {
            const parentId = isChild ? topLevelParentId : comment.id
            await onReply(parentId, text)
      }

      return (
            <div className={`mb-4 ${isChild ? 'ml-10' : ''}`}>
                  <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="font-bold">{comment.user.name}</div>
                        <div className="text-sm text-gray-600 mb-2">
                              <RelativeDate date={comment.createdAt} />
                        </div>
                        <p>{comment.commentText}</p>
                        <CommentActions onReply={handleReply} />
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
                                                isChild={true}
                                                topLevelParentId={isChild ? topLevelParentId : comment.id}
                                          />
                                    ))}
                        </div>
                  )}
            </div>
      )
}
