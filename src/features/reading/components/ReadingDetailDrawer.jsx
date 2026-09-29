import { BookOpen, CheckCircle2, Clock, FileText, Lock, Pencil, User } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import { formatDate } from '@/lib/utils'

const LEVEL_TONE = {
  A1: 'info', A2: 'info',
  B1: 'brand', B2: 'brand',
  C1: 'warning', C2: 'danger',
}

export default function ReadingDetailDrawer({ passage, onClose, canManage, onEditClick }) {
  if (!passage) return null

  const questions = passage.questions || []
  const vocabulary = passage.keyVocabulary || []

  return (
    <Drawer
      open={Boolean(passage)}
      onClose={onClose}
      title={passage.titleEn || passage.titleVi}
      className="max-w-xl"
    >
      <div className="space-y-5 text-sm">
        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
          <Badge tone={LEVEL_TONE[passage.cefrLevel] || 'brand'}>
            Cấp độ {passage.cefrLevel}
          </Badge>
          {passage.topic && <Badge tone="neutral">{passage.topic}</Badge>}
          <Badge tone={passage.status === 'published' ? 'success' : 'neutral'}>
            {passage.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
          </Badge>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <FileText size={14} />
            {passage.wordCount ?? 0} từ
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            ~{passage.estimatedMin ?? 5} phút đọc
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen size={14} />
            {questions.length} câu hỏi
          </span>
          <span className="flex items-center gap-1.5">
            <User size={14} />
            {passage.authorName || 'Hệ thống'}
          </span>
        </div>

        {/* Tiêu đề Tiếng Việt */}
        {passage.titleVi && passage.titleVi !== passage.titleEn && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
              Tiêu đề tiếng Việt
            </h4>
            <p className="text-sm text-navy-800 italic">{passage.titleVi}</p>
          </div>
        )}

        {/* Mô tả */}
        {passage.description && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
              Tổng quan
            </h4>
            <p className="text-sm text-navy-800 leading-relaxed">{passage.description}</p>
          </div>
        )}

        {/* Nội dung đoạn văn */}
        {passage.passageText && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
              Nội dung đoạn văn
            </h4>
            <div className="rounded-xl border border-line bg-slate-50/60 p-4 text-sm text-navy-800 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
              {passage.passageText}
            </div>
          </div>
        )}

        {/* Từ vựng chủ chốt */}
        {vocabulary.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
              Từ vựng chủ chốt ({vocabulary.length})
            </h4>
            <div className="space-y-2">
              {vocabulary.map((v, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-xl border border-line bg-white p-2.5 text-xs shadow-2xs">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-[10px] font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-800">{v.word}</p>
                    <p className="text-ink-muted">{v.meaningVi}</p>
                    {v.ipaUs && <p className="text-brand-600 font-mono text-[10px] mt-0.5">{v.ipaUs}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Câu hỏi trắc nghiệm */}
        {questions.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
              Câu hỏi đọc hiểu ({questions.length})
            </h4>
            <div className="space-y-3">
              {questions.map((q, idx) => {
                const opts = Array.isArray(q.options) ? q.options : []
                const correctAnswer = q.correctAnswer || q.correctIndex
                return (
                  <div key={idx} className="rounded-xl border border-line bg-white p-3 text-xs space-y-2 shadow-2xs">
                    <p className="font-semibold text-navy-800">
                      {idx + 1}. {q.questionText || q.question}
                    </p>
                    {opts.length > 0 && (
                      <ul className="space-y-1">
                        {opts.map((opt, optIdx) => {
                          const label = String.fromCharCode(65 + optIdx)
                          const isCorrect = correctAnswer === label ||
                                            correctAnswer === optIdx ||
                                            String(correctAnswer) === String(optIdx)
                          const optText = typeof opt === 'string' ? opt : opt?.text || opt
                          return (
                            <li
                              key={optIdx}
                              className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-colors ${
                                isCorrect
                                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                                  : 'text-ink'
                              }`}
                            >
                              {isCorrect ? (
                                <CheckCircle2 size={12} className="shrink-0 text-emerald-500" />
                              ) : (
                                <span className="h-3 w-3 shrink-0 rounded-full border border-slate-300" />
                              )}
                              <span className="text-ink-muted mr-1">{label}.</span>
                              {optText}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                    {q.explanationVi && (
                      <p className="text-[11px] text-ink-muted border-t border-slate-100 pt-1.5 mt-1.5">
                        <span className="font-semibold text-navy-700">Giải thích: </span>
                        {q.explanationVi}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-ink-muted space-y-1">
          <p><span className="font-semibold text-navy-700">Tác giả:</span> {passage.authorName || '—'} ({passage.authorEmail || '—'})</p>
          <p><span className="font-semibold text-navy-700">Ngày tạo:</span> {formatDate(passage.createdAt)}</p>
          {passage.updatedAt && (
            <p><span className="font-semibold text-navy-700">Cập nhật:</span> {formatDate(passage.updatedAt)}</p>
          )}
          <p><span className="font-semibold text-navy-700">XP thưởng:</span> {passage.xpReward ?? 30} XP</p>
        </div>

        {/* Action footer */}
        <div className="flex items-center gap-2 pt-4 border-t border-line">
          {canManage ? (
            <Button
              variant="primary"
              icon={Pencil}
              fullWidth
              onClick={() => {
                onClose()
                onEditClick(passage)
              }}
            >
              Chỉnh sửa bài đọc
            </Button>
          ) : (
            <div className="w-full text-center text-xs text-ink-muted py-2 bg-slate-50 rounded-lg">
              <Lock size={13} className="inline mr-1" />
              Bạn đang xem bài đọc của tác giả khác
            </div>
          )}
        </div>
      </div>
    </Drawer>
  )
}
