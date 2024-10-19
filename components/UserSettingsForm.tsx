'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LanguageSelect } from '@/components/ui/language-select'

interface UserSettingsFormProps {
      initialData: {
            languagePreference: string
            themePreference: string
            bio: string | null
      }
}

export default function UserSettingsForm({ initialData }: UserSettingsFormProps) {
      const [formData, setFormData] = useState(initialData)
      const router = useRouter()

      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            setFormData({ ...formData, [e.target.name]: e.target.value })
      }

      const handleLanguageChange = (value: string) => {
            setFormData({ ...formData, languagePreference: value })
      }

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault()
            try {
                  const response = await fetch('/api/users/settings', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                  })

                  if (response.ok) {
                        router.refresh()
                        alert('Settings updated successfully')
                  } else {
                        throw new Error('Failed to update settings')
                  }
            } catch (error) {
                  console.error('Error updating settings:', error)
                  alert('Failed to update settings')
            }
      }

      return (
            <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                        <label htmlFor="languagePreference" className="block text-sm font-medium text-gray-700">
                              Language Preference
                        </label>
                        <LanguageSelect value={formData.languagePreference} onChange={handleLanguageChange} />
                  </div>
                  <div>
                        <label htmlFor="themePreference" className="block text-sm font-medium text-gray-700">
                              Theme Preference
                        </label>
                        <select
                              id="themePreference"
                              name="themePreference"
                              value={formData.themePreference}
                              onChange={handleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                              <option value="light">Light</option>
                              <option value="dark">Dark</option>
                        </select>
                  </div>
                  <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                              Bio
                        </label>
                        <textarea
                              id="bio"
                              name="bio"
                              rows={3}
                              value={formData.bio || ''}
                              onChange={handleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        ></textarea>
                  </div>
                  <div>
                        <button
                              type="submit"
                              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                              Save Settings
                        </button>
                  </div>
            </form>
      )
}
