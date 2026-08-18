import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  Crown,
  FileText,
  Lock,
  Pencil,
  Plus,
  Send,
  Settings,
  Share2,
  SlidersHorizontal,
  Trash2,
  User,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Drawer from '@/components/ui/Drawer'
import EmptyState from '@/components/ui/EmptyState'
import FilterChip from '@/components/ui/FilterChip'
import Pagination from '@/components/ui/Pagination'
import SearchInput from '@/components/ui/SearchInput'
import Select from '@/components/ui/Select'
import { formatDate } from '@/lib/utils'
import { readings } from '@/mocks/data/readings'
import { LEVEL_GROUPS, LEVEL_LABEL, LEVEL_TONE } from './levels'
import { buildPublicContent } from '@/features/aiContent/aiContentService'
import { useAuthStore } from '@/store/authStore'

const PAGE_SIZE = 6

function ReadingPage() {
  const user = useAuthStore((s) => s.user)
  const isTeacher = user?.role === 'teacher'

  // Mặc định giáo viên chỉ xem bài của mình
  const [ownershipFilter, setOwnershipFilter] = useState(isTeacher ? 'mine' : 'all')
  const [search, setSearch] = useState('')
  const [levelGroup, setLevelGroup] = useState('all')
  const [page, setPage] = useState(1)
  const [activeReading, setActiveReading] = useState(null)

  const publicReadings = useMemo(() => buildPublicContent('reading', readings), [])
  const activeGroup = LEVEL_GROUPS.find((group) => group.key === levelGroup)

  // Kiểm tra bài đọc có do chính user này tạo hay không
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

  // Quyền chỉnh sửa / xoá: Admin có toàn quyền, Giáo viên chỉ có quyền với bài của mình
  const canManage = (item) => {
    if (!user) return false
    if (user.role === 'admin') return true
    return checkOwnership(item)
  }

  const myReadingsCount = useMemo(() => {
    return publicReadings.filter((item) => checkOwnership(item)).length
  }, [publicReadings, user])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return publicReadings.filter((item) => {
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

      const matchLevel = !activeGroup.levels || activeGroup.levels.includes(item.level)
      const matchSearch =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        (item.description || '').toLowerCase().includes(keyword) ||
        (item.topic || '').toLowerCase().includes(keyword)

      return matchOwner && matchLevel && matchSearch
    })
  }, [search, activeGroup, publicReadings, ownershipFilter, user])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageData = filtered.slice(start, start + PAGE_SIZE)

  const handleSearchChange = (value) => {
    setSearch(value)
    setPage(1)
  }

  const handleLevelChange = (key) => {
    setLevelGroup(key)
    setPage(1)
  }

  const handleOwnershipChange = (key) => {
    setOwnershipFilter(key)
    setPage(1)
  }

  const handleEditClick = (e, item) => {
    e.stopPropagation()
    const isOwned = checkOwnership(item)
    if (!isOwned && user?.role !== 'admin') {
      toast.error(`Bạn không thể sửa bài đọc của "${item.authorName || 'người khác'}". Chỉ tác giả mới có quyền chỉnh sửa.`)
      return
    }
    toast.success(`Mở trình chỉnh sửa bài: "${item.title}"`)
  }

  const handleDeleteClick = (e, item) => {
    e.stopPropagation()
    const isOwned = checkOwnership(item)
    if (!isOwned && user?.role !== 'admin') {
      toast.error('Bạn không có quyền xóa học liệu của giáo viên khác!')
      return
    }
    toast.success(`Đã xóa bài đọc "${item.title}"`)
  }

  const handleAssignToClass = (e, item) => {
    e.stopPropagation()
    toast.success(`Đã mở popup giao bài "${item.title}" cho lớp học`)
  }

  return (
    <main className="flex-1 bg-canvas p-4 sm:p-6 space-y-5">
      {/* Top action & Quota */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Quota indicator cho giáo viên */}
        {isTeacher ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-brand-200 bg-brand-50/70 px-4 py-2 text-xs">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white">
              <Crown size={13} />
            </span>
            <div>
              <span className="font-semibold text-navy-700">Gói Teacher Pro:</span>{' '}
              <span className="text-ink-muted">
                Bạn đã tạo <strong className="text-brand-600 font-bold">{myReadingsCount}</strong> bài đọc · Hạn mức{' '}
                <strong className="text-emerald-600 font-bold">Không giới hạn</strong>
              </span>
            </div>
            <Link
              to="/goi-dich-vu"
              className="ml-2 font-semibold text-brand-600 hover:underline"
            >
              Chi tiết gói →
            </Link>
          </div>
        ) : <div />}

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button icon={Plus} onClick={() => toast.success('Mở form tạo bài đọc mới')}>
            Thêm bài đọc mới
          </Button>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="space-y-4">
        {/* Dòng 1: Bộ lọc quyền sở hữu theo Giáo viên */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Học liệu:
            </span>
            <div className="flex items-center gap-1.5">
              <FilterChip
                active={ownershipFilter === 'mine'}
                onClick={() => handleOwnershipChange('mine')}
              >
                👤 Của tôi ({myReadingsCount})
              </FilterChip>
              <FilterChip
                active={ownershipFilter === 'all'}
                onClick={() => handleOwnershipChange('all')}
              >
                🌐 Tất cả bài đọc ({publicReadings.length})
              </FilterChip>
              <FilterChip
                active={ownershipFilter === 'system'}
                onClick={() => handleOwnershipChange('system')}
              >
                🏢 Hệ thống SmartEnglish
              </FilterChip>
              {isTeacher && (
                <FilterChip
                  active={ownershipFilter === 'others'}
                  onClick={() => handleOwnershipChange('others')}
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
                onChange={(e) => handleOwnershipChange(e.target.value)}
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

        {/* Dòng 2: Search + Cấp độ */}
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Tìm theo tiêu đề, chủ đề, từ khoá..."
            className="min-w-xs flex-1"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Cấp độ:
            </span>
            {LEVEL_GROUPS.map((group) => (
              <FilterChip
                key={group.key}
                active={levelGroup === group.key}
                onClick={() => handleLevelChange(group.key)}
              >
                {group.label}
              </FilterChip>
            ))}
          </div>
        </div>
      </Card>

      {/* Grid danh sách */}
      {pageData.length === 0 ? (
        <EmptyState
          title="Không tìm thấy bài đọc nào"
          description={
            ownershipFilter === 'mine'
              ? 'Bạn chưa tạo bài đọc nào khớp với bộ lọc. Hãy nhấn "+ Thêm bài đọc mới" hoặc bấm tab "Tất cả bài đọc" để khám phá thêm.'
              : 'Thử đổi từ khoá hoặc bộ lọc cấp độ.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {pageData.map((item) => {
            const isOwned = checkOwnership(item)
            const isSystem = item.authorEmail === 'system@smartenglish.vn' || item.authorName?.includes('Hệ thống')

            return (
              <Card
                key={item.id}
                className="flex cursor-pointer flex-col justify-between hover:border-brand-500 hover:shadow-md transition-all group"
                onClick={() => setActiveReading(item)}
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={LEVEL_TONE[item.level]}>{LEVEL_LABEL[item.level]}</Badge>
                      {item.isAI && <Badge tone="info">🤖 AI sinh</Badge>}
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

                    {/* Ownership badge / Lock indicator */}
                    {!canManage(item) && (
                      <span
                        className="rounded-full bg-slate-100 p-1 text-slate-400"
                        title="Chỉ xem (Không có quyền sửa)"
                      >
                        <Lock size={13} />
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 line-clamp-2 text-base font-semibold text-navy-700 group-hover:text-brand-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-3 text-xs text-ink-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-line">
                  <div className="flex items-center justify-between text-xs text-ink-muted mb-3">
                    <span className="flex items-center gap-1">
                      <FileText size={14} />
                      {item.wordCount} từ
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {item.minutes} phút
                    </span>
                  </div>

                  {/* Actions bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-dashed border-line">
                    <span className="text-[11px] text-ink-muted truncate max-w-[140px]">
                      Tác giả: <strong>{item.authorName || 'SmartEnglish'}</strong>
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Nút giao bài: Chỉ dành cho giáo viên và bài thuộc sở hữu của mình */}
                      {isTeacher && checkOwnership(item) && (
                        <button
                          type="button"
                          onClick={(e) => handleAssignToClass(e, item)}
                          className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold text-navy-700 hover:bg-brand-50 hover:text-brand-600 flex items-center gap-1 cursor-pointer"
                          title="Giao bài cho lớp học"
                        >
                          <Send size={12} />
                          Giao bài
                        </button>
                      )}

                      {/* Nút Sửa/Xóa: Hiển thị cho bài thuộc sở hữu hoặc Admin */}
                      {canManage(item) ? (
                        <>
                          <button
                            type="button"
                            onClick={(e) => handleEditClick(e, item)}
                            className="rounded-md p-1.5 text-ink-muted hover:bg-slate-100 hover:text-navy-700 cursor-pointer"
                            title="Chỉnh sửa bài đọc"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteClick(e, item)}
                            className="rounded-md p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-500 cursor-pointer"
                            title="Xóa bài đọc"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <span
                          className="text-[10px] text-ink-muted italic px-2 py-1 bg-slate-50 rounded-md border border-slate-100 flex items-center gap-1"
                          title="Chỉ tác giả mới có quyền giao bài hoặc chỉnh sửa bài đọc này"
                        >
                          <Lock size={11} /> Chỉ xem
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Phân trang */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="text-xs text-ink-muted">
          Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>-<strong>{Math.min(start + PAGE_SIZE, total)}</strong> trong tổng số{' '}
          <strong>{total}</strong> bài đọc
        </p>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* Drawer xem chi tiết */}
      <Drawer
        open={Boolean(activeReading)}
        onClose={() => setActiveReading(null)}
        title={activeReading?.title}
      >
        {activeReading && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={LEVEL_TONE[activeReading.level]}>{LEVEL_LABEL[activeReading.level]}</Badge>
              <Badge tone="neutral">{activeReading.topic}</Badge>
              <Badge tone={checkOwnership(activeReading) ? 'success' : 'neutral'}>
                Tác giả: {activeReading.authorName || 'Hệ thống'}
              </Badge>
              <span className="text-xs text-ink-muted">
                Cập nhật {formatDate(activeReading.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-ink-muted">
              <span className="flex items-center gap-1.5">
                <FileText size={16} strokeWidth={1.75} />
                {activeReading.wordCount} từ
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={16} strokeWidth={1.75} />
                {activeReading.minutes} phút đọc
              </span>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-navy-700">Nội dung bài đọc</h4>
              <p className="rounded-lg bg-canvas p-3 text-sm leading-relaxed text-ink">
                {activeReading.content}
              </p>
            </div>

            {activeReading.questions?.length > 0 && (
              <div>
                <h4 className="mb-3 text-sm font-semibold text-navy-700">
                  Câu hỏi trắc nghiệm ({activeReading.questions.length})
                </h4>
                <div className="space-y-4">
                  {activeReading.questions.map((question, index) => (
                    <div key={question.id || index} className="rounded-lg border border-line p-3">
                      <p className="text-sm font-medium text-ink">
                        Câu {index + 1}. {question.question}
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {question.options.map((option, optionIndex) => (
                          <li
                            key={option}
                            className={
                              optionIndex === question.correctIndex
                                ? 'flex items-center gap-2 rounded-md bg-[#DCFCE7] px-2 py-1 text-sm font-medium text-[#15803D]'
                                : 'flex items-center gap-2 px-2 py-1 text-sm text-ink'
                            }
                          >
                            <span className="text-xs text-ink-muted">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            {option}
                          </li>
                        ))}
                      </ul>
                      {question.explanation && (
                        <p className="mt-2 text-xs text-ink-muted">
                          <span className="font-semibold text-navy-700">Giải thích: </span>
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions trong Drawer */}
            <div className="flex gap-2 border-t border-line pt-4">
              {isTeacher && checkOwnership(activeReading) && (
                <Button
                  variant="primary"
                  fullWidth
                  icon={Send}
                  onClick={(e) => handleAssignToClass(e, activeReading)}
                >
                  Giao bài đọc này cho lớp
                </Button>
              )}
              {canManage(activeReading) ? (
                <Button
                  variant={isTeacher && checkOwnership(activeReading) ? 'secondary' : 'primary'}
                  fullWidth={!isTeacher || !checkOwnership(activeReading)}
                  icon={Pencil}
                  onClick={(e) => handleEditClick(e, activeReading)}
                >
                  Chỉnh sửa
                </Button>
              ) : (
                <div className="w-full text-center text-xs text-ink-muted py-2 bg-slate-50 rounded-lg">
                  <Lock size={13} className="inline mr-1" />
                  Bạn đang xem bài đọc của tác giả khác (Không có quyền giao bài hoặc chỉnh sửa)
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </main>
  )
}

export default ReadingPage
