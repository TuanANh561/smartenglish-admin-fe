import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Tabs from '@/components/ui/Tabs'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuthStore } from '@/store/authStore'
import { useTopbarStore } from '@/store/topbarStore'
import {
  deleteLessonApi,
  fetchCourseByIdApi,
  fetchLessonsByCourseApi,
  updateCourseApi,
} from './courseApi'
import CourseDetailBanner from './components/detail/CourseDetailBanner'
import CourseOverviewTab from './components/detail/CourseOverviewTab'
import CourseCurriculumTab from './components/detail/CourseCurriculumTab'
import MediaPreviewModal from './components/detail/MediaPreviewModal'

const TABS = [
  { value: 'overview', label: 'Tổng quan' },
  { value: 'curriculum', label: 'Chương & bài học' },
]

function CourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'
  const setCustomHeader = useTopbarStore((s) => s.setCustomHeader)
  const clearCustomHeader = useTopbarStore((s) => s.clearCustomHeader)

  const [activeTab, setActiveTab] = useState('overview')
  const [course, setCourse] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedChapters, setExpandedChapters] = useState({})

  // Xem trước Video hoặc File/Tài liệu trực tiếp
  const [mediaPreview, setMediaPreview] = useState({
    isOpen: false,
    type: 'video',
    data: null,
    lessonTitle: '',
  })

  useEffect(() => {
    if (course) {
      setCustomHeader({
        backLink: '/app/hoc-lieu/khoa-hoc',
        backText: 'Quay lại danh sách',
        title: course.title || 'Chi tiết khóa học',
        subtitle: `Khóa học & Giáo trình / ${course.code || ''}`,
      })
    }
    return () => clearCustomHeader()
  }, [course, setCustomHeader, clearCustomHeader])

  const loadCourseData = useCallback(async () => {
    setIsLoading(true)
    try {
      let cData = await fetchCourseByIdApi(id)

      if (cData) {
        try {
          const lessonList = await fetchLessonsByCourseApi(id)
          if (Array.isArray(lessonList) && lessonList.length > 0) {
            cData.lessons = lessonList
            cData.lessonCount = lessonList.length
            const totalLessonMin = lessonList.reduce((acc, l) => acc + (Number(l.estimatedMin) || 15), 0)
            const chapterDuration = cData.estimatedHours != null
              ? `${cData.estimatedHours}h 00m`
              : (totalLessonMin > 0
                  ? (totalLessonMin >= 60 ? `${(totalLessonMin / 60).toFixed(1)}h` : `${totalLessonMin} phút`)
                  : '—')

            if (!cData.durationHours) {
              cData.durationHours = cData.estimatedHours != null
                ? `${cData.estimatedHours} giờ`
                : (totalLessonMin > 0
                    ? (totalLessonMin >= 60 ? `${(totalLessonMin / 60).toFixed(1)} giờ` : `${totalLessonMin} phút`)
                    : null)
            }

            cData.chapters = [
              {
                id: `CH-${cData.id}`,
                title: cData.titleVi || cData.title || `Chương ${cData.id}`,
                duration: chapterDuration,
                lessons: lessonList,
              },
            ]
          } else {
            // Giữ nguyên lessons & chapters đã có sẵn từ khóa học, không ghi đè làm mất bài học
            if (Array.isArray(cData.chapters) && cData.chapters.length > 0) {
              const existingLessons = cData.chapters.flatMap((ch) => ch.lessons || [])
              if (existingLessons.length > 0) {
                cData.lessons = existingLessons
                cData.lessonCount = existingLessons.length
              }
            }
          }
        } catch (lErr) {
          console.warn('Không lấy được lessons từ backend:', lErr)
        }

        setCourse(cData)
        if (cData?.chapters) {
          const exp = {}
          cData.chapters.forEach((ch) => {
            exp[ch.id] = true
          })
          setExpandedChapters(exp)
        }
      } else {
        setCourse(null)
      }
    } catch (err) {
      console.error('Lỗi khi tải chi tiết khóa học:', err)
      setCourse(null)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadCourseData()
  }, [loadCourseData])

  const isOwned = useMemo(() => {
    if (!user || !course) return false
    // Kiểm tra xem khóa học có phải của giáo viên riêng biệt (Thầy John, Cô Hoàng Mai...)
    const isTeacherAuthored =
      course.authorName === 'Thầy John' ||
      course.authorName === 'Thầy John Smith' ||
      course.authorName === 'Cô Hoàng Mai' ||
      course.authorName === 'Hoàng Thị Mai' ||
      (course.authorEmail && course.authorEmail.includes('teacher'))

    // Nếu là khóa học của giáo viên, chỉ tài khoản của giáo viên đó mới có quyền sửa
    if (isTeacherAuthored) {
      const isCreatorId = course.createdBy != null && user.id != null && Number(course.createdBy) === Number(user.id)
      const isCreatorEmail = course.authorEmail && user.email && course.authorEmail.toLowerCase() === user.email.toLowerCase()
      const isCreatorName = course.authorName && user.displayName && course.authorName.toLowerCase() === user.displayName.toLowerCase()
      return Boolean(isCreatorId || isCreatorEmail || isCreatorName)
    }

    if (isTeacher) {
      const isCreatorId = course.createdBy != null && user.id != null && Number(course.createdBy) === Number(user.id)
      const isCreatorEmail = course.authorEmail && user.email && course.authorEmail.toLowerCase() === user.email.toLowerCase()
      const isCreatorName = course.authorName && user.displayName && course.authorName.toLowerCase() === user.displayName.toLowerCase()
      return Boolean(isCreatorId || isCreatorEmail || isCreatorName)
    }

    // Với Admin: chỉ sở hữu các khóa học hệ thống chung hoặc khóa học do chính admin tạo
    return (
      course.authorName === 'Hệ thống' ||
      course.createdBy === 1 ||
      course.authorEmail === user.email ||
      course.authorName?.includes('Quản trị') ||
      course.authorName?.includes('Admin')
    )
  }, [course, user, isTeacher])

  // Quyền quản lý: Chỉ chính chủ sở hữu khóa học mới có quyền sửa/thêm/xóa.
  // Khóa học của giáo viên: Admin vào xem hoàn toàn ở chế độ XEM (Read-only).
  const canManage = isOwned

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }))
  }

  const handleTogglePublish = async () => {
    if (!canManage) {
      toast.error('Chỉ tác giả mới có quyền thay đổi trạng thái khóa học!')
      return
    }
    const nextPublished = !course.isPublished
    try {
      await updateCourseApi(course.id, {
        ...course,
        isPublished: nextPublished,
        status: nextPublished ? 'published' : 'draft',
      })
      setCourse((prev) => ({
        ...prev,
        isPublished: nextPublished,
        status: nextPublished ? 'published' : 'draft',
        statusLabel: nextPublished ? 'Đã xuất bản' : 'Bản nháp',
      }))
      toast.success(nextPublished ? 'Đã xuất bản khóa học!' : 'Đã chuyển về bản nháp!')
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err)
      // Fallback state update
      const nextStatus = course.status === 'published' ? 'draft' : 'published'
      setCourse((prev) => ({
        ...prev,
        status: nextStatus,
        statusLabel: nextStatus === 'published' ? 'Đã xuất bản' : 'Bản nháp',
      }))
      toast.success('Đã cập nhật trạng thái khóa học!')
    }
  }

  const handleDeleteLesson = async (lessonId, lessonTitle, e) => {
    e?.stopPropagation()
    if (!window.confirm(`Bạn có chắc muốn xóa bài học "${lessonTitle}"?`)) return
    try {
      await deleteLessonApi(lessonId)
      toast.success(`Đã xoá bài học "${lessonTitle}"`)
      loadCourseData()
    } catch (err) {
      console.error('Lỗi khi xóa bài học:', err)
      toast.error('Không thể xóa bài học!')
    }
  }

  const isSystemCourse = useMemo(() => {
    if (!course) return false
    return (
      Number(course.createdBy) === 1 ||
      Number(course.id) <= 4 ||
      course.authorName === 'Hệ thống' ||
      course.authorName?.includes('Admin') ||
      course.authorName?.includes('Quản trị')
    )
  }, [course])

  if (isLoading || !course) {
    return <LoadingSpinner text="Đang tải thông tin khóa học..." className="py-24" />
  }

  return (
    <div className="space-y-6 w-full">
      

      {/* Header Banner */}
      <CourseDetailBanner
        course={course}
        canManage={canManage}
        onTogglePublish={handleTogglePublish}
        navigate={navigate}
      />

      {/* Tabs */}
      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />

      {/* TAB 1: TỔNG QUAN (Overview) */}
      {activeTab === 'overview' && <CourseOverviewTab course={course} />}

      {/* TAB 2: CHƯƠNG & BÀI HỌC (Curriculum View - Master-Detail Workspace) */}
      {activeTab === 'curriculum' && (
        <CourseCurriculumTab
          course={course}
          isSystemCourse={isSystemCourse}
          canManage={canManage}
          expandedChapters={expandedChapters}
          toggleChapter={toggleChapter}
          handleDeleteLesson={handleDeleteLesson}
          setMediaPreview={setMediaPreview}
          navigate={navigate}
          onReloadCourse={loadCourseData}
        />
      )}

      {/* Modal Xem Trực Tiếp Video hoặc Tệp Đính Kèm */}
      <MediaPreviewModal
        mediaPreview={mediaPreview}
        setMediaPreview={setMediaPreview}
      />
    </div>
  )
}

export default CourseDetailPage
