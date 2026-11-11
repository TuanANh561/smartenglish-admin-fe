import { useState } from 'react'
import {
  BookOpen,
  CheckCircle,
  ClipboardList,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Paperclip,
  PenLine,
  Plus,
  X,
} from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AssignmentSubmissionsModal from './AssignmentSubmissionsModal'
import AssignmentDetailModal from './AssignmentDetailModal'

const TYPE_CONFIG = {
  HOMEWORK: { label: 'Bài tập', bg: '#eff6ff', text: '#2563eb' },
  QUIZ: { label: 'Trắc nghiệm', bg: '#ecfdf5', text: '#059669' },
  WRITING: { label: 'Viết luận', bg: '#fef3c7', text: '#d97706' },
  ESSAY: { label: 'Viết luận', bg: '#fef3c7', text: '#d97706' },
  SPEAKING: { label: 'Luyện nói', bg: '#fdf2f8', text: '#db2777' },
  ROLEPLAY: { label: 'Luyện nói', bg: '#fdf2f8', text: '#db2777' },
  READING: { label: 'Đọc hiểu', bg: '#f0f9ff', text: '#0284c7' },
  LISTENING: { label: 'Luyện nghe', bg: '#f5f3ff', text: '#7c3aed' },
  VOCAB_DECK: { label: 'Từ vựng', bg: '#fff7ed', text: '#ea580c' },
  GRAMMAR: { label: 'Ngữ pháp', bg: '#f0fdf4', text: '#16a34a' },
  EXAM: { label: 'Đề thi', bg: '#ecfdf5', text: '#059669' },
}

export default function ClassAssignmentsTab({
  cls,
  assignments = [],
  loading = false,
  onCreateAssignmentClick,
  onSubmissionsChanged,
}) {
  const [previewFile, setPreviewFile] = useState(null)
  const [reviewing, setReviewing] = useState(null)
  const [viewing, setViewing] = useState(null)

  const formatDate = (d) => {
    if (!d) return 'Không có hạn chót'
    try {
      return new Date(d).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return d
    }
  }

  const getViewerUrl = (url) => {
    if (!url) return ''
    const lower = url.toLowerCase()
    if (lower.endsWith('.doc') || lower.endsWith('.docx') || lower.endsWith('.ppt') || lower.endsWith('.pptx') || lower.endsWith('.xls') || lower.endsWith('.xlsx')) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
    }
    return url
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Danh sách bài tập</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng số {assignments.length} bài tập đã được giao cho lớp này
          </p>
        </div>
        {onCreateAssignmentClick && (
          <button
            type="button"
            onClick={onCreateAssignmentClick}
            className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
          >
            <ClipboardList size={14} />
            <span>Giao bài tập mới</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="p-6 pt-2">
        {loading ? (
          <LoadingSpinner text="Đang tải danh sách bài tập..." />
        ) : assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
              <FileText size={24} />
            </span>
            <p className="text-sm font-medium text-slate-600">Chưa có bài tập nào được giao</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Hãy giao bài tập từ kho học liệu hệ thống hoặc tải lên file học liệu cho học viên
            </p>
            {onCreateAssignmentClick && (
              <button
                type="button"
                onClick={onCreateAssignmentClick}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus size={14} />
                <span>Giao bài ngay</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {assignments.map((asm) => {
              const typeCfg = TYPE_CONFIG[asm.assignmentType] || TYPE_CONFIG.HOMEWORK
              return (
                <div
                  key={asm.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-brand-200 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span
                        className="rounded-lg px-2.5 py-1 text-xs font-bold"
                        style={{ backgroundColor: typeCfg.bg, color: typeCfg.text }}
                      >
                        {typeCfg.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => setViewing(asm)}
                        className="text-left text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors cursor-pointer"
                        title="Xem nội dung bài tập"
                      >
                        {asm.title}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock size={14} className="text-slate-400" />
                      <span>Hạn nộp: {formatDate(asm.dueDate)}</span>
                    </div>
                  </div>

                  {/* Học liệu hệ thống hoặc File đính kèm */}
                  {(asm.referenceTitle || asm.attachmentUrl) && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {asm.referenceTitle && (
                        <div className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50/70 px-3 py-1.5 text-xs text-brand-800">
                          <BookOpen size={13} className="text-brand-600 shrink-0" />
                          <span className="font-medium">{asm.referenceTitle}</span>
                        </div>
                      )}

                      {asm.attachmentUrl && (
                        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
                          <Paperclip size={13} className="text-brand-600 shrink-0" />
                          <span className="font-semibold truncate max-w-[240px]">
                            {asm.attachmentName || 'Tài liệu bài tập đính kèm'}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewFile({
                                url: asm.attachmentUrl,
                                name: asm.attachmentName || asm.title || 'Tài liệu bài tập',
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                          >
                            <Eye size={12} />
                            <span>Xem file</span>
                          </button>
                          <a
                            href={asm.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            download={asm.attachmentName || true}
                            className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <Download size={12} />
                            <span>Tải về</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {asm.instructions && (
                    <p className="mt-3 text-xs text-slate-600 line-clamp-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {asm.instructions}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                      <span>
                        Điểm sàn đạt: <strong className="text-slate-700">{asm.passingScore || 5.0}</strong>
                      </span>
                      <span>
                        Chấm điểm: <strong className="text-slate-700">{asm.isGraded ? 'Có tính điểm' : 'Không'}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-700 text-xs">
                        <CheckCircle size={12} />
                        <span>
                          Đã nộp: {asm.submissionCount || 0} / {cls?.studentCount || 0}
                          {asm.submissionCount > 0 && ` · Đã chấm: ${asm.gradedCount || 0}`}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setReviewing(asm)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <PenLine size={12} />
                        <span>Chấm bài</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AssignmentDetailModal
        assignment={viewing}
        studentCount={cls?.studentCount}
        onClose={() => setViewing(null)}
        onOpenSubmissions={(asm) => {
          setViewing(null)
          setReviewing(asm)
        }}
        onPreviewFile={(file) => {
          setViewing(null)
          setPreviewFile(file)
        }}
      />

      <AssignmentSubmissionsModal
        assignment={reviewing}
        onClose={() => setReviewing(null)}
        onGraded={onSubmissionsChanged}
      />

      {/* Modal xem trước file học liệu ngay trên Web */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={17} className="text-brand-600 shrink-0" />
                <h4 className="truncate text-sm font-bold text-slate-900">{previewFile.name}</h4>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewFile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Mở tab mới</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100">
              {/\.(png|jpg|jpeg|gif|webp)$/i.test(previewFile.url) ? (
                <div className="flex h-full items-center justify-center p-4 overflow-auto">
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="max-h-full max-w-full rounded-lg object-contain shadow-md"
                  />
                </div>
              ) : /\.(mp3|wav|ogg)$/i.test(previewFile.url) ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
                  <audio controls src={previewFile.url} className="w-full max-w-md" />
                </div>
              ) : (
                <iframe
                  src={getViewerUrl(previewFile.url)}
                  title={previewFile.name}
                  className="h-full w-full border-0"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
