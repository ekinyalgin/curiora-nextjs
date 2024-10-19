import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const roleSchema = z.object({
      name: z.string().min(1, 'Name is required'),
      description: z.string().optional()
})

type RoleFormData = z.infer<typeof roleSchema>

interface RoleFormProps {
      roleId?: number | null
      onSubmit: () => void
}

export function RoleForm({ roleId, onSubmit }: RoleFormProps) {
      const [isLoading, setIsLoading] = useState(false)

      const {
            register,
            handleSubmit,
            reset,
            formState: { errors }
      } = useForm<RoleFormData>({
            resolver: zodResolver(roleSchema)
      })

      useEffect(() => {
            if (roleId) {
                  fetchRoleData()
            }
      }, [roleId])

      const fetchRoleData = async () => {
            try {
                  const response = await fetch(`/api/roles/${roleId}`)
                  if (!response.ok) throw new Error('Failed to fetch role data')
                  const roleData = await response.json()
                  reset(roleData)
            } catch (error) {
                  console.error('Error fetching role data:', error)
            }
      }

      const handleFormSubmit = async (data: RoleFormData) => {
            setIsLoading(true)
            try {
                  const url = roleId ? `/api/roles/${roleId}` : '/api/roles'
                  const method = roleId ? 'PUT' : 'POST'

                  const response = await fetch(url, {
                        method: method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                  })

                  if (!response.ok) throw new Error('Failed to save role')

                  onSubmit()
            } catch (error) {
                  console.error('Error saving role:', error)
            } finally {
                  setIsLoading(false)
            }
      }

      return (
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                  <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" {...register('name')} />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                  </div>
                  <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" {...register('description')} />
                        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                  </div>
                  <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : roleId ? 'Update Role' : 'Create Role'}
                  </Button>
            </form>
      )
}
