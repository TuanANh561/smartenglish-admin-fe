import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { readings } from '@/mocks/data/readings'
import { useAuthStore } from '@/store/authStore'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const READING_TOPICS = [
  'Business', 'Science', 'Technology', 'Culture', 'Travel',
  'Health', 'Environment', 'Education', 'Sports', 'Arts', 'History', 'Society',
]
const EMPTY_QUESTION = { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }

// ── Accordion Question Card ─────────────────────────────────────────────────
function QuestionCard({ question, index, isOpen, onToggle, onChange, onRemove }) {
  const hasContent = question.question.trim()
  return (
    <div className={`rounded-2xl border transition-all ${isOpen ? 'border-brand-300 bg-white shadow-md' : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'}`}>
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none" onClick={onToggle}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-xs font-bold">{index + 1}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${hasContent ? 'text-slate-800 font-medium' : 'text-slate-400 italic'}`}>
            {hasContent ? question.question : `Câu hỏi ${index + 1} — chưa nhập nội dung`}
          </p>
          {!isOpen && question.options[question.correctIndex] && (
            <p className="text-xs text-emerald-600 mt-0.5">✓ Đáp án: {question.options[question.correctIndex]}</p>
          )}
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove() }}
            className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer" title="Xóa câu hỏi">
            <Trash2 size={14} />
          </button>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      {isOpen && (
        <div className="px-4 pb-4 space-y-3.5 border-t border-slate-100 pt-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Câu hỏi đọc hiểu</label>
            <Textarea
              rows={2}
              autoResize
              value={question.question}
              onChange={(e) => onChange({ ...question, question: e.target.value })}
              placeholder="VD: According to the passage, what is the main purpose of..."
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Các đáp án <span className="text-emerald-600 font-normal">(click ô vuông = đáp án đúng)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {question.options.map((opt, optIdx) => (
                <div
                  key={optIdx}
                  className={`flex items-center gap-2 rounded-xl p-2.5 border transition-colors ${
                    question.correctIndex === optIdx ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onChange({ ...question, correctIndex: optIdx })}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all cursor-pointer ${
                      question.correctIndex === optIdx
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 bg-white hover:border-emerald-400'
                    }`}
                  >
                    {question.correctIndex === optIdx && <Check size={11} strokeWidth={3} />}
                  </button>
                  <span className="text-xs font-bold text-slate-500 shrink-0">{String.fromCharCode(65 + optIdx)}.</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const opts = [...question.options]
                      opts[optIdx] = e.target.value
                      onChange({ ...question, options: opts })
                    }}
                    placeholder={`Đáp án ${String.fromCharCode(65 + optIdx)}...`}
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
              placeholder="Giải thích chi tiết tại sao đáp án này đúng..."
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Form Page ──────────────────────────────────────────────────────────
function ReadingFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isEditing = Boolean(id)
  const existingItem = isEditing ? readings.find((r) => r.id === id) || readings[0] : null

  const [form, setForm] = useState({
    title: existingItem?.title || '',
    description: existingItem?.description || '',
    topic: existingItem?.topic || 'Science',
    level: existingItem?.level || 'B1',
    content: existingItem?.content || '',
  })
  const [questions, setQuestions] = useState(
    existingItem?.questions?.length > 0 ? existingItem.questions : []
  )
  const [openQuestionIdx, setOpenQuestionIdx] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))
  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0
  const readingMinutes = Math.max(1, Math.round(wordCount / 200))

  const addQuestion = () => {
    if (questions.length >= 10) { toast.error('Tối đa 10 câu hỏi'); return }
    const newIdx = questions.length
    setQuestions((prev) => [...prev, { ...EMPTY_QUESTION }])
    setOpenQuestionIdx(newIdx)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Vui lòng nhập tiêu đề bài đọc'); return }
    if (!form.content.trim()) { toast.error('Vui lòng nhập nội dung bài đọc'); return }
    setIsSaving(true)
    setTimeout(() => {
      toast.success(isEditing ? `Đã cập nhật bài đọc "${form.title}"` : `Đã tạo bài đọc "${form.title}"`)
      setIsSaving(false)
      navigate('/hoc-lieu/bai-doc')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-xs">
        <div className="mx-auto max-w-6xl flex items-center gap-4 px-6 py-3.5">
          <Link to="/hoc-lieu/bai-doc"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <ArrowLeft size={16} /> Quay lại Bài đọc
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex-1">
            <h1 className="text-base font-bold text-slate-900">
              {isEditing ? `Chỉnh sửa: "${existingItem?.title}"` : 'Thêm bài đọc mới'}
            </h1>
            <p className="text-xs text-slate-500">Học liệu / Bài đọc hiểu / {isEditing ? 'Chỉnh sửa' : 'Thêm mới'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/hoc-lieu/bai-doc"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Hủy bỏ
            </Link>
            <button type="submit" form="reading-form" disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white transition-colors shadow-xs cursor-pointer">
              <Save size={15} />
              {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo bài đọc'}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <form id="reading-form" onSubmit={handleSave}>
        <div className="mx-auto max-w-6xl px-6 py-6 space-y-6">

          {/* TOP ROW: Card 1 (Thông tin bài đọc) & Card 2 (Nội dung bài đọc) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Card 1: Thông tin cơ bản (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-600 text-xs font-bold">1</span>
                Thông tin bài đọc
              </h3>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tiêu đề *</label>
                <Input value={form.title} onChange={set('title')} placeholder="VD: The Future of Renewable Energy in Southeast Asia" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Chủ đề</label>
                  <Select value={form.topic} onChange={set('topic')}>
                    {READING_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Cấp độ CEFR</label>
                  <Select value={form.level} onChange={set('level')}>
                    {CEFR_LEVELS.map((l) => <option key={l} value={l}>Cấp độ {l}</option>)}
                  </Select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Mô tả ngắn</label>
                <Textarea rows={2} autoResize value={form.description} onChange={set('description')} placeholder="Tóm tắt ngắn gọn nội dung bài đọc..." />
              </div>
            </div>

            {/* Card 2: Nội dung bài đọc (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700 text-xs font-bold">2</span>
                  Nội dung bài đọc *
                </h3>
                {wordCount > 0 && (
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <FileText size={12} /> {wordCount} từ
                    </span>
                    <span>~{readingMinutes} phút đọc</span>
                  </div>
                )}
              </div>
              <Textarea
                rows={9}
                autoResize
                value={form.content}
                onChange={set('content')}
                placeholder="Nhập hoặc dán toàn bộ nội dung bài đọc tiếng Anh vào đây..."
                required
              />
            </div>
          </div>

          {/* BOTTOM ROW: Card 3: Câu hỏi đọc hiểu (FULL ROW) */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">3</span>
                Câu hỏi đọc hiểu
                <span className="ml-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {questions.length}/10
                </span>
              </h3>
              <button type="button" onClick={addQuestion}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs">
                <Plus size={14} /> Thêm câu hỏi
              </button>
            </div>

            {questions.length === 0 ? (
              <div onClick={addQuestion}
                className="flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center hover:border-brand-300 hover:bg-brand-50/30 transition-colors cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Plus size={20} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Chưa có câu hỏi</p>
                  <p className="text-xs text-slate-400 mt-0.5">Nhấn để thêm câu hỏi đọc hiểu</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <QuestionCard
                    key={idx} question={q} index={idx}
                    isOpen={openQuestionIdx === idx}
                    onToggle={() => setOpenQuestionIdx(openQuestionIdx === idx ? null : idx)}
                    onChange={(updated) => setQuestions((prev) => prev.map((x, i) => i === idx ? updated : x))}
                    onRemove={() => { setQuestions((prev) => prev.filter((_, i) => i !== idx)); setOpenQuestionIdx(null) }}
                  />
                ))}
              </div>
            )}

            <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-brand-800">
                <span className="font-bold">💡 Lưu ý:</span>
                <span>Câu hỏi bám sát bài đọc · Nên đặt 4–8 câu hỏi đa dạng (ý chính, chi tiết, từ vựng) · Bấm vào tiêu đề để thu gọn/mở rộng.</span>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}

export default ReadingFormPage
