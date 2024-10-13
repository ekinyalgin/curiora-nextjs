import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CommentFormProps {
      onSubmit: (comment: string) => Promise<void>
      isArchived: boolean
}

export default function CommentForm({ onSubmit, isArchived }: CommentFormProps) {
      const [newComment, setNewComment] = useState('')
      const [isExpanded, setIsExpanded] = useState(false)
      const textareaRef = useRef<HTMLTextAreaElement>(null)
      const formRef = useRef<HTMLFormElement>(null)

      useEffect(() => {
            adjustTextareaHeight()
      }, [newComment, isExpanded])

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

      const handleTextareaFocus = () => {
            setIsExpanded(true)
      }

      const adjustTextareaHeight = () => {
            if (textareaRef.current) {
                  textareaRef.current.style.height = 'auto'
                  textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
            }
      }

      if (isArchived) {
            return null
      }

      return (
            <motion.form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="mb-6 relative block rounded-lg border border-gray-600" // Formun tamamı görünür olsun
                  style={{
                        overflow: isExpanded ? 'visible' : 'hidden'
                  }}
                  initial={false}
                  animate={{ height: isExpanded ? 'auto' : '40px' }}
                  transition={{ duration: 0.3 }}
            >
                  <textarea
                        ref={textareaRef}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onFocus={handleTextareaFocus}
                        className={`w-full p-2 pl-3 border-none rounded-lg text-sm focus:outline-none resize-none text-black  ${
                              isExpanded ? 'min-h-[90px]' : 'h-full'
                        }`}
                        placeholder="Write a comment..."
                        style={{
                              paddingBottom: isExpanded ? '2.5rem' : '0.5rem',
                              height: isExpanded ? 'auto' : '40px' // textarea kapalıyken form içinde kalacak
                        }}
                  />

                  <AnimatePresence>
                        {isExpanded && (
                              <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute bottom-3 right-4 flex space-x-2"
                              >
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
                              </motion.div>
                        )}
                  </AnimatePresence>
            </motion.form>
      )
}
