'use client'

import { useState, useEffect } from 'react'
import { AdminListLayout } from '@/components/ui/admin-list-layout'
import { useSession } from 'next-auth/react'
import { ReportStatus, ReportCategory } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { Check, X, Clock, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Report {
      id: string
      category: ReportCategory
      description: string
      status: ReportStatus
      createdAt: string
      postId: string | null
      commentId: string | null
      reportCount: number
      reporter: {
            name: string
            username: string
      }
      post?: {
            id: string
            title: string
            slug: string
      }
      comment?: {
            id: string
            commentText: string
      }
}

export default function ReportsPanel() {
      const { data: session, status } = useSession()
      const [reports, setReports] = useState<Report[]>([])
      const [filter, setFilter] = useState<'all' | 'post' | 'comment'>('all')
      const [categoryFilter, setCategoryFilter] = useState<ReportCategory | 'all'>('all')

      useEffect(() => {
            if (status !== 'loading') {
                  fetchReports()
            }
      }, [status, filter, categoryFilter])

      const fetchReports = async () => {
            try {
                  const response = await fetch(`/api/reports?filter=${filter}&category=${categoryFilter}`)
                  if (!response.ok) {
                        throw new Error('Failed to fetch reports')
                  }
                  const data = await response.json()
                  setReports(data)
            } catch (error) {
                  console.error('Error fetching reports:', error)
            }
      }

      const handleDecision = async (reportId: string, decision: ReportStatus) => {
            try {
                  const response = await fetch(`/api/reports/${reportId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: decision })
                  })
                  if (!response.ok) {
                        throw new Error('Failed to update report status')
                  }
                  await fetchReports()
            } catch (error) {
                  console.error('Error updating report status:', error)
            }
      }

      const columns: ColumnDef<Report>[] = [
            {
                  accessorKey: 'reporter',
                  header: 'Reporter',
                  cell: ({ row }) => <span>{row.original.reporter.name || row.original.reporter.username}</span>
            },
            {
                  accessorKey: 'type',
                  header: 'Type',
                  cell: ({ row }) => (row.original.postId ? 'Post' : 'Comment')
            },
            {
                  accessorKey: 'content',
                  header: 'Content',
                  cell: ({ row }) => {
                        if (row.original.postId) {
                              return (
                                    <Link
                                          href={`/posts/${row.original.post?.slug}`}
                                          className="flex items-center text-blue-500 hover:underline"
                                    >
                                          {row.original.post?.title.substring(0, 50)}...
                                          <ExternalLink className="ml-1 w-4 h-4" />
                                    </Link>
                              )
                        } else if (row.original.commentId) {
                              return <span>{row.original.comment?.commentText.substring(0, 50)}...</span>
                        }
                        return null
                  }
            },
            {
                  accessorKey: 'category',
                  header: 'Category'
            },
            {
                  accessorKey: 'description',
                  header: 'Description'
            },
            {
                  accessorKey: 'reportCount',
                  header: 'Report Count'
            },
            {
                  accessorKey: 'status',
                  header: 'Status'
            },
            {
                  id: 'actions',
                  header: 'Actions',
                  cell: ({ row }) => (
                        <div className="flex space-x-2">
                              <button
                                    onClick={() => handleDecision(row.original.id, ReportStatus.APPROVED)}
                                    className="p-1 rounded bg-green-100 hover:bg-green-200"
                                    title="Approve"
                              >
                                    <Check className="w-4 h-4 text-green-600" />
                              </button>
                              <button
                                    onClick={() => handleDecision(row.original.id, ReportStatus.REJECTED)}
                                    className="p-1 rounded bg-red-100 hover:bg-red-200"
                                    title="Reject"
                              >
                                    <X className="w-4 h-4 text-red-600" />
                              </button>
                              <button
                                    onClick={() => handleDecision(row.original.id, ReportStatus.PENDING)}
                                    className="p-1 rounded bg-yellow-100 hover:bg-yellow-200"
                                    title="Pending"
                              >
                                    <Clock className="w-4 h-4 text-yellow-600" />
                              </button>
                        </div>
                  )
            }
      ]

      if (status === 'loading') return <div>Loading...</div>
      if (!session) return <div>Access denied</div>

      return (
            <AdminListLayout
                  title="Reports"
                  addNewLink=""
                  addNewText=""
                  columns={columns}
                  data={reports}
                  searchColumn="description"
                  searchPlaceholder="Search reports..."
                  onSearch={async (searchTerm) => {
                        // Implement search functionality if needed
                  }}
                  searchOptions={[
                        { value: 'all', label: 'All' },
                        { value: 'post', label: 'Posts' },
                        { value: 'comment', label: 'Comments' }
                  ]}
                  searchTypeSelector={
                        <select
                              value={filter}
                              onChange={(e) => setFilter(e.target.value as 'all' | 'post' | 'comment')}
                              className="p-2 border rounded"
                        >
                              <option value="all">All Types</option>
                              <option value="post">Posts</option>
                              <option value="comment">Comments</option>
                        </select>
                  }
            />
      )
}
