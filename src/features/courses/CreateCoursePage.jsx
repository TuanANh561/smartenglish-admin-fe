import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  Loader2,
  Lock,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { INITIAL_COURSES } from '@/mocks/data/courses'
import { useAuthStore } from '@/store/authStore'
import {
  createCourseApi,
  createLessonApi,
  fetchCourseByIdApi,
  generateCourseCurriculumWithAi,
  updateCourseApi,
} from './courseApi'
import CourseAiGeneratorModal from './components/CourseAiGeneratorModal'
import CourseCurriculumBuilder from './components/CourseCurriculumBuilder'
import CourseFormGeneral from './components/CourseFormGeneral'
import CourseObjectivesBuilder from './components/CourseObjectivesBuilder'

/**
 * Trang Thêm Mới & Chỉnh Sửa Khóa Học / Chương Trình Học
 * Hỗ trợ đầy đủ các trường theo Migration V5/V9 và tích hợp Trợ lý AI
 */
export default function CreateCoursePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'
  const isEditing = Boolean(id)

  const existingMock = isEditing
    ? INITIAL_COURSES.find((c) => String(c.id) === String(id)) || null
    : null

  // 1. Form States theo chuẩn Database content.courses
  const [titleVi, setTitleVi] = useState(existingMock?.titleVi || existingMock?.title || '')
  const [titleEn, setTitleEn] = useState(existingMock?.titleEn || '')
  const [descriptionVi, setDescriptionVi] = useState(
    existingMock?.descriptionVi || existingMock?.description || '',
  )
  const [courseType, setCourseType] = useState(existingMock?.courseType || 'STRUCTURED')
  const [cefrLevelMin, setCefrLevelMin] = useState(existingMock?.cefrLevelMin || 'A1')
  const [cefrLevelMax, setCefrLevelMax] = useState(existingMock?.cefrLevelMax || 'A2')
  const [targetExam, setTargetExam] = useState(existingMock?.targetExam || 'GENERAL')
  const [estimatedHours, setEstimatedHours] = useState(
    existingMock?.estimatedHours || (existingMock?.durationHours ? parseInt(existingMock.durationHours) : 6.0),
  )
  const [isPremium, setIsPremium] = useState(Boolean(existingMock?.isPremium))
  const [isPublished, setIsPublished] = useState(existingMock?.isPublished !== false)
  const [thumbnailUrl, setThumbnailUrl] = useState(
    existingMock?.thumbnailUrl ||
      existingMock?.thumbnail ||
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846',
  )
  const [creatorType, setCreatorType] = useState(isAdmin ? 'system' : 'teacher')

  // 2. Mục tiêu & Đối tượng
  const [objectives, setObjectives] = useState(
    existingMock?.objectives || [
      'Nắm vững từ vựng và mẫu câu giao tiếp trọng tâm của chương',
      'Tự tin phản xạ và đàm thoại trực tiếp cùng trợ lý Speaking AI',
      'Đạt chuẩn năng lực CEFR theo lộ trình học tương tác',
    ],
  )
  const [targetAudience, setTargetAudience] = useState(
    existingMock?.targetAudience || [
      'Học viên theo học lộ trình tiếng Anh chuẩn toàn diện của hệ thống',
      'Người học cần rèn luyện phản xạ nghe nói thực tế',
    ],
  )

  // 3. Cấu trúc Chương & Unit bài học
  const [chapters, setChapters] = useState(
    existingMock?.chapters || [
      {
        id: `CH-1`,
        title: 'Chương 1: Bài học trọng tâm',
        duration: '6h 00m',
        lessons: [
          { id: 'L-1', title: 'Unit 1: Chào hỏi & Khởi động', type: 'quiz', duration: '15:00' },
          { id: 'L-2', title: 'Unit 2: Luyện nghe đàm thoại', type: 'video', duration: '15:00' },
        ],
      },
    ],
  )

  const [isSaving, setIsSaving] = useState(false)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)

  // Tải thông tin khóa học nếu đang ở chế độ chỉnh sửa (Edit Mode)
  useEffect(() => {
    if (isEditing && id) {
      fetchCourseByIdApi(id)
        .then((c) => {
          if (c) {
            setTitleVi(c.titleVi || c.title || '')
            setTitleEn(c.titleEn || '')
            setDescriptionVi(c.descriptionVi || c.description || '')
            setCourseType(c.courseType || 'STRUCTURED')
            setCefrLevelMin(c.cefrLevelMin || 'A1')
            setCefrLevelMax(c.cefrLevelMax || 'A2')
            setTargetExam(c.targetExam || 'GENERAL')
            setEstimatedHours(c.estimatedHours || 6.0)
            setIsPremium(Boolean(c.isPremium))
            setIsPublished(Boolean(c.isPublished))
            if (c.thumbnail) setThumbnailUrl(c.thumbnail)
            if (c.createdBy === 1) setCreatorType('system')
            else setCreatorType('teacher')
            if (Array.isArray(c.objectives) && c.objectives.length > 0) setObjectives(c.objectives)
            if (Array.isArray(c.targetAudience) && c.targetAudience.length > 0)
              setTargetAudience(c.targetAudience)
            if (Array.isArray(c.chapters) && c.chapters.length > 0) setChapters(c.chapters)
          }
        })
        .catch((err) => {
          console.warn('Lỗi tải dữ liệu khóa học:', err)
        })
    }
  }, [isEditing, id])

  // Handlers mục tiêu & đối tượng
  const handleAddObjective = () => setObjectives((prev) => [...prev, ''])
  const handleUpdateObjective = (index, value) => {
    setObjectives((prev) => prev.map((item, i) => (i === index ? value : item)))
  }
  const handleRemoveObjective = (index) => {
    setObjectives((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddAudience = () => setTargetAudience((prev) => [...prev, ''])
  const handleUpdateAudience = (index, value) => {
    setTargetAudience((prev) => prev.map((item, i) => (i === index ? value : item)))
  }
  const handleRemoveAudience = (index) => {
    setTargetAudience((prev) => prev.filter((_, i) => i !== index))
  }

  // Handlers cấu trúc chương & units
  const handleAddChapter = () => {
    const newChapter = {
      id: `CH-${Date.now()}`,
      title: `Chương ${chapters.length + 1}: Chủ đề mới`,
      duration: '6h 00m',
      lessons: [],
    }
    setChapters((prev) => [...prev, newChapter])
    toast.success('Đã thêm chương mới')
  }

  const handleUpdateChapterTitle = (chapterId, newTitle) => {
    setChapters((prev) =>
      prev.map((ch) => (ch.id === chapterId ? { ...ch, title: newTitle } : ch)),
    )
  }

  const handleRemoveChapter = (chapterId) => {
    setChapters((prev) => prev.filter((ch) => ch.id !== chapterId))
    toast.success('Đã xoá chương')
  }

  const handleAddLesson = (chapterId) => {
    const ch = chapters.find((c) => c.id === chapterId)
    const nextUnitNum = (ch?.lessons?.length || 0) + 1
    const newLesson = {
      id: `L-${Date.now()}`,
      title: `Unit ${nextUnitNum}: Bài học mới`,
      type: 'quiz',
      duration: '15:00',
    }
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId ? { ...c, lessons: [...c.lessons, newLesson] } : c,
      ),
    )
  }

  const handleUpdateLesson = (chapterId, lessonId, field, value) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((l) =>
                l.id === lessonId ? { ...l, [field]: value } : l,
              ),
            }
          : ch,
      ),
    )
  }

  const handleRemoveLesson = (chapterId, lessonId) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? { ...ch, lessons: ch.lessons.filter((l) => l.id !== lessonId) }
          : ch,
      ),
    )
  }

  // Áp dụng dữ liệu giáo trình tự động sinh bởi AI
  const handleApplyAiGenerated = (generated) => {
    if (!generated) return
    if (generated.titleVi) setTitleVi(generated.titleVi)
    if (generated.titleEn) setTitleEn(generated.titleEn)
    if (generated.descriptionVi) setDescriptionVi(generated.descriptionVi)
    if (generated.courseType) setCourseType(generated.courseType)
    if (generated.cefrLevelMin) setCefrLevelMin(generated.cefrLevelMin)
    if (generated.cefrLevelMax) setCefrLevelMax(generated.cefrLevelMax)
    if (generated.targetExam) setTargetExam(generated.targetExam)
    if (generated.estimatedHours) setEstimatedHours(generated.estimatedHours)
    if (generated.isPremium !== undefined) setIsPremium(Boolean(generated.isPremium))
    if (generated.objectives) setObjectives(generated.objectives)
    if (generated.targetAudience) setTargetAudience(generated.targetAudience)

    // Tạo 4 Unit bài học chuẩn Duolingo
    if (Array.isArray(generated.lessons) && generated.lessons.length > 0) {
      const mappedLessons = generated.lessons.map((l, idx) => ({
        id: `L-${Date.now()}-${idx}`,
        title: l.titleVi || `Unit ${idx + 1}: ${l.titleEn}`,
        type: l.lessonType === 'VOCABULARY' || l.lessonType === 'MIXED' ? 'quiz' : 'video',
        duration: `${l.estimatedMin || 15}:00`,
        contentBlocks: l.contentBlocks,
      }))

      setChapters([
        {
          id: `CH-AI-${Date.now()}`,
          title: generated.titleVi || 'Chương học mới',
          duration: `${generated.estimatedHours || 6}h 00m`,
          lessons: mappedLessons,
        },
      ])
    }

    toast.success('AI đã hoàn tất soạn thảo giáo trình chương học!')
  }

  // Lưu hoặc cập nhật chương học
  const handleSaveCourse = async (publishStatus = 'published') => {
    if (!titleVi.trim()) {
      toast.error('Vui lòng nhập tên chương (Tiếng Việt)')
      return
    }

    setIsSaving(true)
    try {
      const totalUnits = chapters.reduce((acc, ch) => acc + (ch.lessons ? ch.lessons.length : 0), 0)
      const creatorId = creatorType === 'system' ? 1 : user?.id ? Number(user.id) : 2

      const payload = {
        titleVi: titleVi.trim(),
        titleEn: titleEn.trim() || titleVi.trim(),
        descriptionVi: descriptionVi.trim(),
        courseType,
        cefrLevelMin,
        cefrLevelMax,
        targetExam,
        thumbnailUrl: thumbnailUrl.trim(),
        totalLessons: totalUnits,
        estimatedHours: Number(estimatedHours) || 6.0,
        isPremium: Boolean(isPremium),
        createdBy: creatorId,
        isPublished: publishStatus === 'published',
      }

      let savedCourse = null
      if (isEditing) {
        savedCourse = await updateCourseApi(id, payload)
        toast.success('Đã cập nhật chương học thành công!')
      } else {
        savedCourse = await createCourseApi(payload)
        toast.success('Đã tạo chương mới cho hệ thống thành công!')

        // Tự động lưu các Unit bài học vào backend nếu có
        if (savedCourse && savedCourse.id) {
          for (const ch of chapters) {
            if (Array.isArray(ch.lessons)) {
              for (let i = 0; i < ch.lessons.length; i++) {
                const l = ch.lessons[i]
                try {
                  await createLessonApi({
                    courseId: savedCourse.id,
                    titleVi: l.title,
                    titleEn: l.title,
                    lessonType: l.type === 'quiz' ? 'VOCABULARY' : 'MIXED',
                    position: i + 1,
                    estimatedMin: 15,
                    xpReward: 30,
                    isFreePreview: i < 2,
                    contentBlocks: l.contentBlocks || [],
                  })
                } catch (unitErr) {
                  console.warn('Lỗi lưu unit:', unitErr)
                }
              }
            }
          }
        }
      }

      navigate('/app/hoc-lieu/khoa-hoc')
    } catch (err) {
      console.error('Lỗi khi lưu chương học:', err)
      toast.error('Có lỗi xảy ra khi lưu chương học. Vui lòng kiểm tra lại!')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 bg-slate-50/95 py-3 backdrop-blur-xs border-b border-line">
        <div className="flex items-center gap-3">
          <Link
            to="/app/hoc-lieu/khoa-hoc"
            className="p-2 rounded-lg bg-white border border-line text-ink-muted hover:text-navy-800 transition-colors shadow-2xs"
            title="Quay lại danh sách"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-navy-800 tracking-tight flex items-center gap-2">
              {isEditing ? 'Chỉnh Sửa Chương Học' : 'Tạo Chương Mới Cho Hệ Thống'}
              {creatorType === 'system' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  <ShieldCheck size={13} className="text-blue-600" /> Hệ thống
                </span>
              )}
            </h1>
            <p className="text-xs text-ink-muted">
              Đồng bộ dữ liệu bảng `content.courses` & cấu trúc bài học hệ thống
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Generator Button */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={Sparkles}
            onClick={() => setIsAiModalOpen(true)}
            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 font-semibold text-xs"
          >
            AI Soạn Thảo Nhanh
          </Button>

          {/* Save Draft */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={Save}
            disabled={isSaving}
            onClick={() => handleSaveCourse('draft')}
            className="text-xs"
          >
            Lưu bản nháp
          </Button>

          {/* Publish */}
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={isSaving ? Loader2 : Send}
            disabled={isSaving}
            onClick={() => handleSaveCourse('published')}
            className="text-xs shadow-xs"
          >
            {isSaving ? 'Đang lưu...' : 'Xuất bản ngay'}
          </Button>
        </div>
      </div>

      {/* Main Grid: Form Sections (Left) & Preview Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Form & Builders (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. General Info & CEFR fields */}
          <CourseFormGeneral
            titleVi={titleVi}
            setTitleVi={setTitleVi}
            titleEn={titleEn}
            setTitleEn={setTitleEn}
            descriptionVi={descriptionVi}
            setDescriptionVi={setDescriptionVi}
            courseType={courseType}
            setCourseType={setCourseType}
            cefrLevelMin={cefrLevelMin}
            setCefrLevelMin={setCefrLevelMin}
            cefrLevelMax={cefrLevelMax}
            setCefrLevelMax={setCefrLevelMax}
            targetExam={targetExam}
            setTargetExam={setTargetExam}
            estimatedHours={estimatedHours}
            setEstimatedHours={setEstimatedHours}
            thumbnailUrl={thumbnailUrl}
            setThumbnailUrl={setThumbnailUrl}
            isPremium={isPremium}
            setIsPremium={setIsPremium}
            isPublished={isPublished}
            setIsPublished={setIsPublished}
            creatorType={creatorType}
            setCreatorType={setCreatorType}
            isAdmin={isAdmin}
          />

          {/* 2. Objectives & Target Audience */}
          <CourseObjectivesBuilder
            objectives={objectives}
            onAddObjective={handleAddObjective}
            onUpdateObjective={handleUpdateObjective}
            onRemoveObjective={handleRemoveObjective}
            targetAudience={targetAudience}
            onAddAudience={handleAddAudience}
            onUpdateAudience={handleUpdateAudience}
            onRemoveAudience={handleRemoveAudience}
          />

          {/* 3. Curriculum Units Builder */}
          <CourseCurriculumBuilder
            chapters={chapters}
            onAddChapter={handleAddChapter}
            onUpdateChapterTitle={handleUpdateChapterTitle}
            onRemoveChapter={handleRemoveChapter}
            onAddLesson={handleAddLesson}
            onUpdateLesson={handleUpdateLesson}
            onRemoveLesson={handleRemoveLesson}
          />
        </div>

        {/* Right Column: Live Mobile Preview */}
        <div className="lg:col-span-1 sticky top-20 space-y-4">
          <Card className="p-4 space-y-3.5 border border-line bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                <Eye size={14} className="text-brand-600" /> Xem Trước Hiển Thị Mobile
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Thời gian thực
              </span>
            </div>

            {/* Mobile Card Mockup */}
            <div className="rounded-2xl overflow-hidden border border-line bg-slate-50 shadow-sm">
              <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
                <img
                  src={thumbnailUrl}
                  alt={titleVi}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846'
                  }}
                />
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-bold text-brand-700 shadow-2xs">
                    {cefrLevelMin} - {cefrLevelMax}
                  </span>
                  <span className="bg-navy-900/80 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-medium text-white shadow-2xs">
                    {courseType}
                  </span>
                </div>
              </div>

              <div className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  {creatorType === 'system' ? (
                    <span className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
                      <ShieldCheck size={12} className="text-blue-600" /> Hệ thống
                    </span>
                  ) : (
                    <span className="text-[11px] text-ink-muted">
                      {user?.displayName || 'Giảng viên'}
                    </span>
                  )}
                  {isPremium && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-0.5">
                      <Lock size={10} /> Premium
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-navy-800 text-xs leading-snug line-clamp-2">
                  {titleVi || 'Tiêu đề chương học'}
                </h4>
                {titleEn && (
                  <p className="text-[11px] text-ink-muted italic line-clamp-1">{titleEn}</p>
                )}

                <p className="text-[11px] text-ink-muted line-clamp-2 leading-relaxed">
                  {descriptionVi || 'Mô tả ngắn về lộ trình học...'}
                </p>

                <div className="flex items-center justify-between text-[11px] text-ink-muted pt-1 border-t border-line/70">
                  <span>
                    <strong>{chapters.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0)}</strong> Units bài học
                  </span>
                  <span>
                    <strong>{estimatedHours}</strong> Giờ học
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* AI Generator Modal */}
      <CourseAiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyGenerated={handleApplyAiGenerated}
        generateCourseCurriculumWithAi={generateCourseCurriculumWithAi}
      />
    </div>
  )
}
