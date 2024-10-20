import * as React from 'react'
import { cn } from '@/lib/utils'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
      children: React.ReactNode
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, children, ...props }, ref) => {
      return (
            <label
                  className={cn(
                        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-20 mb-3 block',
                        className
                  )}
                  ref={ref}
                  {...props}
            >
                  {children}
            </label>
      )
})

Label.displayName = 'Label'

export { Label }
