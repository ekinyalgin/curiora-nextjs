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
      }
      childComments?: Comment[]
      parentCommentId: number | null
}

export default function CommentSection({ comments: initialComments, postId }) {
      const { data: session } = useSession()
      const [newComment, setNewComment] = useState('')
      const [comments, setComments] = useState<Comment[]>([])
      const [showSignInModal, setShowSignInModal] = useState(false)

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
            } catch (error) {
                  console.error('Error submitting reply:', error)
                  alert('Failed to submit reply. Please try again.')
            }
      }

      return (
            <section className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">Comments</h2>
                  {comments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} postId={postId} onReply={handleReply} />
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
