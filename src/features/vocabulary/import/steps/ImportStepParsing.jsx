/**
 * ImportStepParsing.jsx
 * Step 2: Hiệu ứng progress animation + live terminal log khi AI đang xử lý.
 */

import { Sparkles } from 'lucide-react'

export default function ImportStepParsing({ progress, logs, uploadMode, customFile, selectedPreset }) {
  const sourceLabel =
    uploadMode === 'json'
      ? 'Mã JSON từ AI'
      : customFile
      ? customFile.name
      : selectedPreset?.name || '...'

  return (
    <div className="py-8 space-y-6 max-w-lg mx-auto text-center">
      {/* Spinning icon */}
      <div className="relative inline-flex items-center justify-center">
        <div className="h-20 w-20 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
        <Sparkles size={28} className="absolute text-brand-600 animate-pulse" />
      </div>

      <div>
        <h4 className="text-lg font-bold text-slate-900">Đang Bóc Tách Dữ Liệu...</h4>
        <p className="text-xs text-slate-500 mt-1">
          Nguồn: <strong>{sourceLabel}</strong>
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-slate-600">
          <span>Tiến trình xử lý</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-brand-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Live terminal log */}
      <div className="rounded-xl bg-slate-950 p-4 font-mono text-[11px] text-emerald-400 text-left space-y-1.5 shadow-inner max-h-44 overflow-y-auto">
        {logs.map((log, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-slate-600 select-none">&gt;</span>
            <span>{log}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
