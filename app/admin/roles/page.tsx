'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { TableComponent } from '@/components/TableComponent'
import { Button } from '@/components/ui/button'
import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogTrigger,
      DialogDescription
} from '@/components/ui/dialog'
import { RoleForm } from '@/app/admin/roles/RoleForm'
import Notification from '@/lib/notification'
import Loading from '@/lib/loading'

interface Role {
      id: number
      name: string
      description: string
}

interface SessionUser {
      role?: string
}

export default function RoleManagement() {
      const [roles, setRoles] = useState<Role[]>([])
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState<string | null>(null)
      const { data: session, status } = useSession()
      const router = useRouter()
      const [isEditModalOpen, setIsEditModalOpen] = useState(false)
      const [editingRoleId, setEditingRoleId] = useState<number | null>(null)
      const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

      useEffect(() => {
            checkSession()
      }, [status, session])

      const checkSession = () => {
            if (status === 'authenticated' && (session?.user as SessionUser)?.role !== 'admin') {
                  router.push('/')
            } else if (status === 'unauthenticated') {
                  router.push('/')
            }
      }

      useEffect(() => {
            if (status === 'authenticated' && (session?.user as SessionUser)?.role === 'admin') {
                  fetchRoles()
            }
      }, [status, session])

      const fetchRoles = async () => {
            try {
                  setLoading(true)
                  const response = await fetch('/api/roles')
                  if (!response.ok) throw new Error('Failed to fetch roles')
                  const data = await response.json()
                  setRoles(data)
                  setError(null)
            } catch (error) {
                  setError('Failed to load roles. Please try again later.')
                  console.error('Error fetching roles:', error)
            } finally {
                  setLoading(false)
            }
      }

      const handleEdit = (id: number) => {
            setEditingRoleId(id)
            setIsEditModalOpen(true)
      }

      const handleDelete = async (id: number) => {
            try {
                  const response = await fetch('/api/roles', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id })
                  })
                  if (!response.ok) throw new Error('Failed to delete role')
                  await fetchRoles()
                  setNotification({ message: 'Role deleted successfully', type: 'success' })
            } catch (err) {
                  console.error('Error deleting role:', err)
                  setNotification({ message: 'Failed to delete role. Please try again.', type: 'error' })
            }
      }

      const columns: ExtendedColumnDef<Role>[] = [
            {
                  accessorKey: 'id',
                  header: 'ID',
                  headerClassName: '',
                  cell: ({ row }) => <div className="text-center font-medium">{row.original.id}</div>
            },
            {
                  accessorKey: 'name',
                  header: 'Name',
                  headerClassName: 'w-3/12 text-left',
                  cell: ({ row }) => <div className="font-semibold">{row.original.name}</div>
            },
            {
                  accessorKey: 'description',
                  header: 'Description',
                  headerClassName: 'w-8/12  text-left',
                  cell: ({ row }) => (
                        <div className="text-gray-500 text-sm leading-relaxed">{row.original.description}</div>
                  )
            }
      ]

      if (status === 'loading' || loading) {
            return <Loading />
      }
      if (error) {
            return <div>Error: {error}</div>
      }
      if (status === 'authenticated' && (session.user as SessionUser).role !== 'admin') {
            return <div>Unauthorized</div>
      }

      return (
            <div className="container mx-auto py-10">
                  <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Role Management</h1>
                        <Dialog>
                              <DialogTrigger asChild>
                                    <Button>Add New Role</Button>
                              </DialogTrigger>
                              <DialogContent>
                                    <DialogHeader>
                                          <DialogTitle>Add New Role</DialogTitle>
                                          <DialogDescription>
                                                Create a new role here. Click save when you're done.
                                          </DialogDescription>
                                    </DialogHeader>
                                    <RoleForm
                                          onSubmit={() => {
                                                fetchRoles()
                                                setNotification({ message: 'Role added successfully', type: 'success' })
                                          }}
                                    />
                              </DialogContent>
                        </Dialog>
                  </div>
                  <TableComponent columns={columns} data={roles} onEdit={handleEdit} onDelete={handleDelete} />
                  <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                        <DialogContent>
                              <DialogHeader>
                                    <DialogTitle>Edit Role</DialogTitle>
                                    <DialogDescription>
                                          Edit the role details here. Click update when you're done.
                                    </DialogDescription>
                              </DialogHeader>
                              <RoleForm
                                    roleId={editingRoleId}
                                    onSubmit={() => {
                                          fetchRoles()
                                          setIsEditModalOpen(false)
                                          setNotification({ message: 'Role updated successfully', type: 'success' })
                                    }}
                              />
                        </DialogContent>
                  </Dialog>
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
