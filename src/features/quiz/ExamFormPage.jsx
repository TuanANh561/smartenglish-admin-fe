import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
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
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuthStore } from '@/store/authStore'
import {
  createExam,
  getExamById,
  updateExam,
  CEFR_LEVELS,
  EXAM_CATEGORIES,
} from './examApi'

const EMPTY_QUESTION = {
  questionText: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
  point: 10,
  passageText: '',
}

function QuestionCard({ question, index, isOpen, onToggle, onChange, onRemove }) {
  const hasContent = question.questionText?.trim()

  return (
    <div className={`rounded-2xl border transition-all ${isOpen ? 'border-brand-300 bg-white shadow-md' : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'}`}>
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none" onClick={onToggle}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-xs font-bold">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${hasContent ? 'text-slate-800 font-medium' : 'text-slate-400 italic'}`}>
            {hasContent ? question.questionText : `Câu hỏi ${index + 1} — chưa nhập nội dung`}
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
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Nội dung câu hỏi *</label>
            <Textarea
              rows={2}
              autoResize
              value={question.questionText}
              onChange={(e) => onChange({ ...question, questionText: e.target.value })}
              placeholder="VD: What is the main topic of the conversation?..."
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

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
            <div className="sm:col-span-9">
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
            <div className="sm:col-span-3">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Điểm số</label>
              <Input
                type="number"
                min={1}
                max={100}
                value={question.point ?? 10}
                onChange={(e) => onChange({ ...question, point: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ExamFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isEditing = Boolean(id)

  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'TOEIC_MINI',
    cefrLevel: 'B1',
    durationMinutes: 45,
    passingScore: 50,
    xpReward: 50,
    status: 'published',
  })

  const [questions, setQuestions] = useState([])
  const [openQuestionIdx, setOpenQuestionIdx] = useState(0)

  // Load existing exam if editing
  useEffect(() => {
    if (!isEditing) return

    let isMounted = true
    setIsLoading(true)

    getExamById(id)
      .then((data) => {
        if (!isMounted || !data) return
        setForm({
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'GENERAL',
          cefrLevel: data.cefrLevel || 'B1',
          durationMinutes: data.durationMinutes ?? 45,
          passingScore: data.passingScore ?? 50,
          xpReward: data.xpReward ?? 50,
          status: data.status || 'published',
        })

        if (Array.isArray(data.questions) && data.questions.length > 0) {
          const mapped = data.questions.map((q, idx) => {
            const rawOpts = Array.isArray(q.options) ? q.options : ['', '', '', '']
            const cleanOpts = rawOpts.map((opt) => {
              if (typeof opt === 'object' && opt !== null) return opt.text || ''
              return String(opt).replace(/^[A-D]\.\s*/, '')
            })
            while (cleanOpts.length < 4) cleanOpts.push('')

            let cIdx = 0
            if (q.correctAnswer) {
              const letterIdx = ['A', 'B', 'C', 'D'].indexOf(String(q.correctAnswer).trim().toUpperCase())
              if (letterIdx >= 0) cIdx = letterIdx
            }

            return {
              questionText: q.questionText || q.question || '',
              options: cleanOpts.slice(0, 4),
              correctIndex: cIdx,
              explanation: q.explanation || '',
              point: q.point ?? 10,
            }
          })
          setQuestions(mapped)
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải chi tiết bài thi:', err)
        toast.error('Không tìm thấy thông tin bài thi')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => { isMounted = false }
  }, [id, isEditing])

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const addQuestion = () => {
    if (questions.length >= 200) {
      toast.error('Tối đa 200 câu hỏi')
      return
    }
    const newIdx = questions.length
    setQuestions((prev) => [...prev, { ...EMPTY_QUESTION }])
    setOpenQuestionIdx(newIdx)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tên đề thi')
      return
    }

    setIsSaving(true)
    try {
      const formattedQuestions = questions
        .filter((q) => q.questionText?.trim())
        .map((q, idx) => ({
          id: idx + 1,
          questionNumber: idx + 1,
          questionText: q.questionText.trim(),
          options: q.options.map((opt, i) => ({
            id: String.fromCharCode(65 + i),
            text: opt.trim(),
          })),
          correctAnswer: String.fromCharCode(65 + (q.correctIndex || 0)),
          explanation: q.explanation?.trim() || '',
          point: q.point ? Number(q.point) : 10,
        }))

      const payload = {
        title: form.title.trim(),
        description: form.description?.trim() || '',
        category: form.category || 'GENERAL',
        cefrLevel: form.cefrLevel || 'B1',
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : 45,
        totalQuestions: formattedQuestions.length,
        passingScore: form.passingScore ? Number(form.passingScore) : 0,
        xpReward: form.xpReward ? Number(form.xpReward) : 50,
        questions: formattedQuestions,
        status: form.status || 'published',
        authorName: user?.displayName || 'Quản trị viên Hệ thống',
        authorEmail: user?.email || 'admin@smartenglish.vn',
      }

      if (isEditing) {
        await updateExam(id, payload)
        toast.success(`Đã cập nhật bài thi "${payload.title}"`)
      } else {
        await createExam(payload)
        toast.success(`Đã tạo bài thi mới "${payload.title}"`)
      }

      navigate('/app/hoc-lieu/bai-kiem-tra')
    } catch (err) {
      console.error('Lỗi khi lưu bài thi:', err)
      toast.error(err?.response?.data?.message || 'Lưu bài thi thất bại. Vui lòng thử lại!')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner text="Đang tải dữ liệu bài thi..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-xs">
        <div className="mx-auto max-w-6xl flex items-center gap-4 px-6 py-3.5">
          <Link
            to="/app/hoc-lieu/bai-kiem-tra"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} /> Quay lại Bài thi
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex-1">
            <h1 className="text-base font-bold text-slate-900">
              {isEditing ? `Chỉnh sửa: "${form.title || 'Bài thi'}"` : 'Tạo đề thi / bài kiểm tra mới'}
            </h1>
            <p className="text-xs text-slate-500">Học liệu / Bài thi / {isEditing ? 'Chỉnh sửa' : 'Thêm mới'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/app/hoc-lieu/bai-kiem-tra"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              form="exam-form"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white transition-colors shadow-xs cursor-pointer"
            >
              <Save size={15} />
              {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo bài thi'}
            </button>
          </div>
        </div>
      </div>

      {/* Body Form */}
      <form id="exam-form" onSubmit={handleSave}>
        <div className="mx-auto max-w-6xl px-6 py-6 space-y-6">
          {/* Card 1: Thông tin đề thi */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-600 text-xs font-bold">1</span>
              Thông tin đề thi & cấu hình
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tên đề thi / bài kiểm tra *</label>
                <Input
                  value={form.title}
                  onChange={set('title')}
                  placeholder="VD: ETS TOEIC 2024 Practice Test 1..."
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Thể loại bài thi</label>
                <Select value={form.category} onChange={set('category')}>
                  {EXAM_CATEGORIES.filter((c) => c.value !== 'ALL').map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Cấp độ CEFR</label>
                <Select value={form.cefrLevel} onChange={set('cefrLevel')}>
                  {CEFR_LEVELS.map((l) => (
                    <option key={l} value={l}>Cấp độ {l}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Thời gian làm bài (phút)</label>
                <Input
                  type="number"
                  min={1}
                  max={300}
                  value={form.durationMinutes}
                  onChange={set('durationMinutes')}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Điểm đạt (Passing score)</label>
                <Input
                  type="number"
                  min={0}
                  value={form.passingScore}
                  onChange={set('passingScore')}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Thưởng XP</label>
                <Input
                  type="number"
                  min={0}
                  max={1000}
                  value={form.xpReward}
                  onChange={set('xpReward')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Mô tả bài thi</label>
                <Textarea
                  rows={2}
                  autoResize
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Mô tả tóm tắt nội dung, cấu trúc và đối tượng bài thi..."
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Trạng thái xuất bản</label>
                <Select value={form.status} onChange={set('status')}>
                  <option value="published">Xuất bản ngay (Published)</option>
                  <option value="draft">Bản nháp (Draft)</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Card 2: Danh sách câu hỏi */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">2</span>
                Danh sách câu hỏi bài thi
                <span className="ml-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {questions.length} câu hỏi
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
                className="flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-slate-200 py-12 text-center hover:border-brand-300 hover:bg-brand-50/30 transition-colors cursor-pointer"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Plus size={20} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Chưa có câu hỏi nào trong đề thi</p>
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
          </div>
        </div>
      </form>
    </div>
  )
}
