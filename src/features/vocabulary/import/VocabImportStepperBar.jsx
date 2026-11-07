/**
 * VocabImportStepperBar.jsx
 * Thanh tiến trình hiển thị 4 bước của wizard Import Từ Vựng.
 */

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { label: 'Chọn tệp' },
  { label: 'Xử lý' },
  { label: 'Kiểm duyệt' },
  { label: 'Hoàn tất' },
]

export default function VocabImportStepperBar({ currentStep, onStepClick }) {
  return (
    <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-3.5">
      <div className="flex items-center justify-between text-xs max-w-2xl mx-auto">
        {STEPS.map((s, idx) => {
          const stepNum = idx + 1
          const isPassed = currentStep > stepNum
          const isCurrent = currentStep === stepNum
          const isLast = idx === STEPS.length - 1
          const isLineActive = currentStep >= stepNum + 1
          const isClickable = Boolean(onStepClick && currentStep === 3 && stepNum === 1)

          return (
            <div key={stepNum} className="flex items-center flex-1 last:flex-none">
              <div
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onClick={() => isClickable && onStepClick(stepNum)}
                className={cn(
                  'flex items-center gap-2 shrink-0 transition-colors',
                  isPassed && 'text-emerald-700 font-semibold',
                  isCurrent && 'text-brand-700 font-bold',
                  !isPassed && !isCurrent && 'text-slate-400 font-medium',
                  isClickable && 'cursor-pointer hover:opacity-80',
                )}
                title={isClickable ? 'Bấm để quay về Bước 1 (Chọn tệp)' : undefined}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all shadow-2xs',
                    isPassed && 'bg-emerald-600 text-white',
                    isCurrent && 'bg-brand-600 text-white ring-4 ring-brand-100',
                    !isPassed && !isCurrent && 'bg-slate-100 text-slate-400 border border-slate-200',
                  )}
                >
                  {isPassed ? <Check size={13} strokeWidth={2.5} /> : stepNum}
                </span>
                <span>{s.label}</span>
              </div>

              {!isLast && (
                <div className="h-0.5 flex-1 mx-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      isLineActive ? 'bg-emerald-500 w-full' : 'w-0',
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
