/**
 * ImportStepSuccess.jsx
 * Step 4: Màn hình hoàn thành import — tóm tắt kết quả + nút đóng.
 */

import { CheckCircle2 } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function ImportStepSuccess({
  selectedIdsSize,
  importType,
  uploadMode,
  customFile,
  selectedPreset,
  countdown,
  onClose,
}) {
  const sourceLabel =
    uploadMode === 'json'
      ? 'Mã JSON nhập tay'
      : customFile
      ? customFile.name
      : selectedPreset?.name || '—'

  return (
    <div className="py-8 space-y-6 max-w-md mx-auto text-center">
      <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
        <CheckCircle2 size={32} />
      </div>

      <div>
        <h4 className="text-lg font-bold text-slate-900">Nhập dữ liệu thành công!</h4>
        <p className="text-xs text-slate-500 mt-1">
          Đã thêm thành công <strong>{selectedIdsSize}</strong> mục vào hệ thống.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left space-y-2 text-xs">
        <div className="flex justify-between border-b border-slate-200/80 pb-2">
          <span className="text-slate-500">Nguồn dữ liệu:</span>
          <span className="font-semibold text-slate-800">{sourceLabel}</span>
        </div>
        <div className="flex justify-between border-b border-slate-200/80 pb-2">
          <span className="text-slate-500">Loại học liệu:</span>
          <span className="font-semibold text-slate-800 uppercase">{importType}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Số mục đã nạp:</span>
          <span className="font-bold text-emerald-600">{selectedIdsSize} mục</span>
        </div>
      </div>

      <Button
        onClick={onClose}
        className="bg-brand-600 hover:bg-brand-700 text-white font-semibold w-full py-2.5 shadow-xs cursor-pointer rounded-xl"
      >
        Hoàn tất & xem danh sách {countdown > 0 ? `(${countdown}s)` : ''}
      </Button>
    </div>
  )
}
