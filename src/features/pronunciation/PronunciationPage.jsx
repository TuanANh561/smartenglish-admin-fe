import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Copy,
  Crown,
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
  Send,
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
import { cn, formatNumber, formatRelativeTime } from '@/lib/utils'
import {
  PRONUNCIATION_CATEGORIES,
  pronunciationLessons,
} from '@/mocks/data/pronunciation'
import { useAuthStore } from '@/store/authStore'
import { speakWord, stopAudio } from '@/lib/ipaHelper'

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

const LEVEL_COLOR = {
  A1: { bg: '#f0fdf4', text: '#15803d' },
  A2: { bg: '#f0fdf4', text: '#15803d' },
  B1: { bg: '#eff6ff', text: '#1d4ed8' },
  B2: { bg: '#eef2ff', text: '#4f46e5' },
  C1: { bg: '#faf5ff', text: '#7c3aed' },
  C2: { bg: '#faf5ff', text: '#7c3aed' },
}

const PAGE_SIZE = 8

function PronunciationPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [lessons, setLessons] = useState(pronunciationLessons)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tất cả phân loại')
  const [selectedLevel, setSelectedLevel] = useState('Tất cả')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [page, setPage] = useState(1)

  // Drawer / Modal states
  const [activeLesson, setActiveLesson] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [playingAudioId, setPlayingAudioId] = useState(null)

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
    if (playingAudioId === item.id) {
      setPlayingAudioId(null)
      stopAudio()
    } else {
      setPlayingAudioId(item.id)
      const wordToSpeak = item.sampleWords?.[0]?.word || item.title || item.ipaSymbol
      speakWord(wordToSpeak)
      toast.success(`Phát âm mẫu: ${item.ipaSymbol || item.title}`)
      setTimeout(() => {
        setPlayingAudioId(null)
      }, 2000)
    }
  }

  const handleOpenCreate = () => {
    navigate('/hoc-lieu/phat-am/tao-moi')
  }

  const handleOpenEdit = (e, item) => {
    e?.stopPropagation?.()
    navigate(`/hoc-lieu/phat-am/${item.id}/chinh-sua`)
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
              Bạn đã tạo <strong className="text-brand-600 font-bold">{lessons.length}</strong> bài phát âm · Hạn mức{' '}
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
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Tìm kiếm bài học phát âm, âm IPA..."
              className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              {PRONUNCIATION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'Tất cả phân loại' ? 'Phân loại: Tất cả' : cat}
                </option>
              ))}
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value)
                setPage(1)
              }}
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
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={15} />
              <span>Thêm bài phát âm</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3.5 w-[36%] min-w-[260px]">BÀI HỌC PHÁT ÂM</th>
                <th className="px-4 py-3.5 w-[14%] min-w-[120px]">PHÂN LOẠI ÂM</th>
                <th className="px-4 py-3.5 text-center w-[10%] min-w-[80px]">CẤP ĐỘ</th>
                <th className="px-4 py-3.5 text-center w-[13%] min-w-[110px]">MẪU AUDIO</th>
                <th className="px-4 py-3.5 w-[13%] min-w-[120px]">TRẠNG THÁI</th>
                <th className="px-4 py-3.5 w-[11%] min-w-[100px]">CẬP NHẬT</th>
                <th className="px-6 py-3.5 text-right w-[14%] min-w-[130px]">THAO TÁC</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                    Không tìm thấy bài học phát âm nào khớp bộ lọc.
                  </td>
                </tr>
              ) : (
                pageData.map((item) => {
                  const isPublished = item.status === 'published'
                  const isPlaying = playingAudioId === item.id
                  const levelStyle = LEVEL_COLOR[item.level] ?? LEVEL_COLOR.A1

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
                            <Headphones size={18} strokeWidth={1.75} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm tracking-tight truncate block group-hover:text-brand-600 transition-colors">
                                {item.title}
                              </span>
                              {item.ipaSymbol && (
                                <span className="font-mono text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md font-semibold border border-brand-100">
                                  {item.ipaSymbol}
                                </span>
                              )}
                            </div>
                            <span className="line-clamp-1 text-xs text-slate-500 mt-0.5">
                              {item.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phân loại âm */}
                      <td className="px-4 py-4.5 text-sm font-medium text-slate-700 whitespace-nowrap">
                        {item.category}
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

                      {/* Mẫu Audio */}
                      <td className="px-4 py-4.5 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handlePlayAudio(e, item)}
                            className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all cursor-pointer shadow-2xs',
                              isPlaying
                                ? 'bg-brand-500 text-white animate-pulse'
                                : 'bg-blue-50 text-brand-600 hover:bg-brand-500 hover:text-white',
                            )}
                            title={isPlaying ? 'Dừng audio' : 'Nghe thử âm mẫu'}
                          >
                            <Volume2 size={14} />
                          </button>
                          <span className="font-bold text-slate-800 text-sm">
                            {item.audioSampleCount || 24} mẫu
                          </span>
                        </div>
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
                      <td
                        onClick={(e) => e.stopPropagation()}
                        className="px-6 py-4.5 whitespace-nowrap text-right"
                      >
                        <div className="flex items-center justify-end gap-1 text-slate-400">
                          <button
                            type="button"
                            onClick={() => setActiveLesson(item)}
                            className="rounded-lg p-1.5 hover:bg-brand-50 hover:text-brand-600 transition-colors cursor-pointer"
                            title="Xem chi tiết bài học"
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleOpenEdit(e, item)}
                            className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Chỉnh sửa bài học"
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDuplicate(e, item)}
                            className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Nhân bản bài học"
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
                            title="Xóa bài học"
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

        {/* ─── Footer Pagination ─────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-3.5">
          <p className="text-xs text-slate-500">
            Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>-<strong>{Math.min(start + PAGE_SIZE, total)}</strong> trong tổng số{' '}
            <strong>{total}</strong> bài học
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* Form hiện ở trang riêng: /hoc-lieu/phat-am/tao-moi hoặc /:id/chinh-sua */}

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
                          speakWord(sw.word)
                          toast.success(`Phát âm: "${sw.word}"`)
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors cursor-pointer"
                        title="Phát âm từ mẫu"
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
                  navigate(`/hoc-lieu/phat-am/${target.id}/chinh-sua`)
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
    </div>
  )
}

export default PronunciationPage
