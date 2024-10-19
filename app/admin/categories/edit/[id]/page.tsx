'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AdminFormLayout } from '@/components/ui/admin-form-layout'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LanguageSelect } from '@/components/ui/language-select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SlugInput, createSlug } from '@/components/ui/slug-input'
import { checkSlugUniqueness, generateUniqueSlug } from '@/lib/slugUtils'
// import { useSession } from 'next-auth/react'  // Şimdilik yorum satırına alıyoruz

// Update the Input, Textarea, and other components to accept a label prop
type InputProps = React.ComponentProps<typeof Input> & { label?: string }
type TextareaProps = React.ComponentProps<typeof Textarea> & { label?: string }

// Use these new types in your component
const CustomInput = ({ label, ...props }: InputProps) => (
      <div>
            {label && <label>{label}</label>}
            <Input {...props} />
      </div>
)

const CustomTextarea = ({ label, ...props }: TextareaProps) => (
      <div>
            {label && <label>{label}</label>}
            <Textarea {...props} />
      </div>
)

export default function CategoryForm({ params }: { params: { id: string } }) {
      // const { data: session } = useSession()  // Bu satırı kaldırıyoruz veya yorum satırına alıyoruz
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
      const id = params.id === 'new' ? null : parseInt(params.id)

      const fetchCategory = useCallback(async () => {
            const response = await fetch(`/api/categories/${id}`)
            const data = await response.json()
            setCategory({
                  ...data,
                  languageId: data.languageId ? data.languageId.toString() : '',
                  parentId: data.parentId ? data.parentId.toString() : 'none'
            })
      }, [id])

      const fetchParentCategories = useCallback(async () => {
            const response = await fetch('/api/categories')
            const data = await response.json()
            setParentCategories(data.filter((c: { id: number }) => c.id !== id))
      }, [id])

      useEffect(() => {
            if (id) {
                  fetchCategory()
            }
            fetchParentCategories()
      }, [id, fetchCategory, fetchParentCategories])

      async function handleSubmit(e: React.FormEvent) {
            e.preventDefault()
            try {
                  const categoryToSubmit = { ...category }
                  if (!categoryToSubmit.slug) {
                        categoryToSubmit.slug = createSlug(categoryToSubmit.name)
                  }

                  // Check slug uniqueness
                  const isUnique = await checkSlugUniqueness(categoryToSubmit.slug, 'category', id ?? undefined)
                  if (!isUnique) {
                        categoryToSubmit.slug = await generateUniqueSlug(
                              categoryToSubmit.slug,
                              'category',
                              id ?? undefined
                        )
                  }

                  const method = id ? 'PUT' : 'POST'
                  const url = id ? `/api/categories/${id}` : '/api/categories'
                  const response = await fetch(url, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                              ...categoryToSubmit,
                              parentId: categoryToSubmit.parentId === 'none' ? null : categoryToSubmit.parentId
                        })
                  })
                  if (!response.ok) throw new Error('Failed to save category')
                  router.push('/admin/categories')
            } catch (err) {
                  console.error('Error saving category:', err)
                  alert('Failed to save category. Please try again.')
            }
      }

      const handleInputChange = (name: string, value: string) => {
            setCategory((prev) => ({ ...prev, [name]: value }))
      }

      return (
            <AdminFormLayout
                  title={id ? 'Edit Category' : 'Create Category'}
                  backLink="/admin/categories"
                  onSubmit={handleSubmit}
                  submitText={id ? 'Update Category' : 'Create Category'}
            >
                  <CustomInput
                        name="name"
                        label="Name"
                        value={category.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter category name"
                        required
                  />
                  <SlugInput
                        name="slug"
                        value={category.slug}
                        onChange={handleInputChange}
                        sourceValue={category.name}
                        placeholder="Enter slug or leave empty to generate automatically"
                        autoGenerate={false}
                  />
                  <CustomTextarea
                        name="description"
                        label="Description"
                        value={category.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter category description (optional)"
                  />
                  <LanguageSelect
                        value={category.languageId}
                        onChange={(value) => handleInputChange('languageId', value)}
                  />
                  <Select
                        value={category.parentId || 'none'}
                        onValueChange={(value) => handleInputChange('parentId', value)}
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
                  <CustomInput
                        name="seoTitle"
                        label="SEO Title"
                        value={category.seoTitle}
                        onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                        placeholder="Enter SEO title"
                  />
                  <CustomTextarea
                        name="seoDescription"
                        label="SEO Description"
                        value={category.seoDescription}
                        onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                        placeholder="Enter SEO description"
                  />
            </AdminFormLayout>
      )
}
