import { Eye, Lock, Pencil, ShieldCheck, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '@/components/ui/Badge'
import { formatNumber } from '@/lib/utils'

/**
 * Bảng hiển thị danh sách khóa học (Dành cho Admin & Chế độ xem chi tiết)
 */
export default function CourseTable({
  courses = [],
  onEdit,
  onDelete,
  onTogglePublish,
  checkOwnership,
  isAdmin,
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-xs">
      <table className="w-full text-left text-xs text-ink-base border-collapse">
        <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-ink-muted border-b border-line">
          <tr>
            <th className="py-3 px-4 w-16">Ảnh</th>
            <th className="py-3 px-4 min-w-[240px]">Tên chương / Khóa học</th>
            <th className="py-3 px-4 w-28">Thể loại</th>
            <th className="py-3 px-4 w-28 min-w-[110px] text-center">Cấp độ CEFR</th>
            <th className="py-3 px-4 w-20 text-center">Số bài</th>
            <th className="py-3 px-4 min-w-[140px]">Người tạo</th>
            <th className="py-3 px-4 w-28 text-center">Trạng thái</th>
            <th className="py-3 px-4 w-28">Cập nhật</th>
            <th className="py-3 px-4 w-28 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70">
          {courses.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-8 text-center text-ink-muted">
                Không tìm thấy chương hoặc khóa học nào phù hợp với bộ lọc.
              </td>
            </tr>
          ) : (
            courses.map((course) => {
              const isOwner = checkOwnership(course)
              const canEdit = isAdmin || isOwner
              const isSystemCourse =
                course.createdBy === 1 ||
                course.courseType === 'STRUCTURED' ||
                course.authorName === 'Hệ thống'

              return (
                <tr
                  key={course.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => onEdit && onEdit(course.id, 'view')}
                >
                  {/* Thumbnail */}
                  <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/app/hoc-lieu/khoa-hoc/${course.id}`}>
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-11 h-11 rounded-lg object-cover border border-line group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846'
                        }}
                      />
                    </Link>
                  </td>

                  {/* Title */}
                  <td className="py-2.5 px-4">
                    <div className="space-y-0.5">
                      <Link
                        to={`/app/hoc-lieu/khoa-hoc/${course.id}`}
                        className="font-bold text-navy-800 text-xs hover:text-brand-600 transition-colors block line-clamp-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {course.title || course.titleVi}
                      </Link>
                      {course.titleEn && (
                        <p className="text-[11px] text-ink-muted line-clamp-1 italic">
                          {course.titleEn}
                        </p>
                      )}
                      {course.isPremium && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          <Lock size={9} /> Premium
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-2.5 px-4 text-ink-muted">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium text-slate-700">
                      {course.category || course.courseType || 'Tiếng Anh'}
                    </span>
                  </td>

                  {/* CEFR */}
                  <td className="py-2.5 px-4 text-center">
                    <span className="inline-block font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-md text-xs border border-brand-100 whitespace-nowrap shadow-2xs">
                      {course.level || 'A1 - A2'}
                    </span>
                  </td>

                  {/* Lesson Count */}
                  <td className="py-2.5 px-4 text-center font-semibold text-navy-800">
                    {course.lessonCount || course.totalLessons || 0}
                  </td>

                  {/* Author */}
                  <td className="py-2.5 px-4">
                    {isSystemCourse ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <ShieldCheck size={13} className="text-blue-600" />
                        Hệ thống
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-700">
                        {course.authorName || 'Giảng viên'}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onTogglePublish && onTogglePublish(course)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-transform active:scale-95 ${
                        course.status === 'published' || course.isPublished
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                      title="Bấm để bật/tắt xuất bản"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          course.status === 'published' || course.isPublished
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      {course.status === 'published' || course.isPublished ? 'Xuất bản' : 'Bản nháp'}
                    </button>
                  </td>

                  {/* Date */}
                  <td className="py-2.5 px-4 text-ink-muted text-[11px]">
                    {course.updatedAt || '14/09/2026'}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {/* View */}
                      <Link
                        to={`/app/hoc-lieu/khoa-hoc/${course.id}`}
                        className="p-1.5 text-ink-muted hover:text-brand-600 rounded hover:bg-slate-100 transition-colors"
                        title="Xem chi tiết & danh sách Unit"
                      >
                        <Eye size={15} />
                      </Link>

                      {/* Edit */}
                      {canEdit && (
                        <Link
                          to={`/app/hoc-lieu/khoa-hoc/${course.id}/chinh-sua`}
                          className="p-1.5 text-ink-muted hover:text-amber-600 rounded hover:bg-slate-100 transition-colors"
                          title="Chỉnh sửa chương học"
                        >
                          <Pencil size={15} />
                        </Link>
                      )}

                      {/* Delete */}
                      {canEdit && (
                        <button
                          onClick={() => onDelete && onDelete(course)}
                          className="p-1.5 text-ink-muted hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                          title="Xóa chương học"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
