'use client'

import { useState, useEffect } from 'react'
import { AdminListLayout } from '@/components/ui/admin-list-layout'
import { useSession } from 'next-auth/react'
import { ReportStatus, ReportCategory } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'

interface Report {
      id: string
      category: ReportCategory
      description: string
      status: ReportStatus
      createdAt: string
      postId: string | null
      commentId: string | null
      reportCount: number
}

export default function ReportsPanel() {
      const { data: session, status } = useSession()
      const [reports, setReports] = useState<Report[]>([])

      useEffect(() => {
            if (status !== 'loading') {
                  fetchReports()
            }
      }, [status])

      const fetchReports = async () => {
            try {
                  const response = await fetch('/api/reports')
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
                  accessorKey: 'id',
                  header: 'ID'
            },
            {
                  accessorKey: 'type',
                  header: 'Type',
                  cell: ({ row }) => (row.original.postId ? 'Post' : 'Comment')
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
                        <div>
                              <button
                                    onClick={() => handleDecision(row.original.id, ReportStatus.APPROVED)}
                                    className="bg-green-500 text-white p-1 rounded mr-1"
                              >
                                    Approve
                              </button>
                              <button
                                    onClick={() => handleDecision(row.original.id, ReportStatus.REJECTED)}
                                    className="bg-red-500 text-white p-1 rounded mr-1"
                              >
                                    Reject
                              </button>
                              <button
                                    onClick={() => handleDecision(row.original.id, ReportStatus.PENDING)}
                                    className="bg-yellow-500 text-white p-1 rounded"
                              >
                                    Pending
                              </button>
                        </div>
                  )
            }
      ]

      if (status === 'loading') return <div>Loading...</div>
      if (!session) return <div>Access denied</div>

      return <AdminListLayout title="Reports" addNewLink="" addNewText="" columns={columns} data={reports} />
}
