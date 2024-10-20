import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface SeoFieldsProps {
      seoTitle: string
      seoDescription: string
      onSeoTitleChange: (value: string) => void
      onSeoDescriptionChange: (value: string) => void
}

export function SeoFields({ seoTitle, seoDescription, onSeoTitleChange, onSeoDescriptionChange }: SeoFieldsProps) {
      return (
            <div className="space-y-4">
                  <div>
                        <Label htmlFor="seoTitle">SEO Title</Label>
                        <Input
                              id="seoTitle"
                              value={seoTitle}
                              onChange={(e) => onSeoTitleChange(e.target.value)}
                              maxLength={60}
                        />
                        <p className="text-sm text-gray-500 mt-1">{seoTitle.length}/60 characters</p>
                  </div>
                  <div>
                        <Label htmlFor="seoDescription">SEO Description</Label>
                        <Textarea
                              id="seoDescription"
                              value={seoDescription}
                              onChange={(e) => onSeoDescriptionChange(e.target.value)}
                              maxLength={160}
                        />
                        <p className="text-sm text-gray-500 mt-1">{seoDescription.length}/160 characters</p>
                  </div>
            </div>
      )
}
