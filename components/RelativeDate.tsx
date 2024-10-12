import { formatDistanceToNow } from 'date-fns'

interface RelativeDateProps {
      date: Date | string
}

export function RelativeDate({ date }: RelativeDateProps) {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return <span>{formatDistanceToNow(dateObj, { addSuffix: true })}</span>
}
