'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminFormLayout } from '@/components/ui/admin-form-layout'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Role {
      id: string
      name: string
}

export default function NewUser() {
      const [user, setUser] = useState({
            name: '',
            email: '',
            username: '',
            roleId: ''
      })
      const [roles, setRoles] = useState<Role[]>([])
      const router = useRouter()

      useEffect(() => {
            fetchRoles()
      }, [])

      async function fetchRoles() {
            const response = await fetch('/api/roles')
            const data = await response.json()
            setRoles(data)
      }

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault()
            try {
                  const response = await fetch('/api/users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(user)
                  })

                  if (!response.ok) {
                        throw new Error('Failed to create user')
                  }

                  router.push('/admin/users')
            } catch (err) {
                  console.error('Error creating user:', err)
                  alert('Failed to create user. Please try again.')
            }
      }

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target
            setUser((prev) => ({ ...prev, [name]: value }))
      }

      return (
            <AdminFormLayout
                  title="Create New User"
                  backLink="/admin/users"
                  onSubmit={handleSubmit}
                  submitText="Create User"
            >
                  <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                              id="name"
                              name="name"
                              value={user.name}
                              onChange={handleInputChange}
                              placeholder="Enter user's name"
                              required
                        />
                  </div>
                  <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                              id="email"
                              name="email"
                              type="email"
                              value={user.email}
                              onChange={handleInputChange}
                              placeholder="Enter user's email"
                              required
                        />
                  </div>
                  <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                              id="username"
                              name="username"
                              value={user.username}
                              onChange={handleInputChange}
                              placeholder="Enter username"
                              required
                        />
                  </div>
                  <div>
                        <Label htmlFor="roleId">Role</Label>
                        <Select
                              value={user.roleId}
                              onValueChange={(value) => setUser((prev) => ({ ...prev, roleId: value }))}
                        >
                              <SelectTrigger>
                                    <SelectValue placeholder="Select user role" />
                              </SelectTrigger>
                              <SelectContent>
                                    {roles.map((role) => (
                                          <SelectItem key={role.id} value={role.id}>
                                                {role.name}
                                          </SelectItem>
                                    ))}
                              </SelectContent>
                        </Select>
                  </div>
            </AdminFormLayout>
      )
}
