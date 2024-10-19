'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { AdminListLayout } from '@/components/ui/admin-list-layout'

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
            router.push(`/admin/languages/edit/${id}`)
      }

      const handleDelete = async (id: number) => {
            try {
                  const response = await fetch(`/api/languages/${id}`, {
                        method: 'DELETE'
                  })
                  if (!response.ok) throw new Error('Failed to delete language')
                  await fetchLanguages()
            } catch (err) {
                  console.error('Error deleting language:', err)
                  alert('Failed to delete language. Please try again.')
            }
      }

      const columns: ColumnDef<Language>[] = [
            {
                  accessorKey: 'id',
                  header: () => <div className="w-1/12 text-center">ID</div>,
                  cell: ({ row }) => <div className="font-medium text-center">{row.getValue('id')}</div>
            },
            {
                  accessorKey: 'code',
                  header: () => <div className="w-2/12">Code</div>,
                  cell: ({ row }) => <div className="px-4 font-semibold">{row.getValue('code')}</div>
            },
            {
                  accessorKey: 'name',
                  header: () => <div className="w-4/12">Name</div>,
                  cell: ({ row }) => <div className="px-4">{row.getValue('name')}</div>
            },
            {
                  accessorKey: 'isDefault',
                  header: () => <div className="w-2/12 text-center">Default</div>,
                  cell: ({ row }) => <div className="text-center">{row.getValue('isDefault') ? 'Yes' : 'No'}</div>
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
            <AdminListLayout
                  title="Language Management"
                  addNewLink="/admin/languages/new"
                  addNewText="Add New Language"
                  columns={columns}
                  data={languages}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
            />
      )
}
