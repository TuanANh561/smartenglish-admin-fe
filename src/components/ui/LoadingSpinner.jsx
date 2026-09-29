import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoadingSpinner({
  text = 'Đang tải dữ liệu...',
  size = 28,
  className,
  spinnerClassName,
  textClassName,
  inline = false,
}) {
  if (inline) {
    return (
      <div className={cn('inline-flex items-center gap-2 text-sm text-slate-500', className)}>
        <Loader2
          size={size}
          className={cn('animate-spin text-brand-500 shrink-0', spinnerClassName)}
        />
        {text && <span className={cn('text-sm text-slate-500 font-normal', textClassName)}>{text}</span>}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2.5 py-12 text-center', className)}>
      <Loader2
        size={size}
        className={cn('animate-spin text-brand-500 shrink-0', spinnerClassName)}
      />
      {text && (
        <span className={cn('text-sm text-slate-500 font-normal', textClassName)}>
          {text}
        </span>
      )}
    </div>
  )
}
