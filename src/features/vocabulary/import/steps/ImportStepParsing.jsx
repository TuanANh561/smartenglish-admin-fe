/**
 * ImportStepParsing.jsx
 * Step 2: Hiệu ứng tiến trình khi đang xử lý dữ liệu.
 */

import { FileText } from 'lucide-react'

export default function ImportStepParsing({ progress, logs, uploadMode, customFile, selectedPreset }) {
  const sourceLabel =
    uploadMode === 'json'
      ? 'Mã JSON'
      : customFile
      ? customFile.name
      : selectedPreset?.name || '...'

  return (
    <div className="py-6 space-y-5 max-w-lg mx-auto text-center">
      {/* Spinning icon */}
      <div className="relative inline-flex items-center justify-center">
        <div className="h-16 w-16 rounded-full border-3 border-brand-100 border-t-brand-600 animate-spin" />
        <FileText size={22} className="absolute text-brand-600" />
      </div>

      <div>
        <h4 className="text-base font-bold text-slate-900">Đang xử lý dữ liệu...</h4>
        <p className="text-xs text-slate-500 mt-0.5">
          Nguồn: <strong>{sourceLabel}</strong>
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-slate-600">
          <span>Tiến trình</span>
          <span className="text-brand-600 font-bold">{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-brand-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Live terminal log */}
      <div className="rounded-xl bg-slate-900 p-3.5 font-mono text-[11px] text-slate-300 text-left space-y-1 shadow-inner max-h-40 overflow-y-auto border border-slate-800">
        {logs.map((log, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-brand-400 select-none">&gt;</span>
            <span>{log}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
