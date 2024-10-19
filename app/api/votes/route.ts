import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'

export async function POST(request: Request) {
      const session = await getServerSession(authOptions)

      if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const body = await request.json()
      const { itemId, itemType, voteType } = body

      if (!itemId || !itemType || voteType === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      try {
            let vote
            let voteCount

            if (itemType === 'comment') {
                  if (voteType === null) {
                        // Remove existing vote
                        await prisma.commentVote.deleteMany({
                              where: {
                                    commentId: itemId,
                                    userId: session.user.id
                              }
                        })
                  } else {
                        // Upsert vote
                        vote = await prisma.commentVote.upsert({
                              where: {
                                    commentId_userId: {
                                          commentId: itemId,
                                          userId: session.user.id
                                    }
                              },
                              update: { voteType },
                              create: {
                                    commentId: itemId,
                                    userId: session.user.id,
                                    voteType
                              }
                        })
                  }

                  // Update CommentVoteCount
                  voteCount = await prisma.commentVoteCount.upsert({
                        where: { commentId: itemId },
                        update: {
                              upVotes: await prisma.commentVote.count({
                                    where: { commentId: itemId, voteType: 'upvote' }
                              }),
                              downVotes: await prisma.commentVote.count({
                                    where: { commentId: itemId, voteType: 'downvote' }
                              })
                        },
                        create: {
                              commentId: itemId,
                              upVotes: voteType === 'upvote' ? 1 : 0,
                              downVotes: voteType === 'downvote' ? 1 : 0
                        }
                  })
            } else if (itemType === 'post') {
                  if (voteType === null) {
                        // Remove existing vote
                        await prisma.postVote.deleteMany({
                              where: {
                                    postId: itemId,
                                    userId: session.user.id
                              }
                        })
                  } else {
                        // Upsert vote
                        vote = await prisma.postVote.upsert({
                              where: {
                                    postId_userId: {
                                          postId: itemId,
                                          userId: session.user.id
                                    }
                              },
                              update: { voteType },
                              create: {
                                    postId: itemId,
                                    userId: session.user.id,
                                    voteType
                              }
                        })
                  }

                  // Update PostVoteCount
                  voteCount = await prisma.postVoteCount.upsert({
                        where: { postId: itemId },
                        update: {
                              upVotes: await prisma.postVote.count({
                                    where: { postId: itemId, voteType: 'upvote' }
                              }),
                              downVotes: await prisma.postVote.count({
                                    where: { postId: itemId, voteType: 'downvote' }
                              })
                        },
                        create: {
                              postId: itemId,
                              upVotes: voteType === 'upvote' ? 1 : 0,
                              downVotes: voteType === 'downvote' ? 1 : 0
                        }
                  })
            }

            return NextResponse.json({ vote, voteCount })
      } catch (error) {
            console.error('Error voting:', error)
            return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
      }
}
