import { Clock, FileText, Lock, Pencil, Send } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import { formatDate } from '@/lib/utils'
import { LEVEL_LABEL, LEVEL_TONE } from '../levels'

export default function ReadingDetailDrawer({
  reading,
  onClose,
  isTeacher,
  isOwner,
  canManage,
  onAssignToClass,
  onEditClick,
}) {
  if (!reading) return null

  return (
    <Drawer
      open={Boolean(reading)}
      onClose={onClose}
      title={reading?.title}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={LEVEL_TONE[reading.level]}>{LEVEL_LABEL[reading.level]}</Badge>
          <Badge tone="neutral">{reading.topic}</Badge>
          <Badge tone={isOwner ? 'success' : 'neutral'}>
            Tác giả: {reading.authorName || 'Hệ thống'}
          </Badge>
          <span className="text-xs text-ink-muted">
            Cập nhật {formatDate(reading.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-ink-muted">
          <span className="flex items-center gap-1.5">
            <FileText size={16} strokeWidth={1.75} />
            {reading.wordCount} từ
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={16} strokeWidth={1.75} />
            {reading.minutes} phút đọc
          </span>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold text-navy-700">Nội dung bài đọc</h4>
          <p className="rounded-lg bg-canvas p-3 text-sm leading-relaxed text-ink">
            {reading.content}
          </p>
        </div>

        {reading.questions?.length > 0 && (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-navy-700">
              Câu hỏi trắc nghiệm ({reading.questions.length})
            </h4>
            <div className="space-y-4">
              {reading.questions.map((question, index) => (
                <div key={question.id || index} className="rounded-lg border border-line p-3">
                  <p className="text-sm font-medium text-ink">
                    Câu {index + 1}. {question.question}
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {question.options.map((option, optionIndex) => (
                      <li
                        key={option}
                        className={
                          optionIndex === question.correctIndex
                            ? 'flex items-center gap-2 rounded-md bg-[#DCFCE7] px-2 py-1 text-sm font-medium text-[#15803D]'
                            : 'flex items-center gap-2 px-2 py-1 text-sm text-ink'
                        }
                      >
                        <span className="text-xs text-ink-muted">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        {option}
                      </li>
                    ))}
                  </ul>
                  {question.explanation && (
                    <p className="mt-2 text-xs text-ink-muted">
                      <span className="font-semibold text-navy-700">Giải thích: </span>
                      {question.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions trong Drawer */}
        <div className="flex gap-2 border-t border-line pt-4">
          {isTeacher && isOwner && (
            <Button
              variant="primary"
              fullWidth
              icon={Send}
              onClick={(e) => onAssignToClass(e, reading)}
            >
              Giao bài đọc này cho lớp
            </Button>
          )}
          {canManage ? (
            <Button
              variant={isTeacher && isOwner ? 'secondary' : 'primary'}
              fullWidth={!isTeacher || !isOwner}
              icon={Pencil}
              onClick={(e) => {
                onClose()
                onEditClick(e, reading)
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
