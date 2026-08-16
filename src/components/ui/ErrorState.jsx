import { AlertTriangle, RefreshCw } from 'lucide-react'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

function ErrorState({ error, onRetry, className }) {
  const message = error?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.'

  return (
    <div className={cn('flex flex-col items-center gap-1 py-10 text-center', className)}>
      <AlertTriangle size={18} strokeWidth={1.75} className="mb-2 text-[#B91C1C]" />
      <p className="text-sm font-medium text-ink">{message}</p>
      {error?.details && <p className="text-xs text-ink-muted">{error.details}</p>}
      {onRetry && (
        <Button className="mt-4" size="sm" variant="secondary" icon={RefreshCw} onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  )
}

export default ErrorState
