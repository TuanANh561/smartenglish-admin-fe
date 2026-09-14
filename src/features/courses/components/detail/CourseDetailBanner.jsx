import { BookOpen, Lock, Pencil, Star, Upload, User } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatNumber } from '@/lib/utils'

/**
 * Banner Chi Tiết Khóa Học (Header Banner)
 */
export default function CourseDetailBanner({
  course,
  canManage,
  onEdit,
  onTogglePublish,
}) {
  if (!course) return null

  return (
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
                e.target.src =
                  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80'
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
                <User size={14} /> Người tạo:{' '}
                <strong
                  className={
                    course.authorName === 'Hệ thống' || course.createdBy === 1
                      ? 'text-brand-600 font-bold'
                      : 'text-navy-700'
                  }
                >
                  {course.authorName === 'Hệ thống' || course.createdBy === 1
                    ? 'Hệ thống (Lộ trình chuẩn)'
                    : course.authorName}
                </strong>
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

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {canManage ? (
            <>
              <Button
                variant="secondary"
                icon={Pencil}
                onClick={onEdit}
                size="sm"
              >
                Chỉnh sửa
              </Button>
              <Button
                variant="primary"
                icon={Upload}
                onClick={onTogglePublish}
                size="sm"
              >
                {course.status === 'published' || course.isPublished ? 'Tạm ẩn' : 'Xuất bản'}
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
  )
}
