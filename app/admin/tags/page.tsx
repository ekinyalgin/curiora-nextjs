'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { TableComponent } from '@/components/TableComponent'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogTrigger,
      DialogDescription
} from '@/components/ui/dialog'
import { TagForm } from '@/app/admin/tags/TagForm'
import Link from 'next/link'
import Notification from '@/lib/notification'

interface Tag {
      id: number
      name: string
      slug: string
      description: string | null
      imageId: number | null
      language: {
            id: number
            name: string
      } | null
}

interface TagFormData {
      id?: number
      name: string
      slug: string
      description?: string | null
      imageId: number | null
      languageId: number | null
      seoTitle?: string
      seoDescription?: string
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
      const [isAddModalOpen, setIsAddModalOpen] = useState(false)
      const [editingTagId, setEditingTagId] = useState<number | null>(null)
      const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

      const fetchTags = useCallback(async () => {
            if (status !== 'authenticated' || (session?.user as SessionUser)?.role !== 'admin') {
                  return
            }
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
      }, [status, session])

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
      }, [status, session, router, fetchTags])

      const handleAddTag = async (newTag: Omit<TagFormData, 'id'>) => {
            const tempId = Date.now()
            const optimisticTag = {
                  ...newTag,
                  id: tempId,
                  language: newTag.languageId ? { id: newTag.languageId, name: '' } : null
            } as Tag
            setTags((prevTags) => [...prevTags, optimisticTag])
            setIsAddModalOpen(false)

            try {
                  const response = await fetch('/api/tags', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newTag)
                  })
                  if (!response.ok) throw new Error('Failed to add tag')
                  const addedTag = await response.json()
                  setTags((prevTags) => prevTags.map((tag) => (tag.id === tempId ? addedTag : tag)))
                  setNotification({ message: 'Tag added successfully', type: 'success' })
            } catch (err) {
                  console.error('Error adding tag:', err)
                  setTags((prevTags) => prevTags.filter((tag) => tag.id !== tempId))
                  setNotification({ message: 'Failed to add tag. Please try again.', type: 'error' })
            }
      }

      const handleEdit = (id: number) => {
            setEditingTagId(id)
            setIsAddModalOpen(true)
      }

      const handleDelete = async (id: number) => {
            const tagToDelete = tags.find((tag) => tag.id === id)
            setTags((prevTags) => prevTags.filter((tag) => tag.id !== id))

            try {
                  const response = await fetch(`/api/tags/${id}`, {
                        method: 'DELETE'
                  })
                  if (!response.ok) throw new Error('Failed to delete tag')
                  setNotification({ message: 'Tag deleted successfully', type: 'success' })
            } catch (err) {
                  console.error('Error deleting tag:', err)
                  setTags((prevTags) => [...prevTags, tagToDelete!])
                  setNotification({ message: 'Failed to delete tag. Please try again.', type: 'error' })
            }
      }

      const handleUpdateTag = async (updatedTag: TagFormData) => {
            const originalTag = tags.find((tag) => tag.id === updatedTag.id)
            setTags((prevTags) => prevTags.map((tag) => (tag.id === updatedTag.id ? { ...tag, ...updatedTag } : tag)))
            setIsAddModalOpen(false)

            try {
                  console.log('Updating tag with data:', updatedTag)
                  const response = await fetch(`/api/tags/${updatedTag.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedTag)
                  })
                  if (!response.ok) {
                        const errorData = await response.json()
                        throw new Error(errorData.error || response.statusText)
                  }
                  const updatedTagFromServer = await response.json()
                  console.log('Updated tag from server:', updatedTagFromServer)
                  setTags((prevTags) =>
                        prevTags.map((tag) => (tag.id === updatedTagFromServer.id ? updatedTagFromServer : tag))
                  )
                  setNotification({ message: 'Tag updated successfully', type: 'success' })
            } catch (err) {
                  console.error('Error updating tag:', err)
                  setTags((prevTags) => prevTags.map((tag) => (tag.id === updatedTag.id ? originalTag! : tag)))
                  setNotification({ message: `Failed to update tag: ${(err as Error).message}`, type: 'error' })
            }
      }

      const handleSearch = async (searchTerm: string) => {
            try {
                  if (!searchTerm.trim()) {
                        await fetchTags()
                        return
                  }
                  const response = await fetch(`/api/tags/search?term=${encodeURIComponent(searchTerm)}`)
                  if (!response.ok) throw new Error('Failed to search tags')
                  const results = await response.json()
                  setTags(results)
            } catch (err) {
                  console.error('Error searching tags:', err)
                  setNotification({ message: 'Failed to search tags. Please try again.', type: 'error' })
            }
      }

      const columns: ColumnDef<Tag>[] = [
            {
                  accessorKey: 'imageId',
                  header: 'Image',
                  cell: ({ row }) =>
                        row.original.imageId ? (
                              <div className="relative w-10 h-10">
                                    <Image
                                          src={`/api/images/${row.original.imageId}`}
                                          alt={row.original.name}
                                          width={40}
                                          height={40}
                                          className="object-cover rounded"
                                          unoptimized
                                    />
                              </div>
                        ) : (
                              <div>No image</div>
                        )
            },
            {
                  accessorKey: 'name',
                  header: 'Name',
                  cell: ({ row }) => (
                        <Link href={`/tags/${row.original.slug}`} className="font-semibold hover:underline">
                              {row.original.name}
                        </Link>
                  )
            },
            {
                  accessorKey: 'slug',
                  header: 'Slug',
                  cell: ({ row }) => <div className="text-gray-400 text-sm">{row.original.slug}</div>
            },
            {
                  accessorKey: 'description',
                  header: 'Description',
                  cell: ({ row }) => <div className="text-gray-400 text-sm">{row.original.description}</div>
            },
            {
                  header: 'Language',
                  accessorKey: 'language.name'
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
                        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                              <DialogTrigger asChild>
                                    <Button onClick={() => setEditingTagId(null)}>Add New Tag</Button>
                              </DialogTrigger>
                              <DialogContent>
                                    <DialogHeader>
                                          <DialogTitle>{editingTagId ? 'Edit Tag' : 'Add New Tag'}</DialogTitle>
                                          <DialogDescription>
                                                {editingTagId
                                                      ? "Edit the tag details here. Click save when you're done."
                                                      : "Create a new tag here. Click save when you're done."}
                                          </DialogDescription>
                                    </DialogHeader>
                                    <TagForm
                                          tagId={editingTagId}
                                          onSubmit={(tag) =>
                                                editingTagId ? handleUpdateTag(tag as TagFormData) : handleAddTag(tag)
                                          }
                                    />
                              </DialogContent>
                        </Dialog>
                  </div>
                  <TableComponent
                        columns={columns}
                        data={tags}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        enableCheckbox={false}
                        onSearch={handleSearch}
                  />
                  {notification && (
                        <Notification
                              message={notification.message}
                              type={notification.type}
                              onClose={() => setNotification(null)}
                        />
                  )}
            </div>
      )
}
