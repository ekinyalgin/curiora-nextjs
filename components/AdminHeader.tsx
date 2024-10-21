'use client'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'

export default function AdminHeader() {
      const { data: session } = useSession()

      return (
            <header className="bg-gray-900 shadow-md sticky top-0 z-10 w-full">
                  <div className="px-6 py-4 flex justify-between items-center">
                        {/* Logo and Title */}
                        <div className="flex items-center space-x-4">
                              <Link href="/admin" className="text-2xl font-bold text-white flex items-center space-x-2">
                                    <span className="text-white">Admin Panel</span>
                              </Link>
                        </div>

                        {/* User Profile and Sign Out */}
                        <div className="flex items-center space-x-4">
                              {session?.user?.image && (
                                    <Image
                                          src={session.user.image}
                                          alt="User"
                                          width={40}
                                          height={40}
                                          className="rounded-full border border-gray-700"
                                          unoptimized
                                    />
                              )}
                              <div className="text-white font-medium">{session?.user?.name}</div>
                              <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-all text-sm"
                              >
                                    Sign Out
                              </button>
                        </div>
                  </div>
            </header>
      )
}
