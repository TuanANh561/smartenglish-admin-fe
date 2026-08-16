import { cn } from '@/lib/utils'

function ProgressBar({ value, max = 100, className }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))
  const barColor =
    percent >= 100 ? 'bg-[#DC2626]' : percent >= 70 ? 'bg-[#A16207]' : 'bg-brand-500'

  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-chart-idle', className)}>
      <div
        className={cn('h-full rounded-full transition-all', barColor)}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export default ProgressBar
