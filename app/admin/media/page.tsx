'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { TableComponent } from '@/components/TableComponent'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ImageSelect } from '@/components/ui/imageSelect/image-select'
import Image from 'next/image'

interface Media {
      id: number
      fileName: string
      filePath: string
      fileType: string
      fileSize: number
      createdAt: string
      user: { name: string }
}

export default function MediaPage() {
      const [media, setMedia] = useState<Media[]>([])
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState<string | null>(null)
      const { data: session, status } = useSession()
      const router = useRouter()
      const [isModalOpen, setIsModalOpen] = useState(false)

      useEffect(() => {
            if (status === 'authenticated') {
                  if (session?.user?.role !== 'admin') {
                        router.push('/')
                  } else {
                        fetchMedia()
                  }
            } else if (status === 'unauthenticated') {
                  router.push('/login')
            }
      }, [session, status, router])

      const fetchMedia = async () => {
            try {
                  setLoading(true)
                  const response = await fetch('/api/media')
                  if (!response.ok) throw new Error('Failed to fetch media')
                  const data = await response.json()
                  setMedia(data)
            } catch (err) {
                  setError('Failed to load media. Please try again later.')
                  console.error('Error fetching media:', err)
            } finally {
                  setLoading(false)
            }
      }

      const handleDelete = async (id: number) => {
            // Optimistic UI update
            setMedia((prevMedia) => prevMedia.filter((item) => item.id !== id))

            try {
                  const response = await fetch(`/api/media/${id}`, { method: 'DELETE' })
                  if (!response.ok) throw new Error('Failed to delete media')
            } catch (err) {
                  console.error('Error deleting media:', err)
                  alert('Failed to delete media. Please try again.')
                  // Revert the optimistic update
                  await fetchMedia()
            }
      }

      const handleUpload = () => {
            setIsModalOpen(true)
      }

      const handleImageSelect = async (image: { filePath: string; id: number }) => {
            // Optimistic UI update
            const newMedia: Media = {
                  id: image.id,
                  fileName: image.filePath.split('/').pop() || '',
                  filePath: image.filePath,
                  fileType: image.filePath.split('.').pop() || '',
                  fileSize: 0, // You might want to update this with actual file size
                  createdAt: new Date().toISOString(),
                  user: { name: session?.user?.name || 'Unknown' }
            }
            setMedia((prevMedia) => [...prevMedia, newMedia])
            setIsModalOpen(false)

            // Fetch updated data to ensure consistency
            await fetchMedia()
      }

      const columns: ColumnDef<Media>[] = [
            {
                  accessorKey: 'filePath',
                  header: () => <div className="w-2/12">Preview</div>,
                  cell: ({ row }) => (
                        <Image src={row.getValue('filePath')} alt={row.getValue('fileName')} width={50} height={50} />
                  )
            },
            {
                  accessorKey: 'fileName',
                  header: () => <div className="w-2/12">Name</div>,
                  cell: ({ row }) => <div className="font-semibold">{row.getValue('fileName')}</div>
            },

            {
                  accessorKey: 'fileType',
                  header: () => <div className="w-1/12">Type</div>,
                  cell: ({ row }) => <div className="text-sm">{row.getValue('fileType')}</div>
            },
            {
                  accessorKey: 'fileSize',
                  header: () => <div className="w-1/12">Size</div>,
                  cell: ({ row }) => (
                        <div className="text-sm">{`${(row.getValue('fileSize') / 1024).toFixed(2)} KB`}</div>
                  )
            },
            {
                  accessorKey: 'user.name',
                  header: () => <div className="w-2/12">By</div>,
                  cell: ({ row }) => <div className="text-sm">{row.original.user.name}</div>
            },
            {
                  accessorKey: 'createdAt',
                  header: () => <div className="w-2/12">Date</div>,
                  cell: ({ row }) => (
                        <div className="text-sm">{new Date(row.getValue('createdAt')).toLocaleDateString()}</div>
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
                        <h1 className="text-3xl font-bold">Media Management</h1>
                        <Button onClick={handleUpload}>Upload New Media</Button>
                  </div>
                  <TableComponent columns={columns} data={media} onDelete={handleDelete} enableSearch={true} />

                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogContent>
                              <DialogHeader>
                                    <DialogTitle>Upload New Media</DialogTitle>
                                    <DialogDescription>
                                          Select an image to upload or choose from the media library.
                                    </DialogDescription>
                              </DialogHeader>
                              <ImageSelect
                                    onSelect={handleImageSelect}
                                    onClose={() => setIsModalOpen(false)}
                                    isOpen={isModalOpen}
                              />
                        </DialogContent>
                  </Dialog>
            </div>
      )
}
