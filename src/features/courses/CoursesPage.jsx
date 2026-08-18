import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  Lock,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import { cn, formatNumber } from '@/lib/utils'
import { INITIAL_COURSES } from '@/mocks/data/courses'
import { useAuthStore } from '@/store/authStore'

function CoursesPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'

  const [courses, setCourses] = useState(INITIAL_COURSES)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [cefrFilter, setCefrFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [authorFilter, setAuthorFilter] = useState(isTeacher ? 'mine' : 'all')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = isAdmin ? 5 : 6

  const checkOwnership = (course) => {
    if (!user) return false
    if (isTeacher) {
      return (
        course.authorEmail === user.email ||
        course.authorName === user.displayName ||
        course.authorName === 'Hoàng Thị Mai'
      )
    }
    return (
      course.authorEmail === user.email ||
      course.authorName?.includes('Quản trị') ||
      course.authorName?.includes('Admin')
    )
  }

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const isOwned = checkOwnership(c)

      let matchAuthor = true
      if (authorFilter === 'mine') {
        matchAuthor = isOwned
      } else if (authorFilter === 'others') {
        matchAuthor = !isOwned
      } else if (authorFilter !== 'all') {
        matchAuthor = c.authorName === authorFilter || c.authorEmail === authorFilter
      }

      const matchCategory = categoryFilter === 'all' || c.category === categoryFilter
      const matchCefr = cefrFilter === 'all' || c.level.includes(cefrFilter)
      const matchStatus = statusFilter === 'all' || c.status === statusFilter
      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.authorName.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase())

      return matchAuthor && matchCategory && matchCefr && matchStatus && matchSearch
    })
  }, [courses, search, categoryFilter, cefrFilter, statusFilter, authorFilter, user])

  const total = filteredCourses.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageData = filteredCourses.slice(start, start + PAGE_SIZE)

  const handleDeleteCourse = (id, title, e) => {
    e?.stopPropagation()
    setCourses((prev) => prev.filter((c) => c.id !== id))
    toast.success(`Đã xoá khóa học "${title}"`)
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
            Bộ lọc & Danh sách khóa học
          </span>
          <Button
            size="sm"
            icon={Plus}
            onClick={() => navigate('/hoc-lieu/khoa-hoc/tao-moi')}
          >
            Tạo khóa học mới
          </Button>
        </div>
        {/* Ownership quick filter for Teacher */}
        {isTeacher && (
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <span className="text-xs font-semibold text-ink-muted">Nguồn khóa học:</span>
            <button
              type="button"
              onClick={() => {
                setAuthorFilter('mine')
                setPage(1)
              }}
              className={cn(
                'rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer',
                authorFilter === 'mine'
                  ? 'bg-navy-700 text-white shadow-xs'
                  : 'bg-slate-100 text-ink-muted hover:text-navy-700',
              )}
            >
              Của tôi ({courses.filter((c) => checkOwnership(c)).length})
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthorFilter('all')
                setPage(1)
              }}
              className={cn(
                'rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer',
                authorFilter === 'all'
                  ? 'bg-navy-700 text-white shadow-xs'
                  : 'bg-slate-100 text-ink-muted hover:text-navy-700',
              )}
            >
              Tất cả khóa học ({courses.length})
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên khóa học, giảng viên..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setPage(1)
              }}
              className="text-sm rounded-xl"
            >
              <option value="all">Tất cả thể loại</option>
              <option value="Giao tiếp">Giao tiếp</option>
              <option value="IELTS">IELTS</option>
              <option value="TOEIC">TOEIC</option>
              <option value="Tổng hợp">Tổng hợp</option>
            </Select>
          </div>

          <div>
            <Select
              value={cefrFilter}
              onChange={(e) => {
                setCefrFilter(e.target.value)
                setPage(1)
              }}
              className="text-sm rounded-xl"
            >
              <option value="all">Cấp độ CEFR</option>
              <option value="A1">A1 Sơ cấp</option>
              <option value="A2">A2 Tiền trung cấp</option>
              <option value="B1">B1 Trung cấp</option>
              <option value="B2">B2 Trung cao cấp</option>
              <option value="C1">C1 Cao cấp</option>
            </Select>
          </div>

          <div>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="text-sm rounded-xl"
            >
              <option value="all">Trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="pending">Chờ duyệt</option>
              <option value="draft">Bản nháp</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* ─── ADMIN VIEW: DATA TABLE (Mockup Image 1) ────────────────────── */}
      {isAdmin ? (
        <Card className="p-0 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold uppercase tracking-wider text-ink-muted border-b border-line">
                <tr>
                  <th className="px-4 py-3">Ảnh</th>
                  <th className="px-4 py-3">Tên khóa học</th>
                  <th className="px-4 py-3">Thể loại</th>
                  <th className="px-4 py-3 text-center">CEFR</th>
                  <th className="px-4 py-3 text-center">Số bài</th>
                  <th className="px-4 py-3 text-center">Học viên</th>
                  <th className="px-4 py-3">Người tạo</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3">Ngày cập nhật</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-line bg-white">
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-ink-muted">
                      Không tìm thấy khóa học nào khớp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  pageData.map((course) => (
                    <tr
                      key={course.id}
                      onClick={() => navigate(`/hoc-lieu/khoa-hoc/${course.id}`)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Thumbnail */}
                      <td className="px-4 py-3">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-12 w-16 rounded-lg object-cover border border-line shrink-0"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'
                          }}
                        />
                      </td>

                      {/* Title & AI Badge */}
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-bold text-navy-700 group-hover:text-brand-600 transition-colors leading-tight">
                          {course.title}
                        </p>
                        {course.isAiContent && (
                          <span className="inline-flex items-center gap-1 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-600 border border-brand-200/60 mt-1">
                            <Sparkles size={10} /> AI Content
                          </span>
                        )}
                      </td>

                      {/* Thể loại */}
                      <td className="px-4 py-3 font-medium text-ink">
                        {course.categoryLabel}
                      </td>

                      {/* CEFR */}
                      <td className="px-4 py-3 text-center">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-navy-700 text-xs">
                          {course.level}
                        </span>
                      </td>

                      {/* Số bài */}
                      <td className="px-4 py-3 text-center font-semibold text-navy-700">
                        {course.lessonCount}
                      </td>

                      {/* Học viên */}
                      <td className="px-4 py-3 text-center font-semibold text-navy-700">
                        {formatNumber(course.studentCount)}
                      </td>

                      {/* Người tạo */}
                      <td className="px-4 py-3 text-ink font-medium">
                        {course.authorName}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-4 py-3 text-center">
                        {course.status === 'published' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                            Xuất bản
                          </span>
                        ) : course.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                            Chờ duyệt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Bản nháp
                          </span>
                        )}
                      </td>

                      {/* Ngày cập nhật */}
                      <td className="px-4 py-3 text-ink-muted">
                        {course.updatedAt}
                      </td>

                      {/* Thao tác */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => navigate(`/hoc-lieu/khoa-hoc/${course.id}`)}
                            className="rounded p-1.5 text-ink-muted hover:bg-slate-100 hover:text-navy-700 cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/hoc-lieu/khoa-hoc/${course.id}/chinh-sua`)}
                            className="rounded p-1.5 text-ink-muted hover:bg-brand-50 hover:text-brand-600 cursor-pointer"
                            title="Chỉnh sửa khóa học"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCourse(course.id, course.title, e)}
                            className="rounded p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-500 cursor-pointer"
                            title="Xóa khóa học"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Admin Footer Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5">
            <p className="text-xs text-ink-muted">
              Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>-<strong>{Math.min(start + PAGE_SIZE, total)}</strong> trong tổng số <strong>{total}</strong> khóa học
            </p>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </Card>
      ) : (
        /* ─── TEACHER VIEW: CARD GRID (Mockup Image 2) ─────────────────── */
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pageData.map((course) => {
              const isOwned = checkOwnership(course)

              return (
                <Card
                  key={course.id}
                  onClick={() => navigate(`/hoc-lieu/khoa-hoc/${course.id}`)}
                  className="p-0 overflow-hidden border border-line hover:shadow-md hover:border-brand-400 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Thumbnail with Badges */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'
                        }}
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[11px] font-bold text-navy-700 shadow-xs">
                          {course.category}
                        </span>
                        <span className="rounded-md bg-brand-500/90 backdrop-blur-xs px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                          {course.level}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-2.5 right-2.5">
                        {course.status === 'published' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 shadow-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Đã xuất bản
                          </span>
                        ) : course.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 shadow-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Chờ duyệt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 shadow-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Bản nháp
                          </span>
                        )}
                      </div>

                      {/* AI Content tag */}
                      {course.isAiContent && (
                        <div className="absolute bottom-2.5 right-2.5">
                          <span className="inline-flex items-center gap-1 rounded-md bg-navy-900/85 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                            <Sparkles size={11} className="text-amber-400" /> AI Content
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-2.5">
                      <h3 className="font-bold text-navy-700 text-base leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-ink-muted">
                        <span className="flex items-center gap-1.5">
                          <BookOpen size={14} />
                          <strong>{course.lessonCount}</strong> Bài học
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users size={14} />
                          <strong>{formatNumber(course.studentCount)}</strong> Học viên
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div
                    className="flex items-center justify-between border-t border-line px-4 py-2.5 bg-slate-50/50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1">
                      {isOwned ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/hoc-lieu/khoa-hoc/${course.id}/chinh-sua`)}
                          className="rounded p-1.5 text-ink-muted hover:bg-white hover:text-brand-600 cursor-pointer transition-colors"
                          title="Chỉnh sửa khóa học"
                        >
                          <Pencil size={15} />
                        </button>
                      ) : (
                        <span
                          className="rounded p-1.5 text-slate-400 flex items-center gap-1 text-[11px]"
                          title="Chỉ tác giả mới có quyền chỉnh sửa khóa học này"
                        >
                          <Lock size={13} />
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate(`/hoc-lieu/khoa-hoc/${course.id}`)}
                        className="rounded p-1.5 text-ink-muted hover:bg-white hover:text-navy-700 cursor-pointer transition-colors"
                        title="Xem chi tiết & Thống kê"
                      >
                        <BarChart3 size={15} />
                      </button>
                    </div>

                    <span className="text-[11px] text-ink-muted truncate max-w-[150px]">
                      Tác giả: <strong>{course.authorName}</strong>
                    </span>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Teacher Footer Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <p className="text-xs text-ink-muted">
              Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>-<strong>{Math.min(start + PAGE_SIZE, total)}</strong> trong tổng số <strong>{total}</strong> khóa học
            </p>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>
      )}
    </div>
  )
}

export default CoursesPage
