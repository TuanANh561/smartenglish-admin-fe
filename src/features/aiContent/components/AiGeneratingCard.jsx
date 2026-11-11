import { Bot, HelpCircle, Loader2, Sparkles } from 'lucide-react'
import { TYPE_LABELS } from './aiContentConstants'

export default function AiGeneratingCard({ draft, status }) {
  const typeLabel = TYPE_LABELS[draft?.type] || draft?.type || 'Nội dung AI'
  const topicName = draft?.topic?.trim() || 'Đang chuẩn bị đề tài...'
  const level = draft?.level || 'B2'
  const questionCount = draft?.questionCount || 5
  const currentStatus = status || 'Đang kết nối mô hình Gemini AI...'

  return (
    <div className="relative flex flex-col justify-between rounded-2xl border-2 border-brand-400 bg-gradient-to-b from-brand-50/40 via-white to-white p-4.5 shadow-md shadow-brand-500/10 min-h-[270px] animate-pulse transition-all">
      {/* Glow highlight line at top */}
      <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-brand-500 to-transparent" />

      <div>
        {/* Header: Rotating AI icon + Topic Title + Meta + Generating Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Pulsing & Spinning Icon Box */}
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm ring-4 ring-brand-500/20">
              <Loader2 size={20} className="animate-spin" />
            </span>

            <div className="min-w-0">
              <h3
                className="font-bold text-slate-900 text-sm leading-snug line-clamp-1"
                title={topicName}
              >
                {topicName}
              </h3>
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-md bg-brand-100 text-brand-700 px-2 py-0.5 text-[11px] font-semibold border border-brand-200/60">
                  <Sparkles size={11} className="text-brand-600" />
                  {typeLabel}
                </span>
                <span className="rounded-md border border-slate-200/90 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                  Cấp {level}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Status Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 border border-amber-200 shrink-0 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
            Đang tạo...
          </span>
        </div>

        {/* Real-time processing progress box with shimmer effect */}
        <div className="mt-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 flex items-center gap-1">
              <Bot size={12} className="text-brand-600" />
              Tiến trình xử lý AI
            </span>
            <span className="text-[10px] font-mono text-slate-400">Thời gian ~ 15-30s</span>
          </div>

          <div className="rounded-xl bg-slate-50/90 border border-brand-100 p-3 space-y-2">
            <p className="text-xs font-medium text-brand-900 leading-relaxed line-clamp-2">
              {currentStatus}
            </p>

            {/* Skeleton animated bars */}
            <div className="space-y-1.5 pt-1">
              <div className="h-2 w-full rounded bg-slate-200/80 animate-pulse" />
              <div className="h-2 w-4/5 rounded bg-slate-200/80 animate-pulse" />
              <div className="h-2 w-3/5 rounded bg-slate-200/70 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Question count estimation and spinner */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            <HelpCircle size={12} className="text-slate-400" />
            {questionCount} câu hỏi dự kiến
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200/70">
            <Sparkles size={11} className="text-amber-500 fill-amber-400" />
            Đang tạo bởi Gemini
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-600">
          <Loader2 size={13} className="animate-spin" />
          <span>Xử lý...</span>
        </div>
      </div>
    </div>
  )
}

