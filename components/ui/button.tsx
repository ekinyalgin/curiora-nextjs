// components/ui/button.tsx

import { ButtonHTMLAttributes, forwardRef } from 'react'

function cn(...classes: (string | boolean | undefined)[]): string {
      return classes.filter(Boolean).join(' ')
}

const buttonVariants = {
      primary: 'bg-primary text-white hover:bg-primary/90 text-sm',
      secondary: 'bg-secondary text-black hover:bg-secondary/90 text-sm',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm',
      destructive: 'bg-red-500 text-white hover:bg-red-600',
      ghost: 'bg-transparent hover:bg-gray-100',
      disabled: 'bg-gray-400 hover:bg-gray-400 text-white text-sm',
      none: ''
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
      variant?: keyof typeof buttonVariants
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'primary', ...props }, ref) => {
      return (
            <button
                  ref={ref}
                  className={cn(
                        'px-4 py-2 rounded-md transition-all',
                        buttonVariants[variant], // Seçilen varyasyonun stilini uygula
                        className
                  )}
                  {...props}
            />
      )
})

Button.displayName = 'Button'

export { Button }
