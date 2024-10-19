import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'

export async function POST(request: Request, { params }: { params: { id: string } }) {
      const session = await getServerSession(authOptions)

      if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const tagId = parseInt(params.id)

      try {
            const existingFollow = await prisma.tagFollow.findUnique({
                  where: {
                        tagId_userId: {
                              tagId,
                              userId: session.user.id
                        }
                  }
            })

            if (existingFollow) {
                  // Unfollow
                  await prisma.$transaction([
                        prisma.tagFollow.delete({
                              where: { id: existingFollow.id }
                        }),
                        prisma.tag.update({
                              where: { id: tagId },
                              data: { followerCount: { decrement: 1 } }
                        })
                  ])

                  return NextResponse.json({ message: 'Tag unfollowed successfully' })
            } else {
                  // Follow
                  await prisma.$transaction([
                        prisma.tagFollow.create({
                              data: {
                                    tagId,
                                    userId: session.user.id
                              }
                        }),
                        prisma.tag.update({
                              where: { id: tagId },
                              data: { followerCount: { increment: 1 } }
                        })
                  ])

                  return NextResponse.json({ message: 'Tag followed successfully' })
            }
      } catch (error) {
            console.error('Error following/unfollowing tag:', error)
            return NextResponse.json({ error: 'Failed to follow/unfollow tag' }, { status: 500 })
      }
}
