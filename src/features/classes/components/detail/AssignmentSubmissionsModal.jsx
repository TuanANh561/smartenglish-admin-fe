import { useEffect, useState } from 'react'
import { FileText, Paperclip } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/lib/utils'
import { getAssignmentSubmissions, gradeSubmission } from '../../classApi'
import { ScoreBadge } from '../ClassSharedComponents'

const STATUS_META = {
  SUBMITTED: { label: 'Chờ chấm', className: 'bg-[#FEF3C7] text-[#A16207]' },
  GRADED: { label: 'Đã chấm', className: 'bg-[#DCFCE7] text-[#15803D]' },
  LATE: { label: 'Nộp trễ', className: 'bg-[#FEE2E2] text-[#B91C1C]' },
  NOT_SUBMITTED: { label: 'Chưa nộp', className: 'bg-slate-100 text-ink-muted' },
}

function GradeForm({ submission, onGraded }) {
  const [score, setScore] = useState(submission.score ?? '')
  const [feedback, setFeedback] = useState(submission.feedbackText || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const value = Number(score)
    if (score === '' || Number.isNaN(value) || value < 0 || value > 10) {
      toast.error('Điểm phải từ 0 đến 10')
      return
    }
    setSaving(true)
    try {
      await gradeSubmission(submission.id, { score: value, feedbackText: feedback.trim() || null })
      toast.success('Đã lưu điểm')
      onGraded()
    } catch (err) {
      toast.error(err?.message || 'Không thể lưu điểm')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start">
      <input
        type="number"
        min="0"
        max="10"
        step="0.5"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        placeholder="Điểm"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none sm:w-24"
      />
      <textarea
        rows={2}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Nhận xét cho học viên"
        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none resize-none"
      />
      <Button size="sm" loading={saving} onClick={handleSave}>
        Lưu điểm
      </Button>
    </div>
  )
}

export default function AssignmentSubmissionsModal({ assignment, onClose, onGraded }) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const assignmentId = assignment?.id

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAssignmentSubmissions(assignmentId)
      setSubmissions(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách bài nộp')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (assignmentId) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId])

  const handleGraded = async () => {
    await load()
    onGraded?.()
  }

  return (
    <Modal
      isOpen={Boolean(assignment)}
      onClose={onClose}
      title={assignment ? `Bài nộp — ${assignment.title}` : ''}
      className="max-w-2xl max-h-[85vh] overflow-y-auto"
    >
      {loading ? (
        <LoadingSpinner text="Đang tải bài nộp..." />
      ) : error ? (
        <div className="rounded-lg border border-[#FEE2E2] bg-[#FEE2E2]/40 p-3 text-sm text-[#B91C1C]">
          {error}
          <Button size="sm" variant="secondary" className="ml-3" onClick={load}>
            Thử lại
          </Button>
        </div>
      ) : submissions.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center text-ink-muted">
          <FileText size={22} strokeWidth={1.75} />
          <p className="mt-2 text-sm">Chưa có học viên nào nộp bài</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {submissions.map((s) => {
            const meta = STATUS_META[s.status] || STATUS_META.SUBMITTED
            return (
              <li key={s.id} className="rounded-xl border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy-700">{s.studentName}</p>
                    <p className="text-xs text-ink-muted">
                      {s.studentEmail ? `${s.studentEmail} · ` : ''}
                      Nộp lúc {formatDate(s.submittedAt, 'HH:mm dd/MM/yyyy')}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.className}`}>
                      {meta.label}
                    </span>
                    {s.status === 'GRADED' && <ScoreBadge score={Number(s.score)} />}
                  </div>
                </div>

                {s.submissionText && (
                  <p className="mt-3 whitespace-pre-wrap rounded-lg bg-canvas p-3 text-sm text-ink">
                    {s.submissionText}
                  </p>
                )}
                {s.attachmentUrl && (
                  <a
                    href={s.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-canvas"
                  >
                    <Paperclip size={14} strokeWidth={1.75} className="shrink-0" />
                    <span className="truncate">{s.attachmentName || 'File bài làm'}</span>
                  </a>
                )}
                {s.status !== 'GRADED' && s.score != null && (
                  <p className="mt-2 text-xs text-ink-muted">
                    Điểm hệ thống tự chấm: <strong className="text-navy-700">{s.score}</strong>
                    {s.referenceResultId ? ` · Lượt làm bài #${s.referenceResultId}` : ''}
                  </p>
                )}

                <GradeForm key={`${s.id}-${s.gradedAt || ''}`} submission={s} onGraded={handleGraded} />
              </li>
            )
          })}
        </ul>
      )}
    </Modal>
  )
}
