import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const Select = forwardRef(function Select(
  { label, hint, error, disabled = false, className, id, children, ...props },
  ref,
) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          disabled={disabled}
          className={cn(
            'h-10 w-full appearance-none rounded-lg border border-line bg-white pl-3 pr-9 text-sm text-ink focus:border-brand-500 focus:outline-none disabled:bg-canvas disabled:text-ink-muted',
            error && 'border-[#B91C1C] focus:border-[#B91C1C]',
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={18}
          strokeWidth={1.75}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
        />
      </div>
      {error ? (
        <span className="text-xs text-[#B91C1C]">{error}</span>
      ) : (
        hint && <span className="text-xs text-ink-muted">{hint}</span>
      )}
    </div>
  )
})

export default Select
