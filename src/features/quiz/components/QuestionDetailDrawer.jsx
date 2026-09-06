import { CheckCircle2, Lock, Pencil, Trash2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import { QUESTION_TYPE_META } from '../columns'

export default function QuestionDetailDrawer({
  question,
  onClose,
  isOwner,
  isAdmin,
  onDeleteRequest,
  onEditRequest,
}) {
  if (!question) return null

  const canModify = isOwner || isAdmin

  return (
    <Drawer
      open={Boolean(question)}
      onClose={onClose}
      title="Chi tiết câu hỏi"
      className="max-w-[480px]"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="info">{question.cefrLevel}</Badge>
          <Badge tone="neutral">
            {QUESTION_TYPE_META[question.questionType]?.label || 'Trắc nghiệm'}
          </Badge>
          <Badge tone={isOwner ? 'success' : 'neutral'}>
            Tác giả: {question.authorName || 'Hệ thống'}
          </Badge>
          {question.status === 'pending' && <Badge tone="warning">Chờ duyệt</Badge>}
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold text-navy-700">Câu hỏi</h4>
          <p className="rounded-lg bg-canvas p-3 text-sm leading-relaxed text-ink">
            {question.questionText}
          </p>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold text-navy-700">Đáp án</h4>
          <ul className="space-y-1.5">
            {question.options?.map((option) => (
              <li
                key={option}
                className={
                  option === question.correctAnswer
                    ? 'flex items-center gap-2 rounded-md bg-[#DCFCE7] px-2 py-1.5 text-sm font-medium text-[#15803D]'
                    : 'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink'
                }
              >
                {option === question.correctAnswer && (
                  <CheckCircle2 size={16} strokeWidth={1.75} />
                )}
                {option}
              </li>
            ))}
          </ul>
        </div>

        {question.explanationVi && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-navy-700">Giải thích</h4>
            <p className="text-sm text-ink-muted leading-relaxed bg-canvas p-3 rounded-lg">
              {question.explanationVi}
            </p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex gap-2 border-t border-line pt-4">
          {canModify ? (
            <>
              <Button
                variant="secondary"
                fullWidth
                icon={Trash2}
                onClick={onDeleteRequest}
              >
                Xóa câu hỏi
              </Button>
              <Button
                variant="primary"
                fullWidth
                icon={Pencil}
                onClick={onEditRequest}
              >
                Chỉnh sửa
              </Button>
            </>
          ) : (
            <div className="w-full text-center text-xs text-ink-muted py-2 bg-slate-50 rounded-lg">
              <Lock size={13} className="inline mr-1" />
              Bạn đang xem câu hỏi của tác giả khác (Không có quyền chỉnh sửa)
            </div>
          )}
        </div>
      </div>
    </Drawer>
  )
}
