import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Crown,
  Eye,
  FileText,
  Headphones,
  Lock,
  Mic,
  Pencil,
  Play,
  Plus,
  Search,
  Send,
  Square,
  Trash2,
  Upload,
  Volume2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import { cn, formatDate } from '@/lib/utils'
import {
  LISTENING_ACCENTS,
  LISTENING_TOPICS,
  listeningLessons,
} from '@/mocks/data/listening'
import { buildPublicContent } from '@/features/aiContent/aiContentService'
import { useAuthStore } from '@/store/authStore'

const PAGE_SIZE = 8

const CEFR_MAP = {
  'A1': { bg: '#f0fdf4', text: '#15803d', code: 'A1' },
  'A2': { bg: '#f0fdf4', text: '#15803d', code: 'A2' },
  'B1': { bg: '#eff6ff', text: '#1d4ed8', code: 'B1' },
  'B2': { bg: '#eef2ff', text: '#4f46e5', code: 'B2' },
  'C1': { bg: '#faf5ff', text: '#7c3aed', code: 'C1' },
  'C2': { bg: '#faf5ff', text: '#7c3aed', code: 'C2' },
}

function extractCefr(levelStr) {
  if (!levelStr) return { bg: '#eff6ff', text: '#1d4ed8', code: 'B1' }
  const code = levelStr.substring(0, 2).trim()
  return CEFR_MAP[code] ?? { bg: '#eff6ff', text: '#1d4ed8', code: code || 'B1' }
}

