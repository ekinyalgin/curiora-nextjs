import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
      return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number): string {
      if (!date) return 'Invalid date'

      const dateObject = new Date(date)

      if (isNaN(dateObject.getTime())) {
            return 'Invalid date'
      }

      return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
      }).format(dateObject)
}

// Diğer utility fonksiyonlarınız varsa buraya ekleyebilirsiniz
