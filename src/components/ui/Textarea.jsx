import { forwardRef, useCallback, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

const Textarea = forwardRef(function Textarea(
  {
    label,
    hint,
    error,
    disabled = false,
    className,
    id,
    rows = 3,
    autoResize = false,
    onInput,
    ...props
  },
  ref,
) {
  const innerRef = useRef(null)

  const adjustHeight = useCallback((el) => {
    if (!el) return
    el.style.height = 'auto'
    const newHeight = Math.max(el.scrollHeight, (rows || 2) * 22 + 16)
    el.style.height = `${newHeight}px`
  }, [rows])

  useEffect(() => {
    if (autoResize && innerRef.current) {
      adjustHeight(innerRef.current)
    }
  }, [autoResize, props.value, adjustHeight])

  const setCombinedRef = (node) => {
    innerRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  const handleInput = (e) => {
    if (autoResize) {
      adjustHeight(e.target)
    }
    onInput?.(e)
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        ref={setCombinedRef}
        id={id}
        rows={rows}
        disabled={disabled}
        onInput={handleInput}
        className={cn(
          'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-brand-500 focus:outline-none disabled:bg-canvas disabled:text-ink-muted transition-[height]',
          autoResize ? 'resize-y overflow-y-hidden' : 'resize-y',
          error && 'border-[#B91C1C] focus:border-[#B91C1C]',
        )}
        {...props}
      />
      {error ? (
        <span className="text-xs text-[#B91C1C]">{error}</span>
      ) : (
        hint && <span className="text-xs text-ink-muted">{hint}</span>
      )}
    </div>
  )
})

export default Textarea
