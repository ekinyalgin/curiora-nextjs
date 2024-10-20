'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { TableComponent } from '@/components/TableComponent'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { LanguageForm } from './LanguageForm'

interface Language {
      id: number
      code: string
      name: string
      isDefault: boolean
}

export default function LanguageManagement() {
      const [languages, setLanguages] = useState<Language[]>([])
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState<string | null>(null)
      const { data: session, status } = useSession()
      const router = useRouter()
      const [isModalOpen, setIsModalOpen] = useState(false)
      const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(null)

      useEffect(() => {
            if (status === 'authenticated') {
                  if (session?.user?.role !== 'admin') {
                        router.push('/')
                  } else {
                        fetchLanguages()
                  }
            } else if (status === 'unauthenticated') {
                  router.push('/login')
            }
      }, [session, status, router])

      const fetchLanguages = async () => {
            try {
                  setLoading(true)
                  const response = await fetch('/api/languages')
                  if (!response.ok) throw new Error('Failed to fetch languages')
                  const data = await response.json()
                  setLanguages(data)
            } catch (err) {
                  setError('Failed to load languages. Please try again later.')
                  console.error('Error fetching languages:', err)
            } finally {
                  setLoading(false)
            }
      }

      const handleEdit = (id: number) => {
            setSelectedLanguageId(id)
            setIsModalOpen(true)
      }

      const handleDelete = async (id: number) => {
            // Optimistic UI update
            setLanguages((prevLanguages) => prevLanguages.filter((lang) => lang.id !== id))

            try {
                  const response = await fetch(`/api/languages/${id}`, {
                        method: 'DELETE'
                  })
                  if (!response.ok) throw new Error('Failed to delete language')
            } catch (err) {
                  console.error('Error deleting language:', err)
                  alert('Failed to delete language. Please try again.')
                  // Revert the optimistic update
                  await fetchLanguages()
            }
      }

      const handleAddNew = () => {
            setSelectedLanguageId(null)
            setIsModalOpen(true)
      }

      const handleFormSubmit = async (data: Omit<Language, 'id'>) => {
            const isNewLanguage = selectedLanguageId === null
            const optimisticId = isNewLanguage ? Math.random() : selectedLanguageId
            const optimisticLanguage: Language = {
                  id: optimisticId,
                  ...data,
                  isDefault: Boolean(data.isDefault) // Ensure isDefault is a boolean
            }

            // Optimistic UI update
            setLanguages((prevLanguages) =>
                  isNewLanguage
                        ? [...prevLanguages, optimisticLanguage]
                        : prevLanguages.map((lang) => (lang.id === selectedLanguageId ? optimisticLanguage : lang))
            )
            setIsModalOpen(false)

            try {
                  const url = isNewLanguage ? '/api/languages' : `/api/languages/${selectedLanguageId}`
                  const method = isNewLanguage ? 'POST' : 'PUT'

                  const response = await fetch(url, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                              ...data,
                              isDefault: Boolean(data.isDefault) // Ensure isDefault is a boolean
                        })
                  })

                  if (!response.ok) throw new Error('Failed to save language')

                  // Fetch the updated data to ensure consistency
                  await fetchLanguages()
            } catch (err) {
                  console.error('Error saving language:', err)
                  alert('Failed to save language. Please try again.')
                  // Revert the optimistic update
                  await fetchLanguages()
            }
      }

      const columns: ColumnDef<Language>[] = [
            {
                  accessorKey: 'id',
                  header: () => <div className="w-1/12 text-center mx-auto">ID</div>,
                  cell: ({ row }) => <div className="font-medium text-center">{row.getValue('id')}</div>
            },
            {
                  accessorKey: 'code',
                  header: () => <div className="w-3/12">Code</div>,
                  cell: ({ row }) => <div className="font-semibold">{row.getValue('code')}</div>
            },
            {
                  accessorKey: 'name',
                  header: () => <div className="w-5/12">Name</div>,
                  cell: ({ row }) => <div className="text-sm">{row.getValue('name')}</div>
            },
            {
                  accessorKey: 'isDefault',
                  header: () => <div className="w-2/12 mx-auto">Default</div>,
                  cell: ({ row }) => (
                        <div className="text-sm text-center">{row.getValue('isDefault') ? 'Yes' : 'No'}</div>
                  )
            }
      ]

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
            <div className="container mx-auto py-10">
                  <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Language Management</h1>
                        <Button onClick={handleAddNew}>Add New Language</Button>
                  </div>
                  <TableComponent
                        columns={columns}
                        data={languages}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        enableSearch={false}
                  />

                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogContent>
                              <DialogHeader>
                                    <DialogTitle>
                                          {selectedLanguageId ? 'Edit Language' : 'Add New Language'}
                                    </DialogTitle>
                                    <DialogDescription>
                                          {selectedLanguageId
                                                ? 'Edit the details of the selected language.'
                                                : 'Add a new language to the system.'}
                                    </DialogDescription>
                              </DialogHeader>
                              <LanguageForm languageId={selectedLanguageId} onSubmit={handleFormSubmit} />
                        </DialogContent>
                  </Dialog>
            </div>
      )
}
