'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface FollowedTagItemProps {
      id: number
      name: string
      slug: string
      followerCount: number
      featuredImage?: string | null
}

export function FollowedTagItem({ id, name, slug, followerCount, featuredImage }: FollowedTagItemProps) {
      const [isFollowing, setIsFollowing] = useState(true)
      const [localFollowerCount, setLocalFollowerCount] = useState(followerCount)

      const handleFollowToggle = async () => {
            try {
                  const response = await fetch(`/api/tags/${id}/follow`, {
                        method: 'POST'
                  })
                  if (response.ok) {
                        setIsFollowing(!isFollowing)
                        setLocalFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1))
                  } else {
                        throw new Error('Failed to follow/unfollow tag')
                  }
            } catch (error) {
                  console.error('Error following/unfollowing tag:', error)
                  alert('Failed to follow/unfollow tag. Please try again.')
            }
      }

      return (
            <div className="border rounded-lg p-4 mb-4">
                  {featuredImage && (
                        <Image src={featuredImage} alt={name} width={100} height={100} className="rounded-lg mb-2" />
                  )}
                  <Link href={`/tags/${slug}`} className="text-lg font-semibold hover:underline">
                        {name}
                  </Link>
                  <p className="text-sm text-gray-500 mb-2">{localFollowerCount} followers</p>
                  <Button onClick={handleFollowToggle} variant={isFollowing ? 'outline' : 'secondary'}>
                        {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
            </div>
      )
}
