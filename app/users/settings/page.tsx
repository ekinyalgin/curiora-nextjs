import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import UserSettingsForm from '@/components/UserSettingsForm'
import { FollowedTagItem } from '@/components/FollowedTagItem'
import Loading from '@/components/Loading'
import Image from 'next/image'

async function UserSettingsContent() {
      const session = await getServerSession(authOptions)

      if (!session || !session.user) {
            redirect('/login')
      }

      const userSettings = await prisma.userSettings.findUnique({
            where: { userId: session.user.id },
            include: {
                  user: {
                        include: {
                              followedTags: {
                                    include: {
                                          tag: {
                                                include: {
                                                      featuredImage: true
                                                }
                                          }
                                    }
                              }
                        }
                  },
                  language: true
            }
      })

      if (!userSettings) {
            // If settings don't exist, create default settings
            const defaultLanguage = await prisma.language.findFirst({
                  where: { isDefault: true }
            })

            if (!defaultLanguage) {
                  throw new Error('No default language found')
            }

            await prisma.userSettings.create({
                  data: {
                        userId: session.user.id,
                        languageId: defaultLanguage.id,
                        themePreference: 'light'
                  }
            })
      }

      const formattedUserSettings = {
            languagePreference: userSettings?.language.id.toString() || '',
            themePreference: userSettings?.themePreference || 'light',
            bio: userSettings?.bio || null
      }

      return (
            <div className="container mx-auto px-4 py-8">
                  <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="mb-6">
                              <Image
                                    src={session.user.image || '/default-avatar.png'}
                                    alt={session.user.name || 'User'}
                                    width={96}
                                    height={96}
                                    className="w-24 h-24 rounded-full mx-auto object-cover"
                              />
                              <h1 className="text-2xl font-bold text-center mt-4">{session.user.name}</h1>
                              <p className="text-gray-600 text-center">@{session.user.username}</p>
                              <p className="text-gray-600 text-center mt-2">{userSettings?.bio}</p>
                        </div>
                        <UserSettingsForm initialData={formattedUserSettings} />
                  </div>

                  <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-4">Followed Tags</h2>
                        {userSettings?.user.followedTags.map(({ tag }) => (
                              <FollowedTagItem
                                    key={tag.id}
                                    id={tag.id}
                                    name={tag.name}
                                    slug={tag.slug}
                                    followerCount={tag.followerCount}
                                    featuredImage={tag.featuredImage?.filePath}
                              />
                        ))}
                  </div>
            </div>
      )
}

export default function UserSettingsPage() {
      return (
            <Suspense fallback={<Loading />}>
                  <UserSettingsContent />
            </Suspense>
      )
}
