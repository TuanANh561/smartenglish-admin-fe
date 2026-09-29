import { Award, BookOpen, CheckCircle2, Clock, FileText, Lock, Pencil, User } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import { formatDate } from '@/lib/utils'

const LEVEL_TONE = {
  A1:  'info',
  A2:  'info',
  B1:  'brand',
  B2:  'brand',
  C1:  'warning',
  C2:  'danger',
  ALL: 'neutral',
}

export default function ExamDetailDrawer({ exam, onClose, canManage, onEditClick }) {
  if (!exam) return null

  const questions = exam.questions || []
  const sections  = exam.sections  || []

  return (
    <Drawer
      open={Boolean(exam)}
      onClose={onClose}
      title={exam.title}
      className="max-w-xl"
    >
      <div className="space-y-5 text-sm">
        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
          <Badge tone={LEVEL_TONE[exam.cefrLevel] || 'brand'}>
            Cấp độ {exam.cefrLevel}
          </Badge>
          {exam.category && <Badge tone="neutral">{exam.category}</Badge>}
          <Badge tone={exam.status === 'published' ? 'success' : 'neutral'}>
            {exam.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
          </Badge>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {exam.durationMinutes} phút làm bài
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen size={14} />
            {exam.totalQuestions ?? questions.length} câu hỏi
          </span>
          {exam.passingScore > 0 && (
            <span className="flex items-center gap-1.5">
              <Award size={14} />
              Điểm đạt: {exam.passingScore}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <User size={14} />
            {exam.authorName || 'Hệ thống'}
          </span>
        </div>

        {/* Mô tả */}
        {exam.description && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
              Mô tả bài thi
            </h4>
            <p className="text-sm text-navy-800 leading-relaxed">{exam.description}</p>
          </div>
        )}

        {/* Các phần thi (Sections) nếu có */}
        {sections.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
              Cấu trúc phần thi ({sections.length} phần)
            </h4>
            <div className="space-y-1.5">
              {sections.map((s, idx) => (
                <div key={idx} className="rounded-xl border border-line bg-slate-50/70 p-2.5 text-xs">
                  <p className="font-semibold text-slate-800">
                    {s.title || `Part ${s.partNumber || idx + 1}`}
                  </p>
                  {s.instructions && (
                    <p className="text-slate-500 mt-0.5 italic">{s.instructions}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Danh sách câu hỏi */}
        {questions.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
              Danh sách câu hỏi ({questions.length})
            </h4>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const qNum = q.questionNumber || idx + 1
                const opts = Array.isArray(q.options) ? q.options : []
                return (
                  <div key={idx} className="rounded-xl border border-line bg-white p-3 space-y-2 text-xs shadow-2xs">
                    <div className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-brand-100 text-brand-700 font-bold text-[10px]">
                        {qNum}
                      </span>
                      <p className="font-semibold text-navy-900 flex-1 leading-snug">
                        {q.questionText || q.question || `Câu hỏi ${qNum}`}
                      </p>
                    </div>

                    {q.imageUrl && (
                      <img src={q.imageUrl} alt={`Ảnh câu ${qNum}`} className="rounded-lg max-h-32 object-contain border" />
                    )}

                    {opts.length > 0 && (
                      <ul className="space-y-1 pl-7">
                        {opts.map((opt, optIdx) => {
                          const optId = typeof opt === 'object' ? opt.id : String.fromCharCode(65 + optIdx)
                          const optText = typeof opt === 'object' ? opt.text : opt
                          const isCorrect = String(q.correctAnswer).trim().toUpperCase() === String(optId).trim().toUpperCase()

                          return (
                            <li
                              key={optIdx}
                              className={`flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors ${
                                isCorrect
                                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                                  : 'text-slate-600'
                              }`}
                            >
                              {isCorrect ? (
                                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                              ) : (
                                <span className="text-slate-400 font-bold w-3.5 text-center">{optId}.</span>
                              )}
                              <span>{optText}</span>
                            </li>
                          )
                        })}
                      </ul>
                    )}

                    {q.explanation && (
                      <p className="text-[11px] text-ink-muted border-t border-slate-100 pt-1.5 mt-1.5">
                        <span className="font-semibold text-navy-700">Giải thích: </span>
                        {q.explanation}
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
          <p><span className="font-semibold text-navy-700">Tác giả:</span> {exam.authorName || '—'} ({exam.authorEmail || '—'})</p>
          <p><span className="font-semibold text-navy-700">Ngày tạo:</span> {formatDate(exam.createdAt)}</p>
          {exam.updatedAt && (
            <p><span className="font-semibold text-navy-700">Cập nhật:</span> {formatDate(exam.updatedAt)}</p>
          )}
          <p><span className="font-semibold text-navy-700">XP thưởng:</span> {exam.xpReward ?? 50} XP</p>
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
                onEditClick(exam)
              }}
            >
              Chỉnh sửa bài thi
            </Button>
          ) : (
            <div className="w-full text-center text-xs text-ink-muted py-2 bg-slate-50 rounded-lg">
              <Lock size={13} className="inline mr-1" />
              Bạn đang xem bài thi của tác giả khác
            </div>
          )}
        </div>
      </div>
    </Drawer>
  )
}
