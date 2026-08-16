import { cn } from '@/lib/utils'

function StatusDot({ label, color = '#1D8FE1', className }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm text-ink', className)}>
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

export default StatusDot
