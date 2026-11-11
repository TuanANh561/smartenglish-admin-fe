import { BookOpen, ExternalLink, Paperclip, PenLine } from 'lucide-react'
import { Link } from 'react-router-dom'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

const TYPE_LABEL = {
  HOMEWORK: 'Bài tập',
  QUIZ: 'Trắc nghiệm',
  EXAM: 'Đề thi',
  WRITING: 'Viết luận',
  ESSAY: 'Viết luận',
  SPEAKING: 'Luyện nói',
  ROLEPLAY: 'Luyện nói',
  READING: 'Đọc hiểu',
  LISTENING: 'Luyện nghe',
  VOCAB_DECK: 'Từ vựng',
  GRAMMAR: 'Ngữ pháp',
  DOCUMENT: 'Tài liệu',
}

// Trang xem/sửa học liệu tương ứng để giáo viên biết học viên sẽ làm nội dung gì
const materialLink = (asm) => {
  if (!asm.referenceId) return null
  const title = asm.referenceTitle || ''
  if (title.startsWith('[Đề thi')) return `/app/hoc-lieu/bai-kiem-tra/${asm.referenceId}/chinh-sua`
  if (title.startsWith('[Bài đọc')) return `/app/hoc-lieu/bai-doc/${asm.referenceId}/chinh-sua`
  if (title.startsWith('[Bài luyện nghe')) return `/app/hoc-lieu/bai-nghe/${asm.referenceId}/chinh-sua`
  return null
}

function Row({ label, children }) {
  return (
    <div className="flex gap-3 py-2 border-b border-line last:border-0">
      <span className="w-28 shrink-0 text-sm text-ink-muted">{label}</span>
      <div className="min-w-0 flex-1 text-sm text-ink">{children}</div>
    </div>
  )
}

export default function AssignmentDetailModal({ assignment, studentCount, onClose, onOpenSubmissions, onPreviewFile }) {
  if (!assignment) return null
  const link = materialLink(assignment)

  return (
    <Modal isOpen onClose={onClose} title={assignment.title} className="max-w-xl">
      <div>
        <Row label="Loại">{TYPE_LABEL[assignment.assignmentType] || assignment.assignmentType}</Row>
        <Row label="Hạn nộp">
          {assignment.dueDate ? formatDate(assignment.dueDate, 'HH:mm dd/MM/yyyy') : 'Không giới hạn'}
        </Row>
        <Row label="Điểm đạt">{assignment.passingScore ?? 5}/10</Row>
        <Row label="Đã nộp">
          {assignment.submissionCount || 0}/{studentCount || 0} · Đã chấm {assignment.gradedCount || 0}
        </Row>

        {assignment.referenceTitle && (
          <Row label="Học liệu">
            <div className="flex items-center gap-2">
              <BookOpen size={16} strokeWidth={1.75} className="shrink-0 text-brand-500" />
              <span className="truncate">{assignment.referenceTitle}</span>
              {link && (
                <Link to={link} className="shrink-0 text-brand-600 hover:text-brand-500" title="Mở nội dung học liệu">
                  <ExternalLink size={16} strokeWidth={1.75} />
                </Link>
              )}
            </div>
          </Row>
        )}

        {assignment.attachmentUrl && (
          <Row label="File đề bài">
            <button
              type="button"
              onClick={() => onPreviewFile({ url: assignment.attachmentUrl, name: assignment.attachmentName || assignment.title })}
              className="inline-flex max-w-full items-center gap-2 text-brand-600 hover:text-brand-500 cursor-pointer"
            >
              <Paperclip size={16} strokeWidth={1.75} className="shrink-0" />
              <span className="truncate">{assignment.attachmentName || 'Xem file'}</span>
            </button>
          </Row>
        )}

        {assignment.instructions && (
          <div className="mt-3">
            <p className="mb-1 text-sm text-ink-muted">Hướng dẫn</p>
            <p className="whitespace-pre-wrap rounded-lg bg-canvas p-3 text-sm text-ink">{assignment.instructions}</p>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button size="sm" icon={PenLine} onClick={() => onOpenSubmissions(assignment)}>
            Xem bài nộp
          </Button>
        </div>
      </div>
    </Modal>
  )
}
