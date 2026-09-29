import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { GRAMMAR_TOPICS } from '@/mocks/data/grammar'
import { useAuthStore } from '@/store/authStore'
import GrammarQuestionCard from './components/GrammarQuestionCard'
import {
  getGrammarLessonById,
  createGrammarLesson,
  updateGrammarLesson,
  getGrammarTopics,
} from './grammarLessonApi'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const TOPIC_LIST = GRAMMAR_TOPICS.filter((t) => t !== 'Tất cả chủ điểm')

const EMPTY_QUESTION = {
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
}

// ── Main Form Page ──────────────────────────────────────────────────────────
function GrammarFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isEditing = Boolean(id)

  const [isLoading, setIsLoading] = useState(isEditing)
  const [topicList, setTopicList] = useState(TOPIC_LIST)
  const [editTitle, setEditTitle] = useState('')

  const [form, setForm] = useState({
    title: '',
    topic: 'Tenses',
    level: 'B1',
    status: 'published',
    formula: '',
    description: '',
    keyRules: '',
    examples: [{ en: '', vi: '' }],
  })

  const [questions, setQuestions] = useState([
    {
      question: "I haven't seen him ___ last Monday.",
      options: ['for', 'since', 'in', 'ago'],
      correctIndex: 1,
      explanation: 'Dùng "since" với mốc thời gian xác định trong quá khứ.',
    },
  ])
  const [openQuestionIdx, setOpenQuestionIdx] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // Load danh sách chủ điểm
  useEffect(() => {
    getGrammarTopics()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setTopicList(res.filter((t) => t !== 'Tất cả chủ điểm'))
        }
      })
      .catch((err) => console.warn('Không tải được topics:', err))
  }, [])

  // Load chi tiết bài học khi chỉnh sửa
  useEffect(() => {
    if (!isEditing) return
    setIsLoading(true)
    getGrammarLessonById(id)
      .then((item) => {
        if (!item) return
        setEditTitle(item.title || '')
        setForm({
          title: item.title || '',
          topic: item.topic || 'Tenses',
          level: item.cefrLevel || item.level || 'B1',
          status: item.status || 'published',
          formula: item.formula || '',
          description: item.description || '',
          keyRules: Array.isArray(item.keyRules)
            ? item.keyRules.join('\n')
            : (item.keyRules || ''),
          examples: item.examples?.length
            ? item.examples
            : [{ en: '', vi: '' }],
        })
        if (item.sampleExercises && item.sampleExercises.length > 0) {
          setQuestions(
            item.sampleExercises.map((ex) => ({
              question: ex.question || '',
              options: ex.options?.length === 4
                ? ex.options
                : [ex.answer || 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
              correctIndex: ex.correctIndex ?? 0,
              explanation: ex.explanation || '',
            }))
          )
        }
      })
      .catch((err) => {
        toast.error('Không tìm thấy bài học ngữ pháp: ' + (err.message || ''))
      })
      .finally(() => setIsLoading(false))
  }, [id, isEditing])

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleAddExample = () => {
    setForm((prev) => ({
      ...prev,
      examples: [...prev.examples, { en: '', vi: '' }],
    }))
  }

  const handleUpdateExample = (idx, field, val) => {
    setForm((prev) => {
      const nextEx = [...prev.examples]
      nextEx[idx] = { ...nextEx[idx], [field]: val }
      return { ...prev, examples: nextEx }
    })
  }

  const handleRemoveExample = (idx) => {
    setForm((prev) => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== idx),
    }))
  }

  const addQuestion = () => {
    if (questions.length >= 10) {
      toast.error('Tối đa 10 câu hỏi bài tập cho bài học này')
      return
    }
    const newIdx = questions.length
    setQuestions((prev) => [...prev, { ...EMPTY_QUESTION }])
    setOpenQuestionIdx(newIdx)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tên bài học ngữ pháp')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        topic: form.topic,
        cefrLevel: form.level,
        status: form.status,
        formula: form.formula.trim(),
        description: form.description.trim(),
        keyRules: form.keyRules.split('\n').map((s) => s.trim()).filter(Boolean),
        examples: form.examples.filter((ex) => ex.en.trim() || ex.vi.trim()),
        sampleExercises: questions
          .filter((q) => q.question.trim())
          .map((q) => ({
            question: q.question.trim(),
            options: q.options,
            correctIndex: q.correctIndex,
            answer: q.options[q.correctIndex] || '',
            explanation: q.explanation?.trim() || '',
            type: 'multiple-choice',
          })),
        authorName: user?.displayName || 'Admin',
        authorEmail: user?.email || 'admin@smartenglish.vn',
      }

      if (isEditing) {
        await updateGrammarLesson(id, payload)
        toast.success(`Đã cập nhật bài học "${payload.title}"`)
      } else {
        await createGrammarLesson(payload)
        toast.success(`Đã tạo bài học mới "${payload.title}"`)
      }
      navigate('/app/hoc-lieu/ngu-phap')
    } catch (err) {
      console.error('Lỗi khi lưu bài học:', err)
      toast.error('Không thể lưu bài học ngữ pháp: ' + (err?.message || ''))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner text="Đang tải dữ liệu bài học ngữ pháp..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* ── Header bar ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-xs">
        <div className="mx-auto max-w-6xl flex items-center gap-4 px-6 py-3.5">
          <Link
            to="/app/hoc-lieu/ngu-phap"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Quay lại Ngữ pháp
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex-1">
            <h1 className="text-base font-bold text-slate-900">
              {isEditing ? `Chỉnh sửa: "${editTitle || form.title}"` : 'Thêm bài học ngữ pháp mới'}
            </h1>
            <p className="text-xs text-slate-500">
              Quản lý học liệu / Ngữ pháp / {isEditing ? 'Chỉnh sửa' : 'Thêm mới'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/app/hoc-lieu/ngu-phap"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              form="grammar-form"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white transition-colors shadow-xs cursor-pointer"
            >
              <Save size={15} />
              {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo bài học'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Body Form ── */}
      <form id="grammar-form" onSubmit={handleSave}>
        <div className="mx-auto max-w-6xl px-6 py-6 space-y-6">
          {/* ── TOP: Lý thuyết ngữ pháp (Card 1 & Card 2, 3) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Card 1: Thông tin cơ bản (6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-600 text-xs font-bold">
                    1
                  </span>
                  Thông tin bài học
                </h3>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Tên bài học ngữ pháp *
                  </label>
                  <Input
                    value={form.title}
                    onChange={set('title')}
                    placeholder="VD: Present Perfect vs Past Simple..."
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Chủ điểm ngữ pháp
                    </label>
                    <Select value={form.topic} onChange={set('topic')}>
                      {TOPIC_LIST.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Cấp độ CEFR
                    </label>
                    <Select value={form.level} onChange={set('level')}>
                      {CEFR_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          Cấp độ {lvl}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Trạng thái
                    </label>
                    <Select value={form.status} onChange={set('status')}>
                      <option value="published">Đã xuất bản (Published)</option>
                      <option value="draft">Bản nháp (Draft)</option>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Công thức / Cấu trúc tổng quát
                  </label>
                  <Input
                    value={form.formula}
                    onChange={set('formula')}
                    placeholder="VD: S + have/has + V3/ed vs S + V2/ed..."
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Mô tả bài học & ngữ cảnh sử dụng
                  </label>
                  <Textarea
                    rows={2}
                    autoResize
                    value={form.description}
                    onChange={set('description')}
                    placeholder="Mô tả mục tiêu và cách phân biệt cấu trúc ngữ pháp này..."
                  />
                </div>
              </div>
            </div>

            {/* Right column: Card 2 & Card 3 (6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              {/* Card 2: Quy tắc trọng tâm */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-600 text-xs font-bold">
                    2
                  </span>
                  Quy tắc trọng tâm & Dấu hiệu nhận biết
                </h3>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Mỗi dòng là một quy tắc (hệ thống sẽ tự tạo gạch đầu dòng trực quan)
                  </label>
                  <Textarea
                    rows={4}
                    autoResize
                    value={form.keyRules}
                    onChange={set('keyRules')}
                    placeholder="VD:&#10;Present Perfect dùng với: since, for, already, yet, just, ever, never...&#10;Past Simple dùng với: yesterday, ago, last week, in 1999..."
                  />
                </div>
              </div>

              {/* Card 3: Ví dụ minh họa */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-600 text-xs font-bold">
                      3
                    </span>
                    Ví dụ minh họa ({form.examples.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddExample}
                    className="flex items-center gap-1 rounded-xl bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-100 transition-colors cursor-pointer"
                  >
                    <Plus size={13} /> Thêm ví dụ
                  </button>
                </div>

                <div className="space-y-3">
                  {form.examples.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600">Ví dụ {exIdx + 1}</span>
                        {form.examples.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveExample(exIdx)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            title="Xóa ví dụ"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <Input
                        value={ex.en}
                        onChange={(e) => handleUpdateExample(exIdx, 'en', e.target.value)}
                        placeholder="VD: I have lived in Hanoi for 5 years."
                      />
                      <Input
                        value={ex.vi}
                        onChange={(e) => handleUpdateExample(exIdx, 'vi', e.target.value)}
                        placeholder="Dịch nghĩa: Tôi đã sống ở Hà Nội được 5 năm."
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── BOTTOM: Bộ câu hỏi bài tập trắc nghiệm (FULL ROW) ── */}
          <div className="w-full space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                      ✓
                    </span>
                    Bài tập trắc nghiệm củng cố
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {questions.length}/10 câu hỏi luyện tập
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addQuestion}
                  disabled={questions.length >= 10}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus size={13} /> Thêm câu
                </button>
              </div>

              {/* Accordion List */}
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <GrammarQuestionCard
                    key={idx}
                    question={q}
                    index={idx}
                    isOpen={openQuestionIdx === idx}
                    onToggle={() =>
                      setOpenQuestionIdx(openQuestionIdx === idx ? null : idx)
                    }
                    onChange={(updated) => {
                      const next = [...questions]
                      next[idx] = updated
                      setQuestions(next)
                    }}
                    onRemove={() => {
                      setQuestions(questions.filter((_, i) => i !== idx))
                      if (openQuestionIdx === idx) setOpenQuestionIdx(null)
                    }}
                  />
                ))}

                {questions.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center">
                    <HelpCircle size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs text-slate-400 font-medium">
                      Chưa có câu hỏi bài tập nào
                    </p>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="mt-2 text-xs font-bold text-brand-600 hover:underline cursor-pointer"
                    >
                      + Thêm câu hỏi đầu tiên
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tip card */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-blue-900">
                <Lightbulb size={14} className="text-blue-600" />
                Mẹo thiết kế câu hỏi ngữ pháp:
              </p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Bấm vào ô vuông bên cạnh đáp án để đánh dấu đáp án đúng.</li>
                <li>Học viên sẽ làm bài tập này ngay sau phần lý thuyết.</li>
                <li>Thêm phần giải thích để AI hỗ trợ học viên khi làm sai.</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default GrammarFormPage
