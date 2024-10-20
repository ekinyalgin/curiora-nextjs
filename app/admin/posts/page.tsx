'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { TableComponent } from '@/components/TableComponent'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface Post {
      id: number
      title: string
      slug: string
      status: string
      type: string
      user: { name: string }
      category: { name: string }
      language: { name: string }
      publishedAt: string | null
      imageId: number | null
      image: { filePath: string } | null
}

export default function PostsPage() {
      const [posts, setPosts] = useState<Post[]>([])
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState<string | null>(null)
      const { data: session, status } = useSession()
      const router = useRouter()
      const [searchTerm, setSearchTerm] = useState('')

      const fetchPosts = useCallback(async (search: string = '') => {
            try {
                  setLoading(true)
                  const response = await fetch(`/api/posts?search=${encodeURIComponent(search)}`)
                  if (!response.ok) throw new Error('Failed to fetch posts')
                  const data = await response.json()
                  setPosts(data)
            } catch (err) {
                  setError('Failed to load posts. Please try again later.')
                  console.error('Error fetching posts:', err)
            } finally {
                  setLoading(false)
            }
      }, [])

      useEffect(() => {
            if (status === 'authenticated') {
                  if (session?.user?.role !== 'admin') {
                        router.push('/')
                  } else {
                        fetchPosts()
                  }
            } else if (status === 'unauthenticated') {
                  router.push('/login')
            }
      }, [session, status, router, fetchPosts])

      const handleEdit = (id: number) => {
            router.push(`/admin/posts/${id}`)
      }

      const handleDelete = async (id: number) => {
            // Optimistic UI update
            setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id))

            try {
                  const response = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
                  if (!response.ok) throw new Error('Failed to delete post')
            } catch (err) {
                  console.error('Error deleting post:', err)
                  alert('Failed to delete post. Please try again.')
                  // Revert the optimistic update
                  await fetchPosts(searchTerm)
            }
      }

      const handleAddNew = () => {
            router.push('/admin/posts/new')
      }

      const handleSearch = async (term: string) => {
            setSearchTerm(term)
            await fetchPosts(term)
      }

      const columns: ColumnDef<Post>[] = [
            {
                  accessorKey: 'image',
                  header: () => <div className="w-1/12">Image</div>,
                  cell: ({ row }) =>
                        row.original.image ? (
                              <div className="relative w-10 h-10">
                                    <Image
                                          src={row.original.image.filePath}
                                          alt={row.original.title}
                                          fill
                                          className="object-cover rounded"
                                    />
                              </div>
                        ) : (
                              <div>No image</div>
                        )
            },
            {
                  accessorKey: 'title',
                  header: () => <div className="w-3/12">Title</div>,
                  cell: ({ row }) => <div className="font-semibold">{row.getValue('title')}</div>
            },
            {
                  accessorKey: 'status',
                  header: () => <div className="w-1/12">Status</div>,
                  cell: ({ row }) => <div className="text-sm">{row.getValue('status')}</div>
            },
            {
                  accessorKey: 'type',
                  header: () => <div className="w-1/12">Type</div>,
                  cell: ({ row }) => <div className="text-sm">{row.getValue('type')}</div>
            },
            {
                  accessorKey: 'user.name',
                  header: () => <div className="w-2/12">Author</div>,
                  cell: ({ row }) => <div className="text-sm">{row.original.user.name}</div>
            },
            {
                  accessorKey: 'category.name',
                  header: () => <div className="w-2/12">Category</div>,
                  cell: ({ row }) => <div className="text-sm">{row.original.category.name}</div>
            },
            {
                  accessorKey: 'language.name',
                  header: () => <div className="w-1/12">Language</div>,
                  cell: ({ row }) => <div className="text-sm">{row.original.language.name}</div>
            },
            {
                  accessorKey: 'publishedAt',
                  header: () => <div className="w-2/12">Published At</div>,
                  cell: ({ row }) => (
                        <div className="text-sm">
                              {row.original.publishedAt
                                    ? new Date(row.original.publishedAt).toLocaleDateString()
                                    : 'Not published'}
                        </div>
                  )
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
                        <h1 className="text-3xl font-bold">Post Management</h1>
                        <Button onClick={handleAddNew}>Add New Post</Button>
                  </div>
                  <TableComponent
                        columns={columns}
                        data={posts}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        enableSearch={true}
                        onSearch={handleSearch}
                        searchTerm={searchTerm}
                        searchPlaceholder="Search posts..."
                  />
            </div>
      )
}
