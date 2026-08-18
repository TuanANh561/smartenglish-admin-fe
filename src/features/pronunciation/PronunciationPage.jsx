import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  Copy,
  Eye,
  Filter,
  Headphones,
  Mic,
  Music,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Volume2,
  AudioLines,
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
import {
  PRONUNCIATION_CATEGORIES,
  pronunciationLessons,
} from '@/mocks/data/pronunciation'
import { useAuthStore } from '@/store/authStore'

const CEFR_LEVELS = ['Tất cả', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
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

function PronunciationPage() {
  const user = useAuthStore((s) => s.user)
  const [lessons, setLessons] = useState(pronunciationLessons)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tất cả phân loại')
  const [selectedLevel, setSelectedLevel] = useState('Tất cả')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [page, setPage] = useState(1)

  // Drawer / Modal states
  const [activeLesson, setActiveLesson] = useState(null)
  const [editingLesson, setEditingLesson] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [playingAudioId, setPlayingAudioId] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    ipaSymbol: '',
    category: 'Vowels',
    level: 'B1',
    status: 'published',
    audioSampleCount: 24,
    aiMinScoreThreshold: 85,
    description: '',
    mouthShapeGuide: '',
    sampleWord: '',
    sampleWordIpa: '',
    sampleSentence: '',
  })

  // Filter logic
  const filtered = useMemo(() => {
    return lessons.filter((item) => {
      const matchCat =
        selectedCategory === 'Tất cả phân loại' || item.category === selectedCategory
      const matchLevel =
        selectedLevel === 'Tất cả' || item.level === selectedLevel
      const matchStatus =
        selectedStatus === 'all' || item.status === selectedStatus
      const matchSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.ipaSymbol?.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())

      return matchCat && matchLevel && matchStatus && matchSearch
    })
  }, [lessons, selectedCategory, selectedLevel, selectedStatus, search])

  // Pagination
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageData = filtered.slice(start, start + PAGE_SIZE)

  // Stats
  const stats = useMemo(() => {
    const publishedCount = lessons.filter((l) => l.status === 'published').length
    const totalSamples = lessons.reduce((acc, curr) => acc + (curr.audioSampleCount || 0), 0)
    return {
      totalLessons: lessons.length,
      publishedCount,
      totalSamples,
      avgAccuracy: 86.5,
    }
  }, [lessons])

  const handlePlayAudio = (e, item) => {
    e.stopPropagation()
    setPlayingAudioId(item.id)
    toast.success(`Đang phát audio phát âm chuẩn: ${item.ipaSymbol || item.title}`)
    setTimeout(() => {
      setPlayingAudioId(null)
    }, 2000)
  }

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      ipaSymbol: '',
      category: 'Vowels',
      level: 'B1',
      status: 'published',
      audioSampleCount: 24,
      aiMinScoreThreshold: 85,
      description: '',
      mouthShapeGuide: '',
      sampleWord: '',
      sampleWordIpa: '',
      sampleSentence: '',
    })
    setIsCreateOpen(true)
  }

  const handleOpenEdit = (e, item) => {
    e.stopPropagation()
    setEditingLesson(item)
    setFormData({
      title: item.title,
      ipaSymbol: item.ipaSymbol || '',
      category: item.category,
      level: item.level,
      status: item.status,
      audioSampleCount: item.audioSampleCount || 20,
      aiMinScoreThreshold: item.aiMinScoreThreshold || 85,
      description: item.description || '',
      mouthShapeGuide: item.mouthShapeGuide || '',
      sampleWord: item.sampleWords?.[0]?.word || '',
      sampleWordIpa: item.sampleWords?.[0]?.ipa || '',
      sampleSentence: item.sampleSentences?.[0]?.text || '',
    })
  }

  const handleDuplicate = (e, item) => {
    e.stopPropagation()
    const duplicate = {
      ...item,
      id: `pron-${Date.now()}`,
      title: `${item.title} (Bản sao)`,
      status: 'draft',
      authorName: user?.displayName || 'Admin',
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
      toast.error('Vui lòng nhập tên bài học phát âm')
      return
    }

    const sampleWordsArray = formData.sampleWord
      ? [{ word: formData.sampleWord, ipa: formData.sampleWordIpa || '', meaning: '' }]
      : []

    const sampleSentencesArray = formData.sampleSentence
      ? [{ text: formData.sampleSentence, ipa: '' }]
      : []

    if (editingLesson) {
      setLessons((prev) =>
        prev.map((item) =>
          item.id === editingLesson.id
            ? {
                ...item,
                title: formData.title.trim(),
                ipaSymbol: formData.ipaSymbol.trim(),
                category: formData.category,
                level: formData.level,
                status: formData.status,
                audioSampleCount: Number(formData.audioSampleCount) || 20,
                aiMinScoreThreshold: Number(formData.aiMinScoreThreshold) || 85,
                description: formData.description,
                mouthShapeGuide: formData.mouthShapeGuide,
                sampleWords: sampleWordsArray.length > 0 ? sampleWordsArray : item.sampleWords,
                sampleSentences: sampleSentencesArray.length > 0 ? sampleSentencesArray : item.sampleSentences,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      )
      toast.success('Đã cập nhật bài học phát âm!')
      setEditingLesson(null)
    } else {
      const newLesson = {
        id: `pron-${Date.now()}`,
        title: formData.title.trim(),
        ipaSymbol: formData.ipaSymbol.trim(),
        category: formData.category,
        level: formData.level,
        status: formData.status,
        audioSampleCount: Number(formData.audioSampleCount) || 24,
        aiMinScoreThreshold: Number(formData.aiMinScoreThreshold) || 85,
        description: formData.description,
        mouthShapeGuide: formData.mouthShapeGuide,
        sampleWords: sampleWordsArray,
        sampleSentences: sampleSentencesArray,
        authorName: user?.displayName || 'Hoàng Thị Mai',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
      setLessons((prev) => [newLesson, ...prev])
      toast.success('Đã thêm bài học phát âm mới!')
      setIsCreateOpen(false)
    }
  }

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Vừa xong'
    const diffHours = Math.floor((Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60))
    if (diffHours < 1) return 'Vừa xong'
    if (diffHours < 24) return `Cập nhật: ${diffHours} giờ trước`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Cập nhật: Hôm qua'
    if (diffDays < 7) return `Cập nhật: ${diffDays} ngày trước`
    return `Cập nhật: ${new Date(isoString).toLocaleDateString('vi-VN')}`
  }

  return (
    <main className="flex-1 bg-[#f8fafc] p-4 sm:p-6 space-y-6">
      {/* ─── Header & Top Actions ────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
            Quản lý Bài học Phát âm
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Quản lý học liệu luyện phát âm, trọng âm và ngữ điệu AI.
          </p>
        </div>

        <Button
          icon={Plus}
          onClick={handleOpenCreate}
          className="bg-navy-800 hover:bg-navy-900 text-white shadow-sm font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
        >
          Thêm bài học phát âm
        </Button>
      </div>

      {/* ─── Quick Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4 bg-white border border-line shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Tổng bài phát âm
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-600">
              <Headphones size={16} />
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
              Mẫu Audio chuẩn
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Volume2 size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-navy-800">{stats.totalSamples}+</p>
        </Card>

        <Card className="p-4 bg-white border border-line shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Điểm AI chuẩn
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Sparkles size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-navy-800">{stats.avgAccuracy}%</p>
        </Card>
      </div>

      {/* ─── Filter Bar (Image 2 Mockup) ─────────────────────────────────── */}
      <Card className="p-4 bg-white border border-line shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 min-w-[240px] relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="text"
              placeholder="Tìm kiếm bài học..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-line bg-canvas pl-10 pr-3.5 py-2.5 text-xs focus:border-brand-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Loại âm */}
          <div className="w-full sm:w-auto min-w-[170px]">
            <Select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setPage(1)
              }}
              className="text-xs bg-canvas rounded-xl border-line py-2"
            >
              {PRONUNCIATION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Loại âm: {cat}
                </option>
              ))}
            </Select>
          </div>

          {/* Cấp độ CEFR */}
          <div className="w-full sm:w-auto min-w-[150px]">
            <Select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value)
                setPage(1)
              }}
              className="text-xs bg-canvas rounded-xl border-line py-2"
            >
              {CEFR_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl === 'Tất cả' ? 'Cấp độ CEFR: Tất cả' : `Cấp độ ${lvl}`}
                </option>
              ))}
            </Select>
          </div>

          {/* Trạng thái */}
          <div className="w-full sm:w-auto min-w-[150px]">
            <Select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setPage(1)
              }}
              className="text-xs bg-canvas rounded-xl border-line py-2"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Nút Lọc / Reset */}
          <Button
            variant="secondary"
            icon={SlidersHorizontal}
            onClick={() => {
              setSearch('')
              setSelectedCategory('Tất cả phân loại')
              setSelectedLevel('Tất cả')
              setSelectedStatus('all')
              setPage(1)
            }}
            className="rounded-xl px-3.5 text-xs font-semibold"
          >
            Lọc
          </Button>
        </div>
      </Card>

      {/* ─── Table View (Image 2 Mockup) ─────────────────────────────────── */}
      <Card className="p-0 overflow-hidden bg-white border border-line shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-bold uppercase tracking-wider text-ink-muted border-b border-line">
              <tr>
                <th className="px-5 py-3.5">Tên bài học</th>
                <th className="px-4 py-3.5">Phân loại âm</th>
                <th className="px-4 py-3.5 text-center">Cấp độ</th>
                <th className="px-4 py-3.5">Audio</th>
                <th className="px-4 py-3.5 text-center">Trạng thái</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line bg-white">
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-ink-muted">
                    Không tìm thấy bài học phát âm nào khớp bộ lọc.
                  </td>
                </tr>
              ) : (
                pageData.map((item) => {
                  const isPublished = item.status === 'published'
                  const isPlaying = playingAudioId === item.id

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setActiveLesson(item)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Tên bài học */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-600 group-hover:scale-105 transition-transform">
                            <Headphones size={18} strokeWidth={2} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-navy-800 text-sm group-hover:text-brand-600 transition-colors">
                                {item.title}
                              </span>
                              {item.ipaSymbol && (
                                <span className="font-mono text-xs text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-md font-semibold">
                                  {item.ipaSymbol}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-ink-muted mt-0.5">
                              {formatRelativeTime(item.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phân loại âm */}
                      <td className="px-4 py-4 font-medium text-navy-800">
                        {item.category}
                      </td>

                      {/* Cấp độ */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-brand-600 border border-blue-100">
                          {item.level}
                        </span>
                      </td>

                      {/* Audio */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handlePlayAudio(e, item)}
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-full transition-colors cursor-pointer',
                              isPlaying
                                ? 'bg-brand-500 text-white animate-pulse'
                                : 'bg-slate-100 text-navy-800 hover:bg-brand-100 hover:text-brand-600',
                            )}
                            title="Nghe thử âm mẫu"
                          >
                            <Play size={13} fill="currentColor" />
                          </button>
                          <span className="text-xs text-ink-muted font-medium">
                            {item.audioSampleCount || 24} samples
                          </span>
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-4 py-4 text-center">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700 border border-amber-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td
                        onClick={(e) => e.stopPropagation()}
                        className="px-5 py-4 text-right"
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setActiveLesson(item)}
                            className="rounded-lg p-1.5 text-ink-muted hover:bg-slate-100 hover:text-brand-600 transition-colors cursor-pointer"
                            title="Xem chi tiết bài học"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleOpenEdit(e, item)}
                            className="rounded-lg p-1.5 text-ink-muted hover:bg-slate-100 hover:text-navy-800 transition-colors cursor-pointer"
                            title="Chỉnh sửa bài học"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDuplicate(e, item)}
                            className="rounded-lg p-1.5 text-ink-muted hover:bg-slate-100 hover:text-navy-800 transition-colors cursor-pointer"
                            title="Nhân bản bài học"
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteTarget(item)
                            }}
                            className="rounded-lg p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                            title="Xóa bài học"
                          >
                            <Trash2 size={15} />
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

        {/* ─── Footer Pagination (Image 2 Mockup) ─────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5">
          <p className="text-xs text-ink-muted">
            Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>-<strong>{Math.min(start + PAGE_SIZE, total)}</strong> trong tổng số{' '}
            <strong>{total}</strong> bài học
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </Card>

      {/* ─── Modal Create / Edit Lesson ──────────────────────────────────── */}
      <Modal
        open={isCreateOpen || Boolean(editingLesson)}
        onClose={() => {
          setIsCreateOpen(false)
          setEditingLesson(null)
        }}
        title={editingLesson ? 'Chỉnh sửa bài học phát âm' : 'Thêm bài học phát âm mới'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-800">
                Tên bài học phát âm *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="VD: Mastering the Schwa Sound..."
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-800">
                Ký hiệu IPA trọng tâm *
              </label>
              <Input
                value={formData.ipaSymbol}
                onChange={(e) => setFormData({ ...formData, ipaSymbol: e.target.value })}
                placeholder="VD: /ə/, /s/ - /z/, /θ/..."
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-800">
                Phân loại âm
              </label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {PRONUNCIATION_CATEGORIES.filter((c) => c !== 'Tất cả phân loại').map(
                  (cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ),
                )}
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
                Số lượng mẫu Audio (samples)
              </label>
              <Input
                type="number"
                min={1}
                max={100}
                value={formData.audioSampleCount}
                onChange={(e) =>
                  setFormData({ ...formData, audioSampleCount: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-800">
                Ngưỡng đạt chuẩn AI (%)
              </label>
              <Input
                type="number"
                min={50}
                max={100}
                value={formData.aiMinScoreThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, aiMinScoreThreshold: e.target.value })
                }
              />
            </div>

            <div className="sm:col-span-2">
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
                Mô tả đặc điểm phát âm
              </label>
              <Textarea
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Mô tả các lưu ý và vị trí xuất hiện của âm trong từ..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-navy-800">
                Hướng dẫn đặt khẩu hình miệng & lưỡi
              </label>
              <Textarea
                rows={2}
                value={formData.mouthShapeGuide}
                onChange={(e) =>
                  setFormData({ ...formData, mouthShapeGuide: e.target.value })
                }
                placeholder="VD: Môi mở tự nhiên, đầu lưỡi đặt nhẹ ở chân răng cửa trên..."
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-800">
                Từ vựng mẫu luyện âm
              </label>
              <Input
                value={formData.sampleWord}
                onChange={(e) => setFormData({ ...formData, sampleWord: e.target.value })}
                placeholder="VD: Banana, About..."
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-800">
                Phiên âm IPA của từ mẫu
              </label>
              <Input
                value={formData.sampleWordIpa}
                onChange={(e) =>
                  setFormData({ ...formData, sampleWordIpa: e.target.value })
                }
                placeholder="VD: /bəˈnæn.ə/..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-navy-800">
                Câu mẫu thực hành ngữ điệu
              </label>
              <Input
                value={formData.sampleSentence}
                onChange={(e) =>
                  setFormData({ ...formData, sampleSentence: e.target.value })
                }
                placeholder="VD: A cup of tea and a banana for breakfast."
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
              <span className="font-mono text-base font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                {activeLesson.ipaSymbol || '/IPA/'}
              </span>
              <Badge tone={LEVEL_TONE[activeLesson.level]}>
                Cấp độ {activeLesson.level}
              </Badge>
              <Badge tone="neutral">{activeLesson.category}</Badge>
              <Badge tone={activeLesson.status === 'published' ? 'success' : 'neutral'}>
                {activeLesson.status === 'published' ? 'Published' : 'Draft'}
              </Badge>
            </div>

            {/* Audio Waveform simulation player */}
            <div className="rounded-2xl bg-navy-900 p-4 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-200 uppercase tracking-wider">
                  Mẫu phát âm giọng bản xứ AI
                </span>
                <span className="text-xs text-slate-400">0:04 / 0:04</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => handlePlayAudio(e, activeLesson)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-400 cursor-pointer shadow-md"
                >
                  <Play size={18} fill="currentColor" />
                </button>
                <div className="flex-1 space-y-1">
                  <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
                    <div className="h-full bg-brand-400 rounded-full w-2/3" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-700/60">
                <span>Ngưỡng chuẩn: <strong>{activeLesson.aiMinScoreThreshold || 85}%</strong></span>
                <span>{activeLesson.audioSampleCount || 24} mẫu giọng khác nhau</span>
              </div>
            </div>

            {/* Khẩu hình miệng */}
            {activeLesson.mouthShapeGuide && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Khẩu hình miệng & cách phát âm
                </h4>
                <p className="mt-1.5 rounded-xl border border-line bg-canvas p-3 text-xs leading-relaxed text-navy-800">
                  {activeLesson.mouthShapeGuide}
                </p>
              </div>
            )}

            {/* Từ vựng luyện tập */}
            {activeLesson.sampleWords && activeLesson.sampleWords.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Từ vựng chứa âm ({activeLesson.sampleWords.length})
                </h4>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {activeLesson.sampleWords.map((sw, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-line bg-white p-2.5 text-xs shadow-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-navy-800">{sw.word}</p>
                        <p className="font-mono text-[11px] text-brand-600">{sw.ipa}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toast.success(`Phát âm từ: ${sw.word}`)
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                      >
                        <Volume2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Câu luyện tập */}
            {activeLesson.sampleSentences && activeLesson.sampleSentences.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Câu luyện phát âm & ngữ điệu
                </h4>
                <div className="mt-2 space-y-2">
                  {activeLesson.sampleSentences.map((sen, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-line bg-white p-3 text-xs space-y-1 shadow-xs"
                    >
                      <p className="font-semibold text-navy-800">{sen.text}</p>
                      {sen.ipa && (
                        <p className="font-mono text-[11px] text-ink-muted">{sen.ipa}</p>
                      )}
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
        title="Xóa bài học phát âm"
        description={`Bạn có chắc chắn muốn xóa bài học "${deleteTarget?.title}"? Tất cả mẫu audio và câu luyện tập sẽ bị xóa vĩnh viễn.`}
        confirmLabel="Xóa bài học"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  )
}

export default PronunciationPage
