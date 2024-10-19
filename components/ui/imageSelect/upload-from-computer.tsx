'use client'

import { ImageUpload } from './image-upload'

export function UploadFromComputer({ onUpload }: { onUpload: (imageUrl: string) => void }) {
      const handleImageUpload = async (file: File) => {
            const formData = new FormData()
            formData.append('file', file)

            try {
                  const response = await fetch('/api/media/upload', {
                        method: 'POST',
                        body: formData
                  })

                  if (!response.ok) {
                        throw new Error('Failed to upload image')
                  }

                  const data = await response.json()
                  onUpload(data.filePath)
            } catch (error) {
                  console.error('Error uploading image:', error)
                  alert('Failed to upload image. Please try again.')
            }
      }

      const handleImageDelete = async (imageUrl: string) => {
            // Implement image deletion logic here
            console.log('Image deleted:', imageUrl)
      }

      return (
            <ImageUpload
                  onImageUpload={(imageUrl: string) => {
                        const file = new File([imageUrl], 'image.jpg', { type: 'image/jpeg' })
                        handleImageUpload(file)
                  }}
                  onImageDelete={handleImageDelete}
            />
      )
}
