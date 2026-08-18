import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  ArchiveRestore,
  ArrowLeft,
  BookOpen,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import SearchInput from '@/components/ui/SearchInput'
import Select from '@/components/ui/Select'
import Tabs from '@/components/ui/Tabs'
import Textarea from '@/components/ui/Textarea'
import {
  approveAIContent,
  getAIContentRecords,
  rejectAIContent,
  restoreAIContent,
  revokeAIContent,
  saveGeminiContent,
  softDeleteAIContent,
  updateAIContent,
} from './aiContentService'
import {
  generateCloze,
  generateReading,
  generateQuiz,
  GeminiServiceError,
} from './geminiService'
import { useAuthStore } from '@/store/authStore'

const TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'reading', label: 'Bài đọc' },
  { value: 'quiz', label: 'Bài kiểm tra' },
  { value: 'others', label: 'Khác' },
]

const CONTENT_TYPE_OPTIONS = [
  { value: 'reading', label: 'Bài đọc' },
  { value: 'quiz', label: 'Bài kiểm tra' },
  { value: 'toeic_part_5', label: 'TOEIC Part 5' },
  { value: 'toeic_part_6', label: 'TOEIC Part 6' },
  { value: 'toeic_part_7', label: 'TOEIC Part 7' },
  { value: 'cloze_sentence', label: 'Điền khuyết câu' },
  { value: 'cloze_paragraph', label: 'Điền khuyết đoạn văn' },
]

const TYPE_LABELS = {
  reading: 'Bài đọc',
  quiz: 'Bài kiểm tra',
  toeic_part_5: 'TOEIC Part 5',
  toeic_part_6: 'TOEIC Part 6',
  toeic_part_7: 'TOEIC Part 7',
  cloze_sentence: 'Điền khuyết câu',
  cloze_paragraph: 'Điền khuyết đoạn văn',
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'GENERATING', label: 'Đang tạo' },
  { value: 'PENDING_REVIEW', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
  { value: 'DELETED', label: 'Đã xóa' },
]

const TYPE_ICON = {
  reading: BookOpen,
  quiz: ClipboardList,
  toeic_part_5: ClipboardList,
  toeic_part_6: ClipboardList,
  toeic_part_7: BookOpen,
  cloze_sentence: ClipboardList,
  cloze_paragraph: ClipboardList,
}

const STATUS_BADGE = {
  PENDING_REVIEW: { label: 'Chờ duyệt', tone: 'warning' },
  APPROVED: { label: 'Đã duyệt', tone: 'success' },
  REJECTED: { label: 'Từ chối', tone: 'danger' },
  GENERATING: { label: 'Đang tạo', tone: 'info' },
  DELETED: { label: 'Đã xóa', tone: 'danger' },
}

function confidenceTone(score) {
  if (score >= 90) return 'success'
  if (score >= 80) return 'info'
  if (score >= 70) return 'warning'
  return 'danger'
}

