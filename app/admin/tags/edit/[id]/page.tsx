'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AdminFormLayout } from '@/components/ui/admin-form-layout'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LanguageSelect } from '@/components/ui/language-select'
import { SlugInput } from '@/components/ui/slug-input'
import { ImageSelect } from '@/components/ui/imageSelect/image-select'
import slugify from 'slugify'
import Image from 'next/image'

export default function TagForm({ params }: { params: { id: string } }) {
      const [tag, setTag] = useState({
            name: '',
            slug: '',
            description: '',
            language_id: '',
            featuredImageId: null as number | null,
            featuredImage: null as string | null
      })
      const [isImageSelectOpen, setIsImageSelectOpen] = useState(false)
      const router = useRouter()
      const id = params.id === 'new' ? null : parseInt(params.id)

      const fetchTag = useCallback(async () => {
            const response = await fetch(`/api/tags/${id}`)
            const data = await response.json()
            setTag({
                  ...data,
                  language_id: data.language_id ? data.language_id.toString() : '',
                  featuredImageId: data.featuredImageId,
                  featuredImage: data.featuredImage?.filePath || null
            })
      }, [id])

      useEffect(() => {
            if (id) {
                  fetchTag()
            }
      }, [id, fetchTag])

      async function handleSubmit(e: React.FormEvent) {
            e.preventDefault()
            try {
                  const tagToSubmit = { ...tag }
                  if (!tagToSubmit.slug) {
                        tagToSubmit.slug = slugify(tagToSubmit.name, { lower: true, strict: true })
                  }
                  const method = id ? 'PUT' : 'POST'
                  const url = id ? `/api/tags/${id}` : '/api/tags'
                  const response = await fetch(url, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(tagToSubmit)
                  })
                  if (!response.ok) throw new Error('Failed to save tag')
                  router.push('/admin/tags')
            } catch (err) {
                  console.error('Error saving tag:', err)
                  alert('Failed to save tag. Please try again.')
            }
      }

      const handleInputChange = (name: string, value: string | number | null) => {
            setTag((prev) => ({ ...prev, [name]: value }))
      }

      const handleSelectImage = (image: { filePath: string; id: number }) => {
            handleInputChange('featuredImageId', image.id)
            handleInputChange('featuredImage', image.filePath)
      }

      const handleRemoveImage = () => {
            handleInputChange('featuredImageId', null)
            handleInputChange('featuredImage', null)
      }

      return (
            <AdminFormLayout
                  title={id ? 'Edit Tag' : 'Create Tag'}
                  backLink="/admin/tags"
                  onSubmit={handleSubmit}
                  submitText={id ? 'Update Tag' : 'Create Tag'}
            >
                  <div>
                        {' '}
                        {/* JSX'i kapsayan bir div ekleniyor */}
                        <Input
                              name="name"
                              value={tag.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              placeholder="Enter tag name"
                              required
                        />
                        <SlugInput
                              name="slug"
                              value={tag.slug}
                              onChange={(value) => handleInputChange('slug', value)}
                              sourceValue={tag.name}
                              placeholder="Enter slug or leave empty to generate automatically"
                        />
                        <Textarea
                              name="description"
                              value={tag.description}
                              onChange={(e) => handleInputChange('description', e.target.value)}
                              placeholder="Enter tag description (optional)"
                        />
                        <LanguageSelect
                              value={tag.language_id}
                              onChange={(value) => handleInputChange('language_id', value)}
                        />
                        <div>
                              <label className="block text-sm font-medium text-gray-700">Featured Image</label>
                              {tag.featuredImage ? (
                                    <div className="mt-2 relative">
                                          <Image
                                                src={tag.featuredImage}
                                                alt="Featured Image"
                                                width={128}
                                                height={128}
                                                className="w-32 h-32 object-cover rounded-md"
                                          />
                                          <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                                          >
                                                Remove
                                          </button>
                                    </div>
                              ) : (
                                    <button
                                          type="button"
                                          onClick={() => setIsImageSelectOpen(true)}
                                          className="mt-2 bg-blue-500 text-white p-2 rounded"
                                    >
                                          Select Image
                                    </button>
                              )}
                        </div>
                        <ImageSelect
                              isOpen={isImageSelectOpen}
                              onClose={() => setIsImageSelectOpen(false)}
                              onSelect={handleSelectImage}
                              value={tag.featuredImageId}
                        />
                  </div>{' '}
                  {/* Kapsayıcı div burada kapanıyor */}
            </AdminFormLayout>
      )
}
