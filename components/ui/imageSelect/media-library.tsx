'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '../button'
import { Input } from '../input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select'
import { Grid, List, Trash } from 'lucide-react'

// Define a type for the media item
type MediaItem = {
      id: number
      filePath: string
      fileName: string
      fileType: string
      fileSize: number
      createdAt: string
}

type MediaLibraryProps = {
      onSelect: (image: MediaItem) => void
      onDelete: (id: number) => void
      selectedImageId?: number
}

export function MediaLibrary({ onSelect, onDelete, selectedImageId }: MediaLibraryProps) {
      const [media, setMedia] = useState<MediaItem[]>([])
      const [searchTerm, setSearchTerm] = useState('')
      const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
      const [folders, setFolders] = useState<string[]>([])
      const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
      const [selectedMediaItem, setSelectedMediaItem] = useState<MediaItem | null>(null)

      const fetchMedia = useCallback(async () => {
            const response = await fetch(`/api/media?search=${searchTerm}&folder=${selectedFolder || ''}`)
            const data = await response.json()
            setMedia(data)
      }, [searchTerm, selectedFolder])

      useEffect(() => {
            fetchMedia()
      }, [fetchMedia])

      useEffect(() => {
            if (selectedImageId) {
                  const selectedImage = media.find((item: MediaItem) => item.id === selectedImageId)
                  if (selectedImage) {
                        setSelectedMediaItem(selectedImage)
                  }
            }
      }, [selectedImageId, media])

      useEffect(() => {
            fetchFolders()
      }, [])

      async function fetchFolders() {
            const response = await fetch('/api/media/folders')
            const data = await response.json()
            setFolders(data)
            if (data.length > 0) {
                  setSelectedFolder(data[0])
            }
      }

      const handleDelete = async (id: number) => {
            if (confirm('Are you sure you want to delete this image?')) {
                  await onDelete(id)
                  await fetchMedia()
                  if (selectedMediaItem && selectedMediaItem.id === id) {
                        setSelectedMediaItem(null)
                  }
            }
      }

      return (
            <div>
                  <div className="flex justify-between mb-4">
                        <div className="flex items-center space-x-2">
                              <Input
                                    type="text"
                                    placeholder="Search media..."
                                    value={searchTerm}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                              />
                              <Select value={selectedFolder || ''} onValueChange={setSelectedFolder}>
                                    <SelectTrigger>
                                          <SelectValue placeholder="Select folder" />
                                    </SelectTrigger>
                                    <SelectContent>
                                          {folders.map((folder) => (
                                                <SelectItem key={folder} value={folder}>
                                                      {folder}
                                                </SelectItem>
                                          ))}
                                    </SelectContent>
                              </Select>
                        </div>
                        <div>
                              <Button variant="outline" onClick={() => setViewMode('grid')}>
                                    <Grid size={20} />
                              </Button>
                              <Button variant="outline" onClick={() => setViewMode('list')}>
                                    <List size={20} />
                              </Button>
                        </div>
                  </div>
                  <div className="flex h-full overflow-hidden">
                        <div
                              className={`${
                                    viewMode === 'grid' ? 'grid grid-cols-4 gap-4' : 'space-y-2'
                              } flex-grow overflow-y-auto pr-4`}
                        >
                              {media.map((item: MediaItem) =>
                                    viewMode === 'grid' ? (
                                          <div
                                                key={item.id}
                                                className={`cursor-pointer relative ${
                                                      selectedMediaItem?.id === item.id ? 'ring-2 ring-blue-500' : ''
                                                }`}
                                                onClick={() => setSelectedMediaItem(item)}
                                          >
                                                <Image
                                                      src={item.filePath}
                                                      alt={item.fileName}
                                                      width={150}
                                                      height={150}
                                                      className="object-cover rounded-md"
                                                />
                                          </div>
                                    ) : (
                                          <div
                                                key={item.id}
                                                className={`flex items-center space-x-2 cursor-pointer ${
                                                      selectedMediaItem?.id === item.id ? 'bg-blue-100' : ''
                                                }`}
                                                onClick={() => setSelectedMediaItem(item)}
                                          >
                                                <Image
                                                      src={item.filePath}
                                                      alt={item.fileName}
                                                      width={50}
                                                      height={50}
                                                      className="object-cover rounded-md"
                                                />
                                                <span>{item.fileName}</span>
                                          </div>
                                    )
                              )}
                        </div>
                        {selectedMediaItem && (
                              <div className="w-1/3 pl-4 border-l overflow-y-auto">
                                    <h3 className="text-lg font-semibold mb-2">Image Details</h3>
                                    <Image
                                          src={selectedMediaItem.filePath}
                                          alt={selectedMediaItem.fileName}
                                          width={300}
                                          height={200}
                                          className="object-cover rounded-md mb-4"
                                    />
                                    <p>
                                          <strong>File Name:</strong> {selectedMediaItem.fileName}
                                    </p>
                                    <p>
                                          <strong>File Type:</strong> {selectedMediaItem.fileType}
                                    </p>
                                    <p>
                                          <strong>File Size:</strong> {(selectedMediaItem.fileSize / 1024).toFixed(2)}{' '}
                                          KB
                                    </p>
                                    <p>
                                          <strong>Uploaded At:</strong>{' '}
                                          {new Date(selectedMediaItem.createdAt).toLocaleString()}
                                    </p>
                                    <div className="mt-4 space-y-2">
                                          <Button onClick={() => onSelect(selectedMediaItem)}>Select Image</Button>
                                          <Button
                                                variant="destructive"
                                                onClick={() => handleDelete(selectedMediaItem.id)}
                                          >
                                                <Trash size={16} className="mr-2" /> Delete Image
                                          </Button>
                                    </div>
                              </div>
                        )}
                  </div>
            </div>
      )
}
