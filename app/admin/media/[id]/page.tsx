'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AdminFormLayout } from '@/components/ui/admin-form-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface MediaItem {
      id: number
      fileName: string
      filePath: string
      fileType: string
      fileSize: number
      createdAt: string
      user: { name: string }
}

export default function MediaDetailPage({ params }: { params: { id: string } }) {
      const [media, setMedia] = useState<MediaItem | null>(null)
      const [isLoading, setIsLoading] = useState(true)
      const [error, setError] = useState<string | null>(null)
      const router = useRouter()

      const fetchMedia = useCallback(async () => {
            setIsLoading(true)
            try {
                  const response = await fetch(`/api/media/${params.id}`)
                  if (!response.ok) {
                        throw new Error('Failed to fetch media')
                  }
                  const data = await response.json()
                  setMedia(data)
            } catch (err) {
                  setError('Error fetching media. Please try again.')
                  console.error(err)
            } finally {
                  setIsLoading(false)
            }
      }, [params.id])

      useEffect(() => {
            fetchMedia()
      }, [fetchMedia])

      async function handleDelete() {
            if (confirm('Are you sure you want to delete this media?')) {
                  try {
                        const response = await fetch(`/api/media/${params.id}`, {
                              method: 'DELETE'
                        })
                        if (!response.ok) {
                              throw new Error('Failed to delete media')
                        }
                        router.push('/admin/media')
                  } catch (err) {
                        setError('Error deleting media. Please try again.')
                        console.error(err)
                  }
            }
      }

      if (isLoading) return <div>Loading...</div>
      if (error) return <div>Error: {error}</div>
      if (!media) return <div>Media not found</div>

      return (
            <AdminFormLayout
                  title="Media Details"
                  backLink="/admin/media"
                  onSubmit={(e) => e.preventDefault()}
                  submitText=""
            >
                  <div className="space-y-4">
                        <div className="flex justify-center">
                              <Image
                                    src={media.filePath}
                                    alt={media.fileName}
                                    width={300}
                                    height={300}
                                    objectFit="contain"
                              />
                        </div>
                        <Input type="text" placeholder="File Name" value={media.fileName} readOnly />
                        <Input type="text" placeholder="File Type" value={media.fileType} readOnly />
                        <Input
                              type="text"
                              placeholder="File Size"
                              value={`${(media.fileSize / 1024).toFixed(2)} KB`}
                              readOnly
                        />
                        <Input type="text" placeholder="Uploaded By" value={media.user.name} readOnly />
                        <Input
                              type="text"
                              placeholder="Upload Date"
                              value={new Date(media.createdAt).toLocaleString()}
                              readOnly
                        />
                        <Input type="text" placeholder="File Path" value={media.filePath} readOnly />
                        <div className="flex justify-between">
                              <Button
                                    onClick={() => {
                                          navigator.clipboard.writeText(media.filePath)
                                          alert('File path copied to clipboard!')
                                    }}
                              >
                                    Copy File Path
                              </Button>
                              <Button variant="destructive" onClick={handleDelete}>
                                    Delete Media
                              </Button>
                        </div>
                  </div>
            </AdminFormLayout>
      )
}
