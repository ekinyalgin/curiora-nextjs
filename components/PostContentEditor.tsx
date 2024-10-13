import React from 'react'
import { Textarea } from '@/components/ui/textarea'

interface PostContentEditorProps {
      value: string
      onChange: (value: string) => void
      placeholder?: string
}

export function PostContentEditor({ value, onChange, placeholder = 'Enter post content' }: PostContentEditorProps) {
      return (
            <div className="w-full">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                        Content
                  </label>
                  <Textarea
                        id="content"
                        name="content"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        rows={10}
                  />
            </div>
      )
}
