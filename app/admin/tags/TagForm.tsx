'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SlugInput, createSlug } from '@/components/ui/slug-input'
import { ImageSelect } from '@/components/ui/imageSelect/image-select'
import { LanguageSelect } from '@/components/ui/language-select'
import { SeoFields } from '@/components/SeoFields'
import Notification from '@/lib/notification'
import { X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'

interface TagFormData {
      id?: number
      name: string
      slug: string
      description?: string
      imageId: number | null
      languageId: number | null
      seoTitle?: string
      seoDescription?: string
}

interface TagFormProps {
      tagId?: number | null
      onSubmit: (data: TagFormData) => void
}

export function TagForm({ tagId, onSubmit }: TagFormProps) {
      const [isLoading, setIsLoading] = useState(false)
      const [isFetching, setIsFetching] = useState(false)
      const [isImageSelectOpen, setIsImageSelectOpen] = useState(false)
      const [selectedImage, setSelectedImage] = useState<string | null>(null)
      const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
      const [formData, setFormData] = useState<TagFormData>({
            name: '',
            slug: '',
            description: '',
            imageId: null,
            languageId: null,
            seoTitle: '',
            seoDescription: ''
      })

      // fetchTagData fonksiyonunu useCallback ile sarmalıyoruz
      const fetchTagData = useCallback(async () => {
            if (!tagId) return
            setIsFetching(true)
            try {
                  const response = await fetch(`/api/tags/${tagId}`)
                  if (!response.ok) throw new Error('Failed to fetch tag data')
                  const tagData = await response.json()
                  console.log('Fetched tag data:', tagData)
                  setFormData(tagData)
                  setSelectedImage(tagData.imageId ? `/api/images/${tagData.imageId}` : null)
            } catch (error) {
                  console.error('Error fetching tag data:', error)
                  setNotification({ message: `Error fetching tag data: ${(error as Error).message}`, type: 'error' })
            } finally {
                  setIsFetching(false)
            }
      }, [tagId])

      useEffect(() => {
            fetchTagData()
      }, [fetchTagData])

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target
            setFormData((prev) => ({ ...prev, [name]: value }))
      }

      const handleSlugChange = (name: string, value: string) => {
            setFormData((prev) => ({ ...prev, slug: value }))
      }

      const handleLanguageChange = (value: string) => {
            setFormData((prev) => ({ ...prev, languageId: parseInt(value) }))
      }

      const handleImageSelect = (image: { id: number; filePath: string }) => {
            setFormData((prev) => ({ ...prev, imageId: image.id }))
            setSelectedImage(image.filePath)
            setIsImageSelectOpen(false)
      }

      const handleRemoveImage = () => {
            setFormData((prev) => ({ ...prev, imageId: null }))
            setSelectedImage(null)
      }

      const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            setIsLoading(true)
            try {
                  if (!formData.languageId) {
                        throw new Error('Language is required')
                  }
                  if (!formData.slug) {
                        formData.slug = createSlug(formData.name)
                  }
                  await onSubmit(formData)
                  setNotification({ message: 'Tag saved successfully', type: 'success' })
            } catch (error) {
                  console.error('Error saving tag:', error)
                  setNotification({ message: `Error saving tag: ${(error as Error).message}`, type: 'error' })
            } finally {
                  setIsLoading(false)
            }
      }

      return (
            <form onSubmit={handleSubmit} className="space-y-4 fade-in">
                  {isFetching ? (
                        <div className="opacity-0 animate-fadeIn text-sm text-center">Loading...</div>
                  ) : (
                        <Tabs defaultValue="general" className="w-full">
                              <TabsList className="mb-4">
                                    <TabsTrigger value="general">General</TabsTrigger>
                                    <TabsTrigger value="seo">SEO</TabsTrigger>
                              </TabsList>
                              <TabsContent value="general">
                                    <div className="space-y-4">
                                          <div className="mb-4">
                                                {selectedImage ? (
                                                      <div className="relative">
                                                            <Image
                                                                  src={selectedImage}
                                                                  alt="Selected"
                                                                  width={96}
                                                                  height={96}
                                                                  className="rounded-lg w-24 text-right"
                                                                  unoptimized
                                                            />
                                                            <button
                                                                  type="button"
                                                                  onClick={handleRemoveImage}
                                                                  className="absolute -top-2 left-20 bg-black text-white rounded-full text-xs p-1"
                                                            >
                                                                  <X strokeWidth="3" size={12} />
                                                            </button>
                                                      </div>
                                                ) : (
                                                      <Button type="button" onClick={() => setIsImageSelectOpen(true)}>
                                                            Select Image
                                                      </Button>
                                                )}
                                                <ImageSelect
                                                      isOpen={isImageSelectOpen}
                                                      onClose={() => setIsImageSelectOpen(false)}
                                                      onSelect={handleImageSelect}
                                                      value={formData.imageId}
                                                />
                                          </div>

                                          <div className="flex items-center space-x-2">
                                                <div className="w-1/2">
                                                      <Label htmlFor="name">Name</Label>
                                                      <Input
                                                            id="name"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            required
                                                      />
                                                </div>
                                                <div className="w-1/2">
                                                      <Label htmlFor="slug">Slug</Label>
                                                      <SlugInput
                                                            name="slug"
                                                            value={formData.slug}
                                                            sourceValue={formData.name}
                                                            onChange={handleSlugChange}
                                                            autoGenerate={true}
                                                      />
                                                </div>
                                          </div>
                                          <div>
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea
                                                      id="description"
                                                      name="description"
                                                      value={formData.description}
                                                      onChange={handleInputChange}
                                                />
                                          </div>
                                          <div>
                                                <Label htmlFor="language">Language</Label>
                                                <LanguageSelect
                                                      value={formData.languageId ? formData.languageId.toString() : ''}
                                                      onChange={handleLanguageChange}
                                                />
                                          </div>
                                    </div>
                              </TabsContent>
                              <TabsContent value="seo">
                                    <SeoFields
                                          seoTitle={formData.seoTitle || ''}
                                          seoDescription={formData.seoDescription || ''}
                                          onSeoTitleChange={(value) =>
                                                setFormData((prev) => ({ ...prev, seoTitle: value }))
                                          }
                                          onSeoDescriptionChange={(value) =>
                                                setFormData((prev) => ({ ...prev, seoDescription: value }))
                                          }
                                    />
                              </TabsContent>
                        </Tabs>
                  )}
                  <Button type="submit" disabled={isLoading || isFetching}>
                        {isLoading ? 'Saving...' : tagId ? 'Update Tag' : 'Create Tag'}
                  </Button>
                  {notification && (
                        <Notification
                              message={notification.message}
                              type={notification.type}
                              onClose={() => setNotification(null)}
                        />
                  )}
            </form>
      )
}
