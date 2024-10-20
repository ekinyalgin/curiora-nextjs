import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface LanguageFormData {
      code: string
      name: string
      isDefault: boolean
}

interface LanguageFormProps {
      languageId?: number | null
      onSubmit: (data: LanguageFormData) => void
}

export function LanguageForm({ languageId, onSubmit }: LanguageFormProps) {
      const [isLoading, setIsLoading] = useState(false)
      const [isFetching, setIsFetching] = useState(false)

      const {
            register,
            handleSubmit,
            reset,
            setValue,
            formState: { errors }
      } = useForm<LanguageFormData>()

      const fetchLanguageData = useCallback(async () => {
            if (!languageId) return
            setIsFetching(true)
            try {
                  const response = await fetch(`/api/languages/${languageId}`)
                  if (!response.ok) throw new Error('Failed to fetch language data')
                  const languageData = await response.json()
                  reset(languageData)
                  setIsFetching(false)
            } catch (error) {
                  console.error('Error fetching language data:', error)
                  setIsFetching(false)
            }
      }, [languageId, reset])

      useEffect(() => {
            fetchLanguageData()
      }, [fetchLanguageData])

      const handleFormSubmit = async (data: LanguageFormData) => {
            setIsLoading(true)
            try {
                  await onSubmit(data)
                  reset()
            } catch (error) {
                  console.error('Error saving language:', error)
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
                                    <Label htmlFor="code">Code</Label>
                                    <Input id="code" {...register('code', { required: 'Code is required' })} />
                                    {errors.code && <p className="text-red-500 text-sm">{errors.code.message}</p>}

                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" {...register('name', { required: 'Name is required' })} />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

                                    <div className="flex items-center space-x-2 mt-4">
                                          <Checkbox
                                                id="isDefault"
                                                onCheckedChange={(checked) => setValue('isDefault', checked as boolean)}
                                                {...register('isDefault')}
                                          />
                                          <Label htmlFor="isDefault">Is Default Language</Label>
                                    </div>

                                    <Button type="submit" disabled={isLoading || isFetching} className="mt-4">
                                          {isLoading ? 'Saving...' : languageId ? 'Update Language' : 'Create Language'}
                                    </Button>
                              </div>
                        </>
                  )}
            </form>
      )
}
