'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, indeterminate, onChange, ...props }, ref) => {
    const internalRef = React.useRef<HTMLInputElement>(null)
    const combinedRef = (ref as React.RefObject<HTMLInputElement>) || internalRef

    React.useEffect(() => {
      if (combinedRef.current) {
        combinedRef.current.indeterminate = !!indeterminate
      }
    }, [combinedRef, indeterminate])

    return (
      <label className="relative inline-flex items-center justify-center cursor-pointer p-0.5">
        <input
          type="checkbox"
          ref={combinedRef}
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            'flex size-4 items-center justify-center rounded border border-border/80 bg-background transition-colors hover:border-primary peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
            indeterminate && 'bg-primary border-primary text-primary-foreground',
            className
          )}
        >
          {indeterminate ? (
            <span className="h-0.5 w-2 bg-current rounded-full" />
          ) : checked ? (
            <Check className="size-3 stroke-[3]" />
          ) : null}
        </div>
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'
