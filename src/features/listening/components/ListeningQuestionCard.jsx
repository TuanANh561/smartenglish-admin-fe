import { Check, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'

export default function ListeningQuestionCard({
  question,
  index,
  isOpen,
  onToggle,
  onChange,
  onRemove,
}) {
  const hasContent = Boolean(question.question?.trim())
  const hasOptions = question.options?.some((o) => o?.trim())

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isOpen
          ? 'border-brand-400 bg-white shadow-md ring-2 ring-brand-100/60'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
      }`}
    >
      {/* Header dòng câu hỏi */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`text-xs font-semibold truncate ${
              hasContent ? 'text-slate-800' : 'text-slate-400 italic'
            }`}
          >
            {hasContent ? question.question : `Câu hỏi ${index + 1} — chưa nhập nội dung`}
          </p>

          {!isOpen && (
            <div className="flex items-center gap-2 mt-0.5">
              {question.options[question.correctIndex] ? (
                <span className="text-[11px] font-medium text-emerald-600 truncate">
                  ✓ Đáp án: {String.fromCharCode(65 + question.correctIndex)}. {question.options[question.correctIndex]}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  {hasOptions ? 'Chưa chọn đáp án đúng' : 'Chưa nhập 4 đáp án'}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="rounded-lg p-1.5 hover:bg-rose-50 hover:text-rose-500 transition-colors cursor-pointer"
            title="Xóa câu hỏi này"
          >
            <Trash2 size={14} />
          </button>
          <span className="p-1 text-slate-400">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </div>

      {/* Body mở rộng */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-3.5 border-t border-slate-100 pt-3 bg-slate-50/40">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Nội dung câu hỏi nghe hiểu *
            </label>
            <Textarea
              rows={2}
              value={question.question}
              onChange={(e) => onChange({ ...question, question: e.target.value })}
              placeholder="VD: What did the customer order at the cafe?"
              className="text-xs bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Các phương án lựa chọn
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {question.options.map((opt, optIdx) => {
                const isCorrect = question.correctIndex === optIdx
                return (
                  <div
                    key={optIdx}
                    className={`flex items-center gap-2 rounded-xl p-2.5 border transition-all ${
                      isCorrect
                        ? 'border-emerald-300 bg-emerald-50/80 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onChange({ ...question, correctIndex: optIdx })}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition-all cursor-pointer ${
                        isCorrect
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 bg-white hover:border-emerald-400'
                      }`}
                      title={isCorrect ? 'Đáp án đúng' : 'Click để chọn làm đáp án đúng'}
                    >
                      {isCorrect && <Check size={11} strokeWidth={3.5} />}
                    </button>

                    <span
                      className={`text-xs font-bold shrink-0 ${
                        isCorrect ? 'text-emerald-800' : 'text-slate-500'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}.
                    </span>

                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const opts = [...question.options]
                        opts[optIdx] = e.target.value
                        onChange({ ...question, options: opts })
                      }}
                      placeholder={`Lựa chọn ${String.fromCharCode(65 + optIdx)}...`}
                      className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none"
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Giải thích <span className="text-slate-400 font-normal">(tùy chọn)</span>
            </label>
            <Input
              value={question.explanation || ''}
              onChange={(e) => onChange({ ...question, explanation: e.target.value })}
              placeholder="Giải thích ngắn gọn lý do..."
              className="text-xs bg-white"
            />
          </div>
        </div>
      )}
    </div>
  )
}
