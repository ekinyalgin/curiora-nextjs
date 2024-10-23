'use client'

import { ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ClientSideAdminLayoutProps {
      children: ReactNode
}

export default function ClientSideAdminLayout({ children }: ClientSideAdminLayoutProps) {
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

      return <>{children}</>
}
