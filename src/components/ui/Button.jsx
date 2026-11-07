import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const VARIANT_CLASSES = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-2xs disabled:bg-brand-400/50',
  secondary: 'bg-white text-ink border border-slate-200 hover:bg-slate-50 hover:text-brand-600 hover:border-brand-200 disabled:text-ink-muted transition-colors',
  ghost: 'bg-transparent text-ink hover:bg-brand-50 hover:text-brand-600 disabled:text-ink-muted transition-colors',
  danger: 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:text-rose-800 disabled:opacity-50',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 disabled:opacity-50',
  outline: 'bg-transparent text-brand-600 border border-brand-300 hover:bg-brand-50 disabled:text-ink-muted',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50',
}

const SIZE_CLASSES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  fullWidth = false,
  loading = false,
  disabled = false,
  className,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={18} strokeWidth={1.75} className="animate-spin" />
      ) : (
        Icon && <Icon size={18} strokeWidth={1.75} />
      )}
      {children}
    </button>
  )
}

export default Button
