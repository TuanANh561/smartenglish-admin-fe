import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  CheckCircle2,
  Copy,
  Crown,
  Eye,
  FileCheck2,
  FileText,
  HelpCircle,
  Layers,
  Pencil,
  Plus,
  Search,
  Send,
  Sparkles,
  Tag,
  Trash2,
  Upload,
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
import DataImportWizardModal from '@/components/ui/DataImportWizardModal'
import { cn, formatNumber, formatRelativeTime } from '@/lib/utils'
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

const LEVEL_COLOR = {
  A1: { bg: '#f0fdf4', text: '#15803d' },
  A2: { bg: '#f0fdf4', text: '#15803d' },
  B1: { bg: '#eff6ff', text: '#1d4ed8' },
  B2: { bg: '#eef2ff', text: '#4f46e5' },
  C1: { bg: '#faf5ff', text: '#7c3aed' },
  C2: { bg: '#faf5ff', text: '#7c3aed' },
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
  const [isPdfImportOpen, setIsPdfImportOpen] = useState(false)
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

  const isTeacher = user?.role === 'teacher'

  return (
    <div className="space-y-4">
      {/* Top action & Quota */}
      {isTeacher && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-brand-200 bg-brand-50/70 px-4 py-2.5 text-xs shadow-2xs">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white">
            <Crown size={13} />
          </span>
          <div>
            <span className="font-semibold text-navy-700">Gói Teacher Pro:</span>{' '}
            <span className="text-ink-muted">
              Bạn đã tạo <strong className="text-brand-600 font-bold">{lessons.length}</strong> bài học · Hạn mức{' '}
              <strong className="text-emerald-600 font-bold">Không giới hạn</strong>
            </span>
          </div>
          <Link to="/goi-dich-vu" className="ml-auto font-semibold text-brand-600 hover:underline">
            Chi tiết gói →
          </Link>
        </div>
      )}

      {/* ─── Table Card (Matching Benchmark Design) ────────────────────── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Toolbar & Search */}
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Tìm kiếm bài học, cấu trúc ngữ pháp..."
              className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedTopic}
              onChange={(e) => { setSelectedTopic(e.target.value); setPage(1) }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              {GRAMMAR_TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic === 'Tất cả chủ điểm' ? 'Chủ điểm: Tất cả' : topic}
                </option>
              ))}
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => { setSelectedLevel(e.target.value); setPage(1) }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              {CEFR_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl === 'Tất cả' ? 'Cấp độ: Tất cả' : `Cấp độ ${lvl}`}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1) }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <Button size="sm" variant="secondary" icon={Upload} onClick={() => setIsPdfImportOpen(true)}>
              Import
            </Button>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={15} />
              <span>Thêm bài học</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3.5 w-[36%] min-w-[260px]">BÀI HỌC NGỮ PHÁP</th>
                <th className="px-4 py-3.5 w-[14%] min-w-[120px]">CHỦ ĐIỂM</th>
                <th className="px-4 py-3.5 text-center w-[10%] min-w-[80px]">CẤP ĐỘ</th>
                <th className="px-4 py-3.5 text-center w-[11%] min-w-[90px]">SỐ BÀI TẬP</th>
                <th className="px-4 py-3.5 w-[14%] min-w-[130px]">TRẠNG THÁI</th>
                <th className="px-4 py-3.5 w-[11%] min-w-[100px]">CẬP NHẬT</th>
                <th className="px-6 py-3.5 text-right w-[14%] min-w-[130px]">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                    Không tìm thấy bài học ngữ pháp nào phù hợp
                  </td>
                </tr>
              ) : (
                pageData.map((item) => {
                  const isPublished = item.status === 'published'
                  const levelStyle = LEVEL_COLOR[item.level] ?? LEVEL_COLOR.B1

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setActiveLesson(item)}
                      className="group transition-colors hover:bg-slate-50/50 cursor-pointer"
                    >
                      {/* Tên bài học */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-600">
                            <BookOpen size={18} strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 text-sm tracking-tight block group-hover:text-brand-600 transition-colors">
                              {item.title}
                            </span>
                            {item.formula && (
                              <span className="font-mono text-xs text-slate-500 line-clamp-1 mt-0.5">
                                {item.formula}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Chủ điểm */}
                      <td className="px-4 py-4.5 text-sm font-medium text-slate-700 whitespace-nowrap">
                        {item.topic}
                      </td>

                      {/* Cấp độ */}
                      <td className="px-4 py-4.5 text-center whitespace-nowrap">
                        <span
                          className="inline-flex items-center justify-center rounded-lg px-2.5 py-0.5 text-xs font-bold shadow-2xs"
                          style={{ backgroundColor: levelStyle.bg, color: levelStyle.text }}
                        >
                          {item.level}
                        </span>
                      </td>

                      {/* Số bài tập */}
                      <td className="px-4 py-4.5 text-center font-bold text-slate-800 text-sm whitespace-nowrap">
                        {item.exerciseCount || 15} bài
                      </td>

                      {/* Trạng thái */}
                      <td className="px-4 py-4.5 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: isPublished ? '#ecfdf5' : '#f1f5f9',
                            color: isPublished ? '#059669' : '#475569',
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: isPublished ? '#10b981' : '#94a3b8' }}
                          />
                          <span>{isPublished ? 'Published' : 'Draft'}</span>
                        </span>
                      </td>

                      {/* Cập nhật */}
                      <td className="px-4 py-4.5 text-sm text-slate-500 whitespace-nowrap">
                        {formatRelativeTime(item.updatedAt)}
                      </td>

                      {/* Thao tác */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 text-slate-400" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setActiveLesson(item)}
                            className="rounded-lg p-1.5 hover:bg-brand-50 hover:text-brand-600 transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleOpenEdit(e, item)}
                            className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDuplicate(e, item)}
                            className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Nhân bản"
                          >
                            <Copy size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteTarget(item)
                            }}
                            className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-500">
            Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>-
            <strong>{Math.min(start + PAGE_SIZE, total)}</strong> trong tổng số{' '}
            <strong>{total}</strong> bài học
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

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

      {/* ─── Modal Import PDF AI ────────────────────────────────────────── */}
      <DataImportWizardModal
        open={isPdfImportOpen}
        onClose={() => setIsPdfImportOpen(false)}
        defaultType="grammar"
        onImportSuccess={(newItems) => {
          const formatted = newItems.map((item, idx) => ({
            id: `gram-imported-${Date.now()}-${idx}`,
            title: item.title,
            topic: item.topic || 'Advanced Grammar',
            level: item.level || 'B2',
            status: item.status || 'published',
            exerciseCount: item.exerciseCount || 10,
            description: item.description || '',
            formula: item.formula || '',
            keyRules: item.keyRules || [],
            examples: item.examples || [],
            authorName: user?.displayName || 'Admin AI Parser',
            authorEmail: user?.email || 'admin@smartenglish.vn',
            updatedAt: new Date().toISOString(),
          }))
          setLessons((prev) => [...formatted, ...prev])
          toast.success(`Đã thêm thành công ${formatted.length} bài học ngữ pháp bóc tách từ PDF!`)
        }}
      />
    </div>
  )
}

export default GrammarPage
