import { cn } from '@/lib/utils'

function ChartLegend({ items, className }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-4', className)}>
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}

export default ChartLegend
