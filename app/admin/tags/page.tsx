'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { TableComponent } from '@/components/TableComponent'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface Tag {
      id: number
      name: string
      slug: string
      description: string
      featuredImage: string | null
}

interface SessionUser {
      role?: string
}

export default function TagManagement() {
      const [tags, setTags] = useState<Tag[]>([])
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState<string | null>(null)
      const { data: session, status } = useSession()
      const router = useRouter()

      useEffect(() => {
            if (status === 'authenticated') {
                  if ((session?.user as SessionUser)?.role !== 'admin') {
                        router.push('/')
                  } else {
                        fetchTags()
                  }
            } else if (status === 'unauthenticated') {
                  router.push('/')
            }
      }, [status, session, router])

      const fetchTags = async () => {
            try {
                  setLoading(true)
                  const response = await fetch('/api/tags')
                  if (!response.ok) throw new Error('Failed to fetch tags')
                  const data = await response.json()
                  setTags(data)
            } catch (err) {
                  setError('Failed to load tags. Please try again later.')
                  console.error('Error fetching tags:', err)
            } finally {
                  setLoading(false)
            }
      }

      const handleEdit = (id: number) => {
            router.push(`/admin/tags/edit/${id}`)
      }

      const handleDelete = async (id: number) => {
            try {
                  const response = await fetch('/api/tags', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id })
                  })
                  if (!response.ok) throw new Error('Failed to delete tag')
                  await fetchTags()
            } catch (err) {
                  console.error('Error deleting tag:', err)
                  alert('Failed to delete tag. Please try again.')
            }
      }

      const columns: ColumnDef<Tag>[] = [
            {
                  accessorKey: 'id',
                  header: 'ID',
                  cell: ({ row }) => <div className="text-center font-medium">{row.original.id}</div>
            },
            {
                  accessorKey: 'name',
                  header: 'Name',
                  cell: ({ row }) => <div className="font-semibold">{row.original.name}</div>
            },
            {
                  accessorKey: 'slug',
                  header: 'Slug',
                  cell: ({ row }) => <div className="text-gray-400">{row.original.slug}</div>
            },
            {
                  accessorKey: 'description',
                  header: 'Description',
                  cell: ({ row }) => <div className="text-gray-400">{row.original.description}</div>
            },
            {
                  accessorKey: 'featuredImage',
                  header: 'Featured Image',
                  cell: ({ row }) =>
                        row.original.featuredImage ? (
                              <Image
                                    src={row.original.featuredImage}
                                    alt={row.original.name}
                                    width={50}
                                    height={50}
                                    className="object-cover rounded"
                              />
                        ) : (
                              <div>No image</div>
                        )
            }
      ]

      if (status === 'loading' || loading) {
            return <div>Loading...</div>
      }
      if (error) {
            return <div>Error: {error}</div>
      }
      if (status === 'authenticated' && (session.user as SessionUser).role !== 'admin') {
            return <div>Unauthorized</div>
      }

      return (
            <div className="container mx-auto py-10">
                  <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Tag Management</h1>
                        <Button onClick={() => router.push('/admin/tags/new')}>Add New Tag</Button>
                  </div>
                  <TableComponent
                        columns={columns}
                        data={tags}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        headerClassName="bg-gray-100 font-bold"
                        enableCheckbox={true}
                        frontendLink="/tags"
                  />
            </div>
      )
}
