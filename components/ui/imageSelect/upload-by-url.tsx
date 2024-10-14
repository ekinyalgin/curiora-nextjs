'use client'

import { useState } from 'react'
import { Button } from '../button'
import { Textarea } from '../textarea'
import { Upload } from 'lucide-react'

export function UploadByUrl({ onUpload }: { onUpload: (imageUrl: string) => void }) {
      const [urlList, setUrlList] = useState('')

      const handleUploadByUrl = async () => {
            const urls = urlList.split('\n').filter((url) => url.trim() !== '')
            for (const url of urls) {
                  try {
                        const response = await fetch('/api/media/upload-by-url', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ url: url.trim() })
                        })
                        if (!response.ok) {
                              throw new Error(`Failed to upload image from URL: ${url}`)
                        }
                        const data = await response.json()
                        onUpload(data.filePath)
                  } catch (error) {
                        console.error('Error uploading image:', error)
                        alert(`Failed to upload image from URL: ${url}`)
                  }
            }
            setUrlList('')
      }

      return (
            <div className="space-y-4">
                  <Textarea
                        placeholder="Enter image URLs (one per line)"
                        value={urlList}
                        onChange={(e) => setUrlList(e.target.value)}
                        rows={5}
                  />
                  <Button onClick={handleUploadByUrl}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Images
                  </Button>
            </div>
      )
}
