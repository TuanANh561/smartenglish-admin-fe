import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const VARIANT_CLASSES = {
  primary: 'bg-navy-700 text-white hover:bg-navy-800 disabled:bg-navy-700/50',
  secondary: 'bg-white text-ink border border-line hover:bg-canvas disabled:text-ink-muted',
  ghost: 'bg-transparent text-ink hover:bg-canvas disabled:text-ink-muted',
  danger: 'bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#FEE2E2]/70 disabled:opacity-50',
  success: 'bg-[#DCFCE7] text-[#15803D] hover:bg-[#DCFCE7]/70 disabled:opacity-50',
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
