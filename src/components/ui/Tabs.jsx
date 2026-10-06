import { cn } from '@/lib/utils'

function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cn('flex gap-6 border-b border-line', className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = tab.value === value
        const isDisabled = tab.disabled === true

        return (
          <button
            key={tab.value}
            type="button"
            disabled={isDisabled}
            onClick={() => !isDisabled && onChange(tab.value)}
            className={cn(
              '-mb-px border-b-2 px-1 pb-3 text-sm font-medium flex items-center gap-1.5 transition-colors',
              isActive && !isDisabled
                ? 'border-brand-500 text-brand-500'
                : isDisabled
                ? 'border-transparent text-slate-300 cursor-not-allowed'
                : 'border-transparent text-ink-muted hover:text-ink',
            )}
          >
            {Icon && <Icon size={14} />}
            {tab.label}
            {tab.comingSoon && (
              <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                Soon
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
