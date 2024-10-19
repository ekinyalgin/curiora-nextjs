'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import CommentItem from './CommentItem'
import SignInModal from '../auth/SignInModal'
import CommentSearch from './CommentSearch'
import CommentSort from './CommentSort'
import CommentForm from './CommentForm'
import { Archive } from 'lucide-react'

interface CommentSectionProps {
      initialComments: Comment[]
      postId: number
      isAdmin: boolean
      isArchived: boolean
}

// @/types/comment'ten import etmek yerine burada tanımlayalım
interface Comment {
      id: number
      commentText: string
      status: string
      isDeleted: boolean
      createdAt: string
      user: {
            id: string
            name: string
            image?: string
      }
      voteCount?: {
            upVotes: number
            downVotes: number
      }
      votes?: { voteType: 'upvote' | 'downvote' }[]
      childComments?: Comment[]
      userVote?: 'upvote' | 'downvote' | null
      parentCommentId: number | null
}

export default function CommentSection({ initialComments, postId, isAdmin, isArchived }: CommentSectionProps) {
      const { data: session } = useSession()
      const [comments, setComments] = useState<Comment[]>([])
      const [filteredComments, setFilteredComments] = useState<Comment[]>([])
      const [showSignInModal, setShowSignInModal] = useState(false)
      const [activeTextarea, setActiveTextarea] = useState<string | null>(null)
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

      const handleNewComment = async (newComment: string) => {
            if (!session) {
                  setShowSignInModal(true)
                  return
            }

            try {
                  const response = await fetch('/api/comments', {
                        method: 'POST',
                        headers: {
                              'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                              postId,
                              userId: session?.user?.id,
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
            } catch (error) {
                  console.error('Error submitting comment:', error)
                  alert('Failed to submit comment. Please try again.')
            }
      }

      const handleReply = async (parentId: number, replyText: string) => {
            if (!session || !session.user) {
                  console.error('User session is not available')
                  return
            }

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

      const handleStatusChange = async (commentId: number, newStatus: string, archivedAt?: Date) => {
            try {
                  const response = await fetch(`/api/comments/${commentId}`, {
                        method: 'PATCH',
                        headers: {
                              'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ status: newStatus, archivedAt })
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

      const updateCommentInList = (commentList: Comment[], updatedComment: Partial<Comment>) => {
            return commentList.map((comment) => {
                  if (comment.id === updatedComment.id) {
                        return { ...comment, ...updatedComment }
                  }
                  if (comment.childComments) {
                        return {
                              ...comment,
                              childComments: comment.childComments.map((childComment: Comment) =>
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
            if (!term) {
                  setFilteredComments(comments)
            } else {
                  const filtered = comments.filter(
                        (comment) =>
                              comment.commentText.toLowerCase().includes(term.toLowerCase()) ||
                              (comment.childComments &&
                                    comment.childComments.some((child: Comment) =>
                                          child.commentText.toLowerCase().includes(term.toLowerCase())
                                    ))
                  )
                  setFilteredComments(filtered)
            }
      }

      const handleSort = (option: 'best' | 'new' | 'old' | 'controversial') => {
            setSortOption(option)
            const sorted = [...filteredComments]
            switch (option) {
                  case 'best':
                        sorted.sort(
                              (a: Comment, b: Comment) => (b.voteCount?.upVotes || 0) - (a.voteCount?.upVotes || 0)
                        )
                        break
                  case 'new':
                        sorted.sort(
                              (a: Comment, b: Comment) =>
                                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        )
                        break
                  case 'old':
                        sorted.sort(
                              (a: Comment, b: Comment) =>
                                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                        )
                        break
                  case 'controversial':
                        sorted.sort((a: Comment, b: Comment) => {
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
                  {!isArchived && session ? (
                        <CommentForm onSubmit={handleNewComment} isArchived={isArchived} />
                  ) : isArchived ? (
                        <div className="items-center flex space-x-4 border border-gray-300 p-4 mb-5">
                              <Archive className="w-4 text-gray-400" />
                              <p className="text-sm text-gray-400">
                                    This post is archived. New comments cannot be posted.
                              </p>
                        </div>
                  ) : (
                        <p className="mb-6">Please log in to leave a comment.</p>
                  )}

                  <div className="flex justify-between mb-4">
                        <CommentSort onSort={handleSort} currentSort={sortOption} />
                        <CommentSearch onSearch={handleSearch} />
                  </div>

                  {filteredComments.length > 0 ? (
                        filteredComments.map((comment) => (
                              <CommentItem
                                    key={comment.id}
                                    comment={comment as Comment}
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
                                    isArchived={isArchived}
                                    updateComment={(commentId, updatedComment) => {
                                          setComments((prevComments) =>
                                                updateCommentInList(prevComments, updatedComment)
                                          )
                                          setFilteredComments((prevComments) =>
                                                updateCommentInList(prevComments, updatedComment)
                                          )
                                    }}
                                    onDelete={handleDelete}
                              />
                        ))
                  ) : (
                        <div className="text-center py-8">
                              <p className="text-lg text-gray-600">No comments yet.</p>
                              {!isArchived && (
                                    <p className="text-md text-blue-500 mt-2">Be the first to share your thoughts!</p>
                              )}
                        </div>
                  )}

                  <SignInModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />
            </section>
      )
}
