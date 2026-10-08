import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const SIZE_MAP = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
}

const COLOR_MAP = {
  brand: 'text-brand-600',
  navy: 'text-navy-700',
  white: 'text-white',
  slate: 'text-slate-400',
  amber: 'text-amber-500',
}

export default function LoadingSpinner({
  text = 'Đang tải dữ liệu từ máy chủ...',
  size = 'lg',
  color = 'brand',
  className,
  spinnerClassName,
  textClassName,
  inline = false,
  strokeWidth = 2.25,
}) {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 32
  const colorClass = COLOR_MAP[color] || COLOR_MAP.brand

  if (inline) {
    return (
      <div className={cn('inline-flex items-center gap-2 text-sm text-slate-500', className)}>
        <Loader2
          size={pixelSize}
          strokeWidth={strokeWidth}
          className={cn('animate-spin shrink-0', colorClass, spinnerClassName)}
        />
        {text && (
          <span className={cn('text-sm font-medium text-slate-500', textClassName)}>
            {text}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}>
      <div className="relative flex items-center justify-center">
        <Loader2
          size={pixelSize}
          strokeWidth={strokeWidth}
          className={cn('animate-spin shrink-0', colorClass, spinnerClassName)}
        />
      </div>
      {text && (
        <span className={cn('text-xs font-medium tracking-wide text-slate-500 select-none', textClassName)}>
          {text}
        </span>
      )}
    </div>
  )
}
