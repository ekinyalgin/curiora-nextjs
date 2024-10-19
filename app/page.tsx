'use client'

import { useSession } from 'next-auth/react'

export default function Home() {
      const { data: session, status } = useSession()

      if (status === 'loading') {
            return <p>Loading...</p>
      }

      return (
            <div className="container mx-auto px-6 py-8">
                  <h1 className="text-3xl font-bold mb-6">Welcome to Our Application</h1>
                  {session ? (
                        <p>Hello, {session.user?.name || 'User'}! You are logged in.</p>
                  ) : (
                        <p>Please sign in to access all features.</p>
                  )}
            </div>
      )
}
