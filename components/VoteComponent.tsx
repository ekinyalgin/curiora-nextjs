'use client'
import React from 'react'
import { useState, useEffect } from 'react'
import { ArrowBigUp, ArrowBigDown } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Tooltip } from './ui/Tooltip'

interface VoteComponentProps {
      itemId: string
      itemType: string
      initialUpVotes: number
      initialDownVotes: number
      userVote: 'upvote' | 'downvote' | null
      onVote: (voteType: 'upvote' | 'downvote' | null) => Promise<void>
      isDisabled: boolean
}

const VoteComponent: React.FC<VoteComponentProps> = ({
      initialUpVotes,
      initialDownVotes,
      userVote: initialUserVote,
      onVote,
      isDisabled
}) => {
      const [upVotes, setUpVotes] = useState(initialUpVotes)
      const [downVotes, setDownVotes] = useState(initialDownVotes)
      const [userVote, setUserVote] = useState(initialUserVote)
      const { data: session } = useSession()

      useEffect(() => {
            setUpVotes(initialUpVotes)
            setDownVotes(initialDownVotes)
            setUserVote(initialUserVote)
      }, [initialUpVotes, initialDownVotes, initialUserVote])

      const handleVote = async (voteType: 'upvote' | 'downvote') => {
            if (!session) {
                  alert('You must be logged in to vote')
                  return
            }

            let newVote: 'upvote' | 'downvote' | null = voteType

            if (userVote === voteType) {
                  // If clicking the same vote type, remove the vote
                  newVote = null
            }

            try {
                  await onVote(newVote)

                  // Update local state
                  if (newVote === 'upvote') {
                        setUpVotes((prev) => prev + 1)
                        if (userVote === 'downvote') setDownVotes((prev) => prev - 1)
                  } else if (newVote === 'downvote') {
                        setDownVotes((prev) => prev + 1)
                        if (userVote === 'upvote') setUpVotes((prev) => prev - 1)
                  } else {
                        // Removing vote
                        if (userVote === 'upvote') setUpVotes((prev) => prev - 1)
                        if (userVote === 'downvote') setDownVotes((prev) => prev - 1)
                  }
                  setUserVote(newVote)
            } catch (error) {
                  console.error('Error voting:', error)
                  alert('Failed to vote. Please try again.')
            }
      }

      return (
            <div className={`flex items-center space-x-1 ${isDisabled ? 'opacity-50' : ''}`}>
                  <Tooltip content="Upvote">
                        <button
                              onClick={() => handleVote('upvote')}
                              className={`focus:outline-none ${userVote === 'upvote' ? 'text-green-500' : 'text-black hover:text-green-600 transition'}`}
                              disabled={isDisabled}
                        >
                              <ArrowBigUp strokeWidth={1.5} />
                        </button>
                  </Tooltip>
                  <span className="text-gray-500 text-sm font-semibold">{upVotes - downVotes}</span>
                  <Tooltip content="Downvote!">
                        <button
                              onClick={() => handleVote('downvote')}
                              className={`focus:outline-none ${userVote === 'downvote' ? 'text-red-500' : 'text-black hover:text-red-600 transition'}`}
                              disabled={isDisabled}
                        >
                              <ArrowBigDown strokeWidth={1.5} />
                        </button>
                  </Tooltip>
            </div>
      )
}

export default VoteComponent
