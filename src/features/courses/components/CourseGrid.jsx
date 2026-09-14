import { BookOpen, Eye, Lock, Pencil, ShieldCheck, Trash2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import { formatNumber } from '@/lib/utils'

/**
 * Hiển thị danh sách khóa học dạng Card lưới trực quan
 */
export default function CourseGrid({
  courses = [],
  onDelete,
  onTogglePublish,
  checkOwnership,
  isAdmin,
}) {
  if (courses.length === 0) {
    return (
      <div className="py-12 text-center text-ink-muted bg-white rounded-xl border border-line">
        Không tìm thấy chương hoặc khóa học nào phù hợp với bộ lọc.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => {
        const isOwner = checkOwnership(course)
        const canEdit = isAdmin || isOwner
        const isSystemCourse =
          course.createdBy === 1 ||
          course.courseType === 'STRUCTURED' ||
          course.authorName === 'Hệ thống'

        return (
          <Card
            key={course.id}
            className="group flex flex-col justify-between overflow-hidden border border-line transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div>
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846'
                  }}
                />

                {/* Level & Category Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold text-brand-700 shadow-xs backdrop-blur-xs">
                    {course.level || 'A1 - A2'}
                  </span>
                  <span className="rounded-md bg-navy-900/80 px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs backdrop-blur-xs">
                    {course.category || course.courseType || 'Tiếng Anh'}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="absolute top-2.5 right-2.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onTogglePublish && onTogglePublish(course)
                    }}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-xs backdrop-blur-xs transition-transform active:scale-95 ${
                      course.status === 'published' || course.isPublished
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-slate-700/80 text-white'
                    }`}
                    title="Bấm để chuyển trạng thái"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    {course.status === 'published' || course.isPublished
                      ? 'Đã xuất bản'
                      : 'Bản nháp'}
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  {/* Author badge */}
                  {isSystemCourse ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      <ShieldCheck size={12} className="text-blue-600" /> Hệ thống
                    </span>
                  ) : (
                    <span className="text-[11px] text-ink-muted line-clamp-1">
                      {course.authorName || 'Giảng viên'}
                    </span>
                  )}

                  {course.isPremium && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      <Lock size={10} /> Premium
                    </span>
                  )}
                </div>

                <Link
                  to={`/app/hoc-lieu/khoa-hoc/${course.id}`}
                  className="font-bold text-navy-800 text-sm leading-snug hover:text-brand-600 transition-colors line-clamp-2 block"
                >
                  {course.title || course.titleVi}
                </Link>

                {course.titleEn && (
                  <p className="text-xs text-ink-muted line-clamp-1 italic">
                    {course.titleEn}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-ink-muted pt-1">
                  <span className="flex items-center gap-1">
                    <BookOpen size={13} className="text-brand-600" />
                    <strong>{course.lessonCount || course.totalLessons || 0}</strong> Bài học (Units)
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between border-t border-line px-4 py-2.5 bg-slate-50/50">
              <Link
                to={`/app/hoc-lieu/khoa-hoc/${course.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <Eye size={13} /> Chi tiết & Unit
              </Link>

              {canEdit && (
                <div className="flex items-center gap-1">
                  <Link
                    to={`/app/hoc-lieu/khoa-hoc/${course.id}/chinh-sua`}
                    className="p-1.5 text-ink-muted hover:text-amber-600 rounded hover:bg-slate-200/60 transition-colors"
                    title="Chỉnh sửa chương học"
                  >
                    <Pencil size={14} />
                  </Link>
                  <button
                    onClick={() => onDelete && onDelete(course)}
                    className="p-1.5 text-ink-muted hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                    title="Xóa chương học"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
