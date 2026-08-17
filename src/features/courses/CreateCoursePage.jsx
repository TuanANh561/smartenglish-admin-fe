import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bold,
  Check,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  FileText,
  GripVertical,
  Image as ImageIcon,
  Italic,
  List,
  ListOrdered,
  Plus,
  Save,
  Send,
  Sparkles,
  Trash2,
  Underline,
  UploadCloud,
  Video,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import { INITIAL_COURSES } from '@/mocks/data/courses'
import { useAuthStore } from '@/store/authStore'

function CreateCoursePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'
  const isEditing = Boolean(id)

  const existingCourse = isEditing
    ? INITIAL_COURSES.find((c) => c.id === id) || INITIAL_COURSES[0]
    : null

  const checkOwnership = (course) => {
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
  }

  useEffect(() => {
    if (isEditing && existingCourse && !isAdmin && !checkOwnership(existingCourse)) {
      toast.error(`Bạn không có quyền sửa khóa học của "${existingCourse.authorName || 'giáo viên khác'}".`)
      navigate(`/hoc-lieu/khoa-hoc/${id}`)
    }
  }, [isEditing, existingCourse, isAdmin, user, id, navigate])

  // Form states
  const [title, setTitle] = useState(existingCourse?.title || '')
  const [description, setDescription] = useState(existingCourse?.description || '')
  const [category, setCategory] = useState(existingCourse?.category || 'Giao tiếp')
  const [level, setLevel] = useState(existingCourse?.level || 'B2')
  const [durationHours, setDurationHours] = useState(existingCourse?.durationHours ? parseInt(existingCourse.durationHours) : 24)
  const [thumbnail, setThumbnail] = useState(
    existingCourse?.thumbnail ||
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80',
  )

  // Objectives & Target audience lists
  const [objectives, setObjectives] = useState(
    existingCourse?.objectives || [
      'Nắm vững 500+ từ vựng và mẫu câu giao tiếp',
      'Tự tin thuyết trình và phản xạ cùng trợ lý AI',
    ],
  )
  const [targetAudience, setTargetAudience] = useState(
    existingCourse?.targetAudience || [
      'Sinh viên và người đi làm cần cải thiện tiếng Anh',
    ],
  )

  // Chapters & Curriculum
  const [chapters, setChapters] = useState(
    existingCourse?.chapters || [
      {
        id: 'CH-1',
        title: 'Chương 1: Khởi động & Giao tiếp cơ bản',
        duration: '1h 15m',
        lessons: [
          { id: 'L-1', title: 'Bài 1.1: Giới thiệu bản thân ấn tượng', type: 'video', duration: '15:30' },
          { id: 'L-2', title: 'Bài 1.2: Từ vựng giao tiếp hàng ngày', type: 'reading', duration: '20:00' },
          { id: 'L-3', title: 'Bài 1.3: Trắc nghiệm củng cố', type: 'quiz', questionsCount: 10, duration: '15:00' },
        ],
      },
    ],
  )

  const [isSaving, setIsSaving] = useState(false)

  // Handlers
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

  // Chapter handlers
  const handleAddChapter = () => {
    const newChapter = {
      id: `CH-${Date.now()}`,
      title: `Chương ${chapters.length + 1}: Chủ đề mới`,
      duration: '1h 00m',
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
    const newLesson = {
      id: `L-${Date.now()}`,
      title: 'Bài học mới',
      type: 'video',
      duration: '15:00',
    }
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? { ...ch, lessons: [...ch.lessons, newLesson] }
          : ch,
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

  const handleSaveDraft = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Đã lưu bản nháp khóa học thành công!')
      navigate('/hoc-lieu/khoa-hoc')
    }, 500)
  }

  const handlePublish = () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên khóa học')
      return
    }
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success(isEditing ? 'Đã cập nhật khóa học!' : 'Đã xuất bản khóa học mới!')
      navigate('/hoc-lieu/khoa-hoc')
    }, 600)
  }

  return (
    <main className="flex-1 bg-canvas p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div>
          <Link
            to="/hoc-lieu/khoa-hoc"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-navy-700 transition-colors mb-1"
          >
            <ArrowLeft size={14} /> Quay lại danh sách
          </Link>
          <h1 className="text-2xl font-bold text-navy-700">
            {isEditing ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
          </h1>
          <p className="text-xs text-ink-muted">
            Thiết lập thông tin cơ bản và cấu trúc chương trình học.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleSaveDraft}
            loading={isSaving}
            size="sm"
          >
            Lưu bản nháp
          </Button>
          <Button
            variant="primary"
            onClick={handlePublish}
            loading={isSaving}
            size="sm"
          >
            {isEditing ? 'Lưu & Cập nhật' : 'Lưu và tiếp tục'}
          </Button>
        </div>
      </div>

      {/* ─── SECTION 1: THÔNG TIN CHUNG (Mockup Image 3) ───────────────── */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-bold text-navy-700 uppercase tracking-wide border-b border-line pb-2">
          Thông tin chung
        </h2>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Left Fields */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                Tên khóa học *
              </label>
              <Input
                placeholder="Nhập tên khóa học (Vd: Tiếng Anh giao tiếp cơ bản)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 font-semibold text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                Mô tả ngắn *
              </label>
              {/* Rich Text Toolbar Mock */}
              <div className="mt-1 rounded-xl border border-line overflow-hidden bg-white">
                <div className="flex items-center gap-1 border-b border-line bg-slate-50 px-3 py-1.5 text-xs text-ink-muted">
                  <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer"><Bold size={13} /></button>
                  <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer"><Italic size={13} /></button>
                  <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer"><Underline size={13} /></button>
                  <span className="text-slate-300">|</span>
                  <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer"><List size={13} /></button>
                  <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer"><ListOrdered size={13} /></button>
                </div>
                <textarea
                  rows={4}
                  placeholder="Nhập mô tả chi tiết về khóa học, lợi ích và kết quả đầu ra..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 text-xs focus:outline-none bg-canvas"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                  Thể loại
                </label>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 text-xs"
                >
                  <option value="Giao tiếp">Tiếng Anh Giao tiếp</option>
                  <option value="IELTS">Luyện thi IELTS</option>
                  <option value="TOEIC">Luyện thi TOEIC</option>
                  <option value="Tổng hợp">Ngữ pháp & Tổng hợp</option>
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                  Cấp độ CEFR
                </label>
                <Select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="mt-1 text-xs"
                >
                  <option value="A1">A1 - Beginner (Mất gốc / Mới bắt đầu)</option>
                  <option value="A2">A2 - Elementary (Sơ cấp)</option>
                  <option value="B1">B1 - Intermediate (Trung cấp)</option>
                  <option value="B2">B2 - Upper Intermediate (Trung cấp cao)</option>
                  <option value="C1">C1 - Advanced (Nâng cao)</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Right: Thumbnail Upload */}
          <div className="lg:col-span-4 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Thumbnail khóa học
            </label>
            <div className="relative rounded-2xl border-2 border-dashed border-line bg-slate-50/50 p-4 text-center hover:border-brand-500 transition-colors flex flex-col items-center justify-center min-h-[220px]">
              {thumbnail ? (
                <div className="space-y-2 w-full">
                  <img
                    src={thumbnail}
                    alt="Course Thumbnail"
                    className="h-32 w-full object-cover rounded-xl border border-line"
                  />
                  <button
                    type="button"
                    onClick={() => setThumbnail('')}
                    className="text-[11px] font-semibold text-red-500 hover:underline cursor-pointer"
                  >
                    Thay đổi ảnh khác
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xs text-ink-muted mb-2">
                    <ImageIcon size={22} />
                  </div>
                  <p className="text-xs font-semibold text-navy-700">Kéo thả ảnh vào đây</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">hoặc <span className="text-brand-600 font-semibold cursor-pointer">duyệt tập tin</span></p>
                  <p className="text-[10px] text-slate-400 mt-2">PNG, JPG, WEBP max 5MB (16:9)</p>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ─── SECTION 2: MỤC TIÊU & YÊU CẦU ─────────────────────────────── */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-bold text-navy-700 uppercase tracking-wide border-b border-line pb-2">
          Mục tiêu & Yêu cầu
        </h2>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Mục tiêu */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wide text-ink-muted block">
              Mục tiêu khóa học
            </label>
            <div className="space-y-2">
              {objectives.map((obj, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder="Vd: Nắm vững 3000 từ vựng cốt lõi..."
                    value={obj}
                    onChange={(e) => handleUpdateObjective(idx, e.target.value)}
                    className="text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveObjective(idx)}
                    className="p-1.5 text-slate-300 hover:text-red-500 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddObjective}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer flex items-center gap-1 pt-1"
            >
              <Plus size={13} /> Thêm mục tiêu
            </button>
          </div>

          {/* Đối tượng & Thời lượng */}
          <div className="space-y-4">
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wide text-ink-muted block">
                Đối tượng phù hợp
              </label>
              <div className="space-y-2">
                {targetAudience.map((aud, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="Vd: Sinh viên đại học cần thi TOEIC..."
                      value={aud}
                      onChange={(e) => handleUpdateAudience(idx, e.target.value)}
                      className="text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAudience(idx)}
                      className="p-1.5 text-slate-300 hover:text-red-500 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddAudience}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer flex items-center gap-1 pt-1"
              >
                <Plus size={13} /> Thêm đối tượng
              </button>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                Thời lượng dự kiến (Giờ)
              </label>
              <Input
                type="number"
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="mt-1 font-bold text-navy-700 text-xs w-32"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ─── SECTION 3: CHƯƠNG TRÌNH HỌC (Curriculum Builder) ───────────── */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-2">
          <h2 className="text-sm font-bold text-navy-700 uppercase tracking-wide">
            Chương trình học ({chapters.length} chương)
          </h2>
          <Button icon={Plus} size="sm" onClick={handleAddChapter}>
            Thêm chương
          </Button>
        </div>

        {chapters.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-line p-10 text-center space-y-3">
            <p className="text-xs text-ink-muted">
              Chưa có chương nào. Hãy bắt đầu xây dựng cấu trúc khóa học bằng cách thêm các chương và bài học bên trong.
            </p>
            <Button icon={Plus} variant="secondary" onClick={handleAddChapter} size="sm">
              Tạo chương đầu tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {chapters.map((chapter, cIdx) => (
              <div
                key={chapter.id}
                className="rounded-xl border border-line overflow-hidden bg-white shadow-xs"
              >
                {/* Chapter Header */}
                <div className="flex items-center justify-between bg-slate-50/80 px-4 py-3 border-b border-line">
                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <GripVertical size={15} className="text-slate-300 cursor-grab" />
                    <Input
                      value={chapter.title}
                      onChange={(e) => handleUpdateChapterTitle(chapter.id, e.target.value)}
                      className="font-bold text-navy-700 text-xs bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ink-muted">{chapter.lessons.length} bài học</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChapter(chapter.id)}
                      className="p-1 text-slate-300 hover:text-red-500 cursor-pointer"
                      title="Xoá chương này"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Lessons in Chapter */}
                <div className="p-4 space-y-2.5">
                  <div className="space-y-2">
                    {chapter.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-line bg-canvas p-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {lesson.type === 'video' ? (
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                              <Video size={14} />
                            </span>
                          ) : lesson.type === 'quiz' ? (
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600">
                              <FileQuestion size={14} />
                            </span>
                          ) : (
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                              <FileText size={14} />
                            </span>
                          )}

                          <Input
                            value={lesson.title}
                            onChange={(e) => handleUpdateLesson(chapter.id, lesson.id, 'title', e.target.value)}
                            className="text-xs font-semibold bg-white flex-1"
                          />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Select
                            value={lesson.type}
                            onChange={(e) => handleUpdateLesson(chapter.id, lesson.id, 'type', e.target.value)}
                            className="w-24 text-[11px] py-1"
                          >
                            <option value="video">Video</option>
                            <option value="reading">Tài liệu</option>
                            <option value="quiz">Trắc nghiệm</option>
                          </Select>

                          <Input
                            value={lesson.duration}
                            onChange={(e) => handleUpdateLesson(chapter.id, lesson.id, 'duration', e.target.value)}
                            className="w-20 text-[11px] py-1 font-mono text-center"
                            placeholder="15:00"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveLesson(chapter.id, lesson.id)}
                            className="p-1 text-slate-300 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddLesson(chapter.id)}
                    className="w-full rounded-lg border border-dashed border-line p-2 text-center text-xs font-semibold text-brand-600 hover:border-brand-500 hover:bg-brand-50/40 cursor-pointer transition-colors"
                  >
                    + Thêm bài học vào {chapter.title.split(':')[0]}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Bottom Sticky Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
        <Button variant="secondary" onClick={() => navigate('/hoc-lieu/khoa-hoc')}>
          Hủy
        </Button>
        <Button variant="secondary" onClick={handleSaveDraft} loading={isSaving}>
          Lưu bản nháp
        </Button>
        <Button variant="primary" onClick={handlePublish} loading={isSaving} icon={Save}>
          {isEditing ? 'Lưu & Cập nhật' : 'Lưu và tiếp tục'}
        </Button>
      </div>
    </main>
  )
}

export default CreateCoursePage
