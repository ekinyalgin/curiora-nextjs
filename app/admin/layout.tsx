import { ReactNode } from 'react'
import Link from 'next/link'
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
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
import { redirect } from 'next/navigation'
import ClientSideAdminLayout from '@/app/admin/ClientSideAdminLayout'
import { routes } from '@/lib/routes'

const menuSections = [
      {
            sectionTitle: 'Main',
            items: [
                  {
                        title: 'Dashboard',
                        href: routes.admin.dashboard,
                        icon: Home
                  },
                  {
                        title: 'Posts',
                        href: routes.admin.posts,
                        icon: FileText
                  },
                  {
                        title: 'Categories',
                        href: routes.admin.categories,
                        icon: List
                  },
                  {
                        title: 'Tags',
                        href: routes.admin.tags,
                        icon: Tag
                  }
            ]
      },
      {
            sectionTitle: 'Management',
            items: [
                  {
                        title: 'Users',
                        href: routes.admin.users,
                        icon: Users
                  },
                  {
                        title: 'Roles',
                        href: routes.admin.roles,
                        icon: Shield
                  },
                  {
                        title: 'Languages',
                        href: routes.admin.languages,
                        icon: Globe
                  },
                  {
                        title: 'Media',
                        href: routes.admin.media,
                        icon: Image
                  }
            ]
      },
      {
            sectionTitle: 'Settings & Reports',
            items: [
                  {
                        title: 'Settings',
                        href: routes.admin.settings,
                        icon: Settings
                  },
                  {
                        title: 'Comments',
                        href: routes.admin.comments,
                        icon: MessageSquare
                  },
                  {
                        title: 'Reports',
                        href: routes.admin.reports,
                        icon: MessageSquare
                  }
            ]
      }
]

export default async function AdminLayout({ children }: { children: ReactNode }) {
      const session = await getServerSession(authOptions)

      if (!session || session.user?.role !== 'admin') {
            redirect('/')
      }

      return (
            <ClientSideAdminLayout>
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
                                                href={routes.home}
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
            </ClientSideAdminLayout>
      )
}
