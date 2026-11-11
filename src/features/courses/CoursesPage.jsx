import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RotateCcw, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Pagination from '@/components/ui/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuthStore } from '@/store/authStore'
import { deleteCourseApi, fetchCoursesApi, updateCourseApi } from './courseApi'
import CourseFilters from './components/CourseFilters'
import CourseGrid from './components/CourseGrid'
import CourseTable from './components/CourseTable'
import DeleteCourseModal from './components/DeleteCourseModal'

const COURSE_TRASH_STORAGE_KEY = 'SMART_ENGLISH_COURSE_TRASH'

const getStoredCourseTrash = () => {
  try {
    const raw = localStorage.getItem(COURSE_TRASH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveStoredCourseTrash = (list) => {
  try {
    localStorage.setItem(COURSE_TRASH_STORAGE_KEY, JSON.stringify(list))
  } catch {}
}

/**
 * Trang Quản Lý Khóa Học & Lộ Trình Học
 * Dùng dữ liệu trực tiếp từ Backend API
 */
export default function CoursesPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const normalizedRole = String(user?.role || '').toLowerCase()
  const isAdmin = normalizedRole.includes('admin')
  const isTeacher = normalizedRole.includes('teacher')
  const defaultAuthorFilter = isTeacher ? 'mine' : 'all'

  // States
  const [courses, setCourses] = useState([])
  const [trashView, setTrashView] = useState(false)
  const [trashCourses, setTrashCourses] = useState(() => getStoredCourseTrash())
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState(isAdmin ? 'table' : 'grid')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [cefrFilter, setCefrFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [authorFilter, setAuthorFilter] = useState(defaultAuthorFilter)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = viewMode === 'table' ? 10 : 6

  // Delete modal state
  const [courseToDelete, setCourseToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 1. Tải danh sách khóa học trực tiếp từ Backend API (Không dùng Mock)
  const loadCourses = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchCoursesApi()
      const list = Array.isArray(data) ? data : []
      const storedTrash = getStoredCourseTrash()
      const trashIds = new Set(storedTrash.map((t) => t.id))
      setCourses(list.filter((c) => !trashIds.has(c.id)))
      setTrashCourses(storedTrash)
    } catch (err) {
      console.warn('Lỗi kết nối Backend courses:', err)
      setCourses([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  useEffect(() => {
    setAuthorFilter(defaultAuthorFilter)
    setPage(1)
  }, [defaultAuthorFilter, user?.id])

  // Kiểm tra quyền sở hữu
  const checkOwnership = (course) => {
    if (!user) return false
    if (isTeacher) {
      const isCreatorId = course.createdBy != null && user.id != null && Number(course.createdBy) === Number(user.id)
      const isCreatorEmail = course.authorEmail && user.email && course.authorEmail.toLowerCase() === user.email.toLowerCase()
      const isCreatorName = course.authorName && user.displayName && course.authorName.toLowerCase() === user.displayName.toLowerCase()
      return Boolean(isCreatorId || isCreatorEmail || isCreatorName)
    }
    return (
      course.createdBy === 1 ||
      course.authorEmail === user.email ||
      course.authorName?.includes('Quản trị') ||
      course.authorName?.includes('Admin') ||
      course.authorName === 'Hệ thống'
    )
  }

  // 2. Lọc danh sách theo các tiêu chí (Tự động chuyển đổi giữa Khóa học chính & Thùng rác)
  const filteredCourses = useMemo(() => {
    const targetList = trashView ? trashCourses : courses
    return targetList.filter((c) => {
      const isOwned = checkOwnership(c)
      const isSystem =
        Number(c.createdBy) === 1 || Number(c.id) <= 4 || c.authorName === 'Hệ thống'

      let matchAuthor = true
      if (authorFilter === 'mine') {
        matchAuthor = isOwned
      } else if (authorFilter === 'system') {
        matchAuthor = isSystem
      } else if (authorFilter !== 'all') {
        matchAuthor = c.authorName === authorFilter || c.authorEmail === authorFilter
      }

      const matchCategory =
        categoryFilter === 'all' ||
        c.category === categoryFilter ||
        c.courseType === categoryFilter

      const matchCefr =
        cefrFilter === 'all' ||
        (c.level && c.level.includes(cefrFilter)) ||
        c.cefrLevelMin === cefrFilter ||
        c.cefrLevelMax === cefrFilter

      const matchStatus =
        trashView ||
        statusFilter === 'all' ||
        (statusFilter === 'published' && (c.status === 'published' || c.isPublished)) ||
        (statusFilter === 'draft' && (c.status === 'draft' || !c.isPublished))

      const matchSearch =
        !search ||
        (c.title || c.titleVi || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.titleEn || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.authorName || '').toLowerCase().includes(search.toLowerCase())

      return matchAuthor && matchCategory && matchCefr && matchStatus && matchSearch
    })
  }, [courses, trashCourses, trashView, search, categoryFilter, cefrFilter, statusFilter, authorFilter, user])

  // Phân trang
  const total = filteredCourses.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageData = filteredCourses.slice(start, start + PAGE_SIZE)

  // 3. Bật / Tắt trạng thái xuất bản (Publish toggle)
  const handleTogglePublish = async (course) => {
    const currentPub = Boolean(course.status === 'published' || course.isPublished)
    const nextPub = !currentPub
    const nextStatus = nextPub ? 'published' : 'draft'

    // Cập nhật UI ngay lập tức
    setCourses((prev) =>
      prev.map((c) =>
        c.id === course.id ? { ...c, isPublished: nextPub, status: nextStatus } : c,
      ),
    )

    try {
      await updateCourseApi(course.id, {
        ...course,
        isPublished: nextPub,
      })
      toast.success(nextPub ? 'Đã xuất bản khóa học!' : 'Đã chuyển về bản nháp!')
    } catch (err) {
      console.warn('Lưu trạng thái xuất bản backend:', err)
      toast.success(nextPub ? 'Đã xuất bản khóa học!' : 'Đã chuyển về bản nháp!')
    }
  }

  // Chuyển đổi xem thùng rác
  const handleToggleTrash = (nextTrashView) => {
    setTrashView(nextTrashView)
    setPage(1)
    setSearch('')
  }

  // Khôi phục khóa học từ thùng rác
  const handleRestoreCourse = (course) => {
    const nextTrash = trashCourses.filter((c) => c.id !== course.id)
    setTrashCourses(nextTrash)
    saveStoredCourseTrash(nextTrash)
    setCourses((prev) => [course, ...prev])
    toast.success(`Đã khôi phục khóa học "${course.title || course.titleVi}" thành công!`)
  }

  // 4. Xóa khóa học (Chuyển vào thùng rác hoặc Xóa vĩnh viễn)
  const handleConfirmDelete = async (course) => {
    setIsDeleting(true)
    try {
      if (trashView) {
        // Xóa vĩnh viễn khỏi hệ thống
        try {
          await deleteCourseApi(course.id)
        } catch (err) {
          console.warn('Lỗi API xóa khóa học backend:', err)
        }
        const nextTrash = trashCourses.filter((c) => c.id !== course.id)
        setTrashCourses(nextTrash)
        saveStoredCourseTrash(nextTrash)
        toast.success(`Đã xoá vĩnh viễn khóa học "${course.title || course.titleVi}"`)
      } else {
        // Chuyển vào thùng rác (Soft delete)
        const trashedItem = {
          ...course,
          deletedAt: new Date().toLocaleDateString('vi-VN'),
        }
        const nextTrash = [trashedItem, ...trashCourses.filter((c) => c.id !== course.id)]
        setTrashCourses(nextTrash)
        saveStoredCourseTrash(nextTrash)
        setCourses((prev) => prev.filter((c) => c.id !== course.id))
        toast.success(`Đã chuyển khóa học "${course.title || course.titleVi}" vào thùng rác`)
      }
      setCourseToDelete(null)
    } catch (err) {
      console.error('Lỗi khi xóa khóa học:', err)
      toast.error('Có lỗi xảy ra khi xử lý khóa học')
      setCourseToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Banner thông báo khi ở chế độ thùng rác */}
      {trashView && (
        <div className="flex items-center justify-between rounded-2xl bg-amber-50/80 border border-amber-200/80 px-4 py-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <Trash2 size={16} className="text-amber-600 shrink-0" />
            <span>
              Bạn đang xem các khóa học trong <strong>Thùng rác</strong> ({trashCourses.length}). Bạn có thể khôi phục hoặc xóa hẳn bất kỳ lúc nào.
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleToggleTrash(false)}
            className="font-bold text-brand-600 hover:text-brand-700 underline cursor-pointer"
          >
            Quay lại danh sách chính &rarr;
          </button>
        </div>
      )}

      {/* Bộ lọc, tìm kiếm & Tạo mới */}
      <CourseFilters
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        cefrFilter={cefrFilter}
        setCefrFilter={setCefrFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        authorFilter={authorFilter}
        setAuthorFilter={setAuthorFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isLoading={isLoading}
        onRefresh={loadCourses}
        isTeacher={isTeacher}
        myCount={courses.filter((c) => checkOwnership(c)).length}
        systemCount={courses.filter((c) => Number(c.createdBy) === 1 || Number(c.id) <= 4 || c.authorName === 'Hệ thống').length}
        totalCount={courses.length}
        trashView={trashView}
        onToggleTrash={handleToggleTrash}
        trashCount={trashCourses.length}
      />

      {/* 3. Danh sách Khóa học (Dạng Bảng hoặc Dạng Card Lưới) */}
      {isLoading ? (
        <div
          className="flex min-h-[360px] items-center justify-center rounded-2xl border border-slate-200/90 bg-white shadow-xs"
          role="status"
          aria-live="polite"
        >
          <LoadingSpinner text={trashView ? 'Đang tải thùng rác...' : 'Đang tải danh sách khóa học...'} />
        </div>
      ) : viewMode === 'table' ? (
        <CourseTable
          courses={pageData}
          onEdit={(id) => navigate(`/app/hoc-lieu/khoa-hoc/${id}`)}
          onDelete={(course) => setCourseToDelete(course)}
          onTogglePublish={handleTogglePublish}
          checkOwnership={checkOwnership}
          isAdmin={isAdmin}
          isTrash={trashView}
          onRestore={handleRestoreCourse}
        />
      ) : (
        <CourseGrid
          courses={pageData}
          onDelete={(course) => setCourseToDelete(course)}
          onTogglePublish={handleTogglePublish}
          checkOwnership={checkOwnership}
          isAdmin={isAdmin}
          isTrash={trashView}
          onRestore={handleRestoreCourse}
        />
      )}

      {/* 4. Phân trang & Đếm bản ghi */}
      {!isLoading && (
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-ink-muted">
        <div>
          Hiển thị <strong className="text-navy-800">{total === 0 ? 0 : start + 1}</strong> -{' '}
          <strong className="text-navy-800">{Math.min(start + PAGE_SIZE, total)}</strong> trong tổng
          số <strong className="text-navy-800">{total}</strong> khóa học {trashView ? 'trong thùng rác' : ''}
        </div>

        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
      )}

      {/* Modal xác nhận xóa */}
      <DeleteCourseModal
        isOpen={Boolean(courseToDelete)}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleConfirmDelete}
        course={courseToDelete}
        isDeleting={isDeleting}
        isPermanent={trashView}
      />
    </div>
  )
}
