'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminHeader from '@/components/AdminHeader'
import { FileText } from 'lucide-react'
import { Users } from 'lucide-react'
import { MessageSquare } from 'lucide-react'

export default function AdminLayout({ children }: { children: ReactNode }) {
      const { data: session, status } = useSession()
      const router = useRouter()
      const [isLoading, setIsLoading] = useState(true)

      useEffect(() => {
            if (status === 'loading') return
            if (!session || session.user?.role !== 1) {
                  router.push('/')
            } else {
                  setIsLoading(false)
            }
      }, [session, status, router])

      if (isLoading) {
            return <div>Loading...</div>
      }

      if (!session || session.user?.role !== 1) {
            return null
      }

      const menuItems = [
            {
                  title: 'Dashboard',
                  href: '/admin',
                  icon: 'Home'
            },
            {
                  title: 'Roles',
                  href: '/admin/roles',
                  icon: 'Shield'
            },
            {
                  title: 'Settings',
                  href: '/admin/settings',
                  icon: 'Settings'
            },
            {
                  title: 'Tags',
                  href: '/admin/tags',
                  icon: 'Tag'
            },
            {
                  title: 'Categories',
                  href: '/admin/categories',
                  icon: 'List'
            },
            {
                  title: 'Languages',
                  href: '/admin/languages',
                  icon: 'Globe'
            },
            {
                  title: 'Posts',
                  href: '/admin/posts',
                  icon: FileText
            },
            {
                  title: 'Users',
                  href: '/admin/users',
                  icon: Users
            },
            {
                  title: 'Media',
                  href: '/admin/media',
                  icon: Users
            },
            {
                  title: 'Comments',
                  href: '/admin/comments',
                  icon: MessageSquare
            },
            {
                  title: 'Reports',
                  href: '/admin/reports',
                  icon: MessageSquare
            }
      ]

      return (
            <div className="flex flex-col h-screen bg-gray-100">
                  <AdminHeader />
                  <div className="flex flex-1">
                        <aside className="w-40 bg-white text-sm">
                              <nav className="mt-4">
                                    {menuItems.map((item) => (
                                          <Link
                                                key={item.title}
                                                href={item.href}
                                                className="block py-2 px-4 text-gray-600 hover:bg-gray-200"
                                          >
                                                {item.title}
                                          </Link>
                                    ))}
                                    <Link href="/" className="block py-2 px-4 text-gray-600 hover:bg-gray-200">
                                          Back to Site
                                    </Link>
                              </nav>
                        </aside>
                        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
                  </div>
            </div>
      )
}
