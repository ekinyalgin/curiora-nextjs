'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import CommentItem from './CommentItem'
import SignInModal from './auth/SignInModal'

interface Comment {
      id: number
      commentText: string
      createdAt: string
      user: {
            name: string
            image?: string
      }
      childComments?: Comment[]
      parentCommentId: number | null
}

export default function CommentSection({ comments: initialComments, postId }) {
      const { data: session } = useSession()
      const [newComment, setNewComment] = useState('')
      const [comments, setComments] = useState<Comment[]>([])
      const [showSignInModal, setShowSignInModal] = useState(false)
      const [activeTextarea, setActiveTextarea] = useState<string | null>(null)

      useEffect(() => {
            // Organize comments into a hierarchy
            const parentComments = initialComments.filter((comment) => comment.parentCommentId === null)
            const childComments = initialComments.filter((comment) => comment.parentCommentId !== null)

            const organizedComments = parentComments.map((parent) => ({
                  ...parent,
                  childComments: childComments.filter((child) => child.parentCommentId === parent.id)
            }))

            setComments(organizedComments)
      }, [initialComments])

      const handleSubmit = async (e) => {
            e.preventDefault()
            if (!session) {
                  setShowSignInModal(true)
                  return
            }
            if (!newComment.trim()) return

            try {
                  const response = await fetch('/api/comments', {
                        method: 'POST',
                        headers: {
                              'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                              postId,
                              userId: session.user.id,
                              commentText: newComment,
                              status: 'approved'
                        })
                  })

                  if (!response.ok) {
                        throw new Error('Failed to submit comment')
                  }

                  const savedComment = await response.json()
                  setComments([savedComment, ...comments])
                  setNewComment('')
            } catch (error) {
                  console.error('Error submitting comment:', error)
                  alert('Failed to submit comment. Please try again.')
            }
      }

      const handleReply = async (parentId: number, replyText: string) => {
            try {
                  const response = await fetch('/api/comments', {
                        method: 'POST',
                        headers: {
                              'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                              postId,
                              userId: session.user.id,
                              commentText: replyText,
                              parentCommentId: parentId,
                              status: 'approved'
                        })
                  })

                  if (!response.ok) {
                        throw new Error('Failed to submit reply')
                  }

                  const savedReply = await response.json()

                  setComments((prevComments) => {
                        return prevComments.map((comment) => {
                              if (comment.id === parentId) {
                                    return {
                                          ...comment,
                                          childComments: [...(comment.childComments || []), savedReply]
                                    }
                              }
                              return comment
                        })
                  })
                  setActiveTextarea(null)
            } catch (error) {
                  console.error('Error submitting reply:', error)
                  alert('Failed to submit reply. Please try again.')
            }
      }

      const handleEdit = async (commentId: number, newText: string) => {
            try {
                  const response = await fetch(`/api/comments/${commentId}`, {
                        method: 'PUT',
                        headers: {
                              'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ commentText: newText })
                  })

                  if (!response.ok) {
                        throw new Error('Failed to edit comment')
                  }

                  const updatedComment = await response.json()

                  setComments((prevComments) => {
                        return prevComments.map((comment) => {
                              if (comment.id === commentId) {
                                    return { ...comment, ...updatedComment }
                              }
                              if (comment.childComments) {
                                    return {
                                          ...comment,
                                          childComments: comment.childComments.map((childComment) =>
                                                childComment.id === commentId
                                                      ? { ...childComment, ...updatedComment }
                                                      : childComment
                                          )
                                    }
                              }
                              return comment
                        })
                  })
                  setActiveTextarea(null)
            } catch (error) {
                  console.error('Error editing comment:', error)
                  alert('Failed to edit comment. Please try again.')
            }
      }

      const handleDelete = async (commentId: number) => {
            try {
                  const response = await fetch(`/api/comments/${commentId}`, {
                        method: 'DELETE'
                  })

                  if (!response.ok) {
                        throw new Error('Failed to delete comment')
                  }

                  setComments((prevComments) => {
                        return prevComments.filter((comment) => {
                              if (comment.id === commentId) return false
                              if (comment.childComments) {
                                    comment.childComments = comment.childComments.filter(
                                          (childComment) => childComment.id !== commentId
                                    )
                              }
                              return true
                        })
                  })
            } catch (error) {
                  console.error('Error deleting comment:', error)
                  alert('Failed to delete comment. Please try again.')
            }
      }

      return (
            <section className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">Comments</h2>
                  {comments.map((comment) => (
                        <CommentItem
                              key={comment.id}
                              comment={comment}
                              postId={postId}
                              onReply={handleReply}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              activeTextarea={activeTextarea}
                              setActiveTextarea={setActiveTextarea}
                        />
                  ))}
                  {session ? (
                        <form onSubmit={handleSubmit} className="mt-4">
                              <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                    rows={4}
                                    placeholder="Write a comment..."
                              />
                              <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
                                    Submit Comment
                              </button>
                        </form>
                  ) : (
                        <p>Please log in to leave a comment.</p>
                  )}
                  <SignInModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />
            </section>
      )
}
