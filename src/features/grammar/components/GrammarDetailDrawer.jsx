import { BookOpen, CheckCircle2, Pencil } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'

const LEVEL_TONE = {
  A1: 'info',
  A2: 'info',
  B1: 'brand',
  B2: 'brand',
  C1: 'warning',
  C2: 'danger',
}

export default function GrammarDetailDrawer({ activeLesson, onClose, onEdit }) {
  if (!activeLesson) return null

  return (
    <Drawer
      open={Boolean(activeLesson)}
      onClose={onClose}
      title={activeLesson.title}
      className="max-w-lg"
    >
      <div className="space-y-5 text-sm">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
          <Badge tone={LEVEL_TONE[activeLesson.level] || 'brand'}>
            Cấp độ {activeLesson.level}
          </Badge>
          <Badge tone="neutral">Chủ điểm: {activeLesson.topic}</Badge>
          <Badge tone={activeLesson.status === 'published' ? 'success' : 'neutral'}>
            {activeLesson.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
          </Badge>
          <span className="text-xs text-ink-muted">
            Tác giả: <strong>{activeLesson.authorName || 'Admin'}</strong>
          </span>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Tổng quan
          </h4>
          <p className="mt-1 text-sm text-navy-800 leading-relaxed">
            {activeLesson.description || 'Chưa có mô tả chi tiết.'}
          </p>
        </div>

        {/* Formula Card */}
        {activeLesson.formula && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Cấu trúc / Công thức
            </h4>
            <div className="mt-1.5 rounded-xl bg-navy-900 p-3.5 font-mono text-xs text-brand-200 shadow-inner">
              {activeLesson.formula}
            </div>
          </div>
        )}

        {/* Key Rules */}
        {activeLesson.keyRules && activeLesson.keyRules.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Quy tắc ngữ pháp quan trọng
            </h4>
            <ul className="mt-2 space-y-1.5">
              {activeLesson.keyRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-navy-800">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Examples */}
        {activeLesson.examples && activeLesson.examples.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Ví dụ minh họa
            </h4>
            <div className="mt-2 space-y-2">
              {activeLesson.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-line bg-canvas p-3 text-xs"
                >
                  <p className="font-semibold text-navy-800">{ex.en}</p>
                  {ex.vi && (
                    <p className="mt-0.5 text-ink-muted italic">→ {ex.vi}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sample Exercises */}
        {activeLesson.sampleExercises && activeLesson.sampleExercises.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Câu hỏi luyện tập mẫu ({activeLesson.sampleExercises.length})
            </h4>
            <div className="mt-2 space-y-2">
              {activeLesson.sampleExercises.map((quiz, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-line bg-white p-3 text-xs space-y-1 shadow-xs"
                >
                  <p className="font-medium text-navy-800">
                    {idx + 1}. {quiz.question}
                  </p>
                  <p className="text-emerald-600 font-semibold text-[11px]">
                    ✓ Đáp án: {quiz.answer || (quiz.options && quiz.options[quiz.correctIndex])}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Bar in Drawer */}
        <div className="flex items-center gap-2 pt-4 border-t border-line">
          <Button
            variant="secondary"
            icon={Pencil}
            fullWidth
            onClick={() => {
              const target = activeLesson
              onClose()
              if (onEdit) onEdit(target)
            }}
          >
            Chỉnh sửa bài học
          </Button>
        </div>
      </div>
    </Drawer>
  )
}
