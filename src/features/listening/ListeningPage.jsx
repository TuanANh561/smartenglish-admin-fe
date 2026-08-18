import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Crown,
  FileText,
  LayoutGrid,
  LayoutList,
  Lock,
  Mic,
  Pencil,
  Play,
  Plus,
  Send,
  Trash2,
  Upload,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import FilterChip from '@/components/ui/FilterChip'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import {
  LISTENING_ACCENTS,
  LISTENING_TOPICS,
  listeningLessons,
} from '@/mocks/data/listening'
import { buildPublicContent } from '@/features/aiContent/aiContentService'
import { useAuthStore } from '@/store/authStore'

const STATUS_META = {
  ready: { label: 'Bản chép lời sẵn sàng', tone: 'info', Icon: CheckCircle2 },
  review: { label: 'Cần kiểm tra lại', tone: 'warning', Icon: AlertTriangle },
}

function Waveform({ bars }) {
  const max = Math.max(...bars)
  return (
    <svg viewBox={`0 0 ${bars.length * 8} 40`} className="h-10 w-full" preserveAspectRatio="none">
      {bars.map((value, index) => (
        <rect
          key={index}
          x={index * 8}
          y={40 - (value / max) * 36}
          width={5}
          height={(value / max) * 36}
          rx={1.5}
          fill={index % 3 === 0 ? '#1B3A57' : '#29A8E8'}
        />
      ))}
    </svg>
  )
}

