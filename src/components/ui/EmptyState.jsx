import { Inbox } from 'lucide-react'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div className={cn('flex flex-col items-center gap-1 py-10 text-center', className)}>
      <Icon size={18} strokeWidth={1.75} className="mb-2 text-ink-muted/60" />
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="text-sm text-ink-muted">{description}</p>}
      {actionLabel && (
        <Button className="mt-4" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
