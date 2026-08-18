import { useMemo, useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  Copy,
  Eye,
  FileCheck2,
  FileText,
  HelpCircle,
  Layers,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Drawer from '@/components/ui/Drawer'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { cn, formatNumber } from '@/lib/utils'
import { GRAMMAR_TOPICS, grammarLessons } from '@/mocks/data/grammar'
import { useAuthStore } from '@/store/authStore'

const CEFR_LEVELS = ['Tất cả', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'published', label: 'Published (Đã xuất bản)' },
  { value: 'draft', label: 'Draft (Bản nháp)' },
]

const LEVEL_TONE = {
  A1: 'info',
  A2: 'info',
  B1: 'success',
  B2: 'warning',
  C1: 'danger',
  C2: 'danger',
}

const PAGE_SIZE = 8

function GrammarPage() {
  const user = useAuthStore((s) => s.user)
  const [lessons, setLessons] = useState(grammarLessons)
  const [selectedTopic, setSelectedTopic] = useState('Tất cả chủ điểm')
  const [selectedLevel, setSelectedLevel] = useState('Tất cả')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Drawer / Modal states
  const [activeLesson, setActiveLesson] = useState(null)
  const [editingLesson, setEditingLesson] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    topic: 'Tenses',
    level: 'B1',
    status: 'published',
    exerciseCount: 15,
    description: '',
    formula: '',
    keyRules: '',
    exampleEn: '',
    exampleVi: '',
  })

  // Filtering
  const filtered = useMemo(() => {
    return lessons.filter((item) => {
      const matchTopic =
        selectedTopic === 'Tất cả chủ điểm' || item.topic === selectedTopic
      const matchLevel =
        selectedLevel === 'Tất cả' || item.level === selectedLevel
      const matchStatus =
        selectedStatus === 'all' || item.status === selectedStatus
      const matchSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.topic.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())

      return matchTopic && matchLevel && matchStatus && matchSearch
    })
  }, [lessons, selectedTopic, selectedLevel, selectedStatus, search])

  // Pagination calculation
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageData = filtered.slice(start, start + PAGE_SIZE)

  // Quick stats
  const stats = useMemo(() => {
    const publishedCount = lessons.filter((l) => l.status === 'published').length
    const totalExercises = lessons.reduce((acc, curr) => acc + (curr.exerciseCount || 0), 0)
    return {
      totalLessons: lessons.length,
      publishedCount,
      totalExercises,
      totalAttempts: 12450,
    }
  }, [lessons])

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      topic: 'Tenses',
      level: 'B1',
      status: 'published',
      exerciseCount: 15,
      description: '',
      formula: '',
      keyRules: '',
      exampleEn: '',
      exampleVi: '',
    })
    setIsCreateOpen(true)
  }

  const handleOpenEdit = (e, item) => {
    e.stopPropagation()
    setEditingLesson(item)
    setFormData({
      title: item.title,
      topic: item.topic,
      level: item.level,
      status: item.status,
      exerciseCount: item.exerciseCount || 10,
      description: item.description || '',
      formula: item.formula || '',
      keyRules: Array.isArray(item.keyRules) ? item.keyRules.join('\n') : item.keyRules || '',
      exampleEn: item.examples?.[0]?.en || '',
      exampleVi: item.examples?.[0]?.vi || '',
    })
  }

  const handleDuplicate = (e, item) => {
    e.stopPropagation()
    const duplicate = {
      ...item,
      id: `gram-${Date.now()}`,
      title: `${item.title} (Bản sao)`,
      status: 'draft',
      authorName: user?.displayName || 'Admin',
      authorEmail: user?.email || 'admin@smartenglish.vn',
      updatedAt: new Date().toISOString(),
    }
    setLessons((prev) => [duplicate, ...prev])
    toast.success(`Đã nhân bản bài học "${item.title}"`)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setLessons((prev) => prev.filter((l) => l.id !== deleteTarget.id))
    toast.success(`Đã xóa bài học "${deleteTarget.title}"`)
    setDeleteTarget(null)
  }

  const handleSaveForm = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tên bài học ngữ pháp')
      return
    }

    const rulesArray = formData.keyRules
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean)

    const examplesArray = formData.exampleEn
      ? [{ en: formData.exampleEn, vi: formData.exampleVi || '' }]
      : []

    if (editingLesson) {
      setLessons((prev) =>
        prev.map((item) =>
          item.id === editingLesson.id
            ? {
                ...item,
                title: formData.title.trim(),
                topic: formData.topic,
                level: formData.level,
                status: formData.status,
                exerciseCount: Number(formData.exerciseCount) || 10,
                description: formData.description,
                formula: formData.formula,
                keyRules: rulesArray,
                examples: examplesArray.length > 0 ? examplesArray : item.examples,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      )
      toast.success('Đã cập nhật bài học ngữ pháp!')
      setEditingLesson(null)
    } else {
      const newLesson = {
        id: `gram-${Date.now()}`,
        title: formData.title.trim(),
        topic: formData.topic,
        level: formData.level,
        status: formData.status,
        exerciseCount: Number(formData.exerciseCount) || 15,
        description: formData.description,
        formula: formData.formula,
        keyRules: rulesArray,
        examples: examplesArray,
        authorName: user?.displayName || 'Nguyen Van A',
        authorEmail: user?.email || 'nguyenvana@smartenglish.vn',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
      setLessons((prev) => [newLesson, ...prev])
      toast.success('Đã thêm bài học ngữ pháp mới!')
      setIsCreateOpen(false)
    }
  }

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Vừa xong'
    const diffHours = Math.floor((Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60))
    if (diffHours < 1) return 'Vừa xong'
    if (diffHours < 24) return `${diffHours} giờ trước`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Hôm qua'
    if (diffDays < 7) return `${diffDays} ngày trước`
    return new Date(isoString).toLocaleDateString('vi-VN')
  }

  return (
    <main className="flex-1 bg-[#f8fafc] p-4 sm:p-6 space-y-6">
      {/* ─── Header & Top Actions ────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
            Quản lý Bài học Ngữ pháp
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Biên soạn và quản lý các bài học cấu trúc ngữ pháp hệ thống.
          </p>
        </div>

        <Button
          icon={Plus}
          onClick={handleOpenCreate}
          className="bg-navy-800 hover:bg-navy-900 text-white shadow-sm font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
        >
          Thêm bài học ngữ pháp
        </Button>
      </div>

      {/* ─── Quick Stats Summary ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4 bg-white border border-line shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Tổng bài học
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-600">
              <BookOpen size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-navy-800">{stats.totalLessons}</p>
        </Card>

        <Card className="p-4 bg-white border border-line shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Đã xuất bản
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{stats.publishedCount}</p>
        </Card>

        <Card className="p-4 bg-white border border-line shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Tổng bài tập
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FileCheck2 size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-navy-800">{stats.totalExercises}</p>
        </Card>

        <Card className="p-4 bg-white border border-line shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Lượt thực hành
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Users size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-navy-800">
            {formatNumber(stats.totalAttempts)}
          </p>
        </Card>
      </div>

      {/* ─── Filter Bar ─────────────────────────────────────────────────── */}
      <Card className="p-4 bg-white border border-line shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Chủ điểm */}
          <div className="w-full sm:w-auto min-w-[200px]">
            <Select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value)
                setPage(1)
              }}
              className="text-xs bg-canvas rounded-lg border-line"
            >
              {GRAMMAR_TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  Chủ điểm: {topic}
                </option>
              ))}
            </Select>
          </div>

          {/* CEFR Level */}
          <div className="w-full sm:w-auto min-w-[140px]">
            <Select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value)
                setPage(1)
              }}
              className="text-xs bg-canvas rounded-lg border-line"
            >
              {CEFR_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl === 'Tất cả' ? 'Cấp độ CEFR: Tất cả' : `Cấp độ ${lvl}`}
                </option>
              ))}
            </Select>
          </div>

          {/* Trạng thái */}
          <div className="w-full sm:w-auto min-w-[160px]">
            <Select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setPage(1)
              }}
              className="text-xs bg-canvas rounded-lg border-line"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Search Bar */}
          <div className="flex-1 min-w-[220px] relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="text"
              placeholder="Lọc nhanh bài học, cấu trúc..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-lg border border-line bg-canvas pl-9 pr-3 py-2 text-xs focus:border-brand-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </Card>

      {/* ─── Lessons Card List (Image 1 Mockup) ─────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Không tìm thấy bài học ngữ pháp nào"
          description="Thử thay đổi bộ lọc hoặc tạo bài học ngữ pháp mới."
          actionLabel="+ Thêm bài học ngữ pháp"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="space-y-3.5">
          {pageData.map((item) => {
            const isPublished = item.status === 'published'

            return (
              <div
                key={item.id}
                onClick={() => setActiveLesson(item)}
                className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-brand-400 hover:shadow-md cursor-pointer"
              >
                {/* Left: Icon & Title & Topic */}
                <div className="flex items-center gap-4 min-w-0 md:w-[35%]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50/80 text-brand-600 transition-transform group-hover:scale-105">
                    <BookOpen size={22} strokeWidth={1.75} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm sm:text-base font-bold text-navy-800 group-hover:text-brand-600 transition-colors">
                      {item.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                      <Layers size={13} className="text-slate-400" />
                      <span>{item.topic}</span>
                    </div>
                  </div>
                </div>

                {/* Middle Attributes: CẤP ĐỘ, BÀI TẬP, TRẠNG THÁI */}
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 md:gap-8 items-center border-t md:border-t-0 border-line/60 pt-3 md:pt-0">
                  {/* CẤP ĐỘ */}
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                      CẤP ĐỘ
                    </span>
                    <div className="mt-1">
                      <span className="inline-flex items-center justify-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-brand-600 border border-blue-100">
                        {item.level}
                      </span>
                    </div>
                  </div>

                  {/* BÀI TẬP */}
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                      BÀI TẬP
                    </span>
                    <p className="mt-1 text-sm font-bold text-navy-800">
                      {item.exerciseCount || 15}
                    </p>
                  </div>

                  {/* TRẠNG THÁI */}
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                      TRẠNG THÁI
                    </span>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full',
                          isPublished ? 'bg-brand-500' : 'bg-slate-400',
                        )}
                      />
                      <span
                        className={cn(
                          'text-xs font-medium',
                          isPublished ? 'text-brand-700' : 'text-slate-500',
                        )}
                      >
                        {isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Author & Timestamp */}
                <div className="hidden lg:block text-right min-w-[130px]">
                  <p className="text-xs font-semibold text-navy-800">{item.authorName}</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    {formatRelativeTime(item.updatedAt)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-end gap-1 shrink-0 border-t sm:border-t-0 border-line/60 pt-2.5 sm:pt-0"
                >
                  <button
                    type="button"
                    onClick={() => setActiveLesson(item)}
                    className="rounded-lg p-2 text-ink-muted hover:bg-slate-100 hover:text-brand-600 transition-colors cursor-pointer"
                    title="Xem chi tiết bài học"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(e, item)}
                    className="rounded-lg p-2 text-ink-muted hover:bg-slate-100 hover:text-navy-800 transition-colors cursor-pointer"
                    title="Chỉnh sửa bài học"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDuplicate(e, item)}
                    className="rounded-lg p-2 text-ink-muted hover:bg-slate-100 hover:text-navy-800 transition-colors cursor-pointer"
                    title="Nhân bản bài học"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteTarget(item)
                    }}
                    className="rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                    title="Xóa bài học"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}

          {/* ─── Pagination Footer ──────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
            <p className="text-xs text-ink-muted">
              Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>-
              <strong>{Math.min(start + PAGE_SIZE, total)}</strong> trong tổng số{' '}
              <strong>{total}</strong> bài học
            </p>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>
      )}

      {/* ─── Modal Create / Edit Lesson ──────────────────────────────────── */}
      <Modal
        open={isCreateOpen || Boolean(editingLesson)}
        onClose={() => {
          setIsCreateOpen(false)
          setEditingLesson(null)
        }}
        title={editingLesson ? 'Chỉnh sửa bài học ngữ pháp' : 'Thêm bài học ngữ pháp mới'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-navy-800">
                Tên bài học ngữ pháp *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="VD: Present Perfect vs Past Simple..."
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-800">
                Chủ điểm ngữ pháp
              </label>
              <Select
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              >
                {GRAMMAR_TOPICS.filter((t) => t !== 'Tất cả chủ điểm').map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-800">
                Cấp độ CEFR
              </label>
              <Select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              >
                {CEFR_LEVELS.filter((l) => l !== 'Tất cả').map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Cấp độ {lvl}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-800">
                Số lượng bài tập
              </label>
              <Input
                type="number"
                min={1}
                max={100}
                value={formData.exerciseCount}
                onChange={(e) =>
                  setFormData({ ...formData, exerciseCount: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-800">
                Trạng thái
              </label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="published">Published (Đã xuất bản)</option>
                <option value="draft">Draft (Bản nháp)</option>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-navy-800">
                Công thức / Cấu trúc tổng quát
              </label>
              <Input
                value={formData.formula}
                onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                placeholder="VD: S + have/has + V3/ed vs S + V2/ed..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-navy-800">
                Mô tả khái quát
              </label>
              <Textarea
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Mô tả mục tiêu và ngữ cảnh sử dụng của cấu trúc ngữ pháp này..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-navy-800">
                Quy tắc trọng tâm (Mỗi dòng một quy tắc)
              </label>
              <Textarea
                rows={3}
                value={formData.keyRules}
                onChange={(e) =>
                  setFormData({ ...formData, keyRules: e.target.value })
                }
                placeholder="Nhập các quy tắc ngữ pháp quan trọng..."
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-800">
                Ví dụ mẫu (Tiếng Anh)
              </label>
              <Input
                value={formData.exampleEn}
                onChange={(e) =>
                  setFormData({ ...formData, exampleEn: e.target.value })
                }
                placeholder="VD: I have lived in Hanoi for 5 years."
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-800">
                Dịch nghĩa ví dụ (Tiếng Việt)
              </label>
              <Input
                value={formData.exampleVi}
                onChange={(e) =>
                  setFormData({ ...formData, exampleVi: e.target.value })
                }
                placeholder="VD: Tôi đã sống ở Hà Nội được 5 năm."
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-line pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCreateOpen(false)
                setEditingLesson(null)
              }}
            >
              Hủy bỏ
            </Button>
            <Button type="submit" className="bg-navy-800 hover:bg-navy-900 text-white font-semibold">
              {editingLesson ? 'Lưu thay đổi' : 'Tạo bài học'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Drawer View Lesson Details ─────────────────────────────────── */}
      <Drawer
        open={Boolean(activeLesson)}
        onClose={() => setActiveLesson(null)}
        title={activeLesson?.title}
        className="max-w-lg"
      >
        {activeLesson && (
          <div className="space-y-5 text-sm">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
              <Badge tone={LEVEL_TONE[activeLesson.level]}>
                Cấp độ {activeLesson.level}
              </Badge>
              <Badge tone="neutral">Chủ điểm: {activeLesson.topic}</Badge>
              <Badge tone={activeLesson.status === 'published' ? 'success' : 'neutral'}>
                {activeLesson.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
              </Badge>
              <span className="text-xs text-ink-muted">
                Tác giả: <strong>{activeLesson.authorName}</strong>
              </span>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Tổng quan
              </h4>
              <p className="mt-1 text-sm text-navy-800 leading-relaxed">
                {activeLesson.description || 'Chưa có mô tả chi tiết.'}
              </p>
            </div>

            {/* Formula Card */}
            {activeLesson.formula && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Cấu trúc / Công thức
                </h4>
                <div className="mt-1.5 rounded-xl bg-navy-900 p-3.5 font-mono text-xs text-brand-200 shadow-inner">
                  {activeLesson.formula}
                </div>
              </div>
            )}

            {/* Key Rules */}
            {activeLesson.keyRules && activeLesson.keyRules.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Quy tắc ngữ pháp quan trọng
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {activeLesson.keyRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-navy-800">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Examples */}
            {activeLesson.examples && activeLesson.examples.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Ví dụ minh họa
                </h4>
                <div className="mt-2 space-y-2">
                  {activeLesson.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-line bg-canvas p-3 text-xs"
                    >
                      <p className="font-semibold text-navy-800">{ex.en}</p>
                      {ex.vi && (
                        <p className="mt-0.5 text-ink-muted italic">→ {ex.vi}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sample Exercises */}
            {activeLesson.sampleExercises && activeLesson.sampleExercises.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Câu hỏi luyện tập mẫu ({activeLesson.sampleExercises.length})
                </h4>
                <div className="mt-2 space-y-2">
                  {activeLesson.sampleExercises.map((quiz, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-line bg-white p-3 text-xs space-y-1 shadow-xs"
                    >
                      <p className="font-medium text-navy-800">
                        {idx + 1}. {quiz.question}
                      </p>
                      <p className="text-emerald-600 font-semibold text-[11px]">
                        ✓ Đáp án: {quiz.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar in Drawer */}
            <div className="flex items-center gap-2 pt-4 border-t border-line">
              <Button
                variant="secondary"
                icon={Pencil}
                fullWidth
                onClick={() => {
                  const target = activeLesson
                  setActiveLesson(null)
                  handleOpenEdit({ stopPropagation: () => {} }, target)
                }}
              >
                Chỉnh sửa bài học
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* ─── Delete Confirmation Dialog ─────────────────────────────────── */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa bài học ngữ pháp"
        description={`Bạn có chắc chắn muốn xóa bài học "${deleteTarget?.title}"? Dữ liệu bài tập liên kết sẽ bị xóa vĩnh viễn.`}
        confirmLabel="Xóa bài học"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  )
}

export default GrammarPage
