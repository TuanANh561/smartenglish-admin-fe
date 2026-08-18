import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Clock,
  Crown,
  Eye,
  FileText,
  Lock,
  Pencil,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Drawer from '@/components/ui/Drawer'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import { formatDate } from '@/lib/utils'
import { readings } from '@/mocks/data/readings'
import { LEVEL_GROUPS, LEVEL_LABEL, LEVEL_TONE } from './levels'
import { buildPublicContent } from '@/features/aiContent/aiContentService'
import { useAuthStore } from '@/store/authStore'

const PAGE_SIZE = 8

const LEVEL_COLOR = {
  A1: { bg: '#f0fdf4', text: '#15803d' },
  A2: { bg: '#f0fdf4', text: '#15803d' },
  B1: { bg: '#eff6ff', text: '#1d4ed8' },
  B2: { bg: '#eef2ff', text: '#4f46e5' },
  C1: { bg: '#faf5ff', text: '#7c3aed' },
  C2: { bg: '#faf5ff', text: '#7c3aed' },
}

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
              Bạn đã tạo <strong className="text-brand-600 font-bold">{myReadingsCount}</strong> bài đọc · Hạn mức{' '}
              <strong className="text-emerald-600 font-bold">Không giới hạn</strong>
            </span>
          </div>
          <Link
            to="/goi-dich-vu"
            className="ml-auto font-semibold text-brand-600 hover:underline"
          >
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
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm theo tiêu đề, chủ đề, từ khóa..."
              className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>

          {/* Filters & Add Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Học liệu */}
            <select
              value={ownershipFilter}
              onChange={(e) => handleOwnershipChange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="all">Học liệu: Tất cả ({publicReadings.length})</option>
              <option value="mine">Học liệu: Của tôi ({myReadingsCount})</option>
              <option value="system">Học liệu: Hệ thống SmartEnglish</option>
              {isTeacher && <option value="others">Học liệu: Giáo viên khác</option>}
            </select>

            {/* Cấp độ */}
            <select
              value={levelGroup}
              onChange={(e) => handleLevelChange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              {LEVEL_GROUPS.map((group) => (
                <option key={group.key} value={group.key}>
                  {group.key === 'all' ? 'Cấp độ: Tất cả' : `Cấp độ: ${group.label}`}
                </option>
              ))}
            </select>

            {/* Nút thêm mới */}
            <button
              type="button"
              onClick={() => toast.success('Mở form tạo bài đọc mới')}
              className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={15} />
              <span>Thêm bài đọc</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3.5 w-[36%] min-w-[260px]">BÀI ĐỌC HIỂU</th>
                <th className="px-4 py-3.5 text-center w-[10%] min-w-[80px]">CẤP ĐỘ</th>
                <th className="px-4 py-3.5 text-center w-[13%] min-w-[110px]">ĐỘ DÀI</th>
                <th className="px-4 py-3.5 w-[14%] min-w-[130px]">NGUỒN / TÁC GIẢ</th>
                <th className="px-4 py-3.5 text-center w-[10%] min-w-[90px]">CÂU HỎI</th>
                <th className="px-4 py-3.5 w-[11%] min-w-[110px]">NGÀY TẠO</th>
                <th className="px-6 py-3.5 text-right w-[14%] min-w-[130px]">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                    Không tìm thấy bài đọc nào phù hợp
                  </td>
                </tr>
              ) : (
                pageData.map((item) => {
                  const isOwned = checkOwnership(item)
                  const isSystem =
                    item.authorEmail === 'system@smartenglish.vn' ||
                    item.authorName?.includes('Hệ thống')
                  const levelStyle = LEVEL_COLOR[item.level] ?? LEVEL_COLOR.B1

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setActiveReading(item)}
                      className="group transition-colors hover:bg-slate-50/50 cursor-pointer"
                    >
                      {/* Tiêu đề bài đọc */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-600">
                            <BookOpen size={18} strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm tracking-tight truncate block group-hover:text-brand-600 transition-colors">
                                {item.title}
                              </span>
                              {item.isAI && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-200">
                                  <Sparkles size={10} />
                                  AI
                                </span>
                              )}
                            </div>
                            <span className="line-clamp-1 text-xs text-slate-500 mt-0.5">
                              {item.description}
                            </span>
                          </div>
                        </div>
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

                      {/* Độ dài */}
                      <td className="px-4 py-4.5 text-center whitespace-nowrap">
                        <span className="font-bold text-slate-800 text-sm block">
                          {item.wordCount} từ
                        </span>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          ~{item.minutes} phút
                        </span>
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

                      {/* Số câu hỏi */}
                      <td className="px-4 py-4.5 text-center font-bold text-slate-800 text-sm whitespace-nowrap">
                        {item.questions?.length || 5} câu
                      </td>

                      {/* Ngày tạo */}
                      <td className="px-4 py-4.5 text-sm text-slate-500 whitespace-nowrap">
                        {formatDate(item.createdAt)}
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
                              title="Giao bài cho lớp học"
                            >
                              <Send size={17} />
                            </button>
                          )}

                          {/* Nút xem chi tiết */}
                          <button
                            type="button"
                            onClick={() => setActiveReading(item)}
                            className="rounded-lg p-1.5 hover:bg-brand-50 hover:text-brand-600 transition-colors cursor-pointer"
                            title="Xem chi tiết bài đọc"
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
                                title="Xóa bài đọc"
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
            <strong>{total}</strong> bài đọc
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
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
    </div>
  )
}

export default ReadingPage
