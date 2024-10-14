import React, { useState, useRef, useEffect } from 'react'
import Editor from './Editor'

interface CommentFormProps {
      onSubmit: (comment: string) => Promise<void>
      isArchived: boolean
}

export default function CommentForm({ onSubmit, isArchived }: CommentFormProps) {
      const [newComment, setNewComment] = useState('')
      const [isExpanded, setIsExpanded] = useState(false)

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault()
            if (!newComment.trim()) return

            await onSubmit(newComment)
            setNewComment('')
            setIsExpanded(false)
      }

      const handleCancel = () => {
            setNewComment('')
            setIsExpanded(false)
      }

      const handleFocus = () => {
            setIsExpanded(true)
      }

      if (isArchived) {
            return null
      }

      return (
            <form onSubmit={handleSubmit} className="mb-6 relative">
                  <div onFocus={handleFocus}>
                        <Editor content={newComment} onChange={setNewComment} simpleMode={true} />
                  </div>
                  {isExpanded && (
                        <div className="absolute bottom-3 right-3 flex space-x-2">
                              <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition"
                              >
                                    Cancel
                              </button>
                              <button
                                    type="submit"
                                    className="px-2 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 transition"
                              >
                                    Submit
                              </button>
                        </div>
                  )}
            </form>
      )
}
