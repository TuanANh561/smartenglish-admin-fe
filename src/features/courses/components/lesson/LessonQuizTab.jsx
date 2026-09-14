import { FileQuestion, Plus, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

/**
 * Tab Soạn Thảo Bộ Câu Hỏi Trắc Nghiệm Phản Xạ
 */
export default function LessonQuizTab({
  quizBlock,
  updateBlock,
}) {
  const questions = quizBlock?.questions || []

  const handleAddQuestion = () => {
    const nextQuestion = {
      id: questions.length + 1,
      question: '',
      options: ['A. ', 'B. ', 'C. ', 'D. '],
      correctAnswer: 'A',
      explanation: '',
    }
    updateBlock('quiz', { questions: [...questions, nextQuestion] })
  }

  const handleUpdateQuestion = (qIndex, field, value) => {
    const updated = questions.map((q, i) =>
      i === qIndex ? { ...q, [field]: value } : q,
    )
    updateBlock('quiz', { questions: updated })
  }

  const handleUpdateOption = (qIndex, optIndex, value) => {
    const updated = questions.map((q, i) => {
      if (i !== qIndex) return q
      const opts = [...q.options]
      opts[optIndex] = value
      return { ...q, options: opts }
    })
    updateBlock('quiz', { questions: updated })
  }

  const handleRemoveQuestion = (qIndex) => {
    const updated = questions.filter((_, i) => i !== qIndex)
    updateBlock('quiz', { questions: updated })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-bold text-navy-900 text-xs flex items-center gap-1.5">
          <FileQuestion size={15} className="text-brand-600" /> Bộ câu hỏi trắc nghiệm phản xạ (Quiz):
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={Plus}
          onClick={handleAddQuestion}
          className="text-xs h-7.5 font-semibold bg-white border-brand-300 text-brand-700 hover:bg-brand-50 shadow-2xs"
        >
          Thêm câu hỏi
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-line text-ink-muted">
          Chưa có câu hỏi trắc nghiệm nào. Bấm "Thêm câu hỏi" để tạo bài ôn tập kiểm tra nhanh cho bài học.
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-brand-700 text-xs">
                  Câu hỏi #{qIdx + 1}:
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(qIdx)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  title="Xóa câu hỏi này"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <Input
                value={q.question}
                onChange={(e) => handleUpdateQuestion(qIdx, 'question', e.target.value)}
                placeholder="Nội dung câu hỏi tiếng Anh..."
                className="text-xs font-semibold py-1 h-8"
              />

              {/* 4 Lựa chọn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                  <div key={letter} className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-slate-500 w-5 text-center shrink-0">
                      {letter}.
                    </span>
                    <Input
                      value={q.options?.[optIdx] || ''}
                      onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                      placeholder={`Lựa chọn ${letter}`}
                      className="text-xs py-1 h-8 flex-1 min-w-0"
                    />
                  </div>
                ))}
              </div>

              {/* Đáp án đúng & Giải thích */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Đáp án đúng:</label>
                  <Select
                    value={q.correctAnswer || 'A'}
                    onChange={(e) => handleUpdateQuestion(qIdx, 'correctAnswer', e.target.value)}
                    className="text-xs py-0.5 h-8 font-bold text-emerald-700"
                  >
                    <option value="A">Đáp án A</option>
                    <option value="B">Đáp án B</option>
                    <option value="C">Đáp án C</option>
                    <option value="D">Đáp án D</option>
                  </Select>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700">Giải thích chi tiết:</label>
                  <Input
                    value={q.explanation || ''}
                    onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                    placeholder="Lý do vì sao đáp án này đúng..."
                    className="text-xs py-1 h-8"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
