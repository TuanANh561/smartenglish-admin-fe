import { useEffect, useState, useMemo } from 'react'
import {
  X,
  Loader2,
  BookOpen,
  Check,
  GraduationCap,
  Search,
  Calendar,
  Users,
  Layers,
  Info,
} from 'lucide-react'
import { fetchCoursesApi } from '@/features/courses/courseApi'
import { useAuthStore } from '@/store/authStore'
import { getClassCourseIds, setClassCourseIds } from '../classCourseHelper'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import useCtrlSave from '@/hooks/useCtrlSave'
import { cn } from '@/lib/utils'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function ClassFormModal({ isOpen, onClose, initialData, onSubmit, quota }) {
  const isEditing = Boolean(initialData?.id)
  const user = useAuthStore((s) => s.user)

  const [courses, setCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [selectedCourseIds, setSelectedCourseIds] = useState([])
  const [courseSearch, setCourseSearch] = useState('')
  const [courseTab, setCourseTab] = useState('all') // 'all' | 'my' | 'system'

  // Tab chuyển đổi trên màn hình nhỏ (Mobile/Tablet)
  const [mobileTab, setMobileTab] = useState('info') // 'info' | 'courses'

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    courseId: null,
    courseTitle: '',
    cefrTarget: 'B1',
    maxStudents: 30,
    status: 'ACTIVE',
    joinCode: '',
    startDate: '',
    endDate: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // 1. Tải danh sách khóa học
  useEffect(() => {
    if (!isOpen) return
    let isMounted = true
    const loadCourses = async () => {
      setLoadingCourses(true)
      try {
        const data = await fetchCoursesApi()
        if (isMounted) {
          setCourses(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.warn('Lỗi tải khóa học cho modal lớp học:', err)
      } finally {
        if (isMounted) setLoadingCourses(false)
      }
    }
    loadCourses()
    return () => {
      isMounted = false
    }
  }, [isOpen])

  // 2. Điền form khi mở hoặc chuyển lớp
  useEffect(() => {
    if (initialData) {
      const initialIds = getClassCourseIds(initialData.id, initialData.courseId)
      setSelectedCourseIds(initialIds)
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        courseId: initialData.courseId ? Number(initialData.courseId) : (initialIds[0] || null),
        courseTitle: initialData.courseTitle || '',
        cefrTarget: initialData.cefrTarget || initialData.level || 'B1',
        maxStudents: initialData.maxStudents || 30,
        status: (initialData.status || 'ACTIVE').toUpperCase(),
        joinCode: initialData.joinCode || initialData.code || '',
        startDate: initialData.startDate ? initialData.startDate.slice(0, 10) : '',
        endDate: initialData.endDate ? initialData.endDate.slice(0, 10) : '',
      })
    } else {
      setSelectedCourseIds([])
      setFormData({
        name: '',
        description: '',
        courseId: null,
        courseTitle: '',
        cefrTarget: 'B1',
        maxStudents: 30,
        status: 'ACTIVE',
        joinCode: '',
        startDate: '',
        endDate: '',
      })
    }
    setCourseSearch('')
    setCourseTab('all')
    setMobileTab('info')
    setErrors({})
  }, [initialData, isOpen])

  // Khóa học do Hệ thống cung cấp (dùng chung cho toàn hệ thống)
  const isSystemCourse = (c) => {
    const author = (c.authorName || '').toLowerCase()
    // Nếu tác giả là một giảng viên cụ thể (không phải Hệ thống hoặc Quản trị chung) -> KHÔNG phải hệ thống
    if (author && author !== 'hệ thống' && !author.includes('hệ thống') && !author.includes('admin') && !author.includes('quản trị')) {
      return false
    }
    // Nếu người tạo có id > 1 (ví dụ giáo viên có id 2, 29, 43...) -> KHÔNG phải hệ thống
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

  // Khóa học do chính người dùng hiện tại (Giáo viên hoặc Admin) tạo
  const isMyCourse = (c) => {
    if (!user) return false
    const uid = Number(user.id)
    const cid = Number(c.createdBy)
    const emailMatch = c.authorEmail && user.email && c.authorEmail.toLowerCase() === user.email.toLowerCase()
    const nameMatch = c.authorName && user.displayName && c.authorName.toLowerCase() === user.displayName.toLowerCase()
    const idMatch = uid > 0 && cid > 0 && cid === uid
    return idMatch || Boolean(emailMatch) || Boolean(nameMatch)
  }

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const myCourse = isMyCourse(c)
      const systemCourse = isSystemCourse(c)
      const isAlreadySelected = selectedCourseIds.includes(Number(c.id))

      // QUY TẮC CỐT LÕI:
      // - Nếu người đăng nhập là Admin: chỉ lấy khóa học của hệ thống và của chính Admin đó tạo.
      // - Nếu người đăng nhập là Giáo viên: chỉ lấy khóa học của chính Giáo viên đó và của hệ thống.
      // => TUYỆT ĐỐI KHÔNG lấy khóa học của giảng viên khác đưa vào danh sách chọn!
      if (!myCourse && !systemCourse && !isAlreadySelected) {
        return false
      }

      // Lọc theo Tab tác giả
      if (courseTab === 'my' && !myCourse) return false
      if (courseTab === 'system' && !systemCourse) return false

      // Lọc theo từ khóa tìm kiếm
      if (courseSearch.trim()) {
        const q = courseSearch.toLowerCase()
        const titleMatch = (c.title || c.titleVi || '').toLowerCase().includes(q)
        const authorMatch = (c.authorName || '').toLowerCase().includes(q)
        const levelMatch = (c.level || c.cefrLevelMin || '').toLowerCase().includes(q)
        return titleMatch || authorMatch || levelMatch
      }
      return true
    })
  }, [courses, courseTab, courseSearch, user, selectedCourseIds])

  const handleToggleCourse = (courseId) => {
    const numId = Number(courseId)
    setSelectedCourseIds((prev) => {
      let next
      if (prev.includes(numId)) {
        next = prev.filter((id) => id !== numId)
      } else {
        next = [...prev, numId]
      }
      // Tự động gán courseId chính và courseTitle
      const primaryId = next[0] || null
      const primaryCourse = courses.find((c) => Number(c.id) === primaryId)
      setFormData((f) => ({
        ...f,
        courseId: primaryId,
        courseTitle: primaryCourse ? (primaryCourse.title || primaryCourse.titleVi || '') : '',
        cefrTarget: primaryCourse?.cefrLevelMin || f.cefrTarget,
      }))
      return next
    })
  }

  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) {
      errs.name = 'Vui lòng nhập tên lớp học'
    } else if (formData.name.trim().length > 100) {
      errs.name = 'Tên lớp không được vượt quá 100 ký tự'
    }

    const studentNum = Number(formData.maxStudents)
    const limit = quota?.maxStudentsPerClass || 500
    if (!formData.maxStudents || isNaN(studentNum) || studentNum < 1) {
      errs.maxStudents = 'Sĩ số tối thiểu là 1 học viên'
    } else if (studentNum > limit) {
      errs.maxStudents = quota?.maxStudentsPerClass
        ? `Vượt quá giới hạn (${quota.maxStudentsPerClass} học viên) của gói ${quota.planName || 'hiện tại'}.`
        : 'Sĩ số tối đa là 500 học viên'
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      errs.endDate = 'Ngày kết thúc phải sau ngày bắt đầu'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const primaryId = selectedCourseIds[0] ? Number(selectedCourseIds[0]) : null
      const primaryCourse = courses.find((c) => Number(c.id) === primaryId)

      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        courseId: primaryId,
        courseTitle: primaryCourse ? (primaryCourse.title || primaryCourse.titleVi || '') : (formData.courseTitle || null),
        cefrTarget: formData.cefrTarget,
        maxStudents: Number(formData.maxStudents),
        status: formData.status,
        startDate: formData.startDate ? `${formData.startDate}T00:00:00Z` : null,
        endDate: formData.endDate ? `${formData.endDate}T23:59:59Z` : null,
      }
      if (!isEditing && formData.joinCode.trim()) {
        payload.joinCode = formData.joinCode.trim().toUpperCase()
      }

      const result = await onSubmit(payload)

      // Cập nhật persistent mapping cho các khóa học của lớp
      const targetClassId = initialData?.id || result?.id || result?.data?.id
      if (targetClassId) {
        setClassCourseIds(targetClassId, selectedCourseIds)
      }

      onClose()
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err?.message || 'Có lỗi xảy ra, vui lòng thử lại',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  // Phím tắt Ctrl + S lưu nhanh (đồng bộ chuẩn toàn hệ thống)
  useCtrlSave(handleSubmit, isOpen && !submitting)

  // Hỗ trợ thêm phím tắt trực tiếp trên modal (Ctrl + S hoặc Ctrl + Enter)
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.key === 'Enter')) {
      e.preventDefault()
      e.stopPropagation()
      handleSubmit()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onKeyDown={handleKeyDown}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-line animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* ─── 1. HEADER CỐ ĐỊNH ─── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-surface shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
              <GraduationCap size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900 leading-tight">
                {isEditing ? 'Chỉnh sửa thông tin lớp học' : 'Tạo lớp học mới'}
              </h3>
              <p className="text-xs text-ink-muted">
                {isEditing
                  ? `Mã lớp: ${initialData?.code || initialData?.joinCode || '—'}`
                  : 'Thiết lập thông tin và gắn giáo trình cho lớp'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            title="Đóng (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher cho màn hình nhỏ (Mobile/Tablet) */}
        <div className="flex md:hidden border-b border-line bg-canvas px-4 shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab('info')}
            className={cn(
              'flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition-all cursor-pointer',
              mobileTab === 'info'
                ? 'border-brand-600 text-brand-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-navy-900',
            )}
          >
            Thông tin lớp học
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('courses')}
            className={cn(
              'flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition-all cursor-pointer',
              mobileTab === 'courses'
                ? 'border-brand-600 text-brand-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-navy-900',
            )}
          >
            Khóa học/Giáo trình ({selectedCourseIds.length})
          </button>
        </div>

        {/* Lỗi submit tổng quát */}
        {errors.submit && (
          <div className="mx-6 mt-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200 shrink-0">
            {errors.submit}
          </div>
        )}

        {/* ─── 2. BODY 2 CỘT SONG SONG KHÔNG CẦN CUỘN TRANG ─── */}
        <div className="flex-1 overflow-y-auto md:overflow-hidden p-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
            {/* ── CỘT TRÁI (7 COLS): THÔNG TIN LỚP HỌC ── */}
            <div
              className={cn(
                'md:col-span-7 flex flex-col justify-between space-y-3.5',
                mobileTab !== 'info' && 'hidden md:flex',
              )}
            >
              {/* Tên lớp học */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên lớp học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: IELTS Intensive B2 - Khóa 1"
                  className={cn(
                    'w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors',
                    errors.name
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                      : 'border-slate-200 focus:border-brand-500',
                  )}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Grid 2 cột: Trình độ CEFR & Sĩ số */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trình độ CEFR <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.cefrTarget}
                    onChange={(e) => setFormData({ ...formData, cefrTarget: e.target.value })}
                    size="sm"
                    options={CEFR_LEVELS.map((lvl) => ({ value: lvl, label: lvl }))}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Sĩ số tối đa <span className="text-red-500">*</span>
                    </label>
                    {quota?.maxStudentsPerClass && (
                      <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                        Gói: {quota.maxStudentsPerClass} HV
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={quota?.maxStudentsPerClass || 500}
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                    className={cn(
                      'w-full rounded-xl border px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none',
                      errors.maxStudents
                        ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                        : 'border-slate-200 focus:border-brand-500',
                    )}
                  />
                  {errors.maxStudents && (
                    <p className="mt-1 text-xs text-red-500">{errors.maxStudents}</p>
                  )}
                </div>
              </div>

              {/* Grid 2 cột: Trạng thái & Mã lớp */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trạng thái
                  </label>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    size="sm"
                    options={[
                      { value: 'ACTIVE', label: 'Đang diễn ra' },
                      { value: 'UPCOMING', label: 'Sắp diễn ra' },
                      { value: 'ENDED', label: 'Đã kết thúc' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã tham gia {isEditing ? '(Cố định)' : '(Tự sinh nếu trống)'}
                  </label>
                  <input
                    type="text"
                    disabled={isEditing}
                    value={formData.joinCode}
                    onChange={(e) =>
                      setFormData({ ...formData, joinCode: e.target.value.toUpperCase() })
                    }
                    placeholder="VD: ENG888"
                    maxLength={20}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm font-mono text-slate-800 uppercase placeholder:normal-case placeholder:text-slate-400 focus:border-brand-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              </div>

              {/* Grid 2 cột: Ngày bắt đầu & Ngày kết thúc */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={cn(
                      'w-full rounded-xl border px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none',
                      errors.endDate
                        ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                        : 'border-slate-200 focus:border-brand-500',
                    )}
                  />
                  {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
                </div>
              </div>

              {/* Mô tả lớp học */}
              <div className="flex-1 flex flex-col">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả lớp học
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Giới thiệu mục tiêu, đối tượng học viên hoặc nội dung chương trình..."
                  className="w-full flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* ── CỘT PHẢI (5 COLS): KHÓA HỌC GIÁO TRÌNH ÁP DỤNG ── */}
            <div
              className={cn(
                'md:col-span-5 flex flex-col h-full border-t md:border-t-0 md:border-l border-line md:pl-6 pt-4 md:pt-0',
                mobileTab !== 'courses' && 'hidden md:flex',
              )}
            >
              {/* Header Cột Khóa học */}
              <div className="flex items-center justify-between mb-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <BookOpen size={15} className="text-brand-600" />
                  <span className="text-xs font-bold text-navy-900">Giáo trình áp dụng</span>
                </div>
                <Badge tone={selectedCourseIds.length > 0 ? 'info' : 'neutral'}>
                  {selectedCourseIds.length} đã chọn
                </Badge>
              </div>

              {/* Ô tìm kiếm khóa học nhanh */}
              <div className="relative mb-2 shrink-0">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Tìm khóa học, cấp độ..."
                  className="w-full rounded-xl border border-slate-200 bg-canvas pl-8.5 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              {/* Bộ lọc nhỏ: Tất cả / Của tôi / Hệ thống */}
              <div className="flex items-center gap-1 mb-2 shrink-0">
                {[
                  { key: 'all', label: 'Tất cả' },
                  { key: 'my', label: 'Của tôi' },
                  { key: 'system', label: 'Hệ thống' },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setCourseTab(t.key)}
                    className={cn(
                      'px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer',
                      courseTab === t.key
                        ? 'bg-navy-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Danh sách khóa học có scroll riêng biệt */}
              <div className="flex-1 overflow-y-auto max-h-[260px] md:max-h-[300px] space-y-1.5 pr-1 rounded-xl border border-line bg-canvas/60 p-2">
                {loadingCourses ? (
                  <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin text-brand-600" />
                    <span>Đang tải danh sách khóa học...</span>
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Không tìm thấy khóa học phù hợp
                  </div>
                ) : (
                  filteredCourses.map((c) => {
                    const isChecked = selectedCourseIds.includes(Number(c.id))
                    const isTeacher = isMyCourse(c)

                    return (
                      <div
                        key={c.id}
                        onClick={() => handleToggleCourse(c.id)}
                        role="button"
                        tabIndex={0}
                        className={cn(
                          'flex items-center justify-between gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all border text-left',
                          isChecked
                            ? 'bg-white border-brand-500 shadow-2xs ring-1 ring-brand-500/20'
                            : 'bg-white/80 border-line hover:border-slate-300 hover:bg-white',
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={cn(
                              'flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-colors',
                              isChecked
                                ? 'bg-brand-600 border-brand-600 text-white'
                                : 'border-slate-300 bg-white',
                            )}
                          >
                            {isChecked && <Check size={11} strokeWidth={3} />}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-navy-900 truncate">
                                {c.title || c.titleVi}
                              </span>
                              {isSystemCourse(c) ? (
                                <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 shrink-0">
                                  Hệ thống
                                </span>
                              ) : isMyCourse(c) ? (
                                <span className="text-[9px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.2 rounded border border-brand-200 shrink-0">
                                  Của tôi
                                </span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-ink-muted mt-0.5">
                              <span>CEFR {c.level || c.cefrLevelMin || 'All'}</span>
                              <span>&bull;</span>
                              <span>{c.lessonCount || 0} bài</span>
                              <span>&bull;</span>
                              <span className="truncate max-w-[100px]">{isSystemCourse(c) ? 'Hệ thống' : (isMyCourse(c) ? 'Của tôi' : (c.authorName || 'Giáo viên'))}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Ghi chú lộ trình ở dưới */}
              <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-line flex items-center gap-1.5 text-[11px] text-slate-500 shrink-0">
                <Info size={13} className="text-brand-600 shrink-0" />
                <span className="truncate">
                  {selectedCourseIds.length > 0
                    ? `Đã chọn ${selectedCourseIds.length} giáo trình cho bài giảng của lớp.`
                    : 'Tick chọn để gắn giáo trình bài giảng cho lớp.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 3. FOOTER CỐ ĐỊNH Ở ĐÁY (LUÔN NHÌN THẤY) ─── */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-line bg-surface shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs text-ink-muted">
            <span className="font-medium">Phím tắt:</span>
            <kbd className="px-1.5 py-0.5 rounded border border-line bg-canvas font-mono text-[10px] font-bold text-slate-600">
              Ctrl + S
            </kbd>
            <span>để lưu nhanh</span>
          </div>

          <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-line bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting && <Loader2 size={13} strokeWidth={2.25} className="animate-spin shrink-0" />}
              <span>{isEditing ? 'Lưu thay đổi' : 'Tạo lớp học'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
