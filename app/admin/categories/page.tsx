'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { TableComponent } from '@/components/TableComponent'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { CategoryForm } from './CategoryForm'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { env } from 'process'
import { routes } from '@/lib/routes'

interface Category {
      id: number
      name: string
      slug: string
      description: string | null
      language: { id: number; name: string } | null
      parent: { id: number; name: string } | null
      children: Category[]
      imageId: number | null
}

interface CategoryFormData {
      name: string
      slug: string
      description: string | null
      languageId: string | null
      parentId: string | null
      imageId: number | null
      seoTitle?: string
      seoDescription?: string
}

// Remove or comment out the unused interface
// interface TableComponentProps<T> {
//     columns: ColumnDef<T>[]
//     data: T[]
//     onEdit?: (id: number) => void
//     onDelete?: (id: number) => void
//     enableSearch?: boolean
//     onSearch?: (term: string) => void
//     onResetSearch?: () => void
// }

export default function CategoriesPage() {
      const [categories, setCategories] = useState<Category[]>([])
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState<string | null>(null)
      const { data: session, status } = useSession()
      const router = useRouter()
      const [isModalOpen, setIsModalOpen] = useState(false)
      const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
      const [searchTerm, setSearchTerm] = useState('')

      const fetchCategories = useCallback(async (search: string = '') => {
            try {
                  setLoading(true)
                  const response = await fetch(`/api/categories?search=${encodeURIComponent(search)}`)
                  if (!response.ok) throw new Error('Failed to fetch categories')
                  const data = await response.json()
                  setCategories(data)
            } catch (err) {
                  setError('Failed to load categories. Please try again later.')
                  console.error('Error fetching categories:', err)
            } finally {
                  setLoading(false)
            }
      }, [])

      useEffect(() => {
            if (status === 'authenticated') {
                  if (session?.user?.role !== 'admin') {
                        router.push('/')
                  } else {
                        fetchCategories()
                  }
            } else if (status === 'unauthenticated') {
                  router.push('/login')
            }
      }, [session, status, router, fetchCategories])

      useEffect(() => {
            const handleKeyDown = (event: KeyboardEvent) => {
                  if (event.key === 'Escape') {
                        setSearchTerm('')
                        fetchCategories()
                  }
            }

            window.addEventListener('keydown', handleKeyDown)

            return () => {
                  window.removeEventListener('keydown', handleKeyDown)
            }
      }, [fetchCategories])

      const handleEdit = (id: number) => {
            setSelectedCategoryId(id)
            setIsModalOpen(true)
      }

      const handleDelete = async (id: number) => {
            // Optimistic UI update
            setCategories((prevCategories) => prevCategories.filter((category) => category.id !== id))

            try {
                  const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
                  if (!response.ok) throw new Error('Failed to delete category')
            } catch (err) {
                  console.error('Error deleting category:', err)
                  alert('Failed to delete category. Please try again.')
                  // Revert the optimistic update
                  await fetchCategories(searchTerm)
            }
      }

      const handleAddNew = () => {
            setSelectedCategoryId(null)
            setIsModalOpen(true)
      }

      const handleFormSubmit = async (data: CategoryFormData) => {
            const processedData = {
                  ...data,
                  languageId: data.languageId ? Number(data.languageId) : null,
                  parentId: data.parentId ? Number(data.parentId) : null
            }

            const isNewCategory = selectedCategoryId === null
            const optimisticId = isNewCategory ? Math.random() : selectedCategoryId
            const optimisticCategory: Category = {
                  id: optimisticId,
                  name: data.name,
                  slug: data.slug,
                  description: data.description,
                  language: data.languageId ? { id: Number(data.languageId), name: '' } : null,
                  parent: data.parentId ? { id: Number(data.parentId), name: '' } : null,
                  imageId: data.imageId,
                  children: []
            }

            // Optimistic UI update
            setCategories((prevCategories) =>
                  isNewCategory
                        ? [...prevCategories, optimisticCategory]
                        : prevCategories.map((category) =>
                                category.id === selectedCategoryId ? optimisticCategory : category
                          )
            )
            setIsModalOpen(false)

            try {
                  const url = isNewCategory ? '/api/categories' : `/api/categories/${selectedCategoryId}`
                  const method = isNewCategory ? 'POST' : 'PUT'

                  const response = await fetch(url, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(processedData)
                  })

                  if (!response.ok) throw new Error('Failed to save category')

                  // Fetch the updated data to ensure consistency
                  await fetchCategories(searchTerm)
            } catch (err) {
                  console.error('Error saving category:', err)
                  alert('Failed to save category. Please try again.')
                  // Revert the optimistic update
                  await fetchCategories(searchTerm)
            }
      }

      const handleSearch = async (term: string) => {
            setSearchTerm(term)
            await fetchCategories(term)
      }

      const columns: ColumnDef<Category>[] = [
            {
                  accessorKey: 'imageId',
                  header: () => <div className="w-1/12">Image</div>,
                  cell: ({ row }) =>
                        row.original.imageId ? (
                              <div className="mx-auto relative w-10 h-10">
                                    <Image
                                          src={`/api/images/${row.original.imageId}`}
                                          alt={row.original.name}
                                          fill
                                          className="object-cover rounded"
                                    />
                              </div>
                        ) : (
                              <div className="text-center">-</div>
                        )
            },
            {
                  accessorKey: 'name',
                  header: () => <div className="w-3/12">Name</div>,
                  cell: ({ row }) => {
                        const indent = row.original.parent ? 'pl-6' : ''
                        return (
                              <div className={`flex items-center ${indent}`}>
                                    {row.original.parent && <ArrowRight strokeWidth="1.5" className="w-4 h-4 mr-2" />}
                                    <Link 
                                          href={`${routes.categories}/${row.original.slug}`}
                                          className="font-semibold hover:underline"
                                    >
                                          {row.getValue('name')}
                                    </Link>
                              </div>
                        )
                  }
            },
            {
                  accessorKey: 'slug',
                  header: () => <div className="w-2/12">Slug</div>,
                  cell: ({ row }) => <div className="text-sm">{row.getValue('slug')}</div>
            },
            {
                  accessorKey: 'description',
                  header: () => <div className="w-3/12">Description</div>,
                  cell: ({ row }) => {
                        const description = row.getValue('description') as string
                        return <div className="text-sm">{description ? description.substring(0, 50) + '...' : '-'}</div>
                  }
            },
            {
                  accessorKey: 'language.name',
                  header: () => <div className="w-1/12">Language</div>,
                  cell: ({ row }) => <div className="text-sm">{row.original.language?.name || 'N/A'}</div>
            },
            {
                  accessorKey: 'parent.name',
                  header: () => <div className="w-1/12">Parent</div>,
                  cell: ({ row }) => <div className="text-sm">{row.original.parent?.name || '-'}</div>
            }
      ]

      if (status === 'loading' || loading) {
            return <div>Loading...</div>
      }

      if (error) {
            return <div>Error: {error}</div>
      }

      if (status === 'authenticated' && session.user.role !== 'admin') {
            return <div>Unauthorized</div>
      }

      return (
            <div className="container mx-auto py-10">
                  <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Category Management</h1>
                        <Button onClick={handleAddNew}>Add New Category</Button>
                  </div>
                  <TableComponent
                        columns={columns}
                        data={categories}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        enableSearch={true}
                        onSearch={handleSearch}
                  />

                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogContent>
                              <DialogHeader>
                                    <DialogTitle>
                                          {selectedCategoryId ? 'Edit Category' : 'Add New Category'}
                                    </DialogTitle>
                                    <DialogDescription>
                                          {selectedCategoryId
                                                ? 'Edit the details of the selected category.'
                                                : 'Add a new category to the system.'}
                                    </DialogDescription>
                              </DialogHeader>
                              <CategoryForm
                                    categoryId={selectedCategoryId}
                                    onSubmit={(data) => handleFormSubmit(data)}
                              />
                        </DialogContent>
                  </Dialog>
            </div>
      )
}
