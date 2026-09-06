import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Crown } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import { pronunciationLessons } from '@/mocks/data/pronunciation'
import { useAuthStore } from '@/store/authStore'
import { speakWord, stopAudio } from '@/lib/ipaHelper'
import PronunciationToolbar from './components/PronunciationToolbar'
import PronunciationTableRow from './components/PronunciationTableRow'
import PronunciationDetailDrawer from './components/PronunciationDetailDrawer'

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
        <PronunciationToolbar
          search={search}
          onSearchChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          selectedCategory={selectedCategory}
          onCategoryChange={(val) => {
            setSelectedCategory(val)
            setPage(1)
          }}
          selectedLevel={selectedLevel}
          onLevelChange={(val) => {
            setSelectedLevel(val)
            setPage(1)
          }}
          selectedStatus={selectedStatus}
          onStatusChange={(val) => {
            setSelectedStatus(val)
            setPage(1)
          }}
          onOpenCreate={handleOpenCreate}
        />

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
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
                pageData.map((item) => (
                  <PronunciationTableRow
                    key={item.id}
                    item={item}
                    isPlaying={playingAudioId === item.id}
                    onPlayAudio={handlePlayAudio}
                    onViewDetails={setActiveLesson}
                    onEdit={handleOpenEdit}
                    onDuplicate={handleDuplicate}
                    onDelete={(e, it) => {
                      e.stopPropagation()
                      setDeleteTarget(it)
                    }}
                  />
                ))
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

      {/* ─── Drawer View Lesson Details ─────────────────────────────────── */}
      <PronunciationDetailDrawer
        activeLesson={activeLesson}
        onClose={() => setActiveLesson(null)}
        onPlayAudio={handlePlayAudio}
        onEdit={(e, it) => {
          setActiveLesson(null)
          navigate(`/hoc-lieu/phat-am/${it.id}/chinh-sua`)
        }}
      />

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
