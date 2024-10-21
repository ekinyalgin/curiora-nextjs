import React, { useState, useEffect, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SlugInput } from '@/components/ui/slug-input'
import { ImageSelect } from '@/components/ui/imageSelect/image-select'
import { SeoFields } from '@/components/SeoFields'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X } from 'lucide-react'
import Image from 'next/image'

interface CategoryFormData {
      name: string
      slug: string
      description: string
      languageId: string
      parentId: string | null
      imageId: number | null
      seoTitle?: string
      seoDescription?: string
}

interface CategoryFormProps {
      categoryId: number | null
      onSubmit: (data: CategoryFormData) => void
}

interface Language {
      id: number
      name: string
}

interface Category {
      id: number
      name: string
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ categoryId, onSubmit }) => {
      const [isLoading, setIsLoading] = useState(false)
      const [isFetching, setIsFetching] = useState(false)
      const [languages, setLanguages] = useState<Language[]>([])
      const [categories, setCategories] = useState<Category[]>([])
      const [isImageSelectOpen, setIsImageSelectOpen] = useState(false)
      const [selectedImage, setSelectedImage] = useState<string | null>(null)

      const {
            register,
            handleSubmit,
            control,
            reset,
            watch,
            setValue,
            formState: { errors }
      } = useForm<CategoryFormData>()

      const name = watch('name')

      const fetchCategoryData = useCallback(async () => {
            if (!categoryId) return
            setIsFetching(true)
            try {
                  const response = await fetch(`/api/categories/${categoryId}`)
                  if (!response.ok) throw new Error('Failed to fetch category data')
                  const categoryData = await response.json()
                  reset({
                        ...categoryData,
                        languageId: categoryData.language?.id.toString(),
                        parentId: categoryData.parent?.id.toString() || null
                  })
                  setSelectedImage(categoryData.imageId ? `/api/images/${categoryData.imageId}` : null)
            } catch (error) {
                  console.error('Error fetching category data:', error)
            } finally {
                  setIsFetching(false)
            }
      }, [categoryId, reset])

      const fetchLanguages = useCallback(async () => {
            try {
                  const response = await fetch('/api/languages')
                  if (!response.ok) throw new Error('Failed to fetch languages')
                  const data = await response.json()
                  setLanguages(data)
            } catch (error) {
                  console.error('Error fetching languages:', error)
            }
      }, [])

      const fetchCategories = useCallback(async () => {
            try {
                  const response = await fetch('/api/categories')
                  if (!response.ok) throw new Error('Failed to fetch categories')
                  const data = await response.json()
                  setCategories(data)
            } catch (error) {
                  console.error('Error fetching categories:', error)
            }
      }, [])

      useEffect(() => {
            fetchCategoryData()
            fetchLanguages()
            fetchCategories()
      }, [fetchCategoryData, fetchLanguages, fetchCategories])

      const handleFormSubmit = async (data: CategoryFormData) => {
            setIsLoading(true)
            try {
                  await onSubmit(data)
            } catch (error) {
                  console.error('Error saving category:', error)
            } finally {
                  setIsLoading(false)
            }
      }

      const handleSlugChange = (name: string, value: string) => {
            setValue('slug', value)
      }

      const handleImageSelect = (image: { id: number; filePath: string }) => {
            setValue('imageId', image.id)
            setSelectedImage(image.filePath)
            setIsImageSelectOpen(false)
      }

      const handleRemoveImage = () => {
            setValue('imageId', null)
            setSelectedImage(null)
      }

      return (
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                  {isFetching ? (
                        <div className="text-center">Loading...</div>
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
                                                      value={watch('imageId')}
                                                />
                                          </div>

                                          <div className="flex justify-between space-x-2">
                                                <div className="w-1/2">
                                                      <Label htmlFor="name">Name</Label>
                                                      <Input
                                                            id="name"
                                                            {...register('name', { required: 'Name is required' })}
                                                      />
                                                      {errors.name && (
                                                            <p className="text-red-500 text-sm">
                                                                  {errors.name.message}
                                                            </p>
                                                      )}
                                                </div>

                                                <div className="w-1/2">
                                                      <Label htmlFor="slug">Slug</Label>
                                                      <SlugInput
                                                            name="slug"
                                                            value={watch('slug')}
                                                            onChange={handleSlugChange}
                                                            sourceValue={name}
                                                            autoGenerate={true}
                                                      />
                                                      {errors.slug && (
                                                            <p className="text-red-500 text-sm">
                                                                  {errors.slug.message}
                                                            </p>
                                                      )}
                                                </div>
                                          </div>

                                          <div className="flex justify-between space-x-2">
                                                <div className="w-1/2">
                                                      <Label htmlFor="languageId">Language</Label>
                                                      <Controller
                                                            name="languageId"
                                                            control={control}
                                                            rules={{ required: 'Language is required' }}
                                                            render={({ field }) => (
                                                                  <Select
                                                                        onValueChange={field.onChange}
                                                                        value={field.value}
                                                                  >
                                                                        <SelectTrigger>
                                                                              <SelectValue placeholder="Select language" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                              {languages.map((language) => (
                                                                                    <SelectItem
                                                                                          key={language.id}
                                                                                          value={language.id.toString()}
                                                                                    >
                                                                                          {language.name}
                                                                                    </SelectItem>
                                                                              ))}
                                                                        </SelectContent>
                                                                  </Select>
                                                            )}
                                                      />
                                                      {errors.languageId && (
                                                            <p className="text-red-500 text-sm">
                                                                  {errors.languageId.message}
                                                            </p>
                                                      )}
                                                </div>

                                                <div className="w-1/2">
                                                      <Label htmlFor="parentId">Parent Category</Label>
                                                      <Controller
                                                            name="parentId"
                                                            control={control}
                                                            render={({ field }) => (
                                                                  <Select
                                                                        onValueChange={field.onChange}
                                                                        value={field.value || undefined}
                                                                  >
                                                                        <SelectTrigger>
                                                                              <SelectValue placeholder="Select parent category" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                              <SelectItem value="null">None</SelectItem>
                                                                              {categories.map((category) => (
                                                                                    <SelectItem
                                                                                          key={category.id}
                                                                                          value={category.id.toString()}
                                                                                    >
                                                                                          {category.name}
                                                                                    </SelectItem>
                                                                              ))}
                                                                        </SelectContent>
                                                                  </Select>
                                                            )}
                                                      />
                                                </div>
                                          </div>
                                          <div>
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea id="description" {...register('description')} />
                                          </div>
                                    </div>
                              </TabsContent>
                              <TabsContent value="seo">
                                    <SeoFields
                                          seoTitle={watch('seoTitle') || ''}
                                          seoDescription={watch('seoDescription') || ''}
                                          onSeoTitleChange={(value) => setValue('seoTitle', value)}
                                          onSeoDescriptionChange={(value) => setValue('seoDescription', value)}
                                    />
                              </TabsContent>
                        </Tabs>
                  )}
                  <Button type="submit" disabled={isLoading || isFetching}>
                        {isLoading ? 'Saving...' : categoryId ? 'Update Category' : 'Create Category'}
                  </Button>
            </form>
      )
}
