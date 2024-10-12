'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import CommentItem from './CommentItem'
import SignInModal from './auth/SignInModal'
import CommentSearch from './CommentSearch'
import CommentSort from './CommentSort'

interface Comment {
      id: number
      commentText: string
      createdAt: string
      status: 'pending' | 'approved' | 'archived'
      user: {
            name: string
            image?: string
      }
      childComments?: Comment[]
      parentCommentId: number | null
}

interface CommentSectionProps {
      comments: Comment[]
      postId: number
      isAdmin: boolean
}

export default function CommentSection({ comments: initialComments, postId, isAdmin }: CommentSectionProps) {
      const { data: session } = useSession()
      const [newComment, setNewComment] = useState('')
      const [comments, setComments] = useState<Comment[]>([])
      const [filteredComments, setFilteredComments] = useState<Comment[]>([])
      const [showSignInModal, setShowSignInModal] = useState(false)
      const [activeTextarea, setActiveTextarea] = useState<string | null>(null)
      const [searchTerm, setSearchTerm] = useState('')
      const [sortOption, setSortOption] = useState<'best' | 'new' | 'old' | 'controversial'>('best')

      useEffect(() => {
            const organizedComments = organizeComments(initialComments)
            setComments(organizedComments)
            setFilteredComments(organizedComments)
      }, [initialComments])

      const organizeComments = (commentsToOrganize: Comment[]) => {
            const parentComments = commentsToOrganize.filter((comment) => comment.parentCommentId === null)
            const childComments = commentsToOrganize.filter((comment) => comment.parentCommentId !== null)

            return parentComments.map((parent) => ({
                  ...parent,
                  childComments: childComments.filter((child) => child.parentCommentId === parent.id)
            }))
      }

      const handleSubmit = async (e: React.FormEvent) => {
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
                              status: isAdmin ? 'approved' : 'pending'
                        })
                  })

                  if (!response.ok) {
                        throw new Error('Failed to submit comment')
                  }

                  const savedComment = await response.json()
                  setComments([savedComment, ...comments])
                  setFilteredComments([savedComment, ...filteredComments])
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
                              status: isAdmin ? 'approved' : 'pending'
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
                  setFilteredComments((prevComments) => {
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

                  setComments((prevComments) => updateCommentInList(prevComments, updatedComment))
                  setFilteredComments((prevComments) => updateCommentInList(prevComments, updatedComment))
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

                  setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId))
                  setFilteredComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId))
            } catch (error) {
                  console.error('Error deleting comment:', error)
                  alert('Failed to delete comment. Please try again.')
            }
      }

      const handleStatusChange = async (commentId: number, newStatus: string) => {
            try {
                  const response = await fetch(`/api/comments/${commentId}`, {
                        method: 'PATCH',
                        headers: {
                              'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ status: newStatus })
                  })

                  if (!response.ok) {
                        const errorData = await response.json()
                        throw new Error(errorData.error || 'Failed to change comment status')
                  }

                  const updatedComment = await response.json()

                  setComments((prevComments) => updateCommentInList(prevComments, updatedComment))
                  setFilteredComments((prevComments) => updateCommentInList(prevComments, updatedComment))
            } catch (error) {
                  console.error('Error changing comment status:', error)
                  alert('Failed to change comment status. Please try again.')
            }
      }

      const updateCommentInList = (commentList: Comment[], updatedComment: Comment) => {
            return commentList.map((comment) => {
                  if (comment.id === updatedComment.id) {
                        return { ...comment, ...updatedComment }
                  }
                  if (comment.childComments) {
                        return {
                              ...comment,
                              childComments: comment.childComments.map((childComment) =>
                                    childComment.id === updatedComment.id
                                          ? { ...childComment, ...updatedComment }
                                          : childComment
                              )
                        }
                  }
                  return comment
            })
      }

      const handleSearch = (term: string) => {
            setSearchTerm(term)
            if (!term) {
                  setFilteredComments(comments)
            } else {
                  const filtered = comments.filter(
                        (comment) =>
                              comment.commentText.toLowerCase().includes(term.toLowerCase()) ||
                              (comment.childComments &&
                                    comment.childComments.some((child) =>
                                          child.commentText.toLowerCase().includes(term.toLowerCase())
                                    ))
                  )
                  setFilteredComments(filtered)
            }
      }

      const handleSort = (option: 'best' | 'new' | 'old' | 'controversial') => {
            setSortOption(option)
            let sorted = [...filteredComments]
            switch (option) {
                  case 'best':
                        sorted.sort((a, b) => (b.voteCount?.upVotes || 0) - (a.voteCount?.upVotes || 0))
                        break
                  case 'new':
                        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        break
                  case 'old':
                        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                        break
                  case 'controversial':
                        sorted.sort((a, b) => {
                              const aScore = (a.voteCount?.downVotes || 0) / (a.voteCount?.upVotes || 1)
                              const bScore = (b.voteCount?.downVotes || 0) / (b.voteCount?.upVotes || 1)
                              return bScore - aScore
                        })
                        break
            }
            setFilteredComments(sorted)
      }

      const handleSoftDelete = async (commentId: number) => {
            try {
                  const response = await fetch(`/api/comments/${commentId}`, {
                        method: 'PATCH',
                        headers: {
                              'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ isDeleted: true })
                  })

                  if (!response.ok) {
                        throw new Error('Failed to soft delete comment')
                  }

                  const updatedComment = await response.json()
                  setComments((prevComments) => updateCommentInList(prevComments, updatedComment))
                  setFilteredComments((prevComments) => updateCommentInList(prevComments, updatedComment))
            } catch (error) {
                  console.error('Error soft deleting comment:', error)
                  alert('Failed to soft delete comment. Please try again.')
            }
      }

      const handleHardDelete = async (commentId: number) => {
            try {
                  const response = await fetch(`/api/comments/${commentId}`, {
                        method: 'DELETE'
                  })

                  if (!response.ok) {
                        throw new Error('Failed to hard delete comment')
                  }

                  setComments((prevComments) => removeCommentFromList(prevComments, commentId))
                  setFilteredComments((prevComments) => removeCommentFromList(prevComments, commentId))
            } catch (error) {
                  console.error('Error hard deleting comment:', error)
                  alert('Failed to hard delete comment. Please try again.')
            }
      }

      const removeCommentFromList = (commentList: Comment[], commentId: number) => {
            return commentList.filter((comment) => {
                  if (comment.id === commentId) {
                        return false
                  }
                  if (comment.childComments) {
                        comment.childComments = removeCommentFromList(comment.childComments, commentId)
                  }
                  return true
            })
      }

      const handleRestore = async (commentId: number) => {
            try {
                  const response = await fetch(`/api/comments/${commentId}`, {
                        method: 'PATCH',
                        headers: {
                              'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ isDeleted: false })
                  })

                  if (!response.ok) {
                        throw new Error('Failed to restore comment')
                  }

                  const restoredComment = await response.json()
                  setComments((prevComments) => updateCommentInList(prevComments, restoredComment))
                  setFilteredComments((prevComments) => updateCommentInList(prevComments, restoredComment))
            } catch (error) {
                  console.error('Error restoring comment:', error)
                  alert('Failed to restore comment. Please try again.')
            }
      }

      return (
            <section className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">Comments</h2>
                  {session ? (
                        <form onSubmit={handleSubmit} className="mb-6">
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
                        <p className="mb-6">Please log in to leave a comment.</p>
                  )}

                  <div className="flex justify-between mb-4">
                        <CommentSearch onSearch={handleSearch} />
                        <CommentSort onSort={handleSort} currentSort={sortOption} />
                  </div>

                  {filteredComments.map((comment) => (
                        <CommentItem
                              key={comment.id}
                              comment={comment}
                              postId={postId}
                              onReply={handleReply}
                              onEdit={handleEdit}
                              onSoftDelete={handleSoftDelete}
                              onHardDelete={handleHardDelete}
                              onRestore={handleRestore}
                              onStatusChange={handleStatusChange}
                              activeTextarea={activeTextarea}
                              setActiveTextarea={setActiveTextarea}
                              isAdmin={isAdmin}
                              updateComment={(commentId, updatedComment) => {
                                    setComments((prevComments) => updateCommentInList(prevComments, updatedComment))
                                    setFilteredComments((prevComments) =>
                                          updateCommentInList(prevComments, updatedComment)
                                    )
                              }}
                        />
                  ))}

                  <SignInModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />
            </section>
      )
}
