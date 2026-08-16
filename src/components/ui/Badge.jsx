import { cn } from '@/lib/utils'

const TONE_CLASSES = {
  success: 'text-[#15803D] bg-[#DCFCE7]',
  info: 'text-[#1D4ED8] bg-[#DBEAFE]',
  warning: 'text-[#A16207] bg-[#FEF3C7]',
  danger: 'text-[#B91C1C] bg-[#FEE2E2]',
  neutral: 'text-ink-muted bg-canvas',
  gold: 'text-[#A16207] bg-[#FEF3C7]',
}

function Badge({ children, tone = 'neutral', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export default Badge
