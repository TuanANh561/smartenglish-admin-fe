import { useMemo } from 'react'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { CONTENT_TYPE_OPTIONS, mapAiTypeToExamCategory, EXAM_CATEGORY_NAMES } from './aiContentConstants'

export const TOPIC_SUGGESTIONS_BY_TYPE = {
  quiz_grammar: [
    '12 Thì cơ bản & Nâng cao (Tenses & Aspects)',
    'Câu điều kiện & Đảo ngữ (Conditionals & Inversions)',
    'Mệnh đề quan hệ (Relative Clauses)',
    'Câu bị động & Thể sai khiến (Passive Voice & Causatives)',
    'Sự hòa hợp Chủ - Vị (Subject-Verb Agreement)',
    'Động từ khuyết thiếu (Modal Verbs)',
  ],
  quiz_vocab: [
    'Du lịch & Dịch vụ khách sạn (Travel & Hospitality)',
    'Giao tiếp công sở & Đàm phán (Workplace & Negotiations)',
    'Công nghệ & Trí tuệ nhân tạo (Technology & Modern AI)',
    'Giao tiếp đời sống hàng ngày (Daily Routine & Social Life)',
    'Tài chính & Ngân hàng thương mại (Banking & Finance)',
    'Môi trường & Biến đổi khí hậu (Environment & Ecology)',
  ],
  toeic_part_5: [
    'Hợp đồng & Đàm phán thương mại (Contracts & Agreements)',
    'Vận chuyển, Hậu cần & Đặt hàng (Logistics & Shipping)',
    'Nhân sự & Chính sách văn phòng (HR & Office Policies)',
    'Tiếp thị & Quảng bá sản phẩm (Marketing & Promotions)',
  ],
  toeic_part_6: [
    'Thông báo nội bộ doanh nghiệp (Internal Memos)',
    'Email trao đổi đối tác & Báo giá (Business Proposals)',
    'Chính sách bảo hành & Dịch vụ khách hàng (Customer Service)',
  ],
  toeic_part_7: [
    'Đoạn văn email & Thư từ thương mại (Business Letters)',
    'Thông cáo báo chí & Sự kiện ra mắt (Press Releases)',
    'Lịch trình chuyến bay & Hội nghị quốc tế (Travel Itineraries)',
  ],
  quiz_placement: [
    'Đánh giá toàn diện A1 - B1 (Foundation Placement)',
    'Đánh giá trình độ B1 - B2 (Intermediate Assessment)',
    'Đánh giá năng lực nâng cao B2 - C1 (Advanced Mastery)',
  ],
  reading: [
    'Artificial Intelligence in Education & Work',
    'Renewable Energy & Sustainable Living',
    'Remote Work & Modern Workplace Culture',
    'Global Tourism & Cultural Heritage',
  ],
  quiz_general: [
    'Giao tiếp phản xạ tiếng Anh hàng ngày',
    'Tổng hợp Từ vựng & Ngữ pháp trọng điểm',
    'Tình huống phỏng vấn tuyển dụng & Thuyết trình',
  ],
}

export default function AiCreationModal({
  isOpen,
  onClose,
  isGenerating,
  generatingStatus,
  draft,
  setDraft,
  onCreate,
}) {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  const activeSuggestions = useMemo(() => {
    return TOPIC_SUGGESTIONS_BY_TYPE[draft.type] || TOPIC_SUGGESTIONS_BY_TYPE.quiz_general
  }, [draft.type])

  const targetExamCategory = mapAiTypeToExamCategory(draft.type)
  const targetCategoryName = EXAM_CATEGORY_NAMES[targetExamCategory] || 'Tổng hợp'

  return (
    <Modal
      open={isOpen}
      onClose={() => !isGenerating && onClose()}
      title="Tạo nội dung bằng AI"
      className="max-w-3xl w-full p-6 max-h-[92vh] overflow-y-auto"
    >
      {isGenerating ? (
        <LoadingSpinner text={generatingStatus || 'Đang tạo nội dung...'} className="py-12" />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Dạng bài"
              value={draft.type}
              onChange={(e) => {
                const newType = e.target.value
                setDraft((prev) => ({
                  ...prev,
                  type: newType,
                  topic: prev.topic ? prev.topic : (TOPIC_SUGGESTIONS_BY_TYPE[newType]?.[0] || ''),
                }))
              }}
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
              <option value="A1">A1 - Sơ cấp</option>
              <option value="A2">A2 - Sơ trung cấp</option>
              <option value="B1">B1 - Trung cấp</option>
              <option value="B2">B2 - Trung cao cấp</option>
              <option value="C1">C1 - Nâng cao</option>
              <option value="C2">C2 - Thành thạo</option>
            </Select>

            <Select
              label="Số câu hỏi"
              value={String(draft.questionCount)}
              onChange={(e) => setDraft((prev) => ({ ...prev, questionCount: Number(e.target.value) }))}
            >
              <option value={3}>3 câu</option>
              <option value={4}>4 câu</option>
              <option value={5}>5 câu</option>
              <option value={10}>10 câu</option>
            </Select>
          </div>

          <div>
            <Input
              label="Chủ đề *"
              placeholder={
                draft.type.includes('grammar')
                  ? 'VD: Câu điều kiện loại 2 và loại 3'
                  : draft.type.includes('vocab')
                  ? 'VD: Du lịch & Dịch vụ khách sạn'
                  : draft.type.includes('toeic')
                  ? 'VD: Hợp đồng và chính sách thanh toán'
                  : 'VD: Giao tiếp hàng ngày'
              }
              value={draft.topic}
              onChange={(e) => setDraft((prev) => ({ ...prev, topic: e.target.value }))}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activeSuggestions.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, topic }))}
                  className={cn(
                    'rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer',
                    draft.topic === topic
                      ? 'border-brand-500 bg-brand-500/10 text-brand-600'
                      : 'border-line bg-canvas text-ink-muted hover:border-slate-300 hover:text-ink',
                  )}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Yêu cầu bổ sung (tùy chọn)"
            placeholder="VD: Tập trung vào các bẫy ngữ pháp thường gặp"
            rows={2}
            maxLength={1000}
            value={draft.prompt}
            onChange={(e) => setDraft((prev) => ({ ...prev, prompt: e.target.value }))}
            className="text-xs"
          />

          <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
            <span className="text-xs text-ink-muted">
              Lưu vào: {isAdmin ? 'Ngân hàng đề thi' : 'Thư viện lớp học'} · {targetCategoryName}
            </span>
            <div className="flex items-center gap-2.5">
              <Button variant="secondary" onClick={onClose}>
                Huỷ
              </Button>
              <Button onClick={onCreate} disabled={!draft.topic.trim()}>
                Tạo nội dung
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
