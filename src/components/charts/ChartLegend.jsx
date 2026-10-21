import { cn } from '@/lib/utils'

function ChartLegend({ items, className, direction = 'row' }) {
  return (
    <div
      className={cn(
        'flex',
        direction === 'col' ? 'flex-col items-start gap-1' : 'flex-wrap items-center gap-4',
        className,
      )}
    >
      {items.map((item) => (
        <span
          key={item.label}
          className={cn(
            'inline-flex items-center gap-1.5 text-ink-muted',
            direction === 'col' ? 'text-xs' : 'text-sm',
          )}
        >
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}

export default ChartLegend
