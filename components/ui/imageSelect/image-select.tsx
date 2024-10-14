'use client'

import { Dialog, DialogContent } from '../dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs'
import { MediaLibrary } from './media-library'
import { UploadFromComputer } from './upload-from-computer'
import { UploadByUrl } from './upload-by-url'

export function ImageSelect({
      onSelect,
      onClose,
      isOpen,
      value
}: {
      onSelect: (image: { filePath: string; id: number }) => void
      onClose: () => void
      isOpen: boolean
      value?: string | number | null
}) {
      const handleSelect = (image: any) => {
            onSelect({ filePath: image.filePath, id: image.id })
            onClose()
      }

      const handleUpload = (imageUrl: string) => {
            onSelect(imageUrl)
            onClose()
      }

      const handleDelete = async (id: number) => {
            try {
                  const response = await fetch(`/api/media/${id}`, { method: 'DELETE' })
                  if (!response.ok) {
                        throw new Error('Failed to delete image')
                  }
            } catch (error) {
                  console.error('Error deleting image:', error)
                  alert('Failed to delete image. It may still be in use or locked. Please try again later.')
            }
      }

      return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                  <DialogContent className="max-w-[calc(100vw-160px)] w-full max-h-[calc(100vh-160px)] h-full">
                        <Tabs defaultValue="library" className="h-full flex flex-col">
                              <TabsList>
                                    <TabsTrigger value="library">Media Library</TabsTrigger>
                                    <TabsTrigger value="upload">Upload</TabsTrigger>
                                    <TabsTrigger value="url">Upload by URL</TabsTrigger>
                              </TabsList>
                              <TabsContent value="library" className="flex-grow overflow-hidden">
                                    <MediaLibrary
                                          onSelect={handleSelect}
                                          onDelete={handleDelete}
                                          selectedImageId={typeof value === 'number' ? value : undefined}
                                    />
                              </TabsContent>
                              <TabsContent value="upload">
                                    <UploadFromComputer onUpload={handleUpload} />
                              </TabsContent>
                              <TabsContent value="url">
                                    <UploadByUrl onUpload={handleUpload} />
                              </TabsContent>
                        </Tabs>
                  </DialogContent>
            </Dialog>
      )
}
