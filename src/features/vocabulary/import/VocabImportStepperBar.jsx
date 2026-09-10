/**
 * VocabImportStepperBar.jsx
 * Thanh tiến trình hiển thị 4 bước của wizard Import Từ Vựng.
 */

import { cn } from '@/lib/utils'

const STEPS = [
  { label: 'Chọn Tài Liệu' },
  { label: 'Bóc Tách' },
  { label: 'Kiểm Duyệt Bảng' },
  { label: 'Hoàn Tất' },
]

export default function VocabImportStepperBar({ currentStep }) {
  return (
    <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
      <div className="flex items-center justify-between text-xs max-w-2xl mx-auto">
        {STEPS.map((s, idx) => {
          const stepNum = idx + 1
          const isActive = currentStep >= stepNum
          const isLast = idx === STEPS.length - 1

          return (
            <div key={stepNum} className="flex items-center flex-1">
              <div
                className={cn(
                  'flex items-center gap-2 font-semibold shrink-0',
                  isActive
                    ? isLast ? 'text-emerald-600' : 'text-brand-600'
                    : 'text-slate-400',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold',
                    isActive
                      ? isLast ? 'bg-emerald-600 text-white' : 'bg-brand-600 text-white'
                      : 'bg-slate-200 text-slate-600',
                  )}
                >
                  {stepNum}
                </span>
                <span>{s.label}</span>
              </div>

              {!isLast && (
                <div className="h-0.5 flex-1 mx-3 bg-slate-200">
                  <div
                    className="h-full bg-brand-600 transition-all duration-300"
                    style={{ width: currentStep >= stepNum + 1 ? '100%' : '0%' }}
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
