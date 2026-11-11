import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GraduationCap,
  Layers,
  Plus,
  Trash2,
  Users,
  Video,
  FileText,
  HelpCircle,
  Clock,
  ClipboardList,
  ShieldCheck,
  X,
  Search,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchCoursesApi } from '@/features/courses/courseApi'
import { useAuthStore } from '@/store/authStore'
import { LEVEL_COLOR, formatTeacherName } from '../../classConstants'
import {
  getClassCourseIds,
  getHydratedCoursesForClass,
  attachCourseToClass,
  detachCourseFromClass,
} from '../../classCourseHelper'

export default function ClassCoursesTab({
  cls,
  canEdit = true,
  onCreateAssignmentWithCourse,
}) {
  const navigate = useNavigate()
  const [allCourses, setAllCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedCourseId, setExpandedCourseId] = useState(null)
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false)
  const [attachedCourses, setAttachedCourses] = useState([])

  // Tải danh sách tất cả các khóa học trong hệ thống
  const loadCourses = async () => {
    setLoading(true)
    try {
      const data = await fetchCoursesApi()
      const list = Array.isArray(data) ? data : []
      setAllCourses(list)
      const hydrated = getHydratedCoursesForClass(cls?.id, cls, list)
      setAttachedCourses(hydrated)
      // Mở rộng bài học của khóa học đầu tiên nếu có
      if (hydrated.length > 0 && !expandedCourseId) {
        setExpandedCourseId(hydrated[0].id)
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách khóa học cho ClassCoursesTab:', err)
      const fallback = getHydratedCoursesForClass(cls?.id, cls, [])
      setAttachedCourses(fallback)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cls?.id) {
      loadCourses()
    }
  }, [cls?.id, cls?.courseId])

  const handleAttach = (courseId) => {
    attachCourseToClass(cls.id, courseId)
    const updated = getHydratedCoursesForClass(cls.id, cls, allCourses)
    setAttachedCourses(updated)
    setIsAttachModalOpen(false)
    toast.success('Đã gắn khóa học vào lớp thành công!')
  }

  const handleDetach = (courseId, courseTitle) => {
    if (window.confirm(`Bạn có chắc chắn muốn gỡ khóa học "${courseTitle}" khỏi lớp này không?`)) {
      detachCourseFromClass(cls.id, courseId)
      const updated = getHydratedCoursesForClass(cls.id, cls, allCourses)
      setAttachedCourses(updated)
      toast.success('Đã gỡ khóa học khỏi lớp!')
    }
  }

  const toggleExpand = (courseId) => {
    setExpandedCourseId((prev) => (prev === courseId ? null : courseId))
  }

  const getLessonTypeIcon = (type = '') => {
    const t = String(type).toLowerCase()
    if (t.includes('video') || t.includes('listen') || t.includes('speak')) {
      return <Video size={13} className="text-slate-500" />
    }
    if (t.includes('quiz') || t.includes('vocab')) {
      return <HelpCircle size={13} className="text-slate-500" />
    }
    return <FileText size={13} className="text-slate-500" />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner / Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white shadow-xs">
            <GraduationCap size={20} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-900">
              Giáo trình khóa học áp dụng ({attachedCourses.length} khóa học)
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 border border-slate-200">
              <CheckCircle2 size={12} className="text-emerald-500" /> Đang hoạt động
            </span>
          </div>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => setIsAttachModalOpen(true)}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={15} />
            <span>Gắn thêm khóa học</span>
          </button>
        )}
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-600 border-t-transparent" />
          <span className="text-xs font-medium">Đang tải danh sách khóa học của lớp...</span>
        </div>
      ) : attachedCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center bg-slate-50/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-2xs border border-slate-200 mb-3">
            <BookOpen size={24} />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Lớp học chưa được gắn khóa học giáo trình nào</h4>
          <p className="mt-1 text-xs text-slate-500 max-w-md">
            Lớp học đang ở chế độ lớp tự do. Bạn có thể gắn một hoặc nhiều khóa học của giáo viên vào để làm lộ trình bài giảng cho học viên.
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsAttachModalOpen(true)}
              className="mt-4 flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Gắn khóa học ngay</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {attachedCourses.map((course, idx) => {
            const levelKey = course.cefrLevelMin || course.level || 'B1'
            const levelStyle = LEVEL_COLOR[levelKey] ?? LEVEL_COLOR.B1
            const isExpanded = expandedCourseId === course.id
            const lessons =
              course.lessons ||
              (course.chapters && course.chapters[0]?.lessons) ||
              []

            return (
              <div
                key={course.id || idx}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs transition-all hover:shadow-xs"
              >
                {/* Course Card Main Header */}
                <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Thumbnail & Info */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <img
                      src={
                        course.thumbnail ||
                        course.thumbnailUrl ||
                        'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80'
                      }
                      alt={course.title}
                      className="h-20 w-28 shrink-0 rounded-xl object-cover border border-slate-200 shadow-2xs"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="px-2 py-0.5 rounded-md text-[11px] font-bold"
                          style={{ backgroundColor: levelStyle.bg, color: levelStyle.text }}
                        >
                          CEFR {levelKey}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {course.category || course.categoryLabel || 'Luyện thi & Giao tiếp'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ID: #{course.id}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 tracking-tight truncate">
                        {course.title || course.titleVi}
                      </h4>

                      <div className="mt-1 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <ShieldCheck size={14} className="text-slate-500" />
                          <span>GV: {course.authorName || 'Thầy John Smith'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers size={14} className="text-slate-400" />
                          <span>{course.lessonCount || lessons.length || 2} bài học</span>
                        </span>
                        {course.durationHours && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} className="text-slate-400" />
                            <span>{course.durationHours}</span>
                          </span>
                        )}
                      </div>

                      {course.description && (
                        <p className="mt-1.5 text-xs text-slate-500 line-clamp-1">
                          {course.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Expand Toggle */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => navigate(`/app/hoc-lieu/khoa-hoc/${course.id}`)}
                      className="flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50/60 hover:bg-brand-100/80 px-3 py-2 text-xs font-semibold text-brand-700 transition-colors cursor-pointer"
                      title="Xem toàn bộ giáo trình & bài tập của khóa học này"
                    >
                      <ExternalLink size={13} />
                      <span>Xem giáo trình</span>
                    </button>

                    {onCreateAssignmentWithCourse && (
                      <button
                        type="button"
                        onClick={() => onCreateAssignmentWithCourse(course)}
                        className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
                        title="Giao bài tập từ khóa học này cho lớp"
                      >
                        <ClipboardList size={13} />
                        <span>Giao bài tập</span>
                      </button>
                    )}

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleDetach(course.id, course.title || course.titleVi)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Gỡ khóa học này khỏi lớp"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleExpand(course.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer ml-1"
                      title={isExpanded ? 'Thu gọn bài học' : 'Xem danh sách bài học'}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Lessons List inside the class */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/60 p-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Danh sách bài học trong giáo trình ({lessons.length} bài)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Nhấn vào bài để xem chi tiết nội dung
                      </span>
                    </div>

                    {lessons.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2 px-1">
                        Khóa học này hiện chưa có bài học nào được xuất bản.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {lessons.map((lesson, lIdx) => (
                          <div
                            key={lesson.id || lIdx}
                            onClick={() => navigate(`/app/hoc-lieu/khoa-hoc/${course.id}`)}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs hover:border-brand-400 hover:shadow-xs transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 font-mono text-xs font-bold">
                                {lesson.position || lIdx + 1}
                              </span>
                              <div className="min-w-0">
                                <h5 className="truncate text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                                  {lesson.title || lesson.titleVi}
                                </h5>
                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                                  <span className="flex items-center gap-1">
                                    {getLessonTypeIcon(lesson.lessonType || lesson.type)}
                                    <span>{lesson.lessonType || 'VOCABULARY'}</span>
                                  </span>
                                  <span>&bull;</span>
                                  <span>{lesson.estimatedMin || 15} phút</span>
                                </div>
                              </div>
                            </div>

                            {onCreateAssignmentWithCourse && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onCreateAssignmentWithCourse(course, lesson)
                                }}
                                className="shrink-0 rounded-lg p-1.5 text-ink-muted hover:bg-brand-50 hover:text-brand-600 transition-colors cursor-pointer"
                                title="Giao bài học này cho lớp"
                                aria-label="Giao bài học này cho lớp"
                              >
                                <ClipboardList size={16} strokeWidth={1.75} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Chọn Gắn thêm khóa học */}
      {isAttachModalOpen && (
        <AttachCourseModal
          isOpen={isAttachModalOpen}
          onClose={() => setIsAttachModalOpen(false)}
          allCourses={allCourses}
          alreadyAttachedIds={attachedCourses.map((c) => c.id)}
          onAttach={handleAttach}
          teacherName={cls?.teacherName}
          teacherId={cls?.teacherId}
        />
      )}
    </div>
  )
}

/**
 * Modal chọn gắn thêm khóa học cho lớp
 */
function AttachCourseModal({
  isOpen,
  onClose,
  allCourses = [],
  alreadyAttachedIds = [],
  onAttach,
  teacherName,
  teacherId,
}) {
  const currentUser = useAuthStore((s) => s.user)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState(null)

  if (!isOpen) return null

  // Nhận diện khóa học Hệ thống
  const isSystemCourse = (c) => {
    const author = (c.authorName || '').toLowerCase()
    if (author && author !== 'hệ thống' && !author.includes('hệ thống') && !author.includes('admin') && !author.includes('quản trị')) {
      return false
    }
    if (c.createdBy && Number(c.createdBy) > 1) {
      return false
    }
    return (
      Number(c.createdBy) === 1 ||
      c.creatorType === 'system' ||
      author === 'hệ thống' ||
      author.includes('hệ thống')
    )
  }

  // Nhận diện khóa học do chính người đăng nhập tạo
  const isMyCourse = (c) => {
    if (!currentUser) return false
    const uid = Number(currentUser.id)
    const cid = Number(c.createdBy)
    const emailMatch = c.authorEmail && currentUser.email && c.authorEmail.toLowerCase() === currentUser.email.toLowerCase()
    const nameMatch = c.authorName && currentUser.displayName && c.authorName.toLowerCase() === currentUser.displayName.toLowerCase()
    const idMatch = uid > 0 && cid > 0 && cid === uid
    return idMatch || Boolean(emailMatch) || Boolean(nameMatch)
  }

  // Lọc danh sách: CHỈ cho phép khóa học của chính mình hoặc của hệ thống
  // Tuyệt đối không lấy khóa học của giảng viên khác!
  const availableCourses = allCourses.filter((c) => {
    if (alreadyAttachedIds.includes(Number(c.id))) return false

    const myCourse = isMyCourse(c)
    const systemCourse = isSystemCourse(c)

    if (!myCourse && !systemCourse) {
      return false
    }

    if (!searchTerm.trim()) return true
    const q = searchTerm.toLowerCase()
    return (
      (c.title || '').toLowerCase().includes(q) ||
      (c.titleVi || '').toLowerCase().includes(q) ||
      (c.authorName || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-slate-700" size={20} />
            <h3 className="text-base font-bold text-slate-800">
              Gắn khóa học giáo trình vào lớp
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-3">
          {/* Search bar */}
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên khóa học, giảng viên..."
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {availableCourses.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Không tìm thấy khóa học nào phù hợp để gắn thêm.
              </div>
            ) : (
              availableCourses.map((c) => {
                const isSelected = selectedCourseId === c.id
                const myCourse = isMyCourse(c)
                const systemCourse = isSystemCourse(c)

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCourseId(c.id)}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/60 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          c.thumbnail ||
                          c.thumbnailUrl ||
                          'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80'
                        }
                        alt=""
                        className="h-11 w-14 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5 className="font-bold text-xs text-slate-900 truncate">
                            {c.title || c.titleVi}
                          </h5>
                          {systemCourse ? (
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              Hệ thống
                            </span>
                          ) : myCourse ? (
                            <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                              Của tôi
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>CEFR: {c.level || c.cefrLevelMin || 'All'}</span>
                          <span>&bull;</span>
                          <span>{c.lessonCount || 0} bài học</span>
                          <span>&bull;</span>
                          <span>GV: {c.authorName || 'Hệ thống'}</span>
                        </div>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="select_course"
                      checked={isSelected}
                      onChange={() => setSelectedCourseId(c.id)}
                      className="h-4 w-4 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={!selectedCourseId}
            onClick={() => onAttach(selectedCourseId)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Plus size={14} />
            <span>Xác nhận gắn vào lớp</span>
          </button>
        </div>
      </div>
    </div>
  )
}

