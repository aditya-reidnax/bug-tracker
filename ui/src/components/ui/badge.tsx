import * as React from 'react'
import { cn } from '@/lib/utils'

function Badge({ className, variant = 'default', children, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'warning' | 'success' }) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        {
          'bg-blue-100 text-blue-800': variant === 'default',
          'border border-gray-300 text-gray-700': variant === 'outline',
          'bg-gray-100 text-gray-800': variant === 'secondary',
          'bg-red-100 text-red-800': variant === 'destructive',
          'bg-yellow-100 text-yellow-800': variant === 'warning',
          'bg-green-100 text-green-800': variant === 'success',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Badge }
