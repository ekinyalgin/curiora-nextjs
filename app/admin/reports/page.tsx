'use client'

import { useState, useEffect, useCallback } from 'react'
//import { TableComponent } from '@/components/TableComponent'
import { useSession } from 'next-auth/react'
import { ReportCategory } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import {
      Check,
      X,
      Clock,
      ExternalLink,
      Archive,
      Trash,
      Skull,
      ToggleLeft,
      ToggleRight,
      AlertTriangle,
      RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TableComponent } from '@/components/TableComponent'

interface Report {
      id: number
      category: ReportCategory
      description: string
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
            isDeleted: boolean
      }
}

export default function ReportsPanel() {
      const { data: session, status } = useSession()
      const [reports, setReports] = useState<Report[]>([])
      const [activeTab, setActiveTab] = useState<'comment' | 'post'>('comment')
      const [isHardDeleteConfirmation, setIsHardDeleteConfirmation] = useState<{ [key: string]: boolean }>({})

      const fetchReports = useCallback(async () => {
            try {
                  const response = await fetch(`/api/reports?filter=${activeTab}`)
                  if (!response.ok) {
                        throw new Error('Failed to fetch reports')
                  }
                  const data: Report[] = await response.json() // Tip belirtildi
                  setReports(data)
            } catch (error) {
                  console.error('Error fetching reports:', error)
            }
      }, [activeTab])

      useEffect(() => {
            if (status !== 'loading') {
                  fetchReports()
            }
      }, [status, activeTab, fetchReports])

      const handleCommentAction = async (
            commentId: string,
            action:
                  | 'approve'
                  | 'pending'
                  | 'archive'
                  | 'softDelete'
                  | 'hardDelete'
                  | 'reject'
                  | 'delete'
                  | 'restoreDeleted'
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
                        body: JSON.stringify({ status: action === 'publish' ? 'published' : 'draft' })
                  })
                  if (!response.ok) {
                        throw new Error('Failed to update post status')
                  }
                  await fetchReports()
            } catch (error) {
                  console.error('Error updating post status:', error)
            }
      }

      const handleReportAction = async (reportId: string, commentId: string, action: string) => {
            try {
                  await handleCommentAction(commentId, action as (typeof handleCommentAction.arguments)[1])
                  const response = await fetch(`/api/reports/${reportId}`, {
                        method: 'DELETE'
                  })
                  if (!response.ok) {
                        throw new Error('Failed to delete report')
                  }
                  await fetchReports()
            } catch (error) {
                  console.error('Error handling report action:', error)
            }
      }

      const handleDeleteReport = async (reportId: string) => {
            try {
                  const response = await fetch(`/api/reports/${reportId}`, {
                        method: 'DELETE'
                  })
                  if (!response.ok) {
                        throw new Error('Failed to delete report')
                  }
                  await fetchReports()
            } catch (error) {
                  console.error('Error deleting report:', error)
            }
      }

      const handleHardDeleteConfirmation = async (reportId: string, commentId: string) => {
            try {
                  await handleCommentAction(commentId, 'hardDelete')
                  await handleDeleteReport(reportId)
                  setIsHardDeleteConfirmation((prev) => ({ ...prev, [commentId]: false }))
            } catch (error) {
                  console.error('Error hard deleting comment:', error)
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
                                                      postStatus === 'published' ? 'draft' : 'publish'
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
                                    <button
                                          onClick={() =>
                                                handleReportAction(report.id.toString(), report.commentId!, 'approve')
                                          }
                                          className="p-1 rounded bg-green-100 hover:bg-green-200"
                                          title="Approve Report"
                                    >
                                          <Check className="w-4 h-4 text-green-600" />
                                    </button>
                                    <button
                                          onClick={() =>
                                                handleReportAction(report.id.toString(), report.commentId!, 'reject')
                                          }
                                          className="p-1 rounded bg-red-100 hover:bg-red-200"
                                          title="Reject Report"
                                    >
                                          <X className="w-4 h-4 text-red-600" />
                                    </button>
                                    <button
                                          onClick={() =>
                                                handleReportAction(report.id.toString(), report.commentId!, 'delete')
                                          }
                                          className="p-1 rounded bg-red-200 hover:bg-red-300"
                                          title="Delete Report"
                                    >
                                          <Trash className="w-4 h-4 text-red-700" />
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
                  header: 'Status',
                  cell: ({ row }) => {
                        const comment = row.original.comment
                        if (!comment) return null
                        return (
                              <span
                                    className={
                                          comment.status === 'approved'
                                                ? 'text-green-600'
                                                : comment.status === 'archived'
                                                  ? 'text-red-600'
                                                  : 'text-yellow-600'
                                    }
                              >
                                    {comment.status}
                              </span>
                        )
                  }
            },
            {
                  id: 'actions',
                  header: 'Actions',
                  cell: ({ row }) => {
                        const report = row.original
                        const commentStatus = report.comment?.status
                        const isDeleted = report.comment?.isDeleted

                        return (
                              <div className="flex space-x-2">
                                    {commentStatus !== 'approved' && (
                                          <button
                                                onClick={() => handleCommentAction(report.commentId!, 'approve')}
                                                className="p-1 rounded bg-green-100 hover:bg-green-200"
                                                title="Approve Comment"
                                          >
                                                <Check className="w-4 h-4 text-green-600" />
                                          </button>
                                    )}
                                    {commentStatus !== 'pending' && (
                                          <button
                                                onClick={() => handleCommentAction(report.commentId!, 'pending')}
                                                className="p-1 rounded bg-yellow-100 hover:bg-yellow-200"
                                                title="Set Comment to Pending"
                                          >
                                                <Clock className="w-4 h-4 text-yellow-600" />
                                          </button>
                                    )}
                                    {commentStatus !== 'archived' && (
                                          <button
                                                onClick={() => handleCommentAction(report.commentId!, 'archive')}
                                                className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                                                title="Archive Comment"
                                          >
                                                <Archive className="w-4 h-4 text-gray-600" />
                                          </button>
                                    )}
                                    <button
                                          onClick={() =>
                                                handleCommentAction(
                                                      report.commentId!,
                                                      isDeleted ? 'restoreDeleted' : 'softDelete'
                                                )
                                          }
                                          className={`p-1 rounded ${isDeleted ? 'bg-blue-100 hover:bg-blue-200' : 'bg-red-100 hover:bg-red-200'}`}
                                          title={isDeleted ? 'Restore Deleted Comment' : 'Soft Delete Comment'}
                                    >
                                          {isDeleted ? (
                                                <RefreshCw className="w-4 h-4 text-blue-600" />
                                          ) : (
                                                <Trash className="w-4 h-4 text-red-600" />
                                          )}
                                    </button>
                                    <button
                                          onClick={() => {
                                                if (isHardDeleteConfirmation[report.commentId!]) {
                                                      handleHardDeleteConfirmation(
                                                            report.id.toString(),
                                                            report.commentId!
                                                      )
                                                } else {
                                                      setIsHardDeleteConfirmation((prev) => ({
                                                            ...prev,
                                                            [report.commentId!]: true
                                                      }))
                                                }
                                          }}
                                          className="p-1 rounded bg-red-200 hover:bg-red-300"
                                          title={
                                                isHardDeleteConfirmation[report.commentId!]
                                                      ? 'Confirm Hard Delete'
                                                      : 'Hard Delete Comment'
                                          }
                                    >
                                          {isHardDeleteConfirmation[report.commentId!] ? (
                                                <Check className="w-4 h-4 text-red-700" />
                                          ) : (
                                                <Skull className="w-4 h-4 text-red-700" />
                                          )}
                                    </button>
                                    <button
                                          onClick={() => handleDeleteReport(report.id.toString())}
                                          className="p-1 rounded bg-orange-100 hover:bg-orange-200"
                                          title="Delete Report"
                                    >
                                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                                    </button>
                              </div>
                        )
                  }
            }
      ]

      if (status === 'loading') return <div>Loading...</div>
      if (!session || session.user.role !== 'admin') return <div>Access denied</div>

      return (
            <div className="container mx-auto p-4">
                  <h1 className="text-2xl font-bold mb-4">Reports</h1>
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'comment' | 'post')}>
                        <TabsList>
                              <TabsTrigger value="comment">Comment Reports</TabsTrigger>
                              <TabsTrigger value="post">Post Reports</TabsTrigger>
                        </TabsList>
                        <TabsContent value="post">
                              <TableComponent
                                    title=""
                                    addNewLink=""
                                    addNewText=""
                                    columns={postColumns}
                                    data={reports
                                          .filter((report) => report.postId)
                                          .map((report) => ({ ...report, id: Number(report.id) }))}
                              />
                        </TabsContent>
                        <TabsContent value="comment">
                              <TableComponent
                                    title=""
                                    addNewLink=""
                                    addNewText=""
                                    columns={commentColumns}
                                    data={reports
                                          .filter((report) => report.commentId)
                                          .map((report) => ({ ...report, id: Number(report.id) }))}
                              />
                        </TabsContent>
                  </Tabs>
            </div>
      )
}
