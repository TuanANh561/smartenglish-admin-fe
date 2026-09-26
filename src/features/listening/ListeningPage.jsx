import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Crown, Headphones, RotateCcw, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuthStore } from '@/store/authStore'
import { parseDuration, playListeningLessonFull, stopAudio } from '@/lib/ipaHelper'
import ListeningDetailDrawer from './components/ListeningDetailDrawer'
import ListeningToolbar from './components/ListeningToolbar'
import ListeningTableRow from './components/ListeningTableRow'
import {
  deleteListeningLesson,
  getListeningLessons,
  getListeningStatistics,
  permanentDeleteListeningLesson,
  restoreListeningLesson,
} from './listeningLessonApi'

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

  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, trash: 0 })

  const [ownershipFilter, setOwnershipFilter] = useState('all')
  const [category, setCategory] = useState('all')
  const [topic, setTopic] = useState('all')
  const [accent, setAccent] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [trashView, setTrashView] = useState(false)

  const [activeLesson, setActiveLesson] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null)

  // Playback state tập trung
  const [playback, setPlayback] = useState({
    playingId: null,
    currentTime: 0,
    duration: 35,
  })

  // Timer đồng bộ thời gian phát thực tế (không tự ngắt khi vượt quá duration để đọc hết kịch bản)
  useEffect(() => {
    if (!playback.playingId) return

    const timer = setInterval(() => {
      setPlayback((prev) => {
        if (!prev.playingId) return prev
        const nextTime = prev.currentTime + 1
        const newDuration = Math.max(prev.duration, nextTime)
        return { ...prev, currentTime: nextTime, duration: newDuration }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [playback.playingId])

  // Ngắt toàn bộ âm thanh khi người dùng rời khỏi trang
  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [])

  // Tải danh sách bài nghe từ API
  const fetchLessons = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getListeningLessons({
        page,
        size: PAGE_SIZE,
        search,
        category,
        topic,
        accent,
        trash: trashView,
      })
      setLessons(res.items || [])
      setTotal(res.total || 0)
      setTotalPages(res.totalPages || 1)

      const s = await getListeningStatistics()
      if (s) setStats(s)
    } catch (err) {
      console.error('Lỗi khi tải bài nghe:', err)
      toast.error('Không thể tải danh sách bài nghe')
    } finally {
      setLoading(false)
    }
  }, [page, search, category, topic, accent, trashView])

  useEffect(() => {
    fetchLessons()
  }, [fetchLessons])

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

  // Lọc thêm theo quyền sở hữu trên client (nếu giáo viên chọn 'Của tôi' hoặc 'Hệ thống')
  const displayedLessons = useMemo(() => {
    if (ownershipFilter === 'all') return lessons
    return lessons.filter((item) => {
      const isOwned = checkOwnership(item)
      const isSystem =
        item.authorEmail === 'system@smartenglish.vn' || item.authorName?.includes('Hệ thống')

      if (ownershipFilter === 'mine') return isOwned
      if (ownershipFilter === 'system') return isSystem
      if (ownershipFilter === 'others') return !isOwned && !isSystem
      return true
    })
  }, [lessons, ownershipFilter, user])

  // Cơ chế phát âm thanh chuẩn theo yêu cầu:
  // - Bất kể có audio hay không có audio, đọc hết toàn bộ script đến khi kết thúc
  // - Không đọc tiêu đề bài học TOEIC (tránh dư thừa)
  // - TOEIC Part 1 / Part 2 / Miêu tả ảnh: đọc nội dung dẫn chuyện Narrator và lần lượt đáp án A, B, C, D
  // - Hội thoại / Part 3, 4: đọc toàn bộ hội thoại rồi đọc Question number 1: [câu hỏi], ngừng một chút, Question number 2... (không đọc đáp án)
  const handlePlayToggle = (e, item) => {
    e?.stopPropagation?.()
    if (!item) return

    if (playback.playingId === item.id) {
      setPlayback({ playingId: null, currentTime: 0, duration: 0 })
      stopAudio()
      toast('Đã dừng phát bài nghe', { icon: '⏸️' })
    } else {
      const durSec = parseDuration(item.duration) || item.durationSec || 30
      setPlayback({ playingId: item.id, currentTime: 0, duration: durSec })

      playListeningLessonFull(item, () => {
        setPlayback({ playingId: null, currentTime: 0, duration: 0 })
      })
      toast.success(`Đang phát: "${item.title}"`)
    }
  }

  const handleSeek = (newTime) => {
    setPlayback((prev) => {
      if (!prev.playingId) return prev
      const safeTime = Math.max(0, Math.min(prev.duration, newTime))
      return { ...prev, currentTime: safeTime }
    })
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
      toast.error('Chỉ tác giả hoặc quản trị viên mới có quyền xoá bài nghe này!')
      return
    }
    if (trashView) {
      setPermanentDeleteTarget(item)
    } else {
      setDeleteTarget(item)
    }
  }

  // Xóa mềm -> đưa vào thùng rác
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteListeningLesson(deleteTarget.id, user?.displayName || user?.email || 'Admin')
      toast.success(`Đã chuyển bài nghe "${deleteTarget.title}" vào thùng rác`)
      setDeleteTarget(null)
      fetchLessons()
    } catch {
      toast.error('Không thể xóa bài nghe')
    }
  }

  // Khôi phục bài nghe
  const handleRestore = async (e, item) => {
    e.stopPropagation()
    try {
      await restoreListeningLesson(item.id)
      toast.success(`Đã khôi phục bài nghe "${item.title}"`)
      fetchLessons()
    } catch {
      toast.error('Không thể khôi phục bài nghe')
    }
  }

  // Xóa vĩnh viễn
  const handleConfirmPermanentDelete = async () => {
    if (!permanentDeleteTarget) return
    try {
      await permanentDeleteListeningLesson(permanentDeleteTarget.id)
      toast.success(`Đã xóa vĩnh viễn bài nghe "${permanentDeleteTarget.title}"`)
      setPermanentDeleteTarget(null)
      fetchLessons()
    } catch {
      toast.error('Không thể xóa vĩnh viễn')
    }
  }

  const handleAssignToClass = (e, item) => {
    e.stopPropagation()
    toast.success(`Đã mở popup giao bài nghe "${item.title}" cho lớp`)
  }

  const myLessonsCount = useMemo(() => {
    return lessons.filter((item) => checkOwnership(item)).length
  }, [lessons, user])

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
              Đang quản lý <strong className="text-brand-600 font-bold">{total}</strong> bài nghe · Hạn mức{' '}
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
        {/* Banner thông báo khi ở chế độ thùng rác */}
        {trashView && (
          <div className="flex items-center justify-between bg-amber-50/90 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-800">
            <span className="flex items-center gap-1.5 font-medium">
              <Trash2 size={14} className="text-amber-600 shrink-0" />
              Bạn đang xem các bài nghe trong <strong>Thùng rác</strong> ({stats.trash || 0}). Bạn có thể khôi phục hoặc xóa hẳn bất kỳ lúc nào.
            </span>
          </div>
        )}
        {/* Toolbar */}
        <ListeningToolbar
          search={search}
          setSearch={setSearch}
          setPage={setPage}
          ownershipFilter={ownershipFilter}
          setOwnershipFilter={setOwnershipFilter}
          category={category}
          setCategory={setCategory}
          topic={topic}
          setTopic={setTopic}
          trashView={trashView}
          setTrashView={setTrashView}
          trashCount={stats.trash || 0}
          totalLessons={total}
          myLessonsCount={myLessonsCount}
          isTeacher={isTeacher}
          onOpenCreate={handleOpenCreate}
          onReload={fetchLessons}
        />

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3.5 w-[36%] min-w-[280px]">BÀI NGHE AUDIO</th>
                <th className="px-4 py-3.5 w-[14%] min-w-[110px]">CHỦ ĐỀ</th>
                <th className="px-4 py-3.5 text-center w-[10%] min-w-[80px]">CẤP ĐỘ</th>
                <th className="px-4 py-3.5 text-center w-[11%] min-w-[90px]">THỜI LƯỢNG</th>
                <th className="px-4 py-3.5 w-[13%] min-w-[120px]">NGUỒN / TÁC GIẢ</th>
                <th className="px-4 py-3.5 w-[14%] min-w-[140px]">BẢN CHÉP & CÂU HỎI</th>
                <th className="px-6 py-3.5 text-right w-[14%] min-w-[130px]">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <LoadingSpinner text="Đang tải danh sách bài nghe từ máy chủ..." />
                  </td>
                </tr>
              ) : displayedLessons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                    {trashView ? 'Thùng rác đang trống' : 'Không tìm thấy bài nghe nào phù hợp'}
                  </td>
                </tr>
              ) : (
                displayedLessons.map((item) => (
                  <ListeningTableRow
                    key={item.id}
                    item={item}
                    isOwned={checkOwnership(item)}
                    isSystem={
                      item.authorEmail === 'system@smartenglish.vn' ||
                      item.authorName?.includes('Hệ thống')
                    }
                    cefr={extractCefr(item.cefrLevel || item.level)}
                    isPlaying={playback.playingId === item.id}
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
            Hiển thị <strong>{total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}</strong>-
            <strong>{Math.min(page * PAGE_SIZE, total)}</strong> trong tổng số{' '}
            <strong>{total}</strong> bài nghe
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* Drawer xem chi tiết bài nghe */}
      <ListeningDetailDrawer
        lesson={activeLesson}
        onClose={() => {
          stopAudio()
          setPlayback({ playingId: null, currentTime: 0, duration: 0 })
          setActiveLesson(null)
        }}
        isTeacher={isTeacher}
        isOwner={checkOwnership(activeLesson)}
        canManage={canManage(activeLesson)}
        isPlaying={playback.playingId === activeLesson?.id}
        currentTime={playback.playingId === activeLesson?.id ? playback.currentTime : 0}
        onSeek={handleSeek}
        onPlayToggle={handlePlayToggle}
        onAssignToClass={handleAssignToClass}
        onEditClick={handleEditClick}
      />

      {/* Confirm Chuyển vào Thùng rác */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Chuyển vào thùng rác"
        description={`Bạn có chắc muốn chuyển bài nghe "${deleteTarget?.title}" vào thùng rác? Bạn có thể khôi phục lại bất kỳ lúc nào.`}
        confirmLabel="Chuyển vào thùng rác"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Confirm Xóa vĩnh viễn */}
      <ConfirmDialog
        open={Boolean(permanentDeleteTarget)}
        title="Xóa vĩnh viễn bài nghe"
        description={`CẢNH BÁO: Thao tác này sẽ xóa vĩnh viễn bài nghe "${permanentDeleteTarget?.title}" khỏi hệ thống và không thể khôi phục. Bạn có chắc chắn?`}
        confirmLabel="Xóa vĩnh viễn"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleConfirmPermanentDelete}
        onCancel={() => setPermanentDeleteTarget(null)}
      />
    </div>
  )
}

export default ListeningPage
