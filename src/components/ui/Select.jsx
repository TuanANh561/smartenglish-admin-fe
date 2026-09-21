import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const Select = forwardRef(function Select(
  {
    label,
    hint,
    error,
    disabled = false,
    className,
    containerClassName,
    selectClassName,
    id,
    children,
    ...props
  },
  ref,
) {
  const hasLabelOrHint = Boolean(label || hint || error)

  const containerCls = hasLabelOrHint
    ? cn('flex flex-col gap-1.5', containerClassName || (selectClassName ? className : ''))
    : cn('relative w-full flex items-center', containerClassName)

  const selectCls = cn(
    'h-10 w-full appearance-none rounded-lg border border-line bg-white pl-3 pr-8 text-sm text-ink focus:border-brand-500 focus:outline-none disabled:bg-canvas disabled:text-ink-muted transition-colors',
    error && 'border-[#B91C1C] focus:border-[#B91C1C]',
    (!hasLabelOrHint || selectClassName) ? (selectClassName || className) : '',
  )

  return (
    <div className={containerCls}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative w-full flex items-center">
        <select
          ref={ref}
          id={id}
          disabled={disabled}
          className={selectCls}
          {...props}
        >
          {props.options
            ? props.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown
          size={15}
          strokeWidth={2}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted shrink-0"
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
