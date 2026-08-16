import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import Card from '@/components/ui/Card'
import { cn, formatPercent } from '@/lib/utils'

// Mỗi chỉ số một màu nhấn riêng — vẫn trong palette design-system.md,
// chỉ đổi cách phối để 4 thẻ không còn giống hệt nhau.
const TONE_STYLES = {
  brand: { icon: 'bg-brand-500/10 text-brand-500', accent: 'border-l-brand-500' },
  navy: { icon: 'bg-navy-700/10 text-navy-700', accent: 'border-l-navy-700' },
  success: { icon: 'bg-[#DCFCE7] text-[#15803D]', accent: 'border-l-[#15803D]' },
  gold: { icon: 'bg-[#FEF3C7] text-[#A16207]', accent: 'border-l-[#A16207]' },
}

function KpiCard({ icon: Icon, label, value, changePercent, tone = 'brand' }) {
  const isPositive = changePercent >= 0
  const styles = TONE_STYLES[tone]

  return (
    <Card
      className={cn(
        'border-l-[3px] transition-shadow hover:shadow-[0_2px_8px_rgba(16,24,40,0.08)]',
        styles.accent,
      )}
    >
      <div className="flex items-start justify-between">
        <span className={cn('rounded-lg p-2', styles.icon)}>
          <Icon size={18} strokeWidth={1.75} />
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-medium',
            isPositive ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#DC2626]',
          )}
        >
          {isPositive ? (
            <ArrowUpRight size={18} strokeWidth={1.75} />
          ) : (
            <ArrowDownRight size={18} strokeWidth={1.75} />
          )}
          {formatPercent(Math.abs(changePercent))}
        </span>
      </div>
      <p className="mt-4 text-sm text-ink-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold text-navy-700">{value}</p>
    </Card>
  )
}

export default KpiCard
