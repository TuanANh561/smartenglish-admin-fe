import { Loader2, Paperclip } from 'lucide-react'

/** Bong bóng tạm trong cuộc trò chuyện khi ảnh/tệp đang được tải lên. */
export default function PendingUploadBubble({ upload }) {
  if (upload.kind === 'IMAGE') {
    return (
      <div className="flex justify-end">
        <div className="relative overflow-hidden rounded-xl">
          {upload.previewUrl ? (
            <img src={upload.previewUrl} alt="" className="max-h-48 max-w-[220px] rounded-xl object-cover opacity-60" />
          ) : (
            <div className="h-32 w-44 rounded-xl bg-slate-100" />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={22} className="animate-spin text-white drop-shadow" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-end">
      <div className="flex max-w-[240px] items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
        <Paperclip size={16} className="shrink-0 text-slate-400" />
        <span className="min-w-0 flex-1 truncate font-medium">{upload.name}</span>
        <Loader2 size={14} className="shrink-0 animate-spin text-brand-500" />
      </div>
    </div>
  )
}
