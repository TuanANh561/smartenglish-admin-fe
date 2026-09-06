import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Crown } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import { listeningLessons } from '@/mocks/data/listening'
import { buildPublicContent } from '@/features/aiContent/aiContentService'
import { useAuthStore } from '@/store/authStore'
import { speakWord, stopAudio } from '@/lib/ipaHelper'
import ListeningDetailDrawer from './components/ListeningDetailDrawer'
import ListeningToolbar from './components/ListeningToolbar'
import ListeningTableRow from './components/ListeningTableRow'

const PAGE_SIZE = 8

const CEFR_MAP = {
  A1: { bg: '#f0fdf4', text: '#15803d', code: 'A1' },
  A2: { bg: '#f0fdf4', text: '#15803d', code: 'A2' },
  B1: { bg: '#eff6ff', text: '#1d4ed8', code: 'B1' },
  B2: { bg: '#eef2ff', text: '#4f46e5', code: 'B2' },
  C1: { bg: '#faf5ff', text: '#7c3aed', code: 'C1' },
  C2: { bg: '#faf5ff', text: '#7c3aed', code: 'C2' },
}

function extractCefr(levelStr) {
  if (!levelStr) return { bg: '#eff6ff', text: '#1d4ed8', code: 'B1' }
  const code = levelStr.substring(0, 2).trim()
  return CEFR_MAP[code] ?? { bg: '#eff6ff', text: '#1d4ed8', code: code || 'B1' }
}

