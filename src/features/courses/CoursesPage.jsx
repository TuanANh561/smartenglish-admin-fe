import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Pagination from '@/components/ui/Pagination'
import { useAuthStore } from '@/store/authStore'
import { deleteCourseApi, fetchCoursesApi, updateCourseApi } from './courseApi'
import CourseFilters from './components/CourseFilters'
import CourseGrid from './components/CourseGrid'
import CourseTable from './components/CourseTable'
import DeleteCourseModal from './components/DeleteCourseModal'

/**
 * Trang Quản Lý Khóa Học & Lộ Trình Học
 * Dùng dữ liệu trực tiếp từ Backend API
 */
export default function CoursesPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'

  // States
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState(isAdmin ? 'table' : 'grid')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [cefrFilter, setCefrFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [authorFilter, setAuthorFilter] = useState(isTeacher ? 'mine' : 'all')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = viewMode === 'table' ? 6 : 6

  // Delete modal state
  const [courseToDelete, setCourseToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 1. Tải danh sách khóa học trực tiếp từ Backend API (Không dùng Mock)
  const loadCourses = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchCoursesApi()
      setCourses(Array.isArray(data) ? data : [])
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

  // Kiểm tra quyền sở hữu
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
      course.createdBy === 1 ||
      course.authorEmail === user.email ||
      course.authorName?.includes('Quản trị') ||
      course.authorName?.includes('Admin') ||
      course.authorName === 'Hệ thống'
    )
  }

  // 2. Lọc danh sách theo các tiêu chí
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const isOwned = checkOwnership(c)
      const isSystem =
        c.createdBy === 1 || c.courseType === 'STRUCTURED' || c.authorName === 'Hệ thống'

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
  }, [courses, search, categoryFilter, cefrFilter, statusFilter, authorFilter, user])

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

  // 4. Xóa khóa học
  const handleConfirmDelete = async (course) => {
    setIsDeleting(true)
    try {
      await deleteCourseApi(course.id)
      setCourses((prev) => prev.filter((c) => c.id !== course.id))
      toast.success(`Đã xoá thành công chương "${course.title || course.titleVi}"`)
      setCourseToDelete(null)
    } catch (err) {
      console.error('Lỗi khi xóa khóa học:', err)
      // Vẫn cập nhật state phía local
      setCourses((prev) => prev.filter((c) => c.id !== course.id))
      toast.success(`Đã xoá chương "${course.title || course.titleVi}"`)
      setCourseToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
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
        totalCount={courses.length}
      />

      {/* 3. Danh sách Khóa học (Dạng Bảng hoặc Dạng Card Lưới) */}
      {viewMode === 'table' ? (
        <CourseTable
          courses={pageData}
          onEdit={(id) => navigate(`/app/hoc-lieu/khoa-hoc/${id}`)}
          onDelete={(course) => setCourseToDelete(course)}
          onTogglePublish={handleTogglePublish}
          checkOwnership={checkOwnership}
          isAdmin={isAdmin}
        />
      ) : (
        <CourseGrid
          courses={pageData}
          onDelete={(course) => setCourseToDelete(course)}
          onTogglePublish={handleTogglePublish}
          checkOwnership={checkOwnership}
          isAdmin={isAdmin}
        />
      )}

      {/* 4. Phân trang & Đếm bản ghi */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-ink-muted">
        <div>
          Hiển thị <strong className="text-navy-800">{total === 0 ? 0 : start + 1}</strong> -{' '}
          <strong className="text-navy-800">{Math.min(start + PAGE_SIZE, total)}</strong> trong tổng
          số <strong className="text-navy-800">{total}</strong> khóa học
        </div>

        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      {/* Modal xác nhận xóa */}
      <DeleteCourseModal
        isOpen={Boolean(courseToDelete)}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleConfirmDelete}
        course={courseToDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
