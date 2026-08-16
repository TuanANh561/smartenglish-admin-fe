import { cn } from '@/lib/utils'

const TONE_CLASSES = {
  default: 'text-navy-700',
  success: 'text-[#15803D]',
  danger: 'text-[#DC2626]',
  info: 'text-brand-500',
}

function StatTile({ label, value, tone = 'default', className }) {
  return (
    <div className={cn('rounded-xl bg-canvas p-4', className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p className={cn('mt-1 text-xl font-bold', TONE_CLASSES[tone])}>{value}</p>
    </div>
  )
}

export default StatTile
