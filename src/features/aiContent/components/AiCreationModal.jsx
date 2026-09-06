import { Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { CONTENT_TYPE_OPTIONS } from './aiContentConstants'

export default function AiCreationModal({
  isOpen,
  onClose,
  isGenerating,
  generatingStatus,
  draft,
  setDraft,
  onCreate,
}) {
  return (
    <Modal
      open={isOpen}
      onClose={() => !isGenerating && onClose()}
      title="Tạo nội dung bằng AI"
    >
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            <div>
              <p className="font-semibold text-navy-700">Đang xử lý...</p>
              <p className="text-sm text-ink-muted">{generatingStatus}</p>
            </div>
          </div>
          <div className="w-full rounded-lg bg-canvas p-3 text-center text-xs text-ink-muted">
            💡 Quá trình này có thể mất từ 10-30 giây. Vui lòng chờ...
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Select
            label="Loại nội dung"
            value={draft.type}
            onChange={(e) => setDraft((prev) => ({ ...prev, type: e.target.value }))}
          >
            {CONTENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          <Select
            label="Cấp độ CEFR"
            value={draft.level}
            onChange={(e) => setDraft((prev) => ({ ...prev, level: e.target.value }))}
          >
            <option value="A1">A1 - Sơ cấp 1</option>
            <option value="A2">A2 - Sơ cấp 2</option>
            <option value="B1">B1 - Trung cấp 1</option>
            <option value="B2">B2 - Trung cấp 2</option>
            <option value="C1">C1 - Nâng cao 1</option>
            <option value="C2">C2 - Nâng cao 2</option>
          </Select>

          <Select
            label="Số lượng câu"
            value={String(draft.questionCount)}
            onChange={(e) => setDraft((prev) => ({ ...prev, questionCount: Number(e.target.value) }))}
          >
            <option value={3}>3 câu</option>
            <option value={4}>4 câu</option>
            <option value={5}>5 câu (khuyến nghị)</option>
          </Select>

          <div>
            <label className="text-sm font-semibold text-ink-muted">Chủ đề / Nội dung *</label>
            <Input
              placeholder={
                draft.type === 'reading'
                  ? 'VD: Lịch sử của Internet / History of the Internet'
                  : 'VD: Từ vựng công việc văn phòng / Workplace vocabulary'
              }
              value={draft.topic}
              onChange={(e) => setDraft((prev) => ({ ...prev, topic: e.target.value }))}
              className="mt-1"
            />
            <p className="mt-2 text-xs text-ink-muted">
              Hệ thống tự hiểu chủ đề bằng tiếng Việt/Anh và sinh nội dung bằng tiếng Anh.
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-ink-muted">Prompt chi tiết (tùy chọn)</label>
            <Textarea
              placeholder="VD: 3 câu hỏi ngắn theo chủ đề công việc văn phòng, mức B2."
              rows={3}
              value={draft.prompt}
              onChange={(e) => setDraft((prev) => ({ ...prev, prompt: e.target.value }))}
              className="mt-1"
            />
            <p className="mt-2 text-xs text-ink-muted">
              Có thể thêm mục tiêu học tập hoặc độ khó; nội dung chính vẫn là tiếng Anh.
            </p>
          </div>

          <div className="rounded-lg border-l-4 border-brand-400 bg-brand-500/5 p-3">
            <p className="text-xs font-semibold text-brand-600">📊 Kết quả dự kiến:</p>
            <p className="mt-1 whitespace-pre-line text-xs text-ink-muted">
              {draft.type === 'reading'
                ? '• Bài đọc 120–180 từ\n• 3–5 câu hỏi\n• Tiếng Anh chuẩn'
                : '• 3–5 câu hỏi\n• 4 đáp án mỗi câu\n• Tiếng Anh chuẩn'}
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Huỷ
            </Button>
            <Button
              onClick={onCreate}
              disabled={!draft.topic.trim()}
              loading={isGenerating}
            >
              Tạo bằng AI
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
