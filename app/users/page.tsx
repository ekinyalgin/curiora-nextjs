import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Prisma } from '@prisma/client'

// Define an interface for the user object
interface User {
      id: string
      name: string | null
      image: string | null
      username: string | null
      role?: { name: string }
      _count?: { posts: number; comments: number }
}

async function getUsers() {
      const users = await prisma.user.findMany({
            select: {
                  id: true,
                  name: true,
                  image: true,
                  username: true,
                  role: {
                        select: {
                              name: true
                        }
                  },
                  _count: {
                        select: {
                              posts: true,
                              comments: true
                        }
                  }
            },
            orderBy: {
                  createdAt: 'desc'
            } as Prisma.UserOrderByWithRelationInput
      })
      return users
}

export default async function UsersPage() {
      const session = await getServerSession(authOptions)
      const users = await getUsers()

      if (!session) {
            return <div>Please sign in to view this page.</div>
      }

      return (
            <div className="container mx-auto px-4 py-8">
                  <h1 className="text-3xl font-bold mb-6">Users</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map((user: User) => (
                              <div key={user.id} className="bg-white shadow-md rounded-lg p-6">
                                    <div className="flex items-center mb-4">
                                          <Image
                                                src={user.image || '/default-avatar.png'}
                                                alt={user.name || 'User'}
                                                width={50}
                                                height={50}
                                                className="rounded-full mr-4"
                                          />
                                          <div>
                                                <h2 className="text-xl font-semibold">{user.name}</h2>
                                                <p className="text-gray-600">@{user.username}</p>
                                          </div>
                                    </div>
                                    <p className="text-gray-700 mb-2">Role: {user.role?.name || 'User'}</p>
                                    <p className="text-gray-700 mb-2">Posts: {user._count?.posts || 0}</p>
                                    <p className="text-gray-700 mb-4">Comments: {user._count?.comments || 0}</p>
                                    <Link href={`/users/${user.id}`} className="text-blue-500 hover:underline">
                                          View Profile
                                    </Link>
                              </div>
                        ))}
                  </div>
            </div>
      )
}
