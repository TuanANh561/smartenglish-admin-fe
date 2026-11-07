import { useState, useMemo, useEffect, lazy, Suspense } from 'react'
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Download,
  FileCode,
  GripVertical,
  Layers,
  Lock,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils'
import CourseCurriculumExportImportModal from './CourseCurriculumExportImportModal'

// Lazy Loading Code-Splitting cho 2 Panel chi tiết bài học
const LessonEditorWorkspace = lazy(() => import('./LessonEditorWorkspace'))
const LessonStudentViewPanel = lazy(() => import('./LessonStudentViewPanel'))

/**
 * Tab Chương & Bài Học (Master-Detail Split Workspace)
 * Tích hợp:
 * - Cột trái: Dropdown / Accordion các chương, tìm kiếm, kéo thả HTML5 reorder, xuất/nhập JSON
 * - Cột phải: Lazy-loaded Workspace biên soạn chi tiết bài học với Auto-save và Shortcuts
 */
export default function CourseCurriculumTab({
  course,
  isSystemCourse,
  canManage,
  expandedChapters: initialExpandedChapters,
  toggleChapter: parentToggleChapter,
  handleDeleteLesson,
  setMediaPreview,
  navigate,
  onReloadCourse,
}) {
  // Trạng thái bài học đang được chọn và trạng thái tạo mới
  const [selectedLessonId, setSelectedLessonId] = useState(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal Xuất / Nhập Khung Chương Trình Học
  const [isExportImportOpen, setIsExportImportOpen] = useState(false)

  // Drag and drop state
  const [draggedLesson, setDraggedLesson] = useState(null)
  const [dragOverLessonId, setDragOverLessonId] = useState(null)

  // Trạng thái mở/đóng từng chương (local state đồng bộ với props)
  const [localExpandedChapters, setLocalExpandedChapters] = useState({})

  // Khởi tạo mở tất cả các chương
  useEffect(() => {
    if (course?.chapters && course.chapters.length > 0) {
      const exp = {}
      course.chapters.forEach((ch) => {
        exp[ch.id] = initialExpandedChapters?.[ch.id] ?? true
      })
      setLocalExpandedChapters(exp)
    }
  }, [course?.chapters, initialExpandedChapters])

  // Tập hợp toàn bộ bài học phẳng
  const allLessons = useMemo(() => {
    if (!course?.chapters) return []
    const list = []
    course.chapters.forEach((ch) => {
      if (Array.isArray(ch.lessons)) {
        ch.lessons.forEach((l) => {
          list.push({ ...l, chapterId: ch.id, chapterTitle: ch.title })
        })
      }
    })
    return list
  }, [course?.chapters])

  // Tự động chọn bài đầu tiên khi mới tải trang
  useEffect(() => {
    if (allLessons.length > 0) {
      if (!isCreatingNew) {
        const exists = allLessons.some((l) => l.id === selectedLessonId)
        if (!exists) {
          setSelectedLessonId(allLessons[0].id)
        }
      }
    }
  }, [allLessons, selectedLessonId, isCreatingNew])

  // Phím tắt điều hướng nhanh: Alt + N (Tạo bài mới), Alt + ArrowUp/ArrowDown (Chuyển bài)
  useEffect(() => {
    const handleKeyNav = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        handleStartCreateLesson()
      }
      if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault()
        if (allLessons.length > 0) {
          const currentIdx = allLessons.findIndex((l) => l.id === selectedLessonId)
          const nextIdx = (currentIdx + 1) % allLessons.length
          handleSelectLesson(allLessons[nextIdx])
        }
      }
      if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault()
        if (allLessons.length > 0) {
          const currentIdx = allLessons.findIndex((l) => l.id === selectedLessonId)
          const prevIdx = (currentIdx - 1 + allLessons.length) % allLessons.length
          handleSelectLesson(allLessons[prevIdx])
        }
      }
    }

    window.addEventListener('keydown', handleKeyNav)
    return () => window.removeEventListener('keydown', handleKeyNav)
  }, [allLessons, selectedLessonId])

  // Tìm bài học đang active
  const activeLesson = useMemo(() => {
    if (isCreatingNew || !selectedLessonId) return null
    return allLessons.find((l) => l.id === selectedLessonId) || null
  }, [allLessons, selectedLessonId, isCreatingNew])

  // Tìm tên chương hiện tại
  const currentChapterTitle = useMemo(() => {
    if (activeLesson?.chapterTitle) return activeLesson.chapterTitle
    if (course?.chapters?.[0]?.title) return course.chapters[0].title
    return course?.titleVi || course?.title || ''
  }, [activeLesson, course])

  const toggleChapter = (chapterId) => {
    setLocalExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }))
    if (parentToggleChapter) {
      parentToggleChapter(chapterId)
    }
  }

  // Handler khi click chọn một bài học ở cột trái
  const handleSelectLesson = (lesson) => {
    setIsCreatingNew(false)
    setSelectedLessonId(lesson.id)
  }

  // Handler khi bấm nút "+ Thêm bài học mới"
  const handleStartCreateLesson = (chapterId = null) => {
    setIsCreatingNew(true)
    setIsEditMode(true)
    setSelectedLessonId(null)
  }

  // Callback sau khi lưu thành công bài học
  const handleSaveSuccess = async (savedLesson) => {
    if (onReloadCourse) {
      await onReloadCourse()
    }
    if (savedLesson?.id) {
      setIsCreatingNew(false)
      setSelectedLessonId(savedLesson.id)
    }
  }

  // Callback hủy / làm mới
  const handleCancel = () => {
    if (isCreatingNew) {
      if (allLessons.length > 0) {
        setIsCreatingNew(false)
        setSelectedLessonId(allLessons[0].id)
      }
    } else if (activeLesson) {
      setSelectedLessonId(activeLesson.id)
    }
  }

  // Xóa bài học kèm xử lý chuyển active lesson
  const onDeleteLesson = async (lessonId, lessonTitle, e) => {
    e?.stopPropagation()
    if (!handleDeleteLesson) return
    const isDeletingCurrent = selectedLessonId === lessonId

    await handleDeleteLesson(lessonId, lessonTitle, e)

    if (isDeletingCurrent) {
      const remaining = allLessons.filter((l) => l.id !== lessonId)
      if (remaining.length > 0) {
        setSelectedLessonId(remaining[0].id)
        setIsCreatingNew(false)
      } else {
        setSelectedLessonId(null)
        setIsCreatingNew(true)
      }
    }
  }

  // --- HTML5 Native Drag & Drop Reordering ---
  const handleDragStart = (e, lesson, chapterId) => {
    if (!canManage) return
    setDraggedLesson({ ...lesson, sourceChapterId: chapterId })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(lesson.id))
  }

  const handleDragOver = (e, targetLessonId) => {
    if (!canManage) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverLessonId !== targetLessonId) {
      setDragOverLessonId(targetLessonId)
    }
  }

  const handleDragLeave = () => {
    setDragOverLessonId(null)
  }

  const handleDropLesson = (targetChapterId, targetLessonId) => {
    setDragOverLessonId(null)
    if (!draggedLesson || draggedLesson.id === targetLessonId) return

    const currentChapters = [...(course.chapters || [])]
    const targetChapter = currentChapters.find((ch) => ch.id === targetChapterId)
    if (!targetChapter || !Array.isArray(targetChapter.lessons)) return

    const lessons = [...targetChapter.lessons]
    const draggedIdx = lessons.findIndex((l) => l.id === draggedLesson.id)
    const targetIdx = lessons.findIndex((l) => l.id === targetLessonId)

    if (draggedIdx >= 0 && targetIdx >= 0) {
      const [removed] = lessons.splice(draggedIdx, 1)
      lessons.splice(targetIdx, 0, removed)

      // Cập nhật lại số thứ tự position
      lessons.forEach((l, idx) => {
        l.position = idx + 1
      })

      targetChapter.lessons = lessons
      setDraggedLesson(null)
      toast.success(`Đã đổi vị trí bài học "${removed.titleVi || removed.title}" sang vị trí #${targetIdx + 1}!`)
    }
  }

  // Tính số thứ tự tiếp theo
  const nextPosition = allLessons.length + 1

  return (
    <div className="space-y-4">




      {/* 2. Giao diện 2 cột Master - Detail Workspace */}
      <div className="flex flex-col lg:flex-row items-start gap-5 w-full">
        {/* ============================================================== */}
        {/* CỘT TRÁI: NAVIGATOR CHƯƠNG & DROPDOWN BÀI HỌC (30% - 360px)   */}
        {/* ============================================================== */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 space-y-3 lg:sticky lg:top-4 self-start lg:max-h-[calc(100vh-48px)] lg:overflow-y-auto select-scrollbar pr-0.5">
          {/* Card Header Navigator & Ô tìm kiếm */}
          <Card className="p-3.5 space-y-3 border-line shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-brand-600" />
                <h3 className="font-bold text-xs text-navy-800 uppercase tracking-wider">
                  Chương Trình Học
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {course.chapters?.length || 0} chương • {allLessons.length} bài
              </span>
            </div>

            {/* Ô tìm kiếm bài học */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh bài học..."
                className="w-full h-10 pl-9.5 pr-8 text-sm bg-slate-50/80 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                  title="Xóa tìm kiếm"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </Card>

          {/* Danh Sách Các Chương (Accordion / Dropdown) */}
          {course.chapters?.length === 0 ? (
            <Card className="p-6 text-center space-y-2">
              <p className="text-xs text-ink-muted">Chưa có chương học nào trong khóa học này.</p>
              {canManage && (
                <Button size="sm" icon={Plus} onClick={() => handleStartCreateLesson()}>
                  Tạo bài học đầu tiên
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-3">
              {course.chapters.map((chapter, cIdx) => {
                const isExpanded = localExpandedChapters[chapter.id] ?? true
                const lessons = Array.isArray(chapter.lessons) ? chapter.lessons : []

                // Lọc bài học theo tìm kiếm
                const filteredLessons = searchQuery.trim()
                  ? lessons.filter((l) => {
                      const q = searchQuery.toLowerCase()
                      return (
                        (l.titleVi && l.titleVi.toLowerCase().includes(q)) ||
                        (l.title && l.title.toLowerCase().includes(q)) ||
                        (l.titleEn && l.titleEn.toLowerCase().includes(q))
                      )
                    })
                  : lessons

                return (
                  <div
                    key={chapter.id || cIdx}
                    className="rounded-2xl border border-line overflow-hidden bg-white shadow-xs transition-all"
                  >
                    {/* Chapter Header Dropdown Toggle */}
                    <div
                      onClick={() => toggleChapter(chapter.id)}
                      className="flex items-center justify-between bg-slate-50/90 px-3.5 py-2.5 border-b border-line cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md bg-brand-50/60 border border-brand-200/80 text-brand-700 font-bold text-[11px] shadow-2xs">
                          {cIdx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-navy-800 truncate" title={chapter.title}>
                            {chapter.title}
                          </h4>
                          <p className="text-[10px] text-ink-muted mt-0.5">
                            {lessons.length} bài học {chapter.duration ? `• ${chapter.duration}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {canManage && !isSystemCourse && (
                          <button
                            type="button"
                            onClick={() => navigate(`/app/hoc-lieu/khoa-hoc/${course.id}/chinh-sua`)}
                            className="p-1 text-slate-400 hover:text-brand-600 rounded cursor-pointer transition-colors"
                            title="Chỉnh sửa chương"
                          >
                            <Pencil size={12} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleChapter(chapter.id)}
                          className="p-1 text-slate-400 hover:text-navy-900 rounded cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Dropdown Danh Sách Bài Học Của Chương (Hỗ trợ kéo thả Reorder) */}
                    {isExpanded && (
                      <div className="p-2 space-y-1.5 bg-slate-50/30">
                        {filteredLessons.length === 0 ? (
                          <div className="py-4 text-center text-[11px] text-slate-400 italic">
                            {searchQuery ? 'Không tìm thấy bài học phù hợp' : 'Chưa có bài học nào trong chương này'}
                          </div>
                        ) : (
                          filteredLessons.map((lesson) => {
                            const isSelected = selectedLessonId === lesson.id && !isCreatingNew
                            const isDragOver = dragOverLessonId === lesson.id

                            // Đếm số lượng blocks
                            const hasTheory =
                              Array.isArray(lesson.contentBlocks) &&
                              lesson.contentBlocks.some((b) => b.type === 'theory')
                            const vocabCount = Array.isArray(lesson.contentBlocks)
                              ? lesson.contentBlocks.find((b) => b.type === 'vocabulary')?.items?.length || 0
                              : 0
                            const quizCount = Array.isArray(lesson.contentBlocks)
                              ? lesson.contentBlocks.find((b) => b.type === 'quiz')?.questions?.length || 0
                              : 0
                            const hasVideo =
                              lesson.type === 'video' ||
                              (Array.isArray(lesson.contentBlocks) &&
                                lesson.contentBlocks.some((b) => b.type === 'video' && b.videoUrl))

                            return (
                              <div
                                key={lesson.id}
                                draggable={canManage}
                                onDragStart={(e) => handleDragStart(e, lesson, chapter.id)}
                                onDragOver={(e) => handleDragOver(e, lesson.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={() => handleDropLesson(chapter.id, lesson.id)}
                                onClick={() => handleSelectLesson(lesson)}
                                className={cn(
                                  'group relative flex items-center justify-between gap-2 rounded-xl p-2 text-xs transition-all cursor-pointer border select-none',
                                  isSelected
                                    ? 'bg-brand-50/90 border-brand-500 border-l-4 border-l-brand-600 shadow-2xs ring-1 ring-brand-300/40 text-brand-950 font-medium'
                                    : 'bg-white border-line hover:border-slate-300 hover:bg-slate-50/80 text-navy-800',
                                  isDragOver && 'border-dashed border-2 border-brand-500 bg-brand-50/50 scale-[1.01]',
                                )}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {/* Tay cầm kéo thả HTML5 */}
                                  {canManage && (
                                    <span
                                      className="text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing p-0.5 shrink-0"
                                      title="Kéo thả để sắp xếp lại thứ tự bài học"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <GripVertical size={13} />
                                    </span>
                                  )}

                                  {/* Icon theo loại bài */}
                                  <span
                                    className={cn(
                                      'flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold transition-colors shadow-2xs',
                                      isSelected
                                        ? 'bg-brand-600 text-white'
                                        : hasVideo
                                        ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white'
                                        : quizCount > 0
                                        ? 'bg-red-50 text-red-600 group-hover:bg-red-500 group-hover:text-white'
                                        : 'bg-slate-100 text-slate-700 group-hover:bg-brand-600 group-hover:text-white',
                                    )}
                                  >
                                    U{lesson.position || 1}
                                  </span>

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <h5
                                        className={cn(
                                          'font-bold text-xs truncate',
                                          isSelected ? 'text-brand-950' : 'text-navy-800 group-hover:text-brand-600',
                                        )}
                                        title={lesson.titleVi || lesson.title}
                                      >
                                        {lesson.titleVi || lesson.title}
                                      </h5>
                                    </div>

                                    {/* Badges nhỏ gọn */}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px] text-slate-500">
                                      {hasTheory && <span>Lý thuyết</span>}
                                      {vocabCount > 0 && <span>• {vocabCount} từ</span>}
                                      {quizCount > 0 && <span>• {quizCount} quiz</span>}
                                      {hasVideo && <span>• Video</span>}
                                      <span className="text-[10px] text-slate-400">
                                        • {lesson.duration || `${lesson.estimatedMin || 15}m`}
                                      </span>
                                      {!lesson.isFreePreview && (
                                        <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                                          PRO
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Nút Xóa bài học */}
                                {canManage && (
                                  <div
                                    className="flex items-center shrink-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      onClick={(e) =>
                                        onDeleteLesson(lesson.id, lesson.titleVi || lesson.title, e)
                                      }
                                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                                      title="Xóa bài học này"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )
                          })
                        )}

                        {/* Nút thêm bài vào chương này */}
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditMode(true)
                              handleStartCreateLesson(chapter.id)
                            }}
                            className="w-full flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold text-brand-600 hover:bg-brand-50/60 rounded-lg border border-dashed border-brand-200 transition-colors cursor-pointer mt-1"
                          >
                            <Plus size={12} /> Thêm bài vào chương này
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* CỘT PHẢI: DETAIL WORKSPACE SOẠN THẢO TRỰC TIẾP (70% - FLEX-1)  */}
        {/* ============================================================== */}
        <div className="flex-1 min-w-0 w-full">
          <Suspense
            fallback={
              <div className="w-full h-96 flex items-center justify-center bg-white rounded-2xl border border-line">
                <LoadingSpinner text="Đang tải nội dung bài học..." />
              </div>
            }
          >
            {canManage && isEditMode ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl shadow-2xs">
                  <span className="text-xs font-semibold text-slate-700">
                    {isCreatingNew ? 'Soạn bài học mới' : 'Chỉnh sửa bài học'}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-xs font-semibold"
                    onClick={() => {
                      setIsEditMode(false)
                      setIsCreatingNew(false)
                      handleCancel()
                    }}
                  >
                    Quay lại xem bài học
                  </Button>
                </div>
                <LessonEditorWorkspace
                  courseId={course.id}
                  chapterTitle={currentChapterTitle}
                  isCreatingNew={isCreatingNew}
                  activeLesson={activeLesson}
                  nextPosition={nextPosition}
                  onSaveSuccess={async (saved) => {
                    setIsEditMode(false)
                    await handleSaveSuccess(saved)
                  }}
                  onCancel={() => {
                    setIsEditMode(false)
                    handleCancel()
                  }}
                  setMediaPreview={setMediaPreview}
                />
              </div>
            ) : allLessons.length === 0 ? (
              <div className="w-full min-h-[420px] flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-line text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-3">
                  <BookOpen size={24} />
                </div>
                <h4 className="font-bold text-navy-800 text-sm">Khóa học chưa có bài học nào</h4>
                <p className="text-xs text-ink-muted mt-1 max-w-sm">
                  Chương trình giảng dạy hiện chưa có bài học nào được đăng tải.
                </p>
                {canManage && (
                  <Button
                    size="sm"
                    variant="primary"
                    className="mt-4 text-xs font-semibold"
                    icon={Plus}
                    onClick={() => {
                      setIsEditMode(true)
                      handleStartCreateLesson()
                    }}
                  >
                    Thêm bài học mới
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {canManage && (
                  <div className="flex items-center justify-between bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs">
                    <span className="text-xs text-slate-500 font-medium">
                      {activeLesson ? 'Đang ở chế độ xem bài học' : 'Chưa chọn bài học nào'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="primary"
                        icon={Plus}
                        onClick={() => handleStartCreateLesson()}
                        title="Thêm bài học mới"
                        aria-label="Thêm bài học mới"
                        className="h-8 w-8 p-0 justify-center shadow-xs cursor-pointer"
                      />
                      {activeLesson && (
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Pencil}
                          onClick={() => setIsEditMode(true)}
                          title="Chỉnh sửa bài học này"
                          aria-label="Chỉnh sửa bài học này"
                          className="h-8 w-8 p-0 justify-center cursor-pointer"
                        />
                      )}
                    </div>
                  </div>
                )}
                <LessonStudentViewPanel
                  lesson={activeLesson}
                  courseTitle={course.titleVi || course.title}
                />
              </div>
            )}
          </Suspense>
        </div>
      </div>

      {/* Modal Xuất / Nhập Giáo trình Khóa học */}
      <CourseCurriculumExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        course={course}
        onImportSuccess={onReloadCourse}
      />
    </div>
  )
}
