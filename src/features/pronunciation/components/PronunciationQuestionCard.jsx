import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'

export default function PronunciationQuestionCard({
  question,
  index,
  isOpen,
  onToggle,
  onChange,
  onRemove,
}) {
  const hasContent = question.question.trim()

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isOpen
          ? 'border-brand-300 bg-white shadow-md'
          : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
      }`}
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
          <p
            className={`text-sm truncate ${
              hasContent ? 'text-slate-800 font-medium' : 'text-slate-400 italic'
            }`}
          >
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
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Câu hỏi nhận diện âm / phát âm
            </label>
            <Textarea
              rows={2}
              value={question.question}
              onChange={(e) => onChange({ ...question, question: e.target.value })}
              placeholder="VD: Choose the word whose underlined part is pronounced differently:"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              4 Lựa chọn trả lời & Chọn đáp án đúng
            </label>
            <div className="space-y-2">
              {question.options.map((opt, optIdx) => {
                const isCorrect = question.correctIndex === optIdx
                return (
                  <div key={optIdx} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onChange({ ...question, correctIndex: optIdx })}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                      title={isCorrect ? 'Đáp án đúng' : 'Nhấp để đặt làm đáp án đúng'}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </button>
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...question.options]
                        newOptions[optIdx] = e.target.value
                        onChange({ ...question, options: newOptions })
                      }}
                      placeholder={`Lựa chọn ${String.fromCharCode(65 + optIdx)}`}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Giải thích phát âm <span className="text-slate-400 font-normal">(không bắt buộc)</span>
            </label>
            <Input
              value={question.explanation}
              onChange={(e) => onChange({ ...question, explanation: e.target.value })}
              placeholder="VD: Từ 'banana' có âm /ə/ ở vị trí âm tiết đầu và cuối..."
            />
          </div>
        </div>
      )}
    </div>
  )
}
