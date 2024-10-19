'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { AdminFormLayout } from '@/components/ui/admin-form-layout'

export default function NewLanguage() {
      const [code, setCode] = useState('')
      const [name, setName] = useState('')
      const [isDefault, setIsDefault] = useState(false)
      const { data: session, status } = useSession()
      const router = useRouter()

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault()
            try {
                  const response = await fetch('/api/languages', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code, name, isDefault })
                  })
                  if (!response.ok) throw new Error('Failed to add language')
                  router.push('/admin/languages')
            } catch (err) {
                  console.error('Error adding language:', err)
                  alert('Failed to add language. Please try again.')
            }
      }

      if (status === 'loading') {
            return <div>Loading...</div>
      }

      if (status === 'authenticated' && session.user.role !== 'admin') {
            return <div>Unauthorized</div>
      }

      return (
            <AdminFormLayout
                  title="Add New Language"
                  backLink="/admin/languages"
                  onSubmit={handleSubmit}
                  submitText="Add Language"
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