function ListeningPage() {
  const user = useAuthStore((s) => s.user)
  const isTeacher = user?.role === 'teacher'

  const [ownershipFilter, setOwnershipFilter] = useState(isTeacher ? 'mine' : 'all')
  const [topic, setTopic] = useState('all')
  const [accent, setAccent] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [playingId, setPlayingId] = useState(null)
  const [activeLesson, setActiveLesson] = useState(null)

  const publicLessons = useMemo(() => buildPublicContent('listening', listeningLessons), [])

  const checkOwnership = (item) => {
    if (!user) return false
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
    if (!user) return false
    if (user.role === 'admin') return true
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
      toast('Đã dừng phát âm thanh', { icon: '⏸️' })
    } else {
      setPlayingId(item.id)
      toast.success(`Đang phát audio: "${item.title}"`)
    }
  }

  const handleEditClick = (e, item) => {
    e.stopPropagation()
    if (!canManage(item)) {
      toast.error(`Bạn không có quyền sửa bài nghe của "${item.authorName || 'người khác'}".`)
      return
    }
    toast.success(`Mở trình sửa bài nghe: "${item.title}"`)
  }

  const handleDeleteClick = (e, item) => {
    e.stopPropagation()
    if (!canManage(item)) {
      toast.error('Chỉ tác giả mới có quyền xoá bài nghe này!')
      return
    }
    toast.success(`Đã xoá bài nghe "${item.title}"`)
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

      {/* Table Card (Matching Classes & Grammar reference design) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4 border-b border-slate-100">
          {/* Search */}
          <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Tìm theo tên bài nghe, chủ đề, giọng đọc..."
              className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>

          {/* Filters & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Học liệu */}
            <select
              value={ownershipFilter}
              onChange={(e) => {
                setOwnershipFilter(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="all">Học liệu: Tất cả ({publicLessons.length})</option>
              <option value="mine">Học liệu: Của tôi ({myLessonsCount})</option>
              <option value="system">Học liệu: Hệ thống SmartEnglish</option>
              {isTeacher && <option value="others">Học liệu: Giáo viên khác</option>}
            </select>

            {/* Chủ đề */}
            <select
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="all">Chủ đề: Tất cả</option>
              {LISTENING_TOPICS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* Giọng đọc */}
            <select
              value={accent}
              onChange={(e) => {
                setAccent(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="all">Giọng đọc: Tất cả</option>
              {LISTENING_ACCENTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* Tải lên hàng loạt */}
            <button
              type="button"
              onClick={() => toast.success('Mở popup tải lên hàng loạt')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Upload size={14} />
              <span>Tải lên</span>
            </button>

            {/* Thêm bài nghe */}
            <button
              type="button"
              onClick={() => toast.success('Mở form tạo bài nghe mới')}
              className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={15} />
              <span>Thêm bài nghe</span>
            </button>
          </div>
        </div>

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
                pageData.map((item) => {
                  const isOwned = checkOwnership(item)
                  const isSystem =
                    item.authorEmail === 'system@smartenglish.vn' ||
                    item.authorName?.includes('Hệ thống')
                  const cefr = extractCefr(item.level)
                  const isPlaying = playingId === item.id
                  const isReady = item.status === 'ready'

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setActiveLesson(item)}
                      className="group transition-colors hover:bg-slate-50/50 cursor-pointer"
                    >
                      {/* Tiêu đề + Nút Play Audio */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3.5">
                          <button
                            type="button"
                            onClick={(e) => handlePlayToggle(e, item)}
                            className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer shadow-2xs',
                              isPlaying
                                ? 'bg-brand-500 text-white animate-pulse'
                                : 'bg-blue-50 text-brand-600 hover:bg-brand-500 hover:text-white',
                            )}
                            title={isPlaying ? 'Dừng audio' : 'Nghe thử audio'}
                          >
                            {isPlaying ? (
                              <Volume2 size={16} />
                            ) : (
                              <Play size={16} className="ml-0.5" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm tracking-tight truncate block group-hover:text-brand-600 transition-colors">
                                {item.title}
                              </span>
                              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                {item.accent}
                              </span>
                            </div>
                            <span className="line-clamp-1 text-xs text-slate-500 mt-0.5">
                              {item.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Chủ đề */}
                      <td className="px-4 py-4.5 text-sm font-medium text-slate-700 whitespace-nowrap">
                        {item.topic}
                      </td>

                      {/* Cấp độ */}
                      <td className="px-4 py-4.5 text-center whitespace-nowrap">
                        <span
                          className="inline-flex items-center justify-center rounded-lg px-2.5 py-0.5 text-xs font-bold shadow-2xs"
                          style={{ backgroundColor: cefr.bg, color: cefr.text }}
                        >
                          {cefr.code}
                        </span>
                      </td>

                      {/* Thời lượng */}
                      <td className="px-4 py-4.5 text-center font-bold text-slate-800 text-sm whitespace-nowrap">
                        {item.duration}
                      </td>

                      {/* Tác giả / Nguồn */}
                      <td className="px-4 py-4.5 whitespace-nowrap">
                        {isTeacher && isOwned ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Của tôi
                          </span>
                        ) : isSystem ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Hệ thống
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 border border-amber-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            {item.authorName}
                          </span>
                        )}
                      </td>

                      {/* Bản chép lời / Transcript status */}
                      <td className="px-4 py-4.5 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                            isReady
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-amber-50 text-amber-800 border border-amber-100',
                          )}
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              isReady ? 'bg-emerald-500' : 'bg-amber-500',
                            )}
                          />
                          {isReady ? 'Bản chép sẵn sàng' : 'Cần kiểm tra'}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1 text-slate-400"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Nút giao bài */}
                          {isTeacher && isOwned && (
                            <button
                              type="button"
                              onClick={(e) => handleAssignToClass(e, item)}
                              className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                              title="Giao bài nghe cho lớp học"
                            >
                              <Send size={17} />
                            </button>
                          )}

                          {/* Nút xem chi tiết */}
                          <button
                            type="button"
                            onClick={() => setActiveLesson(item)}
                            className="rounded-lg p-1.5 hover:bg-brand-50 hover:text-brand-600 transition-colors cursor-pointer"
                            title="Xem chi tiết bài nghe"
                          >
                            <Eye size={17} />
                          </button>

                          {/* Sửa / Xóa hoặc Lock */}
                          {canManage(item) ? (
                            <>
                              <button
                                type="button"
                                onClick={(e) => handleEditClick(e, item)}
                                className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <Pencil size={17} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteClick(e, item)}
                                className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                                title="Xóa bài nghe"
                              >
                                <Trash2 size={17} />
                              </button>
                            </>
                          ) : (
                            <span
                              className="p-1.5 text-slate-300"
                              title="Chỉ xem (Không có quyền chỉnh sửa)"
                            >
                              <Lock size={15} />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
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
      <Drawer
        open={Boolean(activeLesson)}
        onClose={() => setActiveLesson(null)}
        title={activeLesson?.title}
      >
        {activeLesson && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="info">{activeLesson.level}</Badge>
              <Badge tone="neutral">{activeLesson.topic}</Badge>
              <Badge tone="neutral">{activeLesson.accent}</Badge>
              <Badge tone={checkOwnership(activeLesson) ? 'success' : 'neutral'}>
                Tác giả: {activeLesson.authorName || 'Hệ thống'}
              </Badge>
              <span className="text-xs text-ink-muted">
                Cập nhật {formatDate(activeLesson.createdAt)}
              </span>
            </div>

            {/* Audio Waveform Player */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => handlePlayToggle(e, activeLesson)}
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-2xl shadow-xs transition-transform hover:scale-105 cursor-pointer',
                      playingId === activeLesson.id
                        ? 'bg-brand-500 text-white'
                        : 'bg-navy-800 text-white',
                    )}
                  >
                    {playingId === activeLesson.id ? (
                      <Volume2 size={22} />
                    ) : (
                      <Play size={22} className="ml-1" />
                    )}
                  </button>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">
                      {playingId === activeLesson.id ? 'Đang phát âm thanh...' : 'Audio chuẩn Studio'}
                    </h5>
                    <p className="text-xs text-slate-500">
                      Thời lượng: {activeLesson.duration} · Định dạng MP3 320kbps
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-navy-700">Mô tả bài nghe</h4>
              <p className="rounded-lg bg-canvas p-3 text-sm leading-relaxed text-ink">
                {activeLesson.description}
              </p>
            </div>

            {/* Bottom Actions trong Drawer */}
            <div className="flex gap-2 border-t border-line pt-4">
              {isTeacher && checkOwnership(activeLesson) && (
                <Button
                  variant="primary"
                  fullWidth
                  icon={Send}
                  onClick={(e) => handleAssignToClass(e, activeLesson)}
                >
                  Giao bài nghe này cho lớp
                </Button>
              )}
              {canManage(activeLesson) ? (
                <Button
                  variant={isTeacher && checkOwnership(activeLesson) ? 'secondary' : 'primary'}
                  fullWidth={!isTeacher || !checkOwnership(activeLesson)}
                  icon={Pencil}
                  onClick={(e) => handleEditClick(e, activeLesson)}
                >
                  Chỉnh sửa
                </Button>
              ) : (
                <div className="w-full text-center text-xs text-ink-muted py-2 bg-slate-50 rounded-lg">
                  <Lock size={13} className="inline mr-1" />
                  Bạn đang xem bài nghe của tác giả khác (Không có quyền giao bài hoặc chỉnh sửa)
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default ListeningPage
