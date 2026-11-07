import LessonEditorWorkspace from './detail/LessonEditorWorkspace'

/**
 * @deprecated Đã chuyển đổi sang `LessonEditorWorkspace` nhúng trực tiếp trong màn hình chính.
 * Component này chỉ được giữ lại như một lớp tương thích ngược (Backward Compatibility Wrapper).
 */
export default function QuickLessonModal({
  isOpen,
  onClose,
  lessonModal = {},
  onSave,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/60 backdrop-blur-xs">
      <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <LessonEditorWorkspace
          courseId={lessonModal.courseId}
          isCreatingNew={!lessonModal.isEdit}
          activeLesson={lessonModal}
          nextPosition={lessonModal.position || 1}
          onSaveSuccess={async (saved) => {
            if (onSave) await onSave(saved)
            if (onClose) onClose()
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}
