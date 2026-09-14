import { BookOpen } from 'lucide-react'
import Input from '@/components/ui/Input'

/**
 * Tab Soạn Thảo Lý Thuyết / Trọng Tâm Ngữ Pháp
 */
export default function LessonTheoryTab({
  theoryBlock,
  updateBlock,
  setLessonModal,
}) {
  return (
    <div className="space-y-3.5">
      <div className="space-y-1">
        <label className="font-semibold text-slate-700 flex items-center gap-1.5 text-xs">
          <BookOpen size={14} className="text-brand-600" /> Tiêu đề phần lý thuyết:
        </label>
        <Input
          value={theoryBlock?.title || ''}
          onChange={(e) => updateBlock('theory', { title: e.target.value })}
          placeholder="VD: Cấu trúc đại từ & Động từ To Be"
          className="text-xs py-1 h-8 bg-white"
        />
      </div>

      <div className="space-y-1">
        <label className="font-semibold text-slate-700 text-xs">
          Nội dung tóm tắt lý thuyết / Ngữ pháp trọng tâm:
        </label>
        <textarea
          rows={7}
          value={theoryBlock?.content || ''}
          onChange={(e) => {
            updateBlock('theory', { content: e.target.value })
            setLessonModal((prev) => ({ ...prev, theoryContent: e.target.value }))
          }}
          placeholder="Nhập phần tóm tắt ngắn gọn các mẫu câu, cách dùng và ngữ điệu tự nhiên khi giao tiếp..."
          className="w-full rounded-xl border border-line p-3 text-xs focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none leading-relaxed text-slate-800 bg-white"
        />
      </div>
    </div>
  )
}