function ListeningPage() {
  const user = useAuthStore((s) => s.user)
  const isTeacher = user?.role === 'teacher'
  const isAdmin = user?.role === 'admin'
  const navigate = useNavigate()

  const [lessons, setLessons] = useState(listeningLessons)
  const [ownershipFilter, setOwnershipFilter] = useState(isTeacher ? 'mine' : 'all')
  const [topic, setTopic] = useState('all')
  const [accent, setAccent] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [playingId, setPlayingId] = useState(null)
  const [activeLesson, setActiveLesson] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const publicLessons = useMemo(() => buildPublicContent('listening', lessons), [lessons])

  const checkOwnership = (item) => {
    if (!user || !item) return false
    if (isTeacher) {
      return (
        item.authorEmail === user.email ||
        item.authorName === user.displayName ||
        item.authorName === 'Hoàng Thị Mai'
      )
    }
    return (
      item.authorEmail === user.email ||
      item.authorEmail === 'system@smartenglish.vn' ||
      item.authorName?.includes('Hệ thống') ||
      item.authorName?.includes('Quản trị')
    )
  }

  const canManage = (item) => {
    if (!user || !item) return false
    if (isAdmin) return true
    return checkOwnership(item)
  }

  const myLessonsCount = useMemo(() => {
    return publicLessons.filter((item) => checkOwnership(item)).length
  }, [publicLessons, user])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return publicLessons.filter((item) => {
      const isOwned = checkOwnership(item)
      const isSystem =
        item.authorEmail === 'system@smartenglish.vn' || item.authorName?.includes('Hệ thống')

      let matchOwner = true
      if (ownershipFilter === 'mine') {
        matchOwner = isOwned
      } else if (ownershipFilter === 'system') {
        matchOwner = isSystem
      } else if (ownershipFilter === 'others') {
        matchOwner = !isOwned && !isSystem
      } else if (ownershipFilter !== 'all') {
        matchOwner = item.authorName === ownershipFilter || item.authorEmail === ownershipFilter
      }

      const matchTopic = topic === 'all' || item.topic === topic
      const matchAccent = accent === 'all' || item.accent === accent
      const matchSearch =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        (item.description || '').toLowerCase().includes(keyword) ||
        (item.topic || '').toLowerCase().includes(keyword)

      return matchOwner && matchTopic && matchAccent && matchSearch
    })
  }, [publicLessons, topic, accent, ownershipFilter, search, user])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageData = filtered.slice(start, start + PAGE_SIZE)

  const handlePlayToggle = (e, item) => {
    e.stopPropagation()
    if (playingId === item.id) {
      setPlayingId(null)
      stopAudio()
      toast('Dừng phát âm thanh', { icon: '⏸️' })
    } else {
      setPlayingId(item.id)
      speakWord(item.title + '. ' + (item.description || ''), item.audioUrl)
      toast.success(`Đang phát audio: "${item.title}"`)
    }
  }

  const handleOpenCreate = () => navigate('/hoc-lieu/bai-nghe/tao-moi')

  const handleEditClick = (e, item) => {
    e?.stopPropagation?.()
    if (!canManage(item)) {
      toast.error(`Bạn không có quyền sửa bài nghe của "${item.authorName || 'người khác'}".`)
      return
    }
    navigate(`/hoc-lieu/bai-nghe/${item.id}/chinh-sua`)
  }

  const handleDeleteClick = (e, item) => {
    e?.stopPropagation?.()
    if (!canManage(item)) {
      toast.error('Chỉ tác giả mới có quyền xoà bài nghe này!')
      return
    }
    setDeleteTarget(item)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    setLessons((prev) => prev.filter((l) => l.id !== deleteTarget.id))
    toast.success(`Đã xoà bài nghe "${deleteTarget.title}"`)
    setDeleteTarget(null)
  }

  const handleAssignToClass = (e, item) => {
    e.stopPropagation()
    toast.success(`Đã mở popup giao bài nghe "${item.title}" cho lớp`)
  }

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
              Bạn đã tạo <strong className="text-brand-600 font-bold">{myLessonsCount}</strong> bài nghe · Hạn mức{' '}
              <strong className="text-emerald-600 font-bold">Không giới hạn</strong>
            </span>
          </div>
          <Link to="/goi-dich-vu" className="ml-auto font-semibold text-brand-600 hover:underline">
            Chi tiết gói →
          </Link>
        </div>
      )}

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Toolbar */}
        <ListeningToolbar
          search={search}
          setSearch={setSearch}
          setPage={setPage}
          ownershipFilter={ownershipFilter}
          setOwnershipFilter={setOwnershipFilter}
          topic={topic}
          setTopic={setTopic}
          accent={accent}
          setAccent={setAccent}
          totalLessons={publicLessons.length}
          myLessonsCount={myLessonsCount}
          isTeacher={isTeacher}
          onOpenCreate={handleOpenCreate}
        />

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3.5 w-[34%] min-w-[250px]">BÀI NGHE AUDIO</th>
                <th className="px-4 py-3.5 w-[14%] min-w-[110px]">CHỦ ĐỀ</th>
                <th className="px-4 py-3.5 text-center w-[10%] min-w-[80px]">CẤP ĐỘ</th>
                <th className="px-4 py-3.5 text-center w-[11%] min-w-[90px]">THỜI LƯỢNG</th>
                <th className="px-4 py-3.5 w-[13%] min-w-[120px]">NGUỒN / TÁC GIẢ</th>
                <th className="px-4 py-3.5 w-[14%] min-w-[130px]">BẢN CHÉP LỜI</th>
                <th className="px-6 py-3.5 text-right w-[14%] min-w-[130px]">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                    Không tìm thấy bài nghe nào phù hợp
                  </td>
                </tr>
              ) : (
                pageData.map((item) => (
                  <ListeningTableRow
                    key={item.id}
                    item={item}
                    isOwned={checkOwnership(item)}
                    isSystem={
                      item.authorEmail === 'system@smartenglish.vn' ||
                      item.authorName?.includes('Hệ thống')
                    }
                    cefr={extractCefr(item.level)}
                    isPlaying={playingId === item.id}
                    canManage={canManage(item)}
                    isTeacher={isTeacher}
                    onPlayToggle={handlePlayToggle}
                    onRowClick={setActiveLesson}
                    onAssignToClass={handleAssignToClass}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-500">
            Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>-
            <strong>{Math.min(start + PAGE_SIZE, total)}</strong> trong tổng số{' '}
            <strong>{total}</strong> bài nghe
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* Drawer xem chi tiết bài nghe */}
      <ListeningDetailDrawer
        lesson={activeLesson}
        onClose={() => setActiveLesson(null)}
        isTeacher={isTeacher}
        isOwner={checkOwnership(activeLesson)}
        canManage={canManage(activeLesson)}
        isPlaying={playingId === activeLesson?.id}
        onPlayToggle={handlePlayToggle}
        onAssignToClass={handleAssignToClass}
        onEditClick={handleEditClick}
      />

      {/* Confirm Xóa */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xoà bài nghe"
        description={`Bạn có chắc muốn xoà bài nghe "${deleteTarget?.title}"?`}
        confirmLabel="Xoà bài nghe"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default ListeningPage
