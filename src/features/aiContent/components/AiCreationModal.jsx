import { useMemo } from 'react'
import { BookOpen, CheckCircle, Info, Loader2, Sparkles, Layers, SpellCheck, GraduationCap } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
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
      title="Tạo nội dung học liệu & Đề thi AI"
      className="max-w-4xl w-full p-6 max-h-[92vh] overflow-y-auto"
    >
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin shrink-0 text-brand-600" strokeWidth={2.25} />
            <div>
              <p className="font-bold text-base text-slate-800">Đang khởi tạo học liệu đề thi...</p>
              <p className="text-xs text-slate-500">{generatingStatus}</p>
            </div>
          </div>
          <div className="w-full max-w-md rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-center text-xs text-slate-600 leading-relaxed">
            AI đang biên soạn câu hỏi chuẩn CEFR, tạo 4 đáp án gây nhiễu hợp lý và viết lời giải thích song ngữ chi tiết. Vui lòng chờ 10-25 giây...
          </div>
        </div>
      ) : (
        <div className="space-y-4.5">
          {/* ─── Role Destination Banner (Full width) ─── */}
          <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            isAdmin
              ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{isAdmin ? '🌐' : '🏫'}</span>
              <div>
                <span className="font-bold">
                  {isAdmin
                    ? `Xuất bản tự động: Ngân hàng Đề thi & Quiz học viên (Mục: ${targetCategoryName})`
                    : `Lưu vào: Thư viện Lớp học & Bài tập của Giáo viên (Mục: ${targetCategoryName})`}
                </span>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Nội dung sau khi được duyệt sẽ tự động đồng bộ sang Ngân hàng đề thi để học viên làm bài trực tiếp trên Mobile App.
                </p>
              </div>
            </div>
          </div>

          {/* ─── Row 1: Thông số chính (3 cột ngang nhau) ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Select
              label="Dạng bài / Thể loại Quiz"
              value={draft.type}
              onChange={(e) => {
                const newType = e.target.value
                setDraft((prev) => ({
                  ...prev,
                  type: newType,
                  // Tự động gán gợi ý đầu tiên nếu topic đang trống
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
              <option value="A1">A1 - Sơ cấp (Beginner)</option>
              <option value="A2">A2 - Sơ trung cấp (Elementary)</option>
              <option value="B1">B1 - Trung cấp (Intermediate)</option>
              <option value="B2">B2 - Trung cao cấp (Upper-Inter)</option>
              <option value="C1">C1 - Nâng cao (Advanced)</option>
              <option value="C2">C2 - Thành thạo (Mastery)</option>
            </Select>

            <Select
              label="Số lượng câu hỏi"
              value={String(draft.questionCount)}
              onChange={(e) => setDraft((prev) => ({ ...prev, questionCount: Number(e.target.value) }))}
            >
              <option value={3}>3 câu hỏi (Luyện nhanh)</option>
              <option value={4}>4 câu hỏi</option>
              <option value={5}>5 câu hỏi (Khuyến nghị)</option>
              <option value={10}>10 câu hỏi (Đề Mini Quiz)</option>
            </Select>
          </div>

          {/* ─── Row: Chủ đề bài học / Nội dung chính (Full-width Row) ─── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Chủ đề bài thi / Nội dung kiểm tra *</label>
              <span className="text-[11px] text-slate-400">Khớp với chủ đề Quiz học viên</span>
            </div>
            <Input
              placeholder={
                draft.type.includes('grammar')
                  ? 'VD: Câu điều kiện loại 2 và loại 3 đảo ngữ'
                  : draft.type.includes('vocab')
                  ? 'VD: Du lịch & Dịch vụ khách sạn (Travel & Hospitality)'
                  : draft.type.includes('toeic')
                  ? 'VD: Hợp đồng và chính sách thanh toán công ty'
                  : 'VD: Giao tiếp hàng ngày hoặc AI trong giáo dục'
              }
              value={draft.topic}
              onChange={(e) => setDraft((prev) => ({ ...prev, topic: e.target.value }))}
            />

            {/* Quick suggestions chips spanning horizontally */}
            <div className="mt-2.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-medium text-slate-500 shrink-0">Chủ đề đề xuất cho {targetCategoryName}:</span>
                {activeSuggestions.map((topic, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, topic }))}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                      draft.topic === topic
                        ? 'bg-brand-50 border-brand-300 text-brand-700 font-semibold'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200/80 text-slate-600'
                    }`}
                  >
                    + {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Row: Yêu cầu sư phạm bổ sung (Full-width Row) ─── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Yêu cầu sư phạm bổ sung (Tùy chọn)</label>
              <span className="text-[11px] text-slate-400">Tinh chỉnh trọng tâm bài tập</span>
            </div>
            <Textarea
              placeholder="VD: Thiết kế các câu hỏi có bẫy ngữ pháp phổ biến, giải thích ngắn gọn bằng tiếng Việt dễ hiểu cho học viên..."
              rows={2}
              value={draft.prompt}
              onChange={(e) => setDraft((prev) => ({ ...prev, prompt: e.target.value }))}
              className="text-xs"
            />
          </div>

          {/* ─── Row 3: Cấu trúc kết quả tự động sinh (Chia 3 thẻ ngang) ─── */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5">
            <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              Cấu trúc bài thi AI sẽ sinh và đồng bộ vào Ngân hàng Quiz:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600">
              <div className="rounded-lg bg-white p-2.5 border border-slate-200/70 shadow-2xs">
                <span className="font-bold text-slate-800 block mb-0.5">1. Định dạng bài tập</span>
                <span className="text-[11px] text-slate-500">
                  {draft.type === 'reading'
                    ? 'Đoạn văn đọc hiểu 120-180 từ chuẩn CEFR'
                    : draft.type.includes('toeic_part_6')
                    ? 'Đoạn văn điền khuyết với chỗ trống [131], [132]...'
                    : draft.type.includes('toeic_part_7')
                    ? 'Văn bản đọc hiểu thương mại chuẩn ETS Part 7'
                    : 'Câu hỏi trắc nghiệm ngữ pháp / từ vựng ngữ cảnh thực tế'}
                </span>
              </div>

              <div className="rounded-lg bg-white p-2.5 border border-slate-200/70 shadow-2xs">
                <span className="font-bold text-slate-800 block mb-0.5">2. Bộ câu hỏi & Đáp án</span>
                <span className="text-[11px] text-slate-500">
                  {draft.questionCount} câu hỏi kèm 4 lựa chọn (A, B, C, D) có bẫy tư duy hợp lý
                </span>
              </div>

              <div className="rounded-lg bg-white p-2.5 border border-slate-200/70 shadow-2xs">
                <span className="font-bold text-slate-800 block mb-0.5">3. Giải thích song ngữ</span>
                <span className="text-[11px] text-slate-500">
                  Đáp án chuẩn xác kèm lời giải thích ngữ pháp và dịch nghĩa chi tiết bằng tiếng Việt
                </span>
              </div>
            </div>
          </div>

          {/* ─── Footer: Nút hành động ─── */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={onClose} disabled={isGenerating}>
              Huỷ
            </Button>
            <Button
              onClick={onCreate}
              disabled={!draft.topic.trim() || isGenerating}
              loading={isGenerating}
              className="bg-navy-800 hover:bg-navy-900 text-white px-5"
            >
              Bắt đầu tạo nội dung
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
