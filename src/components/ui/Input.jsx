import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(function Input(
  {
    label,
    hint,
    error,
    disabled = false,
    leadingIcon: LeadingIcon,
    trailingAction,
    className,
    containerClassName,
    inputClassName,
    id,
    ...props
  },
  ref,
) {
  const hasLabelOrHint = Boolean(label || hint || error)

  const containerCls = hasLabelOrHint
    ? cn('flex flex-col gap-1.5', containerClassName || (inputClassName ? className : ''))
    : cn('relative w-full flex items-center', containerClassName)

  const inputCls = cn(
    'h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink placeholder:text-ink-muted focus:border-brand-500 focus:outline-none disabled:bg-canvas disabled:text-ink-muted transition-colors',
    LeadingIcon && 'pl-9',
    trailingAction && 'pr-9',
    error && 'border-[#B91C1C] focus:border-[#B91C1C]',
    (!hasLabelOrHint || inputClassName) ? (inputClassName || className) : '',
  )

  return (
    <div className={containerCls}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative w-full flex items-center">
        {LeadingIcon && (
          <LeadingIcon
            size={18}
            strokeWidth={1.75}
            className="pointer-events-none absolute left-3 text-ink-muted shrink-0"
          />
        )}
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          className={inputCls}
          {...props}
        />
        {trailingAction && <div className="absolute right-2 flex items-center">{trailingAction}</div>}
      </div>
      {error ? (
        <span className="text-xs text-[#B91C1C]">{error}</span>
      ) : (
        hint && <span className="text-xs text-ink-muted">{hint}</span>
      )}
    </div>
  )
})

export default Input
