'use client'

import { useState, useEffect } from 'react'
import { AdminListLayout } from '@/components/ui/admin-list-layout'
import { useSession } from 'next-auth/react'
import { ReportStatus, ReportCategory } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { Check, X, Clock, ExternalLink, Archive, Trash, Skull, ToggleLeft, ToggleRight } from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
            status: 'published' | 'draft'
      }
      comment?: {
            id: string
            commentText: string
            status: 'pending' | 'approved' | 'archived'
      }
}

export default function ReportsPanel() {
      const { data: session, status } = useSession()
      const [reports, setReports] = useState<Report[]>([])
      const [activeTab, setActiveTab] = useState<'post' | 'comment'>('post')

      useEffect(() => {
            if (status !== 'loading') {
                  fetchReports()
            }
      }, [status, activeTab])

      const fetchReports = async () => {
            try {
                  const response = await fetch(`/api/reports?filter=${activeTab}`)
                  if (!response.ok) {
                        throw new Error('Failed to fetch reports')
                  }
                  const data = await response.json()
                  setReports(data)
            } catch (error) {
                  console.error('Error fetching reports:', error)
            }
      }

      const handleCommentAction = async (
            commentId: string,
            action: 'approve' | 'pending' | 'archive' | 'softDelete' | 'hardDelete'
      ) => {
            try {
                  const response = await fetch(`/api/comments/${commentId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action })
                  })
                  if (!response.ok) {
                        throw new Error('Failed to update comment status')
                  }
                  await fetchReports()
            } catch (error) {
                  console.error('Error updating comment status:', error)
            }
      }

      const handlePostAction = async (postId: string, action: 'publish' | 'draft') => {
            try {
                  const response = await fetch(`/api/posts/${postId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: action })
                  })
                  if (!response.ok) {
                        throw new Error('Failed to update post status')
                  }
                  await fetchReports()
            } catch (error) {
                  console.error('Error updating post status:', error)
            }
      }

      const postColumns: ColumnDef<Report>[] = [
            {
                  accessorKey: 'reporter',
                  header: 'Reporter',
                  cell: ({ row }) => <span>{row.original.reporter.name || row.original.reporter.username}</span>
            },
            {
                  accessorKey: 'content',
                  header: 'Content',
                  cell: ({ row }) => (
                        <Link
                              href={`/posts/${row.original.post?.slug}`}
                              className="flex items-center text-blue-500 hover:underline"
                        >
                              {row.original.post?.title.substring(0, 50)}...
                              <ExternalLink className="ml-1 w-4 h-4" />
                        </Link>
                  )
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
                  cell: ({ row }) => {
                        const report = row.original
                        const postStatus = report.post?.status
                        return (
                              <div className="flex space-x-2">
                                    <button
                                          onClick={() =>
                                                handlePostAction(
                                                      report.postId!,
                                                      postStatus === 'published' ? 'draft' : 'published'
                                                )
                                          }
                                          className="p-1 rounded bg-blue-100 hover:bg-blue-200"
                                          title={postStatus === 'published' ? 'Set to Draft' : 'Publish'}
                                    >
                                          {postStatus === 'published' ? (
                                                <ToggleRight className="w-4 h-4 text-blue-600" />
                                          ) : (
                                                <ToggleLeft className="w-4 h-4 text-blue-600" />
                                          )}
                                    </button>
                              </div>
                        )
                  }
            }
      ]

      const commentColumns: ColumnDef<Report>[] = [
            {
                  accessorKey: 'reporter',
                  header: 'Reporter',
                  cell: ({ row }) => <span>{row.original.reporter.name || row.original.reporter.username}</span>
            },
            {
                  accessorKey: 'content',
                  header: 'Content',
                  cell: ({ row }) => <span>{row.original.comment?.commentText.substring(0, 50)}...</span>
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
                  cell: ({ row }) => {
                        const report = row.original
                        const commentStatus = report.comment?.status
                        return (
                              <div className="flex space-x-2">
                                    {commentStatus !== 'approved' && (
                                          <button
                                                onClick={() => handleCommentAction(report.commentId!, 'approve')}
                                                className="p-1 rounded bg-green-100 hover:bg-green-200"
                                                title="Approve"
                                          >
                                                <Check className="w-4 h-4 text-green-600" />
                                          </button>
                                    )}
                                    {commentStatus !== 'pending' && (
                                          <button
                                                onClick={() => handleCommentAction(report.commentId!, 'pending')}
                                                className="p-1 rounded bg-yellow-100 hover:bg-yellow-200"
                                                title="Set to Pending"
                                          >
                                                <Clock className="w-4 h-4 text-yellow-600" />
                                          </button>
                                    )}
                                    {commentStatus !== 'archived' && (
                                          <button
                                                onClick={() => handleCommentAction(report.commentId!, 'archive')}
                                                className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                                                title="Archive"
                                          >
                                                <Archive className="w-4 h-4 text-gray-600" />
                                          </button>
                                    )}
                                    <button
                                          onClick={() => handleCommentAction(report.commentId!, 'softDelete')}
                                          className="p-1 rounded bg-red-100 hover:bg-red-200"
                                          title="Soft Delete"
                                    >
                                          <Trash className="w-4 h-4 text-red-600" />
                                    </button>
                                    <button
                                          onClick={() => handleCommentAction(report.commentId!, 'hardDelete')}
                                          className="p-1 rounded bg-red-200 hover:bg-red-300"
                                          title="Hard Delete"
                                    >
                                          <Skull className="w-4 h-4 text-red-700" />
                                    </button>
                              </div>
                        )
                  }
            }
      ]

      if (status === 'loading') return <div>Loading...</div>
      if (!session) return <div>Access denied</div>

      return (
            <div className="container mx-auto p-4">
                  <h1 className="text-2xl font-bold mb-4">Reports</h1>
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'post' | 'comment')}>
                        <TabsList>
                              <TabsTrigger value="post">Post Reports</TabsTrigger>
                              <TabsTrigger value="comment">Comment Reports</TabsTrigger>
                        </TabsList>
                        <TabsContent value="post">
                              <AdminListLayout
                                    title=""
                                    addNewLink=""
                                    addNewText=""
                                    columns={postColumns}
                                    data={reports.filter((report) => report.postId)}
                              />
                        </TabsContent>
                        <TabsContent value="comment">
                              <AdminListLayout
                                    title=""
                                    addNewLink=""
                                    addNewText=""
                                    columns={commentColumns}
                                    data={reports.filter((report) => report.commentId)}
                              />
                        </TabsContent>
                  </Tabs>
            </div>
      )
}
