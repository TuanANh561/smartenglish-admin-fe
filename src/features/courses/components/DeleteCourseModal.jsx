import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'

/**
 * Modal xác nhận xoá khóa học / chương học
 */
export default function DeleteCourseModal({ isOpen, onClose, onConfirm, course, isDeleting }) {
  if (!isOpen || !course) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-line overflow-hidden animate-scale-up">
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
            <AlertTriangle size={24} />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-navy-800">Xác nhận xoá chương học</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Bạn có chắc chắn muốn xóa chương{' '}
              <strong className="text-navy-900 font-semibold">"{course.title || course.titleVi}"</strong>{' '}
              khỏi hệ thống? Thao tác này không thể hoàn tác.
            </p>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-left text-xs text-amber-800 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <span>⚠️</span> Lưu ý quan trọng:
            </p>
            <p>Toàn bộ các bài học (Units), từ vựng và bài tập trực thuộc chương này cũng sẽ bị gỡ khỏi lộ trình của học viên.</p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isDeleting}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              icon={isDeleting ? Loader2 : Trash2}
              onClick={() => onConfirm(course)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Đang xoá...' : 'Xóa vĩnh viễn'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
