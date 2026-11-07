import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'

/**
 * Modal xác nhận xoá khóa học / chương học (Hỗ trợ cả Chuyển vào thùng rác & Xóa vĩnh viễn)
 */
export default function DeleteCourseModal({
  isOpen,
  onClose,
  onConfirm,
  course,
  isDeleting,
  isPermanent = false,
}) {
  if (!isOpen || !course) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-line overflow-hidden animate-scale-up">
        <div className="p-6 text-center space-y-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto border ${
              isPermanent
                ? 'bg-rose-50 text-rose-600 border-rose-100'
                : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}
          >
            {isPermanent ? <AlertTriangle size={24} /> : <Trash2 size={24} />}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-navy-800">
              {isPermanent ? 'Xác nhận xoá vĩnh viễn' : 'Chuyển vào thùng rác'}
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Bạn có chắc chắn muốn {isPermanent ? 'xóa vĩnh viễn' : 'chuyển vào thùng rác'} khóa học{' '}
              <strong className="text-navy-900 font-semibold">
                "{course.title || course.titleVi}"
              </strong>
              ? {isPermanent ? 'Thao tác này không thể hoàn tác.' : 'Bạn có thể khôi phục lại bất kỳ lúc nào.'}
            </p>
          </div>

          <div
            className={`p-3 rounded-xl border text-left text-xs space-y-1 ${
              isPermanent
                ? 'bg-rose-50/70 border-rose-100 text-rose-800'
                : 'bg-amber-50 border border-amber-100 text-amber-800'
            }`}
          >
            <p className="font-semibold flex items-center gap-1.5">
              <span>⚠️</span> {isPermanent ? 'Cảnh báo vĩnh viễn:' : 'Lưu ý:'}
            </p>
            <p>
              {isPermanent
                ? 'Toàn bộ dữ liệu của khóa học này sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu.'
                : 'Khóa học sẽ tạm thời bị ẩn khỏi danh sách của học viên và giáo viên.'}
            </p>
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
              variant={isPermanent ? 'danger' : 'primary'}
              size="sm"
              icon={isDeleting ? Loader2 : Trash2}
              onClick={() => onConfirm(course)}
              disabled={isDeleting}
            >
              {isDeleting
                ? isPermanent
                  ? 'Đang xoá...'
                  : 'Đang chuyển...'
                : isPermanent
                ? 'Xóa vĩnh viễn'
                : 'Chuyển vào thùng rác'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
