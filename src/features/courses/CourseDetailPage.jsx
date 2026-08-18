import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  FileQuestion,
  FileText,
  GraduationCap,
  Lock,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  Send,
  Sparkles,
  Star,
  Trash2,
  Upload,
  User,
  Users,
  Video,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import { cn, formatNumber } from '@/lib/utils'
import { INITIAL_COURSES } from '@/mocks/data/courses'
import { useAuthStore } from '@/store/authStore'

const TABS = [
  { value: 'overview', label: 'Tổng quan' },
  { value: 'curriculum', label: 'Chương & bài học' },
  { value: 'students', label: 'Học viên' },
  { value: 'analytics', label: 'Thống kê' },
]

function CourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'

  const [activeTab, setActiveTab] = useState('curriculum')
  const [courses, setCourses] = useState(INITIAL_COURSES)
  const [expandedChapters, setExpandedChapters] = useState({ 'CH-1': true, 'CH-2': true })

  const course = useMemo(() => {
    return courses.find((c) => c.id === id) || courses[0]
  }, [courses, id])

  const isOwned = useMemo(() => {
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
  }, [course, user, isTeacher])

  // Quyền quản lý: Admin hoặc chính chủ sở hữu
  const canManage = isAdmin || isOwned

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }))
  }

  const handleTogglePublish = () => {
    if (!canManage) {
      toast.error('Chỉ tác giả mới có quyền thay đổi trạng thái khóa học!')
      return
    }
    const nextStatus = course.status === 'published' ? 'draft' : 'published'
    setCourses((prev) =>
      prev.map((c) =>
        c.id === course.id
          ? {
              ...c,
              status: nextStatus,
              statusLabel: nextStatus === 'published' ? 'Đã xuất bản' : 'Bản nháp',
            }
          : c,
      ),
    )
    toast.success(
      nextStatus === 'published'
        ? 'Đã xuất bản khóa học thành công'
        : 'Đã chuyển khóa học về Bản nháp',
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/hoc-lieu/khoa-hoc"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-navy-700 transition-colors"
        >
          <ArrowLeft size={14} /> Quay lại danh sách khóa học
        </Link>
      </div>

      {/* ─── HEADER BANNER (Mockup Image 4) ────────────────────────────── */}
      <Card className="p-6 border border-line overflow-hidden shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Left: Thumbnail & Badges */}
          <div className="flex flex-col sm:flex-row gap-5 flex-1">
            <div className="relative h-36 w-full sm:w-56 shrink-0 overflow-hidden rounded-xl border border-line bg-slate-100 shadow-xs">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80'
                }}
              />
              <div className="absolute bottom-2 left-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {course.statusLabel}
                </span>
              </div>
            </div>

            {/* Course Title & Meta */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-brand-600 border border-blue-100">
                  {course.levelLabel || course.level}
                </span>
                {course.isAiContent && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-navy-700">
                    <Sparkles size={12} className="text-amber-500" /> Nội dung AI
                  </span>
                )}
                {!canManage && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                    <Lock size={11} /> Chỉ xem (Tác giả khác)
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-navy-700 leading-tight">
                {course.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <BookOpen size={14} /> Thể loại: <strong>{course.categoryLabel || course.category}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <User size={14} /> Người tạo: <strong>{course.authorName}</strong>
                </span>
              </div>

              {/* Quick KPI Stats Chips */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-line text-xs">
                <div>
                  <span className="text-[11px] text-ink-muted block">Học viên</span>
                  <strong className="text-base text-navy-700">{formatNumber(course.studentCount)}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-ink-muted block">Đánh giá</span>
                  <strong className="text-base text-amber-500 flex items-center gap-1">
                    {course.rating} <Star size={13} fill="#f59e0b" />
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-ink-muted block">Thời lượng</span>
                  <strong className="text-base text-navy-700">{course.durationHours}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Buttons: Chỉ hiển thị khi có quyền quản trị/sở hữu */}
          <div className="flex items-center gap-2 shrink-0">
            {canManage ? (
              <>
                <Button
                  variant="secondary"
                  icon={Pencil}
                  onClick={() => navigate(`/hoc-lieu/khoa-hoc/${course.id}/chinh-sua`)}
                  size="sm"
                >
                  Chỉnh sửa
                </Button>
                <Button
                  variant="primary"
                  icon={Upload}
                  onClick={handleTogglePublish}
                  size="sm"
                >
                  {course.status === 'published' ? 'Tạm ẩn' : 'Xuất bản'}
                </Button>
              </>
            ) : (
              <div className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-2 text-xs text-ink-muted flex items-center gap-1.5">
                <Lock size={14} />
                <span>Bạn không thể chỉnh sửa khóa học này</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />

      {/* ─── TAB 1: TỔNG QUAN (Overview) ─────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-5">
            <Card className="p-5 space-y-3 border border-line">
              <h3 className="text-sm font-bold text-navy-700 uppercase tracking-wide">
                Mô tả khóa học
              </h3>
              <p className="text-xs text-ink leading-relaxed">
                {course.description}
              </p>
            </Card>

            <Card className="p-5 space-y-3 border border-line">
              <h3 className="text-sm font-bold text-navy-700 uppercase tracking-wide">
                Mục tiêu đạt được sau khóa học
              </h3>
              <ul className="space-y-2 text-xs text-ink">
                {course.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <Card className="p-5 space-y-3 border border-line">
              <h3 className="text-sm font-bold text-navy-700 uppercase tracking-wide">
                Đối tượng phù hợp
              </h3>
              <ul className="space-y-2 text-xs text-ink-muted">
                {course.targetAudience.map((aud, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                    <span>{aud}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5 space-y-3 border border-line">
              <h3 className="text-sm font-bold text-navy-700 uppercase tracking-wide">
                Thông số khóa học
              </h3>
              <div className="divide-y divide-line text-xs">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-ink-muted">Tổng số chương:</span>
                  <strong className="text-navy-700">{course.chapters.length} chương</strong>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-ink-muted">Tổng số bài học:</span>
                  <strong className="text-navy-700">{course.lessonCount} bài</strong>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-ink-muted">Ngày cập nhật:</span>
                  <strong className="text-navy-700">{course.updatedAt}</strong>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ─── TAB 2: CHƯƠNG & BÀI HỌC (Curriculum View - Image 4) ──────────── */}
      {activeTab === 'curriculum' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-700">Cấu trúc khóa học</h2>
            {canManage && (
              <Button
                icon={Plus}
                size="sm"
                onClick={() => navigate(`/hoc-lieu/khoa-hoc/${course.id}/chinh-sua`)}
              >
                Thêm chương
              </Button>
            )}
          </div>

          {!canManage && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 flex items-center gap-2">
              <Lock size={14} className="shrink-0 text-amber-600" />
              <span>
                Bạn đang xem chương trình học của giảng viên <strong>{course.authorName}</strong> ở chế độ <strong>Chỉ đọc</strong>. Bạn không có quyền thêm hoặc chỉnh sửa bài học.
              </span>
            </div>
          )}

          {course.chapters.length === 0 ? (
            <Card className="p-10 text-center space-y-3">
              <p className="text-xs text-ink-muted">Chưa có chương trình học cụ thể cho khóa học này.</p>
              {canManage && (
                <Button
                  size="sm"
                  icon={Plus}
                  onClick={() => navigate(`/hoc-lieu/khoa-hoc/${course.id}/chinh-sua`)}
                >
                  Tạo cấu trúc bài học
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {course.chapters.map((chapter) => {
                const isExpanded = expandedChapters[chapter.id] ?? true

                return (
                  <div
                    key={chapter.id}
                    className="rounded-xl border border-line overflow-hidden bg-white shadow-xs"
                  >
                    {/* Chapter Accordion Bar */}
                    <div
                      onClick={() => toggleChapter(chapter.id)}
                      className="flex items-center justify-between bg-slate-50/90 px-4 py-3 border-b border-line cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white border border-line text-navy-700 font-bold text-xs">
                          ⋮⋮
                        </span>
                        <div>
                          <h3 className="font-bold text-sm text-navy-700">{chapter.title}</h3>
                          <p className="text-[11px] text-ink-muted mt-0.5">
                            {chapter.lessons.length} Bài học • {chapter.duration}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {canManage && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/hoc-lieu/khoa-hoc/${course.id}/chinh-sua`)
                            }}
                            className="p-1.5 text-slate-400 hover:text-brand-600 rounded cursor-pointer"
                            title="Sửa chương này"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {isExpanded ? <ChevronUp size={16} className="text-ink-muted" /> : <ChevronDown size={16} className="text-ink-muted" />}
                      </div>
                    </div>

                    {/* Lessons list */}
                    {isExpanded && (
                      <div className="p-4 space-y-2.5 bg-white">
                        <div className="space-y-2">
                          {chapter.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between gap-3 rounded-lg border border-line bg-slate-50/50 p-3 text-xs hover:border-brand-300 hover:bg-white transition-all cursor-pointer group"
                              onClick={() => toast.success(`Mở xem bài học: ${lesson.title}`)}
                            >
                              <div className="flex items-center gap-3">
                                {lesson.type === 'video' ? (
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                    <Play size={14} fill="currentColor" />
                                  </span>
                                ) : lesson.type === 'quiz' ? (
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                    <FileQuestion size={14} />
                                  </span>
                                ) : (
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-navy-700 group-hover:text-white transition-colors">
                                    <FileText size={14} />
                                  </span>
                                )}

                                <div>
                                  <h4 className="font-bold text-navy-700 group-hover:text-brand-600 transition-colors">
                                    {lesson.title}
                                  </h4>
                                  <p className="text-[11px] text-ink-muted mt-0.5">
                                    {lesson.type === 'video' ? 'Video bài giảng' : lesson.type === 'quiz' ? `Bài tập trắc nghiệm • ${lesson.questionsCount || 10} câu hỏi` : 'Tài liệu đọc & từ vựng'}{' '}
                                    • {lesson.duration}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                className="rounded p-1 text-slate-400 hover:text-navy-700"
                                title="Xem nội dung bài học"
                              >
                                <Eye size={14} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {canManage && (
                          <button
                            type="button"
                            onClick={() => navigate(`/hoc-lieu/khoa-hoc/${course.id}/chinh-sua`)}
                            className="w-full rounded-lg border border-dashed border-line p-2.5 text-center text-xs font-semibold text-brand-600 hover:border-brand-500 hover:bg-brand-50/40 cursor-pointer transition-colors mt-2"
                          >
                            + Thêm bài học
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
      )}

      {/* ─── TAB 3: HỌC VIÊN (Students) ──────────────────────────────────── */}
      {activeTab === 'students' && (
        <Card className="p-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-line flex items-center justify-between">
            <h3 className="font-bold text-sm text-navy-700">
              Danh sách học viên đã đăng ký ({formatNumber(course.studentCount)})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold uppercase text-ink-muted border-b border-line">
                <tr>
                  <th className="px-4 py-3">Học viên</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3 text-center">Tiến độ</th>
                  <th className="px-4 py-3 text-center">Điểm TB</th>
                  <th className="px-4 py-3">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {[
                  { name: 'Nguyễn Anh Tuấn', email: 'tuan.na@gmail.com', progress: 85, score: 8.8, date: '12/10/2026' },
                  { name: 'Trần Thị Lan', email: 'lan.tt@gmail.com', progress: 60, score: 7.5, date: '14/10/2026' },
                  { name: 'Lê Hoàng Nam', email: 'nam.lh@gmail.com', progress: 100, score: 9.2, date: '05/10/2026' },
                  { name: 'Đinh Thuỳ Dung', email: 'dung.dt@gmail.com', progress: 40, score: 6.8, date: '16/10/2026' },
                ].map((st, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-semibold text-navy-700">{st.name}</td>
                    <td className="px-4 py-3 font-mono text-ink-muted">{st.email}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="space-y-1">
                        <span className="font-bold text-navy-700">{st.progress}%</span>
                        <div className="h-1.5 w-16 mx-auto rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${st.progress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-brand-600">{st.score}</td>
                    <td className="px-4 py-3 text-ink-muted">{st.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ─── TAB 4: THỐNG KÊ (Analytics) ─────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Card className="p-4 border border-line">
            <span className="text-xs font-semibold text-ink-muted">Tỷ lệ hoàn thành</span>
            <p className="text-2xl font-bold text-navy-700 mt-1">74.2%</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              ↗ +5.8% so với tháng trước
            </p>
          </Card>

          <Card className="p-4 border border-line">
            <span className="text-xs font-semibold text-ink-muted">Điểm bài tập trung bình</span>
            <p className="text-2xl font-bold text-brand-600 mt-1">8.4 / 10</p>
            <p className="text-[11px] text-ink-muted mt-1">Dựa trên 1,420 lượt làm bài</p>
          </Card>

          <Card className="p-4 border border-line">
            <span className="text-xs font-semibold text-ink-muted">Mức độ hài lòng</span>
            <p className="text-2xl font-bold text-amber-500 mt-1">4.8 ★</p>
            <p className="text-[11px] text-ink-muted mt-1">98% phản hồi tích cực</p>
          </Card>
        </div>
      )}
    </div>
  )
}

export default CourseDetailPage
