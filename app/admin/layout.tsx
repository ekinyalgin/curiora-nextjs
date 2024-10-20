'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminHeader from '@/components/AdminHeader'
import {
      Home,
      Shield,
      Settings,
      Tag,
      List,
      Globe,
      FileText,
      Users,
      MessageSquare,
      ArrowLeft,
      Image
} from 'lucide-react'

export default function AdminLayout({ children }: { children: ReactNode }) {
      const { data: session, status } = useSession()
      const router = useRouter()
      const [isLoading, setIsLoading] = useState(true)

      useEffect(() => {
            if (status === 'loading') return
            if (!session || session.user?.role !== 'admin') {
                  router.push('/')
            } else {
                  setIsLoading(false)
            }
      }, [session, status, router])

      if (isLoading) {
            return (
                  <div className="flex items-center justify-center h-screen">
                        <div className="text-lg font-semibold text-gray-700">Loading...</div>
                  </div>
            )
      }

      if (!session || session.user?.role !== 'admin') {
            return null
      }

      const menuSections = [
            {
                  sectionTitle: 'Main',
                  items: [
                        {
                              title: 'Dashboard',
                              href: '/admin',
                              icon: Home
                        },
                        {
                              title: 'Posts',
                              href: '/admin/posts',
                              icon: FileText
                        },
                        {
                              title: 'Categories',
                              href: '/admin/categories',
                              icon: List
                        },
                        {
                              title: 'Tags',
                              href: '/admin/tags',
                              icon: Tag
                        }
                  ]
            },
            {
                  sectionTitle: 'Management',
                  items: [
                        {
                              title: 'Users',
                              href: '/admin/users',
                              icon: Users
                        },
                        {
                              title: 'Roles',
                              href: '/admin/roles',
                              icon: Shield
                        },
                        {
                              title: 'Languages',
                              href: '/admin/languages',
                              icon: Globe
                        },
                        {
                              title: 'Media',
                              href: '/admin/media',
                              icon: Image
                        }
                  ]
            },
            {
                  sectionTitle: 'Settings & Reports',
                  items: [
                        {
                              title: 'Settings',
                              href: '/admin/settings',
                              icon: Settings
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
            }
      ]

      return (
            <div className="flex flex-col h-screen bg-gray-100">
                  <AdminHeader />
                  <div className="flex flex-1">
                        <aside className="w-60 bg-white shadow-md">
                              <nav className="mt-8 space-y-6">
                                    {menuSections.map((section) => (
                                          <div key={section.sectionTitle} className="px-4">
                                                <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                                      {section.sectionTitle}
                                                </h2>
                                                <div className="space-y-2">
                                                      {section.items.map((item) => (
                                                            <Link
                                                                  key={item.title}
                                                                  href={item.href}
                                                                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-200 transition-all rounded-lg"
                                                            >
                                                                  <item.icon className="w-5 h-5 mr-3 text-gray-600" />
                                                                  <span className="font-medium">{item.title}</span>
                                                            </Link>
                                                      ))}
                                                </div>
                                          </div>
                                    ))}
                                    <Link
                                          href="/"
                                          className="flex items-center px-4 py-3 mt-6 text-gray-700 hover:bg-gray-200 transition-all rounded-lg"
                                    >
                                          <ArrowLeft className="w-5 h-5 mr-3 text-gray-600" />
                                          <span className="font-medium">Back to Site</span>
                                    </Link>
                              </nav>
                        </aside>
                        <main className="container mx-10 overflow-y-auto">
                              <div className="max-w-6xl mx-auto">{children}</div>
                        </main>
                  </div>
            </div>
      )
}
