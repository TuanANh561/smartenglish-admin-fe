import { X } from 'lucide-react'
import LessonStudentViewPanel from './LessonStudentViewPanel'

/**
 * @deprecated Đã chuyển đổi sang `LessonStudentViewPanel` nhúng trực tiếp inline.
 * Component này chỉ được giữ lại như một lớp tương thích ngược (Backward Compatibility Wrapper).
 */
export default function LessonStudentViewModal({ isOpen, onClose, lesson, courseTitle }) {
  if (!isOpen || !lesson) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 transition-colors cursor-pointer"
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>
        <LessonStudentViewPanel lesson={lesson} courseTitle={courseTitle} />
      </div>
    </div>
  )
}
