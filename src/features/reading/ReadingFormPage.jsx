import { useEffect, useState } from 'react'
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
  Sparkles,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuthStore } from '@/store/authStore'
import {
  createReadingPassage,
  getReadingPassageById,
  getReadingTopics,
  updateReadingPassage,
  CEFR_LEVELS,
} from './readingApi'

const DEFAULT_TOPICS = [
  'Business', 'Science', 'Technology', 'Culture', 'Travel',
  'Health', 'Environment', 'Education', 'Sports', 'Arts', 'History', 'Society', 'General',
]

const EMPTY_QUESTION = {
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
}

const EMPTY_VOCAB = {
  word: '',
  meaningVi: '',
  ipaUs: '',
  example: '',
}

// ── Accordion Question Card ─────────────────────────────────────────────────
function QuestionCard({ question, index, isOpen, onToggle, onChange, onRemove }) {
  const hasContent = question.question?.trim()
  return (
    <div className={`rounded-2xl border transition-all ${isOpen ? 'border-brand-300 bg-white shadow-md' : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'}`}>
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none" onClick={onToggle}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-xs font-bold">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${hasContent ? 'text-slate-800 font-medium' : 'text-slate-400 italic'}`}>
            {hasContent ? question.question : `Câu hỏi ${index + 1} — chưa nhập nội dung`}
          </p>
          {!isOpen && question.options?.[question.correctIndex] && (
            <p className="text-xs text-emerald-600 mt-0.5">
              ✓ Đáp án {String.fromCharCode(65 + question.correctIndex)}: {question.options[question.correctIndex]}
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
      {isOpen && (
        <div className="px-4 pb-4 space-y-3.5 border-t border-slate-100 pt-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Câu hỏi đọc hiểu *</label>
            <Textarea
              rows={2}
              autoResize
              value={question.question}
              onChange={(e) => onChange({ ...question, question: e.target.value })}
              placeholder="VD: According to the passage, what is the main purpose of..."
              required
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

  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)
  const [topics, setTopics] = useState(DEFAULT_TOPICS)

  const [form, setForm] = useState({
    titleEn: '',
    titleVi: '',
    description: '',
    topic: 'Technology',
    level: 'B1',
    content: '',
    estimatedMin: 5,
    xpReward: 30,
    status: 'published',
  })

  const [keyVocabulary, setKeyVocabulary] = useState([])
  const [questions, setQuestions] = useState([])
  const [openQuestionIdx, setOpenQuestionIdx] = useState(0)

  // Fetch topics
  useEffect(() => {
    getReadingTopics()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setTopics(Array.from(new Set([...res, ...DEFAULT_TOPICS])))
        }
      })
      .catch(() => {})
  }, [])

  // Load existing passage if editing
  useEffect(() => {
    if (!isEditing) return

    let isMounted = true
    setIsLoading(true)

    getReadingPassageById(id)
      .then((data) => {
        if (!isMounted || !data) return
        setForm({
          titleEn: data.titleEn || '',
          titleVi: data.titleVi || '',
          description: data.description || '',
          topic: data.topic || 'General',
          level: data.cefrLevel || 'B1',
          content: data.passageText || '',
          estimatedMin: data.estimatedMin ?? 5,
          xpReward: data.xpReward ?? 30,
          status: data.status || 'published',
        })

        // Map vocabulary
        if (Array.isArray(data.keyVocabulary) && data.keyVocabulary.length > 0) {
          setKeyVocabulary(data.keyVocabulary)
        }

        // Map questions
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          const mappedQuestions = data.questions.map((q) => {
            const rawOpts = Array.isArray(q.options) ? q.options : ['', '', '', '']
            const cleanOpts = rawOpts.map((opt) => String(opt).replace(/^[A-D]\.\s*/, ''))
            while (cleanOpts.length < 4) cleanOpts.push('')

            let cIdx = 0
            if (q.correctAnswer) {
              const letterIdx = ['A', 'B', 'C', 'D'].indexOf(String(q.correctAnswer).trim().toUpperCase())
              if (letterIdx >= 0) cIdx = letterIdx
            } else if (typeof q.correctIndex === 'number') {
              cIdx = q.correctIndex
            }

            return {
              question: q.questionText || q.question || '',
              options: cleanOpts.slice(0, 4),
              correctIndex: cIdx,
              explanation: q.explanationVi || q.explanation || '',
            }
          })
          setQuestions(mappedQuestions)
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải chi tiết bài đọc:', err)
        toast.error('Không tìm thấy thông tin bài đọc')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id, isEditing])

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))
  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0
  const autoEstimatedMin = Math.max(1, Math.round(wordCount / 180))

  const addQuestion = () => {
    if (questions.length >= 15) {
      toast.error('Tối đa 15 câu hỏi đọc hiểu')
      return
    }
    const newIdx = questions.length
    setQuestions((prev) => [...prev, { ...EMPTY_QUESTION }])
    setOpenQuestionIdx(newIdx)
  }

  const addVocabItem = () => {
    setKeyVocabulary((prev) => [...prev, { ...EMPTY_VOCAB }])
  }

  const updateVocabItem = (idx, field, val) => {
    setKeyVocabulary((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item)),
    )
  }

  const removeVocabItem = (idx) => {
    setKeyVocabulary((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.titleEn.trim()) {
      toast.error('Vui lòng nhập tiêu đề tiếng Anh cho bài đọc')
      return
    }
    if (!form.content.trim()) {
      toast.error('Vui lòng nhập nội dung đoạn văn bài đọc')
      return
    }

    setIsSaving(true)
    try {
      // Build questions for backend
      const formattedQuestions = questions
        .filter((q) => q.question?.trim())
        .map((q, idx) => ({
          id: idx + 1,
          questionText: q.question.trim(),
          options: q.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt.trim()}`),
          correctAnswer: String.fromCharCode(65 + (q.correctIndex || 0)),
          explanationVi: q.explanation?.trim() || '',
        }))

      // Build key vocabulary
      const formattedVocabulary = keyVocabulary
        .filter((v) => v.word?.trim())
        .map((v) => ({
          word: v.word.trim(),
          meaningVi: v.meaningVi?.trim() || '',
          ipaUs: v.ipaUs?.trim() || '',
          example: v.example?.trim() || '',
        }))

      const payload = {
        titleEn: form.titleEn.trim(),
        titleVi: form.titleVi?.trim() || form.titleEn.trim(),
        topic: form.topic || 'General',
        cefrLevel: form.level || 'B1',
        passageText: form.content.trim(),
        description: form.description?.trim() || '',
        estimatedMin: form.estimatedMin ? Number(form.estimatedMin) : autoEstimatedMin,
        xpReward: form.xpReward ? Number(form.xpReward) : 30,
        keyVocabulary: formattedVocabulary,
        questions: formattedQuestions,
        status: form.status || 'published',
        authorName: user?.displayName || 'Quản trị viên Hệ thống',
        authorEmail: user?.email || 'admin@smartenglish.vn',
      }

      if (isEditing) {
        await updateReadingPassage(id, payload)
        toast.success(`Đã cập nhật bài đọc "${payload.titleEn}"`)
      } else {
        await createReadingPassage(payload)
        toast.success(`Đã tạo bài đọc mới "${payload.titleEn}"`)
      }

      navigate('/app/hoc-lieu/bai-doc')
    } catch (err) {
      console.error('Lỗi khi lưu bài đọc:', err)
      toast.error(err?.response?.data?.message || 'Lưu bài đọc thất bại. Vui lòng thử lại!')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner text="Đang tải dữ liệu bài đọc..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-xs">
        <div className="mx-auto max-w-6xl flex items-center gap-4 px-6 py-3.5">
          <Link
            to="/app/hoc-lieu/bai-doc"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} /> Quay lại Bài đọc
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex-1">
            <h1 className="text-base font-bold text-slate-900">
              {isEditing ? `Chỉnh sửa: "${form.titleEn || 'Bài đọc'}"` : 'Thêm bài đọc hiểu mới'}
            </h1>
            <p className="text-xs text-slate-500">Học liệu / Bài đọc hiểu / {isEditing ? 'Chỉnh sửa' : 'Thêm mới'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/app/hoc-lieu/bai-doc"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              form="reading-form"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white transition-colors shadow-xs cursor-pointer"
            >
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
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tiêu đề tiếng Anh *</label>
                <Input
                  value={form.titleEn}
                  onChange={set('titleEn')}
                  placeholder="VD: The Future of Renewable Energy..."
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tiêu đề tiếng Việt</label>
                <Input
                  value={form.titleVi}
                  onChange={set('titleVi')}
                  placeholder="VD: Tương lai của Năng lượng Tái tạo..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Chủ đề</label>
                  <Select value={form.topic} onChange={set('topic')}>
                    {topics.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Cấp độ CEFR</label>
                  <Select value={form.level} onChange={set('level')}>
                    {CEFR_LEVELS.map((l) => <option key={l} value={l}>Cấp độ {l}</option>)}
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Thời gian đọc (phút)</label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={form.estimatedMin}
                    onChange={set('estimatedMin')}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Thưởng XP</label>
                  <Input
                    type="number"
                    min={5}
                    max={200}
                    value={form.xpReward}
                    onChange={set('xpReward')}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Trạng thái xuất bản</label>
                <Select value={form.status} onChange={set('status')}>
                  <option value="published">Xuất bản ngay (Published)</option>
                  <option value="draft">Bản nháp (Draft)</option>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Mô tả tóm tắt</label>
                <Textarea
                  rows={2}
                  autoResize
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Tóm tắt ngắn gọn nội dung bài đọc..."
                />
              </div>
            </div>

            {/* Card 2: Nội dung bài đọc (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700 text-xs font-bold">2</span>
                  Nội dung đoạn văn đọc hiểu *
                </h3>
                {wordCount > 0 && (
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <FileText size={12} /> {wordCount} từ
                    </span>
                    <span>~{autoEstimatedMin} phút đọc</span>
                  </div>
                )}
              </div>
              <Textarea
                rows={14}
                autoResize
                value={form.content}
                onChange={set('content')}
                placeholder="Nhập hoặc dán toàn bộ văn bản tiếng Anh vào đây..."
                required
              />
            </div>
          </div>

          {/* MIDDLE ROW: Card: Từ vựng chủ chốt (Vocabulary) */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700 text-xs font-bold">3</span>
                Từ vựng trọng tâm (Key Vocabulary)
                <span className="ml-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {keyVocabulary.length} từ
                </span>
              </h3>
              <button
                type="button"
                onClick={addVocabItem}
                className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <Plus size={14} /> Thêm từ mới
              </button>
            </div>

            {keyVocabulary.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">
                Chưa thêm từ vựng nào. Nhấn &ldquo;Thêm từ mới&rdquo; để ghi chú các từ vựng cốt lõi cho bài đọc này.
              </p>
            ) : (
              <div className="space-y-2.5">
                {keyVocabulary.map((v, idx) => (
                  <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 rounded-xl border border-slate-200 p-2.5 bg-slate-50/50">
                    <input
                      type="text"
                      placeholder="Từ vựng (VD: sustainable)"
                      value={v.word}
                      onChange={(e) => updateVocabItem(idx, 'word', e.target.value)}
                      className="w-full sm:w-1/4 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-brand-500"
                    />
                    <input
                      type="text"
                      placeholder="Phiên âm IPA (/səˈsteɪnəbl/)"
                      value={v.ipaUs}
                      onChange={(e) => updateVocabItem(idx, 'ipaUs', e.target.value)}
                      className="w-full sm:w-1/4 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-brand-500 font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Nghĩa tiếng Việt (bền vững)"
                      value={v.meaningVi}
                      onChange={(e) => updateVocabItem(idx, 'meaningVi', e.target.value)}
                      className="w-full sm:w-1/3 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeVocabItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Xóa từ"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BOTTOM ROW: Card 4: Câu hỏi đọc hiểu */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">4</span>
                Câu hỏi đọc hiểu
                <span className="ml-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {questions.length}/15
                </span>
              </h3>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
              >
                <Plus size={14} /> Thêm câu hỏi
              </button>
            </div>

            {questions.length === 0 ? (
              <div
                onClick={addQuestion}
                className="flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center hover:border-brand-300 hover:bg-brand-50/30 transition-colors cursor-pointer"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Plus size={20} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Chưa có câu hỏi đọc hiểu</p>
                  <p className="text-xs text-slate-400 mt-0.5">Nhấn để thêm câu hỏi trắc nghiệm A-B-C-D</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <QuestionCard
                    key={idx}
                    question={q}
                    index={idx}
                    isOpen={openQuestionIdx === idx}
                    onToggle={() => setOpenQuestionIdx(openQuestionIdx === idx ? null : idx)}
                    onChange={(updated) => setQuestions((prev) => prev.map((x, i) => (i === idx ? updated : x)))}
                    onRemove={() => {
                      setQuestions((prev) => prev.filter((_, i) => i !== idx))
                      setOpenQuestionIdx(null)
                    }}
                  />
                ))}
              </div>
            )}

            <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-brand-800">
                <span className="font-bold">💡 Lưu ý:</span>
                <span>Câu hỏi bám sát đoạn văn · Mỗi câu có 4 đáp án A/B/C/D · Đánh dấu ô vuông xanh cho đáp án đúng.</span>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}

export default ReadingFormPage
