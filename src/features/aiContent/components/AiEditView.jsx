import { useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Save } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'

export default function AiEditView({ item, onBack, onSave }) {
  const [content, setContent] = useState(item.content || item.definition || '')
  const [questions, setQuestions] = useState(
    (item.questions || []).map((q) => ({ ...q })),
  )
  const [activeQ, setActiveQ] = useState(0)
  const [saving, setSaving] = useState(false)

  const q = questions[activeQ] ?? null

  const updateQ = (field, value) => {
    setQuestions((prev) =>
      prev.map((item, idx) => (idx === activeQ ? { ...item, [field]: value } : item)),
    )
  }

  const updateOption = (optIdx, value) => {
    setQuestions((prev) =>
      prev.map((item, idx) => {
        if (idx !== activeQ) return item
        const opts = [...(item.options || [])]
        opts[optIdx] = value
        return { ...item, options: opts }
      }),
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({ content, questions })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-navy-700 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>
        <Button icon={Save} onClick={handleSave} loading={saving} disabled={saving}>
          Lưu thay đổi
        </Button>
      </div>

      {/* Title bar */}
      <div className="rounded-xl border border-brand-400/40 bg-brand-500/5 px-5 py-3">
        <p className="text-sm font-semibold text-brand-700">
          ✏️ Đang chỉnh sửa: <span className="text-navy-700">{item.title}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Content editor */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-line bg-white shadow-sm">
            <div className="border-b border-line px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Nội dung bài đọc</p>
            </div>
            <div className="p-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={18}
                className="w-full resize-none text-sm"
                placeholder="Nhập nội dung bài đọc..."
              />
            </div>
          </div>
        </div>

        {/* Question editor */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-line bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Câu hỏi ({questions.length})
              </p>
              <div className="flex items-center gap-1">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveQ(idx)}
                    className={[
                      'h-7 w-7 rounded-full text-xs font-semibold transition-colors cursor-pointer',
                      idx === activeQ
                        ? 'bg-brand-500 text-white'
                        : 'bg-canvas text-ink-muted hover:bg-brand-100 hover:text-brand-600',
                    ].join(' ')}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {q ? (
              <div className="space-y-4 p-5">
                {/* Question text */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Câu hỏi {activeQ + 1}
                  </label>
                  <Textarea
                    value={q.questionText || ''}
                    onChange={(e) => updateQ('questionText', e.target.value)}
                    rows={3}
                    className="w-full resize-none text-sm"
                  />
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Các đáp án
                  </label>
                  {(q.options || []).map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx)
                    const isCorrect = q.correctAnswer === letter
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQ('correctAnswer', letter)}
                          className={[
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors cursor-pointer',
                            isCorrect
                              ? 'bg-green-500 text-white shadow'
                              : 'bg-canvas text-ink-muted hover:bg-green-100 hover:text-green-600',
                          ].join(' ')}
                          title="Chọn làm đáp án đúng"
                        >
                          {letter}
                        </button>
                        <Input
                          value={opt}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          className="flex-1 text-sm"
                        />
                      </div>
                    )
                  })}
                  <p className="text-xs text-ink-muted">
                    💡 Nhấn vào chữ cái (A/B/C/D) để chọn đáp án đúng
                  </p>
                </div>

                {/* Explanation */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Giải thích (tiếng Việt)
                  </label>
                  <Textarea
                    value={q.explanationVi || ''}
                    onChange={(e) => updateQ('explanationVi', e.target.value)}
                    rows={2}
                    className="w-full resize-none text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-ink-muted">
                Không có câu hỏi
              </div>
            )}

            {questions.length > 1 && (
              <div className="flex items-center justify-between border-t border-line px-5 py-3">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ChevronLeft}
                  onClick={() => setActiveQ((i) => Math.max(0, i - 1))}
                  disabled={activeQ === 0}
                >
                  Trước
                </Button>
                <span className="text-xs text-ink-muted">
                  {activeQ + 1} / {questions.length}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveQ((i) => Math.min(questions.length - 1, i + 1))}
                  disabled={activeQ === questions.length - 1}
                >
                  Sau
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