function ListeningPage() {
  const user = useAuthStore((s) => s.user)
  const isTeacher = user?.role === 'teacher'

  const [ownershipFilter, setOwnershipFilter] = useState(isTeacher ? 'mine' : 'all')
  const [topic, setTopic] = useState('all')
  const [accent, setAccent] = useState('all')
  const [view, setView] = useState('grid')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 6

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
    // Đối với admin: chỉ bài do admin/hệ thống tạo mới là của admin
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
    return publicLessons.filter((item) => {
      const isOwned = checkOwnership(item)
      const isSystem = item.authorEmail === 'system@smartenglish.vn' || item.authorName?.includes('Hệ thống')

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
      return matchOwner && matchTopic && matchAccent
    })
  }, [publicLessons, topic, accent, ownershipFilter, user])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageData = filtered.slice(start, start + PAGE_SIZE)

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
    <main className="flex-1 bg-canvas p-4 sm:p-6 space-y-5">
      {/* Top action & Quota */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {isTeacher ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-brand-200 bg-brand-50/70 px-4 py-2 text-xs">
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
            <Link to="/goi-dich-vu" className="ml-2 font-semibold text-brand-600 hover:underline">
              Chi tiết gói →
            </Link>
          </div>
        ) : <div />}

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button variant="secondary" icon={Upload} onClick={() => toast.success('Mở popup tải lên hàng loạt')}>
            Tải lên hàng loạt
          </Button>
          <Button icon={Mic} onClick={() => toast.success('Mở form tạo bài nghe mới')}>
            Thêm bài nghe mới
          </Button>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="space-y-4">
        {/* Dòng 1: Bộ lọc tác giả */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Học liệu:
            </span>
            <div className="flex items-center gap-1.5">
              <FilterChip
                active={ownershipFilter === 'mine'}
                onClick={() => setOwnershipFilter('mine')}
              >
                👤 Của tôi ({myLessonsCount})
              </FilterChip>
              <FilterChip
                active={ownershipFilter === 'all'}
                onClick={() => setOwnershipFilter('all')}
              >
                🌐 Tất cả bài nghe ({publicLessons.length})
              </FilterChip>
              <FilterChip
                active={ownershipFilter === 'system'}
                onClick={() => setOwnershipFilter('system')}
              >
                🏢 Hệ thống SmartEnglish
              </FilterChip>
              {isTeacher && (
                <FilterChip
                  active={ownershipFilter === 'others'}
                  onClick={() => setOwnershipFilter('others')}
                >
                  👥 Giáo viên khác
                </FilterChip>
              )}
            </div>
          </div>

          {!isTeacher && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted">Lọc theo tác giả:</span>
              <Select
                value={ownershipFilter}
                onChange={(e) => setOwnershipFilter(e.target.value)}
                className="w-48 text-xs"
              >
                <option value="all">Tất cả tác giả</option>
                <option value="Hoàng Thị Mai">Hoàng Thị Mai (GV)</option>
                <option value="Vũ Đức Thắng">Vũ Đức Thắng (GV)</option>
                <option value="Hệ thống SmartEnglish">Hệ thống SmartEnglish</option>
              </Select>
            </div>
          )}
        </div>

        {/* Dòng 2: Chủ đề + Giọng đọc + View Mode */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-48">
            <option value="all">Tất cả chủ đề</option>
            {LISTENING_TOPICS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select value={accent} onChange={(e) => setAccent(e.target.value)} className="w-48">
            <option value="all">Tất cả giọng đọc</option>
            {LISTENING_ACCENTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>

          <div className="ml-auto flex items-center gap-1 rounded-lg border border-line p-1">
            <button
              type="button"
              aria-label="Xem dạng lưới"
              onClick={() => setView('grid')}
              className={cn(
                'rounded-md p-1.5 cursor-pointer',
                view === 'grid' ? 'bg-navy-700 text-white' : 'text-ink-muted hover:bg-canvas',
              )}
            >
              <LayoutGrid size={18} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              aria-label="Xem dạng danh sách"
              onClick={() => setView('list')}
              className={cn(
                'rounded-md p-1.5 cursor-pointer',
                view === 'list' ? 'bg-navy-700 text-white' : 'text-ink-muted hover:bg-canvas',
              )}
            >
              <LayoutList size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="Không có bài nghe phù hợp"
          description={
            ownershipFilter === 'mine'
              ? 'Bạn chưa tạo bài nghe nào trong danh mục này. Hãy bấm "+ Thêm bài nghe mới" hoặc chọn "Tất cả bài nghe".'
              : 'Thử đổi chủ đề hoặc giọng đọc.'
          }
        />
      ) : (
        <div
          className={cn(
            'grid gap-5',
            view === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1',
          )}
        >
          {pageData.map((item) => {
            const status = STATUS_META[item.status]
            const isOwned = checkOwnership(item)
            const isSystem = item.authorEmail === 'system@smartenglish.vn' || item.authorName?.includes('Hệ thống')

            return (
              <Card key={item.id} className="flex flex-col overflow-hidden p-0 hover:border-brand-500 hover:shadow-md transition-all group">
                <div className="relative flex items-center justify-center bg-canvas px-4 py-6">
                  <div className="absolute left-3 top-3 flex items-center gap-1.5">
                    {isTeacher && isOwned ? (
                      <Badge tone="success" className="font-semibold">
                        👤 Của tôi
                      </Badge>
                    ) : isSystem ? (
                      <Badge tone="neutral">🏢 Hệ thống</Badge>
                    ) : (
                      <Badge tone="warning">👨‍🏫 {item.authorName}</Badge>
                    )}
                  </div>

                  <Badge tone={status.tone} className="absolute right-3 top-3 gap-1">
                    <status.Icon size={12} strokeWidth={1.75} />
                    {status.label}
                  </Badge>

                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 group-hover:scale-105 transition-transform">
                    <Play size={28} strokeWidth={1.75} className="ml-1" />
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <h3 className="line-clamp-1 font-semibold text-navy-700 group-hover:text-brand-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-ink-muted leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-3">
                      <Waveform bars={item.waveform} />
                    </div>
                  </div>

                  <div className="mt-4 border-t border-line pt-3">
                    <div className="flex items-center justify-between text-xs text-ink-muted">
                      <span className="flex items-center gap-1">
                        <Clock size={13} strokeWidth={1.75} />
                        {item.duration}
                      </span>
                      <span>{item.accent}</span>
                      <span>{item.topic}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2.5">
                      <span className="text-[11px] text-ink-muted truncate max-w-[120px]">
                        {item.authorName || 'SmartEnglish'}
                      </span>

                      <div className="flex items-center gap-1">
                        {isTeacher && (
                          <button
                            type="button"
                            onClick={(e) => handleAssignToClass(e, item)}
                            className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold text-navy-700 hover:bg-brand-50 hover:text-brand-600 flex items-center gap-1 cursor-pointer"
                            title="Giao bài nghe cho lớp"
                          >
                            <Send size={12} />
                            Giao bài
                          </button>
                        )}

                        {/* Nút Sửa/Xóa */}
                        {canManage(item) ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => handleEditClick(e, item)}
                              aria-label="Sửa bài nghe"
                              className="p-1.5 text-ink-muted hover:text-brand-500 rounded-md cursor-pointer"
                              title="Chỉnh sửa bài nghe"
                            >
                              <Pencil size={15} strokeWidth={1.75} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteClick(e, item)}
                              aria-label="Xoá bài nghe"
                              className="p-1.5 text-ink-muted hover:text-[#B91C1C] rounded-md cursor-pointer"
                              title="Xoá bài nghe"
                            >
                              <Trash2 size={15} strokeWidth={1.75} />
                            </button>
                          </>
                        ) : (
                          <span
                            className="text-[10px] text-ink-muted italic px-2 py-1 bg-slate-50 rounded-md border border-slate-100 flex items-center gap-1"
                            title="Chỉ tác giả mới có quyền giao bài hoặc chỉnh sửa bài nghe này"
                          >
                            <Lock size={11} />
                            Chỉ xem
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}

          <button
            type="button"
            onClick={() => toast.success('Mở form tạo bài nghe mới')}
            className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-line bg-transparent p-5 text-center hover:border-brand-500 cursor-pointer"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-ink-muted">
              <Plus size={22} strokeWidth={1.75} />
            </span>
            <span className="text-base font-semibold text-navy-700">Tải lên bài nghe mới</span>
            <span className="text-sm text-ink-muted">Hỗ trợ MP3, WAV, M4A tối đa 50MB</span>
          </button>
        </div>
      )}

      {/* Phân trang */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="text-xs text-ink-muted">
          Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>-<strong>{Math.min(start + PAGE_SIZE, total)}</strong> trong tổng số{' '}
          <strong>{total}</strong> bài nghe
        </p>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </main>
  )
}

export default ListeningPage
