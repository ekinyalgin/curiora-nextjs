'use client'

import { useEffect, useState, useCallback } from 'react'
import { TableComponent } from '@/components/TableComponent'
import { ColumnDef } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Notification from '@/lib/notification'
import Loading from '@/lib/loading'

interface Comment {
      id: number
      status: string
      commentText: string
      createdAt: string
      user: { name: string }
      post: { title: string }
}

export default function CommentsPage() {
      const [comments, setComments] = useState<Comment[]>([])
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState<string | null>(null)
      const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
      const router = useRouter()
      const { data: session, status } = useSession()

      const fetchComments = useCallback(async (search: string = '') => {
            try {
                  setLoading(true)
                  const response = await fetch(`/api/comments?search=${encodeURIComponent(search)}`)
                  if (!response.ok) {
                        const errorText = await response.text()
                        throw new Error(
                              `Failed to fetch comments: ${response.status} ${response.statusText}. ${errorText}`
                        )
                  }
                  const data = await response.json()
                  // Add this right after const data = await response.json()
                  if (!Array.isArray(data)) {
                        throw new Error(`Expected an array of comments, but received: ${JSON.stringify(data)}`)
                  }
                  setComments(data)
                  setError(null)
            } catch (error) {
                  setError('Failed to load comments. Please try again later.')
                  console.error('Error fetching comments:', error)
            } finally {
                  setLoading(false)
            }
      }, [])

      useEffect(() => {
            if (status === 'authenticated' && session?.user?.role === 'admin') {
                  fetchComments()
            } else if (status === 'unauthenticated') {
                  router.push('/')
            }
      }, [status, session, router, fetchComments])

      const handleEdit = (id: number) => {
            router.push(`/admin/comments/${id}`)
      }

      const handleDelete = async (id: number) => {
            // Optimistic update
            const updatedComments = comments.filter((comment) => comment.id !== id)
            setComments(updatedComments)

            try {
                  const response = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
                  if (!response.ok) throw new Error('Failed to delete comment')
                  setNotification({ message: 'Comment deleted successfully', type: 'success' })
            } catch (error) {
                  console.error('Error deleting comment:', error)
                  setNotification({ message: 'Failed to delete comment. Please try again.', type: 'error' })
                  // Revert the optimistic update
                  await fetchComments()
            }
      }

      const handleSearch = async (term: string) => {
            await fetchComments(term)
      }

      const columns: ColumnDef<Comment>[] = [
            {
                  accessorKey: 'commentText',
                  header: 'Comment',
                  cell: ({ row }) => row.original.commentText.substring(0, 50) + '...'
            },
            {
                  accessorKey: 'status',
                  header: 'Status'
            },
            {
                  accessorKey: 'user.name',
                  header: 'User'
            },
            {
                  accessorKey: 'post.title',
                  header: 'Post'
            },
            {
                  accessorKey: 'createdAt',
                  header: 'Created At',
                  cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString()
            }
      ]

      if (status === 'loading' || loading) {
            return <Loading />
      }
      if (error) {
            return <div>Error: {error}</div>
      }
      if (status === 'authenticated' && session.user.role !== 'admin') {
            return <div>Unauthorized</div>
      }

      return (
            <div className="container mx-auto py-10">
                  <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Comment Management</h1>
                        <Button onClick={() => router.push('/admin/comments/new')}>Add New Comment</Button>
                  </div>
                  <TableComponent
                        columns={columns}
                        data={comments}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onSearch={handleSearch}
                        enableSearch={true}
                  />
                  {notification && (
                        <Notification
                              message={notification.message}
                              type={notification.type}
                              onClose={() => setNotification(null)}
                        />
                  )}
            </div>
      )
}
