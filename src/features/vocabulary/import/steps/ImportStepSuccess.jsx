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
      ? 'Mã JSON từ AI'
      : customFile
      ? customFile.name
      : selectedPreset?.name || '—'

  return (
    <div className="py-8 space-y-6 max-w-md mx-auto text-center">
      <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 size={36} />
      </div>

      <div>
        <h4 className="text-xl font-bold text-slate-900">Import Dữ Liệu Thành Công!</h4>
        <p className="text-xs text-slate-500 mt-1">
          Đã nạp thành công <strong>{selectedIdsSize}</strong> bản ghi mới vào cơ sở dữ liệu Smart English.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left space-y-2 text-xs">
        <div className="flex justify-between border-b border-slate-200 pb-2">
          <span className="text-slate-500">Nguồn dữ liệu:</span>
          <span className="font-semibold text-slate-800">{sourceLabel}</span>
        </div>
        <div className="flex justify-between border-b border-slate-200 pb-2">
          <span className="text-slate-500">Loại học liệu:</span>
          <span className="font-bold text-brand-600 uppercase">{importType}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Số mục đã import thành công:</span>
          <span className="font-bold text-emerald-600">{selectedIdsSize} mục</span>
        </div>
      </div>

      <Button
        onClick={onClose}
        className="bg-brand-600 hover:bg-brand-700 text-white font-semibold w-full py-2.5 shadow-sm cursor-pointer"
      >
        Xem Bản Ghi Vừa Nạp Trong Bảng {countdown > 0 ? `(Tự chuyển sau ${countdown}s)` : ''}
      </Button>
    </div>
  )
}
