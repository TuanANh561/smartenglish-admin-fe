import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Save,
  Trash2,
  Volume2,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import IpaInputField from '@/components/ui/IpaInputField'
import { vocabularies } from '@/mocks/data/vocabulary'
import { useAuthStore } from '@/store/authStore'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const PARTS_OF_SPEECH = [
  { value: 'Noun', label: 'Danh từ (Noun)' },
  { value: 'Verb', label: 'Động từ (Verb)' },
  { value: 'Adjective', label: 'Tính từ (Adjective)' },
  { value: 'Adverb', label: 'Trạng từ (Adverb)' },
  { value: 'Pronoun', label: 'Đại từ (Pronoun)' },
  { value: 'Preposition', label: 'Giới từ (Preposition)' },
  { value: 'Conjunction', label: 'Liên từ (Conjunction)' },
  { value: 'Interjection', label: 'Thán từ (Interjection)' },
]

const EMPTY_QUESTION = { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }

// ── Accordion Question Card ─────────────────────────────────────────────────
function QuestionCard({ question, index, isOpen, onToggle, onChange, onRemove }) {
  const hasContent = question.question.trim()

  return (
    <div className={`rounded-2xl border transition-all ${isOpen ? 'border-brand-300 bg-white shadow-md' : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'}`}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-xs font-bold">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${hasContent ? 'text-slate-800 font-medium' : 'text-slate-400 italic'}`}>
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
            onClick={(e) => { e.stopPropagation(); onRemove() }}
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
              value={question.question}
              onChange={(e) => onChange({ ...question, question: e.target.value })}
              placeholder="VD: Choose the correct meaning of 'serendipity':"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Các đáp án <span className="text-emerald-600 font-normal">(click vào ô vuông để chọn đáp án đúng)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {question.options.map((opt, optIdx) => (
                <div key={optIdx} className={`flex items-center gap-2 rounded-xl p-2.5 border transition-colors ${question.correctIndex === optIdx ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-white'}`}>
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
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Giải thích đáp án <span className="text-slate-400 font-normal">(không bắt buộc)</span></label>
            <Input
              value={question.explanation}
              onChange={(e) => onChange({ ...question, explanation: e.target.value })}
              placeholder="VD: 'Serendipity' means a fortunate accident, so option A is correct..."
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Form Page ──────────────────────────────────────────────────────────
function VocabularyFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isEditing = Boolean(id)

  const existingItem = isEditing ? vocabularies.find((v) => v.id === id) || vocabularies[0] : null

  const [form, setForm] = useState({
    word: existingItem?.word || '',
    pronunciation: existingItem?.pronunciation || '',
    partOfSpeech: existingItem?.partOfSpeech || 'Noun',
    cefrLevel: existingItem?.cefrLevel || 'B1',
    vietnameseMeaning: existingItem?.vietnameseMeaning || '',
    englishMeaning: existingItem?.englishMeaning || '',
    topic: existingItem?.topic || '',
    exampleEn: existingItem?.exampleEn || '',
    exampleVi: existingItem?.exampleVi || '',
    synonyms: Array.isArray(existingItem?.synonyms) ? existingItem.synonyms.join(', ') : (existingItem?.synonyms || ''),
    antonyms: Array.isArray(existingItem?.antonyms) ? existingItem.antonyms.join(', ') : (existingItem?.antonyms || ''),
  })

  const [questions, setQuestions] = useState(
    existingItem?.exercises?.length > 0
      ? existingItem.exercises
      : []
  )
  const [openQuestionIdx, setOpenQuestionIdx] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const addQuestion = () => {
    if (questions.length >= 10) { toast.error('Tối đa 10 câu hỏi bài tập'); return }
    const newIdx = questions.length
    setQuestions((prev) => [...prev, { ...EMPTY_QUESTION }])
    setOpenQuestionIdx(newIdx)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.word.trim()) { toast.error('Vui lòng nhập từ vựng'); return }
    if (!form.vietnameseMeaning.trim()) { toast.error('Vui lòng nhập nghĩa tiếng Việt'); return }

    setIsSaving(true)
    const validQuestions = questions.filter((q) => q.question.trim())

    setTimeout(() => {
      toast.success(isEditing ? `Đã cập nhật từ "${form.word}"` : `Đã thêm từ mới "${form.word}"`)
      setIsSaving(false)
      navigate('/hoc-lieu/tu-vung')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* ── Header bar ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-xs">
        <div className="mx-auto max-w-6xl flex items-center gap-4 px-6 py-3.5">
          <Link
            to="/hoc-lieu/tu-vung"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Quay lại Từ vựng
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex-1">
            <h1 className="text-base font-bold text-slate-900">
              {isEditing ? `Chỉnh sửa từ: "${existingItem?.word}"` : 'Thêm từ vựng mới'}
            </h1>
            <p className="text-xs text-slate-500">Kho từ vựng / {isEditing ? 'Chỉnh sửa' : 'Thêm mới'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/hoc-lieu/tu-vung"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              form="vocab-form"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white transition-colors shadow-xs cursor-pointer"
            >
              <Save size={15} />
              {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Thêm từ vựng'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <form id="vocab-form" onSubmit={handleSave}>
        <div className="mx-auto max-w-6xl px-6 py-6 grid grid-cols-5 gap-6">

          {/* ── LEFT: Thông tin từ (3 cols) ── */}
          <div className="col-span-3 space-y-5">

            {/* Card: Thông tin cơ bản */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-600 text-xs font-bold">1</span>
                Thông tin từ vựng
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Từ vựng *</label>
                    <Input value={form.word} onChange={set('word')} placeholder="VD: serendipity" required />
                  </div>
                  <IpaInputField
                    value={form.pronunciation}
                    onChange={(newIpa) => setForm((prev) => ({ ...prev, pronunciation: newIpa }))}
                    sourceWord={form.word}
                    onWordCorrect={(corrected) => setForm((prev) => ({ ...prev, word: corrected }))}
                    placeholder="VD: /ˌser.ənˈdɪp.ɪ.ti/"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Từ loại</label>
                  <Select value={form.partOfSpeech} onChange={set('partOfSpeech')}>
                    {PARTS_OF_SPEECH.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Cấp độ CEFR</label>
                  <Select value={form.cefrLevel} onChange={set('cefrLevel')}>
                    {CEFR_LEVELS.map((l) => <option key={l} value={l}>Cấp độ {l}</option>)}
                  </Select>
                </div>
                <div className="col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Nghĩa tiếng Việt *</label>
                  <Input value={form.vietnameseMeaning} onChange={set('vietnameseMeaning')} placeholder="VD: sự tình cờ may mắn" required />
                </div>
                <div className="col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Nghĩa tiếng Anh (định nghĩa)</label>
                  <Textarea rows={2} value={form.englishMeaning} onChange={set('englishMeaning')} placeholder="VD: the occurrence of events by chance in a happy way" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Chủ đề</label>
                  <Input value={form.topic} onChange={set('topic')} placeholder="VD: Emotions, Travel, Business..." />
                </div>
              </div>
            </div>

            {/* Card: Ví dụ & Đồng / Trái nghĩa */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700 text-xs font-bold">2</span>
                Ví dụ & Từ liên quan
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Câu ví dụ (Tiếng Anh)</label>
                  <Input value={form.exampleEn} onChange={set('exampleEn')} placeholder="VD: Finding that job was pure serendipity." />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Dịch câu ví dụ (Tiếng Việt)</label>
                  <Input value={form.exampleVi} onChange={set('exampleVi')} placeholder="VD: Tìm được việc đó hoàn toàn là may mắn." />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Từ đồng nghĩa</label>
                  <Input value={form.synonyms} onChange={set('synonyms')} placeholder="VD: luck, fortune (cách nhau bằng dấu phẩy)" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Từ trái nghĩa</label>
                  <Input value={form.antonyms} onChange={set('antonyms')} placeholder="VD: misfortune, bad luck" />
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT: Câu hỏi bài tập (2 cols) ── */}
          <div className="col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">3</span>
                  Câu hỏi bài tập
                  <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {questions.length}/10
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
                >
                  <Plus size={13} />
                  Thêm câu
                </button>
              </div>

              {questions.length === 0 ? (
                <div
                  onClick={addQuestion}
                  className="flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center text-slate-400 hover:border-brand-300 hover:bg-brand-50/30 transition-colors cursor-pointer"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Plus size={20} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Chưa có câu hỏi bài tập</p>
                    <p className="text-xs text-slate-400 mt-0.5">Nhấn để thêm câu hỏi trắc nghiệm đầu tiên</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {questions.map((q, idx) => (
                    <QuestionCard
                      key={idx}
                      question={q}
                      index={idx}
                      isOpen={openQuestionIdx === idx}
                      onToggle={() => setOpenQuestionIdx(openQuestionIdx === idx ? null : idx)}
                      onChange={(updated) => setQuestions((prev) => prev.map((x, i) => i === idx ? updated : x))}
                      onRemove={() => {
                        setQuestions((prev) => prev.filter((_, i) => i !== idx))
                        setOpenQuestionIdx(null)
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Tips card */}
            <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4 space-y-2">
              <p className="text-xs font-bold text-brand-700">💡 Gợi ý tạo bài tập hiệu quả</p>
              <ul className="space-y-1 text-xs text-brand-800/80">
                <li>• Nhấn vào ô vuông để chọn đáp án đúng (màu xanh)</li>
                <li>• Nên thêm 3–5 câu hỏi đa dạng: nghĩa, ví dụ, từ loại</li>
                <li>• Câu hỏi để trống sẽ không được lưu</li>
              </ul>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}

export default VocabularyFormPage
