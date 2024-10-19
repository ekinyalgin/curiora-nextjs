'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface FollowTagButtonProps {
      tagId: number
      initialIsFollowing: boolean
}

export function FollowTagButton({ tagId, initialIsFollowing }: FollowTagButtonProps) {
      const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
      const [isLoading, setIsLoading] = useState(false)

      const handleFollowToggle = async () => {
            setIsLoading(true)
            try {
                  const response = await fetch(`/api/tags/${tagId}/follow`, {
                        method: 'POST'
                  })
                  if (response.ok) {
                        setIsFollowing(!isFollowing)
                  } else {
                        throw new Error('Failed to follow/unfollow tag')
                  }
            } catch (error) {
                  console.error('Error following/unfollowing tag:', error)
                  alert('Failed to follow/unfollow tag. Please try again.')
            } finally {
                  setIsLoading(false)
            }
      }

      return (
            <Button onClick={handleFollowToggle} disabled={isLoading} variant={isFollowing ? 'outline' : 'secondary'}>
                  {isFollowing ? 'Unfollow' : 'Follow'} Tag
            </Button>
      )
}
