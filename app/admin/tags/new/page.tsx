'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AdminFormLayout } from '@/components/ui/admin-form-layout'
import { LanguageSelect } from '@/components/ui/language-select'
import { SlugInput } from '@/components/ui/slug-input'
import { ImageSelect } from '@/components/ui/imageSelect/image-select'
import { createSlug } from '@/components/ui/slug-input'
import Image from 'next/image'

export default function NewTag() {
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

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault()
            try {
                  const tagToSubmit = { ...tag }
                  if (!tagToSubmit.slug) {
                        tagToSubmit.slug = createSlug(tagToSubmit.name)
                  }

                  // Slug benzersizliğini kontrol et
                  const isUnique = await checkSlugUniqueness(tagToSubmit.slug)
                  if (!isUnique) {
                        tagToSubmit.slug = await generateUniqueSlug(tagToSubmit.slug, checkSlugUniqueness)
                  }

                  const response = await fetch('/api/tags', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(tagToSubmit)
                  })

                  if (!response.ok) {
                        const errorData = await response.json()
                        throw new Error(`Failed to add tag: ${errorData.error}, ${errorData.details}`)
                  }

                  router.push('/admin/tags')
            } catch (err: unknown) {
                  console.error('Error adding tag:', err)
                  alert(
                        `Failed to add tag. Please try again. Error: ${err instanceof Error ? err.message : 'Unknown error'}`
                  )
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

      const checkSlugUniqueness = async (slug: string): Promise<boolean> => {
            const response = await fetch(`/api/check-slug?slug=${encodeURIComponent(slug)}&type=tag`)
            if (!response.ok) {
                  throw new Error('Failed to check slug uniqueness')
            }
            const data = await response.json()
            return data.isUnique
      }

      async function generateUniqueSlug(
            baseSlug: string,
            checkUniqueness: (slug: string) => Promise<boolean>
      ): Promise<string> {
            let slug = baseSlug
            let counter = 1
            let isUnique = await checkUniqueness(slug)

            while (!isUnique) {
                  slug = `${baseSlug}-${counter}`
                  isUnique = await checkUniqueness(slug)
                  counter++
            }

            return slug
      }

      return (
            <AdminFormLayout title="Add New Tag" backLink="/admin/tags" onSubmit={handleSubmit} submitText="Add Tag">
                  <div>
                        <Input
                              name="name"
                              value={tag.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              placeholder="Tag name"
                              required
                        />
                        <SlugInput
                              name="slug"
                              value={tag.slug}
                              onChange={(value) => handleInputChange('slug', value)}
                              sourceValue={tag.name}
                              placeholder="Enter slug or leave empty to generate automatically"
                              autoGenerate={false}
                        />
                        <Textarea
                              name="description"
                              value={tag.description}
                              onChange={(e) => handleInputChange('description', e.target.value)}
                              placeholder="Tag description"
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
                  </div>
            </AdminFormLayout>
      )
}
