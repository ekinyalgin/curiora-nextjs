'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AdminFormLayout } from '@/components/ui/admin-form-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { createSlug } from '@/components/ui/slug-input'
import { checkSlugUniqueness, generateUniqueSlug } from '@/lib/slugUtils'

export default function NewCategory() {
      const [category, setCategory] = useState({
            name: '',
            slug: '',
            description: '',
            languageId: '',
            parentId: null as string | null,
            seoDescription: '',
            seoTitle: ''
      })
      const [parentCategories, setParentCategories] = useState([])
      const router = useRouter()

      useEffect(() => {
            fetchParentCategories()
      }, [])

      async function fetchParentCategories() {
            const response = await fetch('/api/categories')
            const data = await response.json()
            setParentCategories(data)
      }

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault()
            try {
                  const categoryToSubmit = { ...category }
                  if (!categoryToSubmit.slug) {
                        categoryToSubmit.slug = createSlug(categoryToSubmit.name)
                  }

                  // Slug benzersizliğini kontrol et
                  const isUnique = await checkSlugUniqueness(categoryToSubmit.slug, 'category')
                  if (!isUnique) {
                        categoryToSubmit.slug = await generateUniqueSlug(categoryToSubmit.slug, 'category')
                  }

                  const response = await fetch('/api/categories', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(categoryToSubmit)
                  })

                  if (!response.ok) {
                        const errorData = await response.json()
                        throw new Error(`Failed to add category: ${errorData.error}, ${errorData.details}`)
                  }

                  router.push('/admin/categories')
            } catch (err: unknown) {
                  console.error('Error adding category:', err)
                  alert(
                        `Failed to add category. Please try again. Error: ${err instanceof Error ? err.message : 'Unknown error'}`
                  )
            }
      }

      const handleInputChange = (name: string, value: string) => {
            setCategory((prev) => ({ ...prev, [name]: value }))
      }

      return (
            <AdminFormLayout
                  title="Create New Category"
                  backLink="/admin/categories"
                  onSubmit={handleSubmit}
                  submitText="Create Category"
            >
                  <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                              id="name"
                              name="name"
                              value={category.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              placeholder="Enter category name"
                              required
                        />
                  </div>

                  <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                              id="description"
                              name="description"
                              value={category.description}
                              onChange={(e) => handleInputChange('description', e.target.value)}
                              placeholder="Enter category description"
                        />
                  </div>

                  <div>
                        <Label htmlFor="parentId">Parent Category</Label>
                        <Select
                              value={category.parentId || 'none'}
                              onValueChange={(value) => handleInputChange('parentId', value === 'none' ? '' : value)}
                        >
                              <SelectTrigger>
                                    <SelectValue placeholder="Select parent category" />
                              </SelectTrigger>
                              <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {parentCategories.map((parentCategory: { id: number; name: string }) => (
                                          <SelectItem key={parentCategory.id} value={parentCategory.id.toString()}>
                                                {parentCategory.name}
                                          </SelectItem>
                                    ))}
                              </SelectContent>
                        </Select>
                  </div>

                  <div>
                        <Label htmlFor="seoTitle">SEO Title</Label>
                        <Input
                              id="seoTitle"
                              name="seoTitle"
                              value={category.seoTitle}
                              onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                              placeholder="Enter SEO title"
                        />
                  </div>

                  <div>
                        <Label htmlFor="seoDescription">SEO Description</Label>
                        <Textarea
                              id="seoDescription"
                              name="seoDescription"
                              value={category.seoDescription}
                              onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                              placeholder="Enter SEO description"
                        />
                  </div>
            </AdminFormLayout>
      )
}
