'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminFormLayout } from '@/components/ui/admin-form-layout'
import { ImageUpload } from '@/components/ui/imageSelect/image-upload'

export default function NewMedia() {
      const [uploadedImage, setUploadedImage] = useState<string | undefined>(undefined)
      const router = useRouter()

      const handleImageUpload = (imageUrl: string) => {
            setUploadedImage(imageUrl)
      }

      const handleImageDelete = async (imageUrl: string) => {
            try {
                  await fetch(`/api/media?filePath=${encodeURIComponent(imageUrl)}`, { method: 'DELETE' })
                  setUploadedImage(undefined)
            } catch (error) {
                  console.error('Error deleting image:', error)
                  alert('Failed to delete image. Please try again.')
            }
      }

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault()
            if (uploadedImage) {
                  router.push('/admin/media')
            } else {
                  alert('Please upload an image before submitting.')
            }
      }

      return (
            <AdminFormLayout
                  title="Upload New Media"
                  backLink="/admin/media"
                  onSubmit={handleSubmit}
                  submitText="Save Media"
            >
                  <ImageUpload
                        onImageUpload={handleImageUpload}
                        onImageDelete={handleImageDelete}
                        initialImage={uploadedImage}
                  />
            </AdminFormLayout>
      )
}
