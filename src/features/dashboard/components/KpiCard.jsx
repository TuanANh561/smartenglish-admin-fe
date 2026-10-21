import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import Card from '@/components/ui/Card'
import { cn, formatPercent } from '@/lib/utils'

// Mỗi chỉ số một màu nhấn riêng — vẫn trong palette design-system.md,
// chỉ đổi cách phối để 4 thẻ không còn giống hệt nhau.
const TONE_STYLES = {
  brand: { icon: 'bg-brand-500/10 text-brand-500', accent: 'border-l-brand-500' },
  navy: { icon: 'bg-navy-700/10 text-navy-700', accent: 'border-l-navy-700' },
  success: { icon: 'bg-emerald-50 text-emerald-700', accent: 'border-l-emerald-600' },
  gold: { icon: 'bg-amber-50 text-amber-700', accent: 'border-l-amber-500' },
  indigo: { icon: 'bg-indigo-50 text-indigo-700', accent: 'border-l-indigo-600' },
  purple: { icon: 'bg-purple-50 text-purple-700', accent: 'border-l-purple-600' },
}

function KpiCard({ icon: Icon, label, value, changePercent, tone = 'brand', subtitle }) {
  const isPositive = (changePercent ?? 0) >= 0
  const styles = TONE_STYLES[tone] || TONE_STYLES.brand

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
        {changePercent != null ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
              isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600',
            )}
          >
            {isPositive ? (
              <ArrowUpRight size={14} strokeWidth={2} />
            ) : (
              <ArrowDownRight size={14} strokeWidth={2} />
            )}
            {formatPercent(Math.abs(changePercent))}
          </span>
        ) : subtitle ? (
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {subtitle}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-xs font-medium text-ink-muted truncate" title={label}>{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-navy-800">{value}</p>
    </Card>
  )
}

export default KpiCard
