import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface RoleFormData {
      id?: number
      name: string
      description?: string
}

interface RoleFormProps {
      roleId?: number | null
      onSubmit: (data: RoleFormData) => void
}

export function RoleForm({ roleId, onSubmit }: RoleFormProps) {
      const [isLoading, setIsLoading] = useState(false)
      const [isFetching, setIsFetching] = useState(false)

      const {
            register,
            handleSubmit,
            reset,
            formState: { errors }
      } = useForm<RoleFormData>()

      const fetchRoleData = useCallback(async () => {
            if (!roleId) return
            setIsFetching(true)
            try {
                  const response = await fetch(`/api/roles/${roleId}`)
                  if (!response.ok) throw new Error('Failed to fetch role data')
                  const roleData = await response.json()
                  setTimeout(() => {
                        reset(roleData)
                        setIsFetching(false)
                  }, 300)
            } catch (error) {
                  console.error('Error fetching role data:', error)
                  setIsFetching(false)
            }
      }, [roleId, reset])

      useEffect(() => {
            fetchRoleData()
      }, [fetchRoleData])

      const handleFormSubmit = async (data: RoleFormData) => {
            setIsLoading(true)
            try {
                  onSubmit(data)
                  reset()
            } catch (error) {
                  console.error('Error saving role:', error)
            } finally {
                  setIsLoading(false)
            }
      }

      return (
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 fade-in">
                  {isFetching ? (
                        <div className="opacity-0 animate-fadeIn text-sm text-center">Loading...</div>
                  ) : (
                        <>
                              <div className="opacity-0 animate-fadeInFast">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" {...register('name', { required: 'Name is required' })} />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" {...register('description')} />

                                    <Button type="submit" disabled={isLoading || isFetching}>
                                          {isLoading ? 'Saving...' : roleId ? 'Update Role' : 'Create Role'}
                                    </Button>
                              </div>
                        </>
                  )}
            </form>
      )
}
