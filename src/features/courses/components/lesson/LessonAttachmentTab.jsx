import { AlertCircle, CheckCircle2, Download, Eye, FileText, Loader2, Trash2, UploadCloud } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

/**
 * Tab Soạn Thảo & Tải Lên Tệp Đính Kèm Của Unit
 */
export default function LessonAttachmentTab({
  attachmentBlock,
  updateBlock,
  attachmentInputRef,
  handleAttachmentFileSelect,
  handleRemoveAttachment,
  isUploadingAttachment,
  uploadAttachmentMsg,
}) {
  return (
    <div className="space-y-3.5">
      <div className="bg-slate-50 p-4 rounded-xl border border-line space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="font-bold text-navy-800 text-xs flex items-center gap-1.5">
            <FileText size={15} className="text-brand-600" /> Tài liệu đính kèm của Unit:
          </span>

          {/* Nút Chọn & Tải Tệp Từ Máy Tính */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={attachmentInputRef}
              onChange={handleAttachmentFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z,.mp3,.wav,.mp4"
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={isUploadingAttachment ? Loader2 : UploadCloud}
              onClick={() => attachmentInputRef.current?.click()}
              disabled={isUploadingAttachment}
              className="text-xs h-8 font-semibold bg-white border-brand-300 text-brand-700 hover:bg-brand-50 shadow-xs"
            >
              {isUploadingAttachment ? 'Đang tải tệp lên...' : 'Chọn tệp từ máy tính'}
            </Button>
          </div>
        </div>

        {/* Banner Thông Báo Tình Trạng Tải Lên */}
        {uploadAttachmentMsg && (
          <div
            className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
              uploadAttachmentMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : uploadAttachmentMsg.type === 'warning'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            {uploadAttachmentMsg.type === 'success' ? (
              <CheckCircle2 size={14} className="shrink-0" />
            ) : (
              <AlertCircle size={14} className="shrink-0" />
            )}
            <span>{uploadAttachmentMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Tiêu đề tài liệu:</label>
            <Input
              value={attachmentBlock?.title || ''}
              onChange={(e) => updateBlock('attachment', { title: e.target.value })}
              placeholder="VD: Slide bài giảng tóm tắt & Handout bài tập"
              className="text-xs py-1 h-8 bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Tên file (kèm đuôi .pdf, .docx):</label>
            <Input
              value={attachmentBlock?.fileName || ''}
              onChange={(e) => updateBlock('attachment', { fileName: e.target.value })}
              placeholder="VD: Unit1-Greetings-Summary.pdf"
              className="text-xs py-1 h-8 bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <label className="font-semibold text-slate-700">Đường dẫn tệp (URL / S3):</label>
            <Input
              value={attachmentBlock?.fileUrl || ''}
              onChange={(e) => updateBlock('attachment', { fileUrl: e.target.value })}
              placeholder="https://.../tai-lieu-bai-hoc.pdf"
              className="text-xs py-1 h-8 bg-white font-mono text-blue-700"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Dung lượng ước tính:</label>
            <Input
              value={attachmentBlock?.fileSize || ''}
              onChange={(e) => updateBlock('attachment', { fileSize: e.target.value })}
              placeholder="VD: 1.5 MB"
              className="text-xs py-1 h-8 bg-white text-center"
            />
          </div>
        </div>
      </div>

      {/* THẺ PREVIEW TỆP VÀ NÚT XEM TRỰC TIẾP / TẢI VỀ / XÓA */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-navy-900 text-xs truncate">
              {attachmentBlock?.title || 'Chưa đặt tiêu đề tài liệu'}
            </h4>
            <p className="text-[11px] text-ink-muted truncate font-mono">
              {attachmentBlock?.fileName || 'Chưa có file nào'} • {attachmentBlock?.fileSize || '0 KB'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Nút Xem file trực tiếp */}
          <a
            href={attachmentBlock?.fileUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              attachmentBlock?.fileUrl
                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                : 'bg-slate-100 text-slate-400 border-slate-200 pointer-events-none'
            }`}
          >
            <Eye size={13} /> Xem trực tuyến
          </a>

          {/* Nút Tải file về máy */}
          <a
            href={attachmentBlock?.fileUrl || '#'}
            download={attachmentBlock?.fileName || 'tai-lieu-bai-hoc'}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              attachmentBlock?.fileUrl
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-400 border-slate-200 pointer-events-none'
            }`}
          >
            <Download size={13} /> Tải file về
          </a>

          {/* Nút Xóa tệp */}
          {attachmentBlock?.fileUrl && (
            <button
              type="button"
              onClick={handleRemoveAttachment}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
              title="Xóa tệp này"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
