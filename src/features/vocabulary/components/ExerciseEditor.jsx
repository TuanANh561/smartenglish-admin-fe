import { Plus, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export const EMPTY_FORM = {
  word: '',
  pronunciation: '',
  partOfSpeech: 'Noun',
  vietnameseMeaning: '',
  englishMeaning: '',
  cefrLevel: 'B1',
  topic: '',
  exampleEn: '',
  exampleVi: '',
  synonyms: '',
  antonyms: '',
  exercises: [
    { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' },
  ],
}

/**
 * Component chỉnh sửa danh sách câu hỏi trắc nghiệm (MCQ) đính kèm từ vựng.
 * Tối đa 5 câu hỏi bài tập.
 */
export function ExerciseEditor({ exercises = [], onChange }) {
  const addExercise = () => {
    if (exercises.length >= 5) {
      toast.error('Tối đa 5 câu hỏi bài tập')
      return
    }
    onChange([
      ...exercises,
      { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' },
    ])
  }

  const removeExercise = (idx) => onChange(exercises.filter((_, i) => i !== idx))

  const updateExercise = (idx, field, value) => {
    const next = exercises.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex))
    onChange(next)
  }

  const updateOption = (exIdx, optIdx, value) => {
    const next = exercises.map((ex, i) => {
      if (i !== exIdx) return ex
      const options = [...ex.options]
      options[optIdx] = value
      return { ...ex, options }
    })
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Câu hỏi bài tập ({exercises.length}/5)
        </label>
        <button
          type="button"
          onClick={addExercise}
          className="flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-100 transition-colors cursor-pointer"
        >
          <Plus size={12} /> Thêm câu hỏi
        </button>
      </div>

      {exercises.map((ex, exIdx) => (
        <div key={exIdx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Câu {exIdx + 1}</span>
            <button
              type="button"
              onClick={() => removeExercise(exIdx)}
              className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>

          <input
            type="text"
            value={ex.question}
            onChange={(e) => updateExercise(exIdx, 'question', e.target.value)}
            placeholder="Nhập câu hỏi... VD: Choose the correct meaning of 'serene':"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20"
          />

          <div className="grid grid-cols-2 gap-2">
            {ex.options.map((opt, optIdx) => (
              <div key={optIdx} className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateExercise(exIdx, 'correctIndex', optIdx)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors cursor-pointer ${
                    ex.correctIndex === optIdx
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 bg-white hover:border-slate-400'
                  }`}
                  title="Đánh dấu là đáp án đúng"
                >
                  {ex.correctIndex === optIdx && <Check size={11} strokeWidth={3} />}
                </button>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(exIdx, optIdx, e.target.value)}
                  placeholder={`Đáp án ${String.fromCharCode(65 + optIdx)}`}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-400"
                />
              </div>
            ))}
          </div>

          <input
            type="text"
            value={ex.explanation}
            onChange={(e) => updateExercise(exIdx, 'explanation', e.target.value)}
            placeholder="Giải thích đáp án (không bắt buộc)..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-600 placeholder:text-slate-400 outline-none focus:border-brand-400"
          />
        </div>
      ))}

      {exercises.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 py-4 text-center text-xs text-slate-400">
          Chưa có câu hỏi bài tập. Nhấn "Thêm câu hỏi" để tạo.
        </div>
      )}
    </div>
  )
}

export default ExerciseEditor