/* ─────────────────────────────────────────
   DETAIL VIEW
───────────────────────────────────────── */
function DetailView({ item, onBack, onEdit, onApprove, onReject, onRevoke, onDelete, onRestore, canManage }) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const questions = item.questions || []
  const q = questions[questionIndex] ?? null

  const isCorrect = (idx) => {
    if (!q?.correctAnswer) return false
    return idx === q.correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-navy-700"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={STATUS_BADGE[item.status]?.tone ?? 'info'}>
            {STATUS_BADGE[item.status]?.label ?? item.status}
          </Badge>
          {canManage ? (
            <Badge tone={confidenceTone(item.confidenceScore ?? 92)}>
              Độ tin cậy {item.confidenceScore ?? 92}%
            </Badge>
          ) : (
            <Badge tone="info">Chỉ xem</Badge>
          )}
        </div>
      </div>

      {/* Title bar */}
      <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
              {item.type === 'reading' ? <BookOpen size={22} /> : <ClipboardList size={22} />}
            </span>
            <div>
              <h2 className="text-lg font-bold text-navy-700">{item.title}</h2>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                {item.type === 'reading' ? 'Bài đọc' : 'Bài kiểm tra'} · Cấp {item.level}
              </p>
            </div>
          </div>
          {canManage && (
            <div className="flex shrink-0 items-center gap-2">
              {item.status === 'DELETED' ? (
                <Button size="sm" variant="secondary" icon={ArchiveRestore} onClick={onRestore}>
                  Khôi phục
                </Button>
              ) : (
                <>
                  {item.status === 'APPROVED' ? null : (
                    <Button size="sm" variant="secondary" icon={Pencil} onClick={onEdit}>
                      Sửa
                    </Button>
                  )}
                  {(item.status === 'PENDING_REVIEW' || item.status === 'REJECTED') && (
                    <Button size="sm" onClick={onApprove}>
                      Duyệt
                    </Button>
                  )}
                  {item.status === 'PENDING_REVIEW' && (
                    <Button size="sm" variant="danger" onClick={onReject} aria-label="Từ chối">
                      <X size={16} />
                    </Button>
                  )}
                  {item.status === 'APPROVED' && (
                    <button
                      type="button"
                      onClick={onRevoke}
                      className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                    >
                      ↩ Thu hồi
                    </button>
                  )}
                  <Button size="sm" variant="danger" icon={Trash2} onClick={onDelete}>
                    Xóa
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Content — fixed, scrollable */}
        <div className="lg:col-span-2">
          <div className="sticky top-4 rounded-xl border border-line bg-white shadow-sm">
            <div className="border-b border-line px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Nội dung</p>
            </div>
            <div className="max-h-[480px] overflow-y-auto px-5 py-4">
              <p className="text-sm leading-relaxed text-ink whitespace-pre-wrap">
                {item.content || item.definition || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="lg:col-span-3">
          {questions.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-line bg-canvas text-ink-muted">
              Không có câu hỏi
            </div>
          ) : (
            <div className="rounded-xl border border-line bg-white shadow-sm">
              {/* Question header */}
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Câu hỏi
                </p>
                <Badge>
                  {questionIndex + 1} / {questions.length}
                </Badge>
              </div>

              {/* Question body */}
              <div className="space-y-4 px-5 py-4">
                <div className="rounded-lg border-l-4 border-brand-400 bg-canvas p-4">
                  <p className="text-sm font-semibold text-navy-700">
                    {/^\d+\.?\s*$/.test(String(q.questionText || '').trim())
                      ? q.questionText
                      : `${questionIndex + 1}. ${q.questionText || ''}`}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Tùy chọn trả lời:
                  </p>
                  {q.options?.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx)
                    const correct = isCorrect(idx)
                    return (
                      <div
                        key={idx}
                        className={[
                          'w-full rounded-lg border-2 p-3 text-sm transition-colors',
                          correct
                            ? 'border-green-500 bg-green-50 font-semibold text-green-700'
                            : 'border-line bg-white text-ink',
                        ].join(' ')}
                      >
                        <span className="font-semibold">{letter}.</span> {opt}
                        {correct && <span className="ml-2 text-xs">✓ Đúng</span>}
                      </div>
                    )
                  })}
                </div>

                {q.explanationVi && (
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                      💡 Giải thích:
                    </p>
                    <p className="mt-1.5 text-sm text-blue-900">{q.explanationVi}</p>
                  </div>
                )}
              </div>

              {/* Prev / Next */}
              <div className="flex items-center justify-between border-t border-line px-5 py-3">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ChevronLeft}
                  onClick={() => setQuestionIndex((i) => Math.max(0, i - 1))}
                  disabled={questionIndex === 0}
                >
                  Trước
                </Button>

                <div className="flex items-center gap-1">
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuestionIndex(idx)}
                      className={[
                        'h-2 rounded-full transition-all',
                        idx === questionIndex ? 'w-6 bg-brand-500' : 'w-2 bg-line hover:bg-brand-300',
                      ].join(' ')}
                    />
                  ))}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setQuestionIndex((i) => Math.min(questions.length - 1, i + 1))}
                  disabled={questionIndex === questions.length - 1}
                >
                  Sau
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   EDIT VIEW
───────────────────────────────────────── */
function EditView({ item, onBack, onSave }) {
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
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-navy-700"
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
                      'h-7 w-7 rounded-full text-xs font-semibold transition-colors',
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
                    const isCorrect =
                      q.correctAnswer === letter
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQ('correctAnswer', letter)}
                          className={[
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
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

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
function AiContentPage() {
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [items, setItems] = useState(() => getAIContentRecords())
  const [view, setView] = useState('list') // 'list' | 'detail' | 'edit'
  const [selectedItem, setSelectedItem] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingStatus, setGeneratingStatus] = useState('')
  const [showCreationForm, setShowCreationForm] = useState(false)
  const [showTrash, setShowTrash] = useState(false)
  const [draft, setDraft] = useState({
    type: 'reading',
    topic: '',
    prompt: '',
    level: 'B2',
    questionCount: 3,
  })

  const normalizeOwner = (value) => String(value ?? '').trim().toLowerCase()
  const isOwnedByCurrentUser = useMemo(() => {
    return (item) => {
      if (!user) return true
      const current = normalizeOwner(user.displayName || user.email || 'admin')
      const created = normalizeOwner(item?.createdBy || '')
      const approved = normalizeOwner(item?.approvedBy || '')
      return created === current || approved === current
    }
  }, [user])

  const trashCount = useMemo(
    () => items.filter((item) => item.status === 'DELETED').length,
    [items],
  )
  const statusCounts = useMemo(
    () => ({
      all: items.length,
      GENERATING: items.filter((item) => item.status === 'GENERATING').length,
      PENDING_REVIEW: items.filter((item) => item.status === 'PENDING_REVIEW').length,
      APPROVED: items.filter((item) => item.status === 'APPROVED').length,
      REJECTED: items.filter((item) => item.status === 'REJECTED').length,
      DELETED: items.filter((item) => item.status === 'DELETED').length,
    }),
    [items],
  )
  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        const isDeleted = item.status === 'DELETED'

        if (showTrash) {
          return isDeleted && (activeTab === 'all' || activeTab === 'others' || item.type === activeTab)
        }

        if (isDeleted) return false

        const matchesType = activeTab === 'all' || item.type === activeTab
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter
        const matchesOwner = activeTab === 'others'
          ? !isOwnedByCurrentUser(item)
          : isOwnedByCurrentUser(item)
        const keyword = searchTerm.trim().toLowerCase()
        const matchesSearch = !keyword || 
          (item.title || '').toLowerCase().includes(keyword) ||
          (item.content || '').toLowerCase().includes(keyword)
        
        return matchesType && matchesStatus && matchesOwner && matchesSearch
      }),
    [items, activeTab, statusFilter, searchTerm, isOwnedByCurrentUser, showTrash],
  )

  const refresh = () => {
    const updated = getAIContentRecords()
    setItems(updated)
    // sync selectedItem if in detail/edit
    if (selectedItem) {
      const fresh = updated.find((i) => i.id === selectedItem.id)
      if (fresh) setSelectedItem(fresh)
    }
  }

  const updateStatus = async (id, status, reason = '') => {
    try {
      if (status === 'APPROVED') approveAIContent(id, user)
      else if (status === 'REJECTED') rejectAIContent(id, reason, user)
      refresh()
      toast.success(status === 'APPROVED' ? 'Đã duyệt nội dung' : 'Đã từ chối nội dung')
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật nội dung')
    }
  }

  const handleBulkApprove = () => {
    const manageableItems = visibleItems.filter((item) => isOwnedByCurrentUser(item))
    for (const item of manageableItems) approveAIContent(item.id, user)
    refresh()
    toast.success(
      manageableItems.length > 0
        ? 'Đã duyệt tất cả nội dung thuộc quyền quản lý của bạn trong tab này'
        : 'Không có nội dung nào thuộc quyền quản lý của bạn để duyệt',
    )
  }

  const handleCardClick = (item) => {
    setSelectedItem(item)
    setView('detail')
  }

  const handleEdit = () => setView('edit')

  const handleSaveEdit = async ({ content, questions }) => {
    try {
      updateAIContent(selectedItem.id, { content, definition: content, questions })
      refresh()
      toast.success('Đã lưu thay đổi')
      setView('detail')
    } catch (error) {
      toast.error(error.message || 'Không thể lưu thay đổi')
    }
  }

  const handleBack = () => {
    if (view === 'edit') {
      setView('detail')
    } else {
      setView('list')
      setSelectedItem(null)
    }
  }

  const handleRevoke = () => {
    try {
      revokeAIContent(selectedItem.id, '', user)
      refresh()
      toast.success('↩ Đã thu hồi — nội dung chuyển về chờ duyệt')
    } catch (error) {
      toast.error(error.message || 'Không thể thu hồi nội dung')
    }
  }

  const handleSoftDelete = (id) => {
    try {
      softDeleteAIContent(id, user)
      refresh()
      setSelectedItem(null)
      setView('list')
      toast.success('Đã chuyển nội dung vào thùng rác')
    } catch (error) {
      toast.error(error.message || 'Không thể xóa nội dung')
    }
  }

  const handleRestore = (id) => {
    try {
      restoreAIContent(id)
      refresh()
      setSelectedItem(null)
      setView('list')
      toast.success('Đã khôi phục nội dung từ thùng rác')
    } catch (error) {
      toast.error(error.message || 'Không thể khôi phục nội dung')
    }
  }

  const formatGeminiError = (error) => {
    if (error.code === 'NO_API_KEY') return '❌ Chưa cấu hình VITE_GEMINI_API_KEY trong .env'
    if (error.code === 'RATE_LIMIT') return '❌ Gemini đang vượt giới hạn sử dụng. Vui lòng thử lại sau.'
    if (error.code === 'TRUNCATED_RESPONSE') return '❌ Phản hồi bị cắt do giới hạn token — thử chủ đề ngắn hơn'
    if (error.code === 'PARSE_ERROR') return '❌ Gemini trả về JSON không hợp lệ — mở F12 → Console để xem chi tiết'
    if (error.code === 'SAFETY_BLOCK' || error.code === 'SAFETY_FILTER') return '❌ Gemini chặn nội dung — thử chủ đề khác'
    return `❌ Lỗi Gemini: ${error.message}`
  }

  const handleCreate = async () => {
    try {
      if (!draft.topic.trim()) { toast.error('Vui lòng nhập chủ đề nội dung'); return }
      setShowCreationForm(false)
      setIsGenerating(true)
      setGeneratingStatus('Đang gửi yêu cầu đến Gemini...')

      const questionCount = Math.min(Math.max(Number(draft.questionCount) || 3, 1), 5)
      let result
      if (draft.type === 'reading') {
        setGeneratingStatus('Đang sinh bài đọc và câu hỏi (có thể mất 10-20s)...')
        result = await generateReading({ topic: draft.topic, level: draft.level, questionCount })
      } else if (draft.type === 'quiz') {
        setGeneratingStatus('Đang sinh câu hỏi kiểm tra (có thể mất 15-30s)...')
        result = await generateQuiz({ topic: draft.topic, level: draft.level, questionCount })
      } else {
        setGeneratingStatus('Đang sinh dạng điền khuyết TOEIC (có thể mất 15-30s)...')
        result = await generateCloze({
          topic: draft.topic,
          level: draft.level,
          type: draft.type,
          questionCount,
        })
      }

      setGeneratingStatus('Đang lưu nội dung...')
      const finalTitle = `${draft.topic.trim()} - ${TYPE_LABELS[draft.type] || 'Nội dung AI'}`
      const saved = saveGeminiContent({
        type: draft.type,
        title: finalTitle,
        content: result.text || draft.topic,
        level: draft.level,
        questions: result.questions || [],
        geminiPrompt: draft.prompt || draft.topic,
        createdBy: user?.displayName || 'Admin',
      })

      refresh()
      setIsGenerating(false)
      setGeneratingStatus('')
      setDraft({ type: 'reading', topic: '', prompt: '', level: 'B2', questionCount: 3 })
      toast.success(`✅ Đã tạo ${saved.title} · ${saved.questions?.length || 0} câu hỏi · đang chờ duyệt`)
    } catch (error) {
      setIsGenerating(false)
      setGeneratingStatus('')
      if (error instanceof GeminiServiceError) toast.error(formatGeminiError(error))
      else toast.error(error.message || '❌ Không thể tạo nội dung')
    }
  }

  /* ── DETAIL VIEW ── */
  if (view === 'detail' && selectedItem) {
    return (
      <div className="space-y-4">
        <DetailView
          item={selectedItem}
          onBack={handleBack}
          onEdit={handleEdit}
          onApprove={() => updateStatus(selectedItem.id, 'APPROVED')}
          onReject={() => updateStatus(selectedItem.id, 'REJECTED', 'Nội dung không đạt tiêu chuẩn chất lượng.')}
          onRevoke={handleRevoke}
          onDelete={() => handleSoftDelete(selectedItem.id)}
          onRestore={() => handleRestore(selectedItem.id)}
          canManage={isOwnedByCurrentUser(selectedItem)}
        />
      </div>
    )
  }

  /* ── EDIT VIEW ── */
  if (view === 'edit' && selectedItem) {
    return (
      <div className="space-y-4">
        <EditView
          item={selectedItem}
          onBack={handleBack}
          onSave={handleSaveEdit}
        />
      </div>
    )
  }

  /* ── LIST VIEW ── */
  return (
    <div className="space-y-4">
      <div className="space-y-5">
        {/* Tabs + Search + Status dropdown + Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:flex-wrap">
          <Tabs
            tabs={TABS}
            value={activeTab}
            onChange={setActiveTab}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput
              placeholder="Tìm nội dung..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="min-w-[180px]"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            >
              {STATUS_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </Select>
            <Button icon={Plus} onClick={() => setShowCreationForm(true)}>
              Tạo nội dung AI
            </Button>
            <Button icon={CheckCheck} onClick={handleBulkApprove}>
              Duyệt tất cả
            </Button>
            <Button
              variant="secondary"
              icon={Trash2}
              onClick={() => setShowTrash((value) => !value)}
            >
              {showTrash ? 'Đóng thùng rác' : `Thùng rác${trashCount > 0 ? ` (${trashCount})` : ''}`}
            </Button>
          </div>
        </div>

        {/* Grid */}
        {visibleItems.length === 0 && !isGenerating ? (
          <EmptyState
            title={showTrash ? 'Thùng rác trống' : 'Không có nội dung'}
            description={
              showTrash
                ? 'Các nội dung đã xóa mềm sẽ hiển thị ở đây.'
                : 'Mọi mục trong tab này đã được xử lý hoặc chưa có dữ liệu.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Generating placeholder */}
            {isGenerating && (
              <Card className="border-2 border-brand-500/50 bg-brand-500/5">
                <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                  <div>
                    <h3 className="text-base font-semibold text-navy-700">Đang tạo nội dung...</h3>
                    <p className="mt-1 text-sm text-ink-muted">{generatingStatus}</p>
                  </div>
                  <div className="w-full rounded-lg bg-white p-3 text-center text-xs text-ink-muted">
                    💡 Quá trình này có thể mất từ 10-30 giây
                  </div>
                </div>
              </Card>
            )}

            {visibleItems.map((item) => {
              const Icon = TYPE_ICON[item.type] || BookOpen
              const statusMeta = STATUS_BADGE[item.status]
              const canManage = isOwnedByCurrentUser(item)
              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCardClick(item)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCardClick(item)}
                  className="group cursor-pointer rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
                >
                  {/* Card content — fixed height */}
                  <div className="flex h-[260px] flex-col p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                          <Icon size={17} strokeWidth={1.75} />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-navy-700">{item.title}</h3>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-500">
                            {TYPE_LABELS[item.type] || 'Nội dung AI'} · {item.level}
                          </p>
                        </div>
                      </div>
                      {statusMeta && (
                        <Badge tone={statusMeta.tone} className="shrink-0 text-[10px]">
                          {statusMeta.label}
                        </Badge>
                      )}
                    </div>

                    {/* Content preview — truncated */}
                    <div className="mt-3 flex-1 overflow-hidden">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                        Nội dung
                      </p>
                      <p className="mt-1 line-clamp-5 text-xs leading-relaxed text-ink">
                        {item.content || item.definition || '—'}
                      </p>
                    </div>

                    {/* Footer meta */}
                    <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                      <div className="flex items-center gap-3 text-[10px] text-ink-muted">
                        {item.questions?.length > 0 && (
                          <span>{item.questions.length} câu hỏi</span>
                        )}
                        <Badge tone={confidenceTone(item.confidenceScore ?? 92)} className="text-[10px]">
                          {item.confidenceScore ?? 92}%
                        </Badge>
                      </div>
                      {canManage && !showTrash && item.status !== 'DELETED' && (
                        <div className="flex items-center gap-1.5">
                          {item.status === 'PENDING_REVIEW' && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); updateStatus(item.id, 'APPROVED') }}
                              className="rounded-md bg-navy-700 px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-navy-800"
                            >
                              Duyệt
                            </button>
                          )}
                          {item.status === 'PENDING_REVIEW' && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); updateStatus(item.id, 'REJECTED', 'Nội dung không đạt tiêu chuẩn chất lượng.') }}
                              className="rounded-md border border-line bg-white p-1 text-ink-muted transition-colors hover:border-red-300 hover:text-red-500"
                              aria-label="Từ chối"
                            >
                              <X size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleSoftDelete(item.id) }}
                            className="rounded-md border border-red-200 bg-red-50 p-1 text-red-600 transition-colors hover:bg-red-100"
                            aria-label="Xóa mềm"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                      {showTrash && canManage && item.status === 'DELETED' && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRestore(item.id) }}
                          className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                        >
                          <ArchiveRestore size={12} />
                          Khôi phục
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      <Modal
        open={showCreationForm}
        onClose={() => !isGenerating && setShowCreationForm(false)}
        title="Tạo nội dung bằng AI"
      >
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
              <div>
                <p className="font-semibold text-navy-700">Đang xử lý...</p>
                <p className="text-sm text-ink-muted">{generatingStatus}</p>
              </div>
            </div>
            <div className="w-full rounded-lg bg-canvas p-3 text-center text-xs text-ink-muted">
              💡 Quá trình này có thể mất từ 10-30 giây. Vui lòng chờ...
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Select
              label="Loại nội dung"
              value={draft.type}
              onChange={(e) => setDraft((prev) => ({ ...prev, type: e.target.value }))}
            >
              {CONTENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>

            <Select
              label="Cấp độ CEFR"
              value={draft.level}
              onChange={(e) => setDraft((prev) => ({ ...prev, level: e.target.value }))}
            >
              <option value="A1">A1 - Sơ cấp 1</option>
              <option value="A2">A2 - Sơ cấp 2</option>
              <option value="B1">B1 - Trung cấp 1</option>
              <option value="B2">B2 - Trung cấp 2</option>
              <option value="C1">C1 - Nâng cao 1</option>
              <option value="C2">C2 - Nâng cao 2</option>
            </Select>

            <Select
              label="Số lượng câu"
              value={String(draft.questionCount)}
              onChange={(e) => setDraft((prev) => ({ ...prev, questionCount: Number(e.target.value) }))}
            >
              <option value={3}>3 câu</option>
              <option value={4}>4 câu</option>
              <option value={5}>5 câu (khuyến nghị)</option>
            </Select>

            <div>
              <label className="text-sm font-semibold text-ink-muted">Chủ đề / Nội dung *</label>
              <Input
                placeholder={
                  draft.type === 'reading'
                    ? 'VD: Lịch sử của Internet / History of the Internet'
                    : 'VD: Từ vựng công việc văn phòng / Workplace vocabulary'
                }
                value={draft.topic}
                onChange={(e) => setDraft((prev) => ({ ...prev, topic: e.target.value }))}
                className="mt-1"
              />
              <p className="mt-2 text-xs text-ink-muted">
                Hệ thống tự hiểu chủ đề bằng tiếng Việt/Anh và sinh nội dung bằng tiếng Anh.
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-ink-muted">Prompt chi tiết (tùy chọn)</label>
              <Textarea
                placeholder="VD: 3 câu hỏi ngắn theo chủ đề công việc văn phòng, mức B2."
                rows={3}
                value={draft.prompt}
                onChange={(e) => setDraft((prev) => ({ ...prev, prompt: e.target.value }))}
                className="mt-1"
              />
              <p className="mt-2 text-xs text-ink-muted">
                Có thể thêm mục tiêu học tập hoặc độ khó; nội dung chính vẫn là tiếng Anh.
              </p>
            </div>

            <div className="rounded-lg border-l-4 border-brand-400 bg-brand-500/5 p-3">
              <p className="text-xs font-semibold text-brand-600">📊 Kết quả dự kiến:</p>
              <p className="mt-1 whitespace-pre-line text-xs text-ink-muted">
                {draft.type === 'reading'
                  ? '• Bài đọc 120–180 từ\n• 3–5 câu hỏi\n• Tiếng Anh chuẩn'
                  : '• 3–5 câu hỏi\n• 4 đáp án mỗi câu\n• Tiếng Anh chuẩn'}
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowCreationForm(false)}>
                Huỷ
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!draft.topic.trim()}
                loading={isGenerating}
              >
                Tạo bằng AI
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AiContentPage
