import { cn } from '@/lib/utils'

function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cn('flex gap-6 border-b border-line', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            '-mb-px border-b-2 px-1 pb-3 text-sm font-medium',
            tab.value === value
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-ink-muted hover:text-ink',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default Tabs
