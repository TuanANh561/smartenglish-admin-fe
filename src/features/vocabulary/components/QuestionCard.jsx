import { ChevronDown, ChevronUp, Trash2, Check } from 'lucide-react'
import Textarea from '@/components/ui/Textarea'
import { cn } from '@/lib/utils'

/**
 * Thẻ câu hỏi trắc nghiệm (MCQ) dạng Accordion, cho phép nhập câu hỏi, 4 phương án và lời giải thích.
 */
export function QuestionCard({ question, index, isOpen, onToggle, onChange, onRemove }) {
  const hasContent = question.question.trim()

  return (
    <div
      className={cn(
        'rounded-2xl border transition-all',
        isOpen ? 'border-brand-300 bg-white shadow-md' : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
      )}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-xs font-bold">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm truncate', hasContent ? 'text-slate-800 font-medium' : 'text-slate-400 italic')}>
            {hasContent ? question.question : `Câu hỏi ${index + 1} — chưa nhập nội dung`}
          </p>
          {!isOpen && question.options[question.correctIndex] && (
            <p className="text-xs text-emerald-600 mt-0.5">
              ✓ Đáp án: {question.options[question.correctIndex]}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
            title="Xóa câu hỏi"
          >
            <Trash2 size={14} />
          </button>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Câu hỏi</label>
            <Textarea
              rows={2}
              autoResize
              value={question.question}
              onChange={(e) => onChange({ ...question, question: e.target.value })}
              placeholder="VD: Choose the correct meaning of the word:"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Các đáp án <span className="text-slate-400 font-normal">(chọn ô vuông của đáp án đúng)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {question.options.map((opt, optIdx) => (
                <div
                  key={optIdx}
                  className={cn(
                    'flex items-center gap-2 rounded-xl p-2.5 border transition-colors',
                    question.correctIndex === optIdx
                      ? 'border-emerald-200 bg-emerald-50/60'
                      : 'border-slate-200 bg-white'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onChange({ ...question, correctIndex: optIdx })}
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all cursor-pointer',
                      question.correctIndex === optIdx
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 bg-white hover:border-emerald-400'
                    )}
                  >
                    {question.correctIndex === optIdx && <Check size={11} strokeWidth={3} />}
                  </button>
                  <span className="text-xs font-bold text-slate-500 shrink-0">{String.fromCharCode(65 + optIdx)}.</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const options = [...question.options]
                      options[optIdx] = e.target.value
                      onChange({ ...question, options })
                    }}
                    placeholder={`Nhập đáp án ${String.fromCharCode(65 + optIdx)}...`}
                    className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Giải thích đáp án <span className="text-slate-400 font-normal">(không bắt buộc)</span>
            </label>
            <Textarea
              rows={2}
              autoResize
              value={question.explanation}
              onChange={(e) => onChange({ ...question, explanation: e.target.value })}
              placeholder="Nhập giải thích ngắn gọn vì sao đáp án này đúng..."
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestionCard

