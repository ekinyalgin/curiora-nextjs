'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { TableComponent } from '@/components/TableComponent'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { UserForm } from './UserForm'

interface User {
      id: number
      name: string
      email: string
      username: string
      role: {
            id: string
            name: string
            description?: string
      }
}

interface Role {
      id: string
      name: string
}

export default function UsersPage() {
      const [users, setUsers] = useState<User[]>([])
      const [roles, setRoles] = useState<Role[]>([])
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState<string | null>(null)
      const { data: session, status } = useSession()
      const router = useRouter()
      const [isModalOpen, setIsModalOpen] = useState(false)
      const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

      useEffect(() => {
            if (status === 'authenticated') {
                  if (session?.user?.role !== 'admin') {
                        router.push('/')
                  } else {
                        fetchUsers()
                        fetchRoles()
                  }
            } else if (status === 'unauthenticated') {
                  router.push('/login')
            }
      }, [session, status, router])

      const fetchUsers = async () => {
            try {
                  setLoading(true)
                  const response = await fetch('/api/users')
                  if (!response.ok) throw new Error('Failed to fetch users')
                  const data = await response.json()
                  setUsers(data)
            } catch (err) {
                  setError('Failed to load users. Please try again later.')
                  console.error('Error fetching users:', err)
            } finally {
                  setLoading(false)
            }
      }

      const fetchRoles = async () => {
            try {
                  const response = await fetch('/api/roles')
                  if (!response.ok) throw new Error('Failed to fetch roles')
                  const data = await response.json()
                  setRoles(data)
            } catch (err) {
                  console.error('Error fetching roles:', err)
            }
      }

      const handleEdit = (id: number) => {
            setSelectedUserId(id)
            setIsModalOpen(true)
      }

      const handleDelete = async (id: number) => {
            // Optimistic UI update
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id))

            try {
                  const response = await fetch(`/api/users/${id}`, { method: 'DELETE' })
                  if (!response.ok) throw new Error('Failed to delete user')
            } catch (err) {
                  console.error('Error deleting user:', err)
                  alert('Failed to delete user. Please try again.')
                  // Revert the optimistic update
                  await fetchUsers()
            }
      }

      const handleAddNew = () => {
            setSelectedUserId(null)
            setIsModalOpen(true)
      }

      const handleFormSubmit = async (data: Omit<User, 'id' | 'role'> & { roleId: string }) => {
            const isNewUser = selectedUserId === null
            const optimisticId = isNewUser ? Math.random() : selectedUserId
            const optimisticUser: User = {
                  id: optimisticId,
                  ...data,
                  role: roles.find((r) => r.id === data.roleId) || { id: data.roleId, name: 'Unknown' }
            }

            // Optimistic UI update
            setUsers((prevUsers) =>
                  isNewUser
                        ? [...prevUsers, optimisticUser]
                        : prevUsers.map((user) => (user.id === selectedUserId ? optimisticUser : user))
            )
            setIsModalOpen(false)

            try {
                  const url = isNewUser ? '/api/users' : `/api/users/${selectedUserId}`
                  const method = isNewUser ? 'POST' : 'PUT'

                  const response = await fetch(url, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                              name: data.name,
                              email: data.email,
                              username: data.username,
                              roleId: parseInt(data.roleId)
                        })
                  })

                  if (!response.ok) throw new Error('Failed to save user')

                  // Fetch the updated data to ensure consistency
                  await fetchUsers()
            } catch (err) {
                  console.error('Error saving user:', err)
                  alert('Failed to save user. Please try again.')
                  // Revert the optimistic update
                  await fetchUsers()
            }
      }

      const columns: ColumnDef<User>[] = [
            {
                  accessorKey: 'name',
                  header: () => <div className="w-3/12">Name</div>,
                  cell: ({ row }) => <div className="font-semibold">{row.getValue('name')}</div>
            },
            {
                  accessorKey: 'email',
                  header: () => <div className="w-3/12">Email</div>,
                  cell: ({ row }) => <div className="text-sm">{row.getValue('email')}</div>
            },
            {
                  accessorKey: 'username',
                  header: () => <div className="w-3/12">Username</div>,
                  cell: ({ row }) => <div className="text-sm">{row.getValue('username')}</div>
            },
            {
                  accessorKey: 'role.name',
                  header: () => <div className="w-2/12">Role</div>,
                  cell: ({ row }) => <div className="text-sm">{row.original.role?.name || 'N/A'}</div>
            }
      ]

      if (status === 'loading' || loading) {
            return <div>Loading...</div>
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
                        <h1 className="text-3xl font-bold">User Management</h1>
                        <Button onClick={handleAddNew}>Add New User</Button>
                  </div>
                  <TableComponent
                        columns={columns}
                        data={users}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        enableSearch={false}
                  />

                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogContent>
                              <DialogHeader>
                                    <DialogTitle>{selectedUserId ? 'Edit User' : 'Add New User'}</DialogTitle>
                                    <DialogDescription>
                                          {selectedUserId
                                                ? 'Edit the details of the selected user.'
                                                : 'Add a new user to the system.'}
                                    </DialogDescription>
                              </DialogHeader>
                              <UserForm userId={selectedUserId} onSubmit={handleFormSubmit} roles={roles} />
                        </DialogContent>
                  </Dialog>
            </div>
      )
}
