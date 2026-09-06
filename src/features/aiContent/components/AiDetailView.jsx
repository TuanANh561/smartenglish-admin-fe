import { useState } from 'react'
import {
  ArchiveRestore,
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { confidenceTone, STATUS_BADGE } from './aiContentConstants'

export default function AiDetailView({
  item,
  onBack,
  onEdit,
  onApprove,
  onReject,
  onRevoke,
  onDelete,
  onRestore,
  canManage,
}) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const questions = item.questions || []
  const q = questions[questionIndex] ?? null

  const isCorrect = (idx) => {
    if (!q?.correctAnswer) return false
    return idx === q.correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-navy-700 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={STATUS_BADGE[item.status]?.tone ?? 'info'}>
            {STATUS_BADGE[item.status]?.label ?? item.status}
          </Badge>
          {canManage ? (
            <Badge tone={confidenceTone(item.confidenceScore ?? 92)}>
              Độ tin cậy {item.confidenceScore ?? 92}%
            </Badge>
          ) : (
            <Badge tone="info">Chỉ xem</Badge>
          )}
        </div>
      </div>

      {/* Title bar */}
      <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
              {item.type === 'reading' ? <BookOpen size={22} /> : <ClipboardList size={22} />}
            </span>
            <div>
              <h2 className="text-lg font-bold text-navy-700">{item.title}</h2>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                {item.type === 'reading' ? 'Bài đọc' : 'Bài kiểm tra'} · Cấp {item.level}
              </p>
            </div>
          </div>
          {canManage && (
            <div className="flex shrink-0 items-center gap-2">
              {item.status === 'DELETED' ? (
                <Button size="sm" variant="secondary" icon={ArchiveRestore} onClick={onRestore}>
                  Khôi phục
                </Button>
              ) : (
                <>
                  {item.status === 'APPROVED' ? null : (
                    <Button size="sm" variant="secondary" icon={Pencil} onClick={onEdit}>
                      Sửa
                    </Button>
                  )}
                  {(item.status === 'PENDING_REVIEW' || item.status === 'REJECTED') && (
                    <Button size="sm" onClick={onApprove}>
                      Duyệt
                    </Button>
                  )}
                  {item.status === 'PENDING_REVIEW' && (
                    <Button size="sm" variant="danger" onClick={onReject} aria-label="Từ chối">
                      <X size={16} />
                    </Button>
                  )}
                  {item.status === 'APPROVED' && (
                    <button
                      type="button"
                      onClick={onRevoke}
                      className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 cursor-pointer"
                    >
                      ↩ Thu hồi
                    </button>
                  )}
                  <Button size="sm" variant="danger" icon={Trash2} onClick={onDelete}>
                    Xóa
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Content — fixed, scrollable */}
        <div className="lg:col-span-2">
          <div className="sticky top-4 rounded-xl border border-line bg-white shadow-sm">
            <div className="border-b border-line px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Nội dung</p>
            </div>
            <div className="max-h-[480px] overflow-y-auto px-5 py-4">
              <p className="text-sm leading-relaxed text-ink whitespace-pre-wrap">
                {item.content || item.definition || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="lg:col-span-3">
          {questions.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-line bg-canvas text-ink-muted">
              Không có câu hỏi
            </div>
          ) : (
            <div className="rounded-xl border border-line bg-white shadow-sm">
              {/* Question header */}
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Câu hỏi
                </p>
                <Badge>
                  {questionIndex + 1} / {questions.length}
                </Badge>
              </div>

              {/* Question body */}
              <div className="space-y-4 px-5 py-4">
                <div className="rounded-lg border-l-4 border-brand-400 bg-canvas p-4">
                  <p className="text-sm font-semibold text-navy-700">
                    {/^\d+\.?\s*$/.test(String(q.questionText || '').trim())
                      ? q.questionText
                      : `${questionIndex + 1}. ${q.questionText || ''}`}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Tùy chọn trả lời:
                  </p>
                  {q.options?.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx)
                    const correct = isCorrect(idx)
                    return (
                      <div
                        key={idx}
                        className={[
                          'w-full rounded-lg border-2 p-3 text-sm transition-colors',
                          correct
                            ? 'border-green-500 bg-green-50 font-semibold text-green-700'
                            : 'border-line bg-white text-ink',
                        ].join(' ')}
                      >
                        <span className="font-semibold">{letter}.</span> {opt}
                        {correct && <span className="ml-2 text-xs">✓ Đúng</span>}
                      </div>
                    )
                  })}
                </div>

                {q.explanationVi && (
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                      💡 Giải thích:
                    </p>
                    <p className="mt-1.5 text-sm text-blue-900">{q.explanationVi}</p>
                  </div>
                )}
              </div>

              {/* Prev / Next */}
              <div className="flex items-center justify-between border-t border-line px-5 py-3">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ChevronLeft}
                  onClick={() => setQuestionIndex((i) => Math.max(0, i - 1))}
                  disabled={questionIndex === 0}
                >
                  Trước
                </Button>

                <div className="flex items-center gap-1">
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuestionIndex(idx)}
                      className={[
                        'h-2 rounded-full transition-all cursor-pointer',
                        idx === questionIndex ? 'w-6 bg-brand-500' : 'w-2 bg-line hover:bg-brand-300',
                      ].join(' ')}
                    />
                  ))}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setQuestionIndex((i) => Math.min(questions.length - 1, i + 1))}
                  disabled={questionIndex === questions.length - 1}
                >
                  Sau
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
