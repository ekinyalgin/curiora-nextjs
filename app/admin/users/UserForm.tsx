import React, { useState, useEffect, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface UserFormData {
      name: string
      email: string
      username: string
      roleId: string
      password?: string
}

interface UserFormProps {
      userId?: number | null
      onSubmit: (data: UserFormData) => void
      roles: Role[]
}

interface Role {
      id: string
      name: string
}

export function UserForm({ userId, onSubmit, roles }: UserFormProps) {
      const [isLoading, setIsLoading] = useState(false)
      const [isFetching, setIsFetching] = useState(false)

      const {
            register,
            handleSubmit,
            control,
            reset,
            formState: { errors }
      } = useForm<UserFormData>()

      const fetchUserData = useCallback(async () => {
            if (!userId) return
            setIsFetching(true)
            try {
                  const response = await fetch(`/api/users/${userId}`)
                  if (!response.ok) throw new Error('Failed to fetch user data')
                  const userData = await response.json()
                  reset({
                        ...userData,
                        roleId: userData.role.id // Ensure we're setting the role ID, not the entire role object
                  })
            } catch (error) {
                  console.error('Error fetching user data:', error)
            } finally {
                  setIsFetching(false)
            }
      }, [userId, reset])

      useEffect(() => {
            fetchUserData()
      }, [fetchUserData])

      const handleFormSubmit = async (data: UserFormData) => {
            setIsLoading(true)
            try {
                  await onSubmit(data)
            } catch (error) {
                  console.error('Error saving user:', error)
            } finally {
                  setIsLoading(false)
            }
      }

      return (
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                  {isFetching ? (
                        <div className="text-center">Loading...</div>
                  ) : (
                        <>
                              <div className="flex justify-between space-x-2">
                                    <div className="w-1/2">
                                          <Label htmlFor="name">Name</Label>
                                          <Input id="name" {...register('name', { required: 'Name is required' })} />
                                          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                                    </div>
                                    <div className="w-1/2">
                                          <Label htmlFor="username">Username</Label>
                                          <Input
                                                id="username"
                                                {...register('username', { required: 'Username is required' })}
                                          />
                                          {errors.username && (
                                                <p className="text-red-500 text-sm">{errors.username.message}</p>
                                          )}
                                    </div>
                              </div>

                              <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                          id="email"
                                          type="email"
                                          {...register('email', { required: 'Email is required' })}
                                    />
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                              </div>

                              <div>
                                    <Label htmlFor="roleId">Role</Label>
                                    <Controller
                                          name="roleId"
                                          control={control}
                                          rules={{ required: 'Role is required' }}
                                          render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
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
                                          )}
                                    />
                                    {errors.roleId && <p className="text-red-500 text-sm">{errors.roleId.message}</p>}
                              </div>

                              <Button type="submit" disabled={isLoading || isFetching}>
                                    {isLoading ? 'Saving...' : userId ? 'Update User' : 'Create User'}
                              </Button>
                        </>
                  )}
            </form>
      )
}
