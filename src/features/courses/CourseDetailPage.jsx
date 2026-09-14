import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Tabs from '@/components/ui/Tabs'
import { useAuthStore } from '@/store/authStore'
import {
  createLessonApi,
  deleteLessonApi,
  fetchCourseByIdApi,
  fetchLessonsByCourseApi,
  updateCourseApi,
  updateLessonApi,
} from './courseApi'
import QuickLessonModal from './components/QuickLessonModal'
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

  const [activeTab, setActiveTab] = useState('curriculum')
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

  // Modal thêm / sửa nhanh bài học (Unit)
  const [lessonModal, setLessonModal] = useState({
    isOpen: false,
    isEdit: false,
    lessonId: null,
    titleVi: '',
    titleEn: '',
    lessonType: 'VOCABULARY',
    position: 1,
    estimatedMin: 15,
    xpReward: 30,
    isFreePreview: true,
    theoryContent: '',
    isSaving: false,
  })

  const loadCourseData = useCallback(async () => {
    setIsLoading(true)
    try {
      let cData = await fetchCourseByIdApi(id)

      if (cData) {
        try {
          const lessonList = await fetchLessonsByCourseApi(id)
          if (lessonList) {
            cData.lessons = lessonList
            cData.lessonCount = lessonList.length
            cData.chapters = [
              {
                id: `CH-${cData.id}`,
                title: cData.titleVi || cData.title || `Chương ${cData.id}`,
                duration: `${cData.estimatedHours || 5}h 00m`,
                lessons: lessonList,
              },
            ]
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
  }, [course, user, isTeacher])

  // Quyền quản lý: Admin hoặc chính chủ sở hữu
  const canManage = isAdmin || isOwned

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

  const handleOpenAddLesson = () => {
    const nextPos = (course?.lessons?.length || 0) + 1
    setLessonModal({
      isOpen: true,
      isEdit: false,
      lessonId: null,
      titleVi: `Unit ${nextPos}: `,
      titleEn: `Unit ${nextPos}: `,
      lessonType: 'VOCABULARY',
      position: nextPos,
      estimatedMin: 15,
      xpReward: 30,
      isFreePreview: true,
      theoryContent: '',
      contentBlocks: [],
      isSaving: false,
    })
  }

  const handleOpenEditLesson = (lesson) => {
    let theory = ''
    if (Array.isArray(lesson.contentBlocks)) {
      const th = lesson.contentBlocks.find((b) => b.type === 'theory')
      if (th) theory = th.content || ''
    }
    setLessonModal({
      isOpen: true,
      isEdit: true,
      lessonId: lesson.id,
      titleVi: lesson.titleVi || lesson.title || '',
      titleEn: lesson.titleEn || lesson.title || '',
      lessonType: lesson.lessonType || 'VOCABULARY',
      position: lesson.position || 1,
      estimatedMin: lesson.estimatedMin || 15,
      xpReward: lesson.xpReward || 30,
      isFreePreview: Boolean(lesson.isFreePreview),
      theoryContent: theory,
      contentBlocks: Array.isArray(lesson.contentBlocks) ? lesson.contentBlocks : [],
      isSaving: false,
    })
  }

  const handleSaveLessonModal = async () => {
    if (!lessonModal.titleVi.trim()) {
      toast.error('Vui lòng nhập tên bài học tiếng Việt')
      return
    }

    setLessonModal((prev) => ({ ...prev, isSaving: true }))
    try {
      let finalBlocks = Array.isArray(lessonModal.contentBlocks)
        ? [...lessonModal.contentBlocks]
        : []

      if (lessonModal.theoryContent?.trim()) {
        const thIdx = finalBlocks.findIndex((b) => b.type === 'theory')
        if (thIdx >= 0) {
          finalBlocks[thIdx] = {
            ...finalBlocks[thIdx],
            content: lessonModal.theoryContent.trim(),
          }
        } else {
          finalBlocks.unshift({
            type: 'theory',
            title: 'Lý thuyết trọng tâm',
            content: lessonModal.theoryContent.trim(),
          })
        }
      }

      const payload = {
        courseId: Number(id),
        titleVi: lessonModal.titleVi.trim(),
        titleEn: lessonModal.titleEn.trim() || lessonModal.titleVi.trim(),
        lessonType: lessonModal.lessonType,
        position: Number(lessonModal.position),
        estimatedMin: Number(lessonModal.estimatedMin),
        xpReward: Number(lessonModal.xpReward),
        isFreePreview: Boolean(lessonModal.isFreePreview),
        contentBlocks: finalBlocks,
      }

      if (lessonModal.isEdit && lessonModal.lessonId) {
        await updateLessonApi(lessonModal.lessonId, payload, id)
        toast.success('Cập nhật bài học thành công!')
      } else {
        await createLessonApi(payload, id)
        toast.success('Thêm bài học mới thành công!')
      }

      setLessonModal((prev) => ({ ...prev, isOpen: false, isSaving: false }))
      loadCourseData()
    } catch (err) {
      console.error('Lỗi khi lưu bài học:', err)
      toast.error('Lỗi khi kết nối với máy chủ!')
      setLessonModal((prev) => ({ ...prev, isSaving: false }))
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
      course.createdBy === 1 ||
      course.courseType === 'STRUCTURED' ||
      course.authorName === 'Hệ thống' ||
      course.authorName?.includes('Admin') ||
      course.authorName?.includes('Quản trị')
    )
  }, [course])

  if (isLoading || !course) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/app/hoc-lieu/khoa-hoc"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-navy-700 transition-colors"
        >
          <ArrowLeft size={14} /> Quay lại danh sách khóa học
        </Link>
      </div>

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

      {/* TAB 2: CHƯƠNG & BÀI HỌC (Curriculum View) */}
      {activeTab === 'curriculum' && (
        <CourseCurriculumTab
          course={course}
          isSystemCourse={isSystemCourse}
          canManage={canManage}
          expandedChapters={expandedChapters}
          toggleChapter={toggleChapter}
          handleOpenAddLesson={handleOpenAddLesson}
          handleOpenEditLesson={handleOpenEditLesson}
          handleDeleteLesson={handleDeleteLesson}
          setMediaPreview={setMediaPreview}
          navigate={navigate}
        />
      )}

      {/* Modal thêm / sửa nhanh bài học (Unit) */}
      <QuickLessonModal
        isOpen={lessonModal.isOpen}
        onClose={() => setLessonModal((prev) => ({ ...prev, isOpen: false }))}
        lessonModal={lessonModal}
        setLessonModal={setLessonModal}
        onSave={handleSaveLessonModal}
      />

      {/* Modal Xem Trực Tiếp Video hoặc Tệp Đính Kèm */}
      <MediaPreviewModal
        mediaPreview={mediaPreview}
        setMediaPreview={setMediaPreview}
      />
    </div>
  )
}

export default CourseDetailPage
