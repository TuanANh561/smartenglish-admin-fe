import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Headphones,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { LISTENING_ACCENTS, LISTENING_TOPICS, listeningLessons } from '@/mocks/data/listening'
import { useAuthStore } from '@/store/authStore'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
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
            className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer">
            <Trash2 size={14} />
          </button>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Câu hỏi nghe hiểu</label>
            <Textarea rows={2} value={question.question}
              onChange={(e) => onChange({ ...question, question: e.target.value })}
              placeholder="VD: What did the speaker say about..." />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Các đáp án <span className="text-emerald-600 font-normal">(click ô vuông = đáp án đúng)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {question.options.map((opt, optIdx) => (
                <div key={optIdx} className={`flex items-center gap-2 rounded-xl p-2.5 border transition-colors ${question.correctIndex === optIdx ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-white'}`}>
                  <button type="button" onClick={() => onChange({ ...question, correctIndex: optIdx })}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all cursor-pointer ${question.correctIndex === optIdx ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white hover:border-emerald-400'}`}>
                    {question.correctIndex === optIdx && <Check size={11} strokeWidth={3} />}
                  </button>
                  <span className="text-xs font-bold text-slate-500 shrink-0">{String.fromCharCode(65 + optIdx)}.</span>
                  <input type="text" value={opt}
                    onChange={(e) => { const opts = [...question.options]; opts[optIdx] = e.target.value; onChange({ ...question, options: opts }) }}
                    placeholder={`Đáp án ${String.fromCharCode(65 + optIdx)}...`}
                    className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Giải thích <span className="text-slate-400 font-normal">(không bắt buộc)</span></label>
            <Input value={question.explanation}
              onChange={(e) => onChange({ ...question, explanation: e.target.value })}
              placeholder="Tại sao đáp án này đúng..." />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Form Page ──────────────────────────────────────────────────────────
function ListeningFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isEditing = Boolean(id)
  const existingItem = isEditing ? listeningLessons.find((l) => l.id === id) || listeningLessons[0] : null

  const [form, setForm] = useState({
    title: existingItem?.title || '',
    description: existingItem?.description || '',
    topic: existingItem?.topic || (LISTENING_TOPICS[0] || ''),
    accent: existingItem?.accent || 'American',
    level: existingItem?.level?.substring(0, 2) || 'B1',
    duration: existingItem?.duration || '3:00',
    audioUrl: existingItem?.audioUrl || '',
    transcript: existingItem?.transcript || '',
  })
  const [questions, setQuestions] = useState(
    existingItem?.questions?.length > 0 ? existingItem.questions : []
  )
  const [openQuestionIdx, setOpenQuestionIdx] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const addQuestion = () => {
    if (questions.length >= 10) { toast.error('Tối đa 10 câu hỏi'); return }
    const newIdx = questions.length
    setQuestions((prev) => [...prev, { ...EMPTY_QUESTION }])
    setOpenQuestionIdx(newIdx)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Vui lòng nhập tiêu đề bài nghe'); return }
    setIsSaving(true)
    setTimeout(() => {
      toast.success(isEditing ? `Đã cập nhật bài nghe "${form.title}"` : `Đã tạo bài nghe "${form.title}"`)
      setIsSaving(false)
      navigate('/hoc-lieu/bai-nghe')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-xs">
        <div className="mx-auto max-w-6xl flex items-center gap-4 px-6 py-3.5">
          <Link to="/hoc-lieu/bai-nghe"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <ArrowLeft size={16} /> Quay lại Bài nghe
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex-1">
            <h1 className="text-base font-bold text-slate-900">
              {isEditing ? `Chỉnh sửa: "${existingItem?.title}"` : 'Thêm bài nghe mới'}
            </h1>
            <p className="text-xs text-slate-500">Học liệu / Bài nghe / {isEditing ? 'Chỉnh sửa' : 'Thêm mới'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/hoc-lieu/bai-nghe"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Hủy bỏ
            </Link>
            <button type="submit" form="listening-form" disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white transition-colors shadow-xs cursor-pointer">
              <Save size={15} />
              {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo bài nghe'}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <form id="listening-form" onSubmit={handleSave}>
        <div className="mx-auto max-w-6xl px-6 py-6 grid grid-cols-5 gap-6">

          {/* LEFT: Nội dung (3 cols) */}
          <div className="col-span-3 space-y-5">
            {/* Thông tin cơ bản */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-600 text-xs font-bold">1</span>
                Thông tin bài nghe
              </h3>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tiêu đề *</label>
                <Input value={form.title} onChange={set('title')} placeholder="VD: A Conversation at the Airport" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Chủ đề</label>
                  <Select value={form.topic} onChange={set('topic')}>
                    {LISTENING_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Cấp độ CEFR</label>
                  <Select value={form.level} onChange={set('level')}>
                    {CEFR_LEVELS.map((l) => <option key={l} value={l}>Cấp độ {l}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Giọng đọc (Accent)</label>
                  <Select value={form.accent} onChange={set('accent')}>
                    {LISTENING_ACCENTS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Thời lượng</label>
                  <div className="relative flex items-center">
                    <Clock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={form.duration}
                      onChange={set('duration')}
                      placeholder="VD: 4:30"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Mô tả ngắn</label>
                <Input value={form.description} onChange={set('description')} placeholder="Tóm tắt nội dung bài nghe..." />
              </div>
            </div>

            {/* Audio */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700 text-xs font-bold">2</span>
                File âm thanh
              </h3>
              {/* Upload placeholder */}
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-8 hover:border-brand-300 hover:bg-brand-50/20 transition-colors cursor-pointer">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <Headphones size={22} className="text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">Nhấn để tải lên file audio</p>
                  <p className="text-xs text-slate-400 mt-1">MP3, WAV, AAC — Tối đa 50MB</p>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Hoặc nhập URL file audio</label>
                <Input value={form.audioUrl} onChange={set('audioUrl')} placeholder="https://example.com/audio/lesson1.mp3" />
              </div>
            </div>

            {/* Transcript */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100 text-purple-700 text-xs font-bold">3</span>
                Bản chép lời (Transcript)
              </h3>
              <Textarea
                rows={10}
                value={form.transcript}
                onChange={set('transcript')}
                placeholder="Nhập toàn bộ lời thoại hoặc nội dung của bài nghe vào đây...&#10;&#10;VD:&#10;A: Excuse me, could you tell me where Gate 12 is?&#10;B: Sure! Just go straight ahead and turn left at the information desk..."
              />
            </div>
          </div>

          {/* RIGHT: Câu hỏi (2 cols) */}
          <div className="col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">4</span>
                  Câu hỏi nghe hiểu
                  <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {questions.length}/10
                  </span>
                </h3>
                <button type="button" onClick={addQuestion}
                  className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs">
                  <Plus size={13} /> Thêm câu
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
                    <p className="text-xs text-slate-400 mt-0.5">Nhấn để thêm câu hỏi nghe hiểu</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
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
            </div>

            {/* Tips */}
            <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4 space-y-2">
              <p className="text-xs font-bold text-brand-700">💡 Lưu ý tạo bài nghe hiệu quả</p>
              <ul className="space-y-1 text-xs text-brand-800/80">
                <li>• Transcript giúp học viên đọc lại sau khi nghe</li>
                <li>• 4–6 câu hỏi là phù hợp với 1 bài nghe</li>
                <li>• Nên đa dạng loại câu hỏi: chủ đề, chi tiết, thái độ</li>
                <li>• Nhấn vào tiêu đề câu để mở/thu gọn chỉnh sửa</li>
              </ul>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}

export default ListeningFormPage
