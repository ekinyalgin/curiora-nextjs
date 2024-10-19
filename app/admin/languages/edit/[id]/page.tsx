'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { AdminFormLayout } from '@/components/ui/admin-form-layout'

export default function EditLanguage({ params }: { params: { id: string } }) {
      const [code, setCode] = useState('')
      const [name, setName] = useState('')
      const [isDefault, setIsDefault] = useState(false)
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState<string | null>(null)
      const { data: session, status } = useSession()
      const router = useRouter()

      const fetchLanguage = useCallback(async () => {
            try {
                  setLoading(true)
                  const response = await fetch(`/api/languages/${params.id}`)
                  if (!response.ok) throw new Error('Failed to fetch language')
                  const data = await response.json()
                  setCode(data.code)
                  setName(data.name)
                  setIsDefault(data.isDefault)
            } catch (err) {
                  console.error('Error fetching language:', err)
                  setError('Failed to load language data. Please try again later.')
            } finally {
                  setLoading(false)
            }
      }, [params.id])

      useEffect(() => {
            if (status === 'authenticated' && session.user.role !== 'admin') {
                  router.push('/')
            } else if (status === 'authenticated') {
                  fetchLanguage()
            }
      }, [status, session, router, fetchLanguage])

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault()
            try {
                  const response = await fetch(`/api/languages/${params.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code, name, isDefault })
                  })
                  if (!response.ok) throw new Error('Failed to update language')
                  router.push('/admin/languages')
            } catch (err) {
                  console.error('Error updating language:', err)
                  alert('Failed to update language. Please try again.')
            }
      }

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
            <AdminFormLayout
                  title="Edit Language"
                  backLink="/admin/languages"
                  onSubmit={handleSubmit}
                  submitText="Update Language"
            >
                  <Input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Language code"
                        required
                  />
                  <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Language name"
                        required
                  />
                  <div className="flex items-center space-x-2">
                        <Checkbox
                              id="isDefault"
                              checked={isDefault}
                              onCheckedChange={(checked) => setIsDefault(checked as boolean)}
                        />
                        <label htmlFor="isDefault">Set as default language</label>
                  </div>
            </AdminFormLayout>
      )
}
