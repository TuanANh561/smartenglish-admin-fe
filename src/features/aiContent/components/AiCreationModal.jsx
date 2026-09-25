import { BookOpen, CheckCircle, Info, Loader2, Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { useAuthStore } from '@/store/authStore'
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
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  const QUICK_TOPICS = [
    'Technology & AI in Education',
    'Workplace Email & Formal Communication',
    'Travel & Hospitality Services',
    'Environmental Protection & Climate Change',
    'Business Negotiations & Contract Terms',
  ]

  return (
    <Modal
      open={isOpen}
      onClose={() => !isGenerating && onClose()}
      title="Tạo nội dung học liệu thông minh bằng AI"
      className="max-w-4xl w-full p-6 max-h-[92vh] overflow-y-auto"
    >
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
            <div>
              <p className="font-bold text-base text-slate-800">Đang khởi tạo học liệu...</p>
              <p className="text-xs text-slate-500">{generatingStatus}</p>
            </div>
          </div>
          <div className="w-full max-w-md rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-center text-xs text-slate-600 leading-relaxed">
            ⚡ AI đang biên soạn văn bản tiếng Anh chuẩn CEFR, tạo ngân hàng câu hỏi và sinh đáp án kèm giải thích chi tiết. Vui lòng chờ 10-25 giây...
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
                    ? 'Lưu vào: Kho học liệu chuẩn toàn hệ thống (Global Standard Curriculum)'
                    : 'Lưu vào: Thư viện Lớp học & Bài tập của Giáo viên (Teacher Class Library)'}
                </span>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {isAdmin
                    ? 'Nội dung sau khi duyệt sẽ công khai cho toàn bộ học viên và các khóa học chính trên hệ thống.'
                    : 'Nội dung sẽ thuộc quyền quản lý của Thầy/Cô để giao bài tập cho các lớp phụ trách, không ghi đè giáo trình hệ thống.'}
                </p>
              </div>
            </div>
          </div>

          {/* ─── Row 1: Thông số chính (3 cột ngang nhau) ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Select
              label="Loại học liệu"
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
              <option value="A1">A1 - Sơ cấp (Beginner)</option>
              <option value="A2">A2 - Sơ trung cấp (Elementary)</option>
              <option value="B1">B1 - Trung cấp (Intermediate)</option>
              <option value="B2">B2 - Trung cao cấp (Upper-Inter)</option>
              <option value="C1">C1 - Nâng cao (Advanced)</option>
              <option value="C2">C2 - Thành thạo (Mastery)</option>
            </Select>

            <Select
              label="Số lượng câu hỏi / câu test"
              value={String(draft.questionCount)}
              onChange={(e) => setDraft((prev) => ({ ...prev, questionCount: Number(e.target.value) }))}
            >
              <option value={3}>3 câu hỏi</option>
              <option value={4}>4 câu hỏi</option>
              <option value={5}>5 câu hỏi (khuyến nghị)</option>
            </Select>
          </div>

          {/* ─── Row: Chủ đề bài học / Nội dung chính (Full-width Row) ─── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Chủ đề bài học / Nội dung chính *</label>
              <span className="text-[11px] text-slate-400">Tiếng Việt hoặc Tiếng Anh</span>
            </div>
            <Input
              placeholder={
                draft.type === 'reading'
                  ? 'VD: Artificial Intelligence in Modern Education'
                  : draft.type.includes('toeic')
                  ? 'VD: Office equipment and contract agreements'
                  : 'VD: Workplace Communication & Phrasal Verbs'
              }
              value={draft.topic}
              onChange={(e) => setDraft((prev) => ({ ...prev, topic: e.target.value }))}
            />

            {/* Quick suggestions chips spanning horizontally */}
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-medium text-slate-400 shrink-0">Gợi ý chủ đề nhanh:</span>
              {QUICK_TOPICS.map((topic, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, topic }))}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 transition-colors cursor-pointer"
                >
                  + {topic}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Row: Yêu cầu sư phạm bổ sung (Full-width Row) ─── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Yêu cầu sư phạm bổ sung (Prompt chi tiết - Tùy chọn)</label>
              <span className="text-[11px] text-slate-400">Tùy biến cho bài giảng</span>
            </div>
            <Textarea
              placeholder="VD: Tập trung vào từ vựng chuyên ngành công sở, các cấu trúc câu điều kiện loại 2, thiết kế các phương án gây nhiễu hợp lý và giải thích chi tiết đáp án bằng tiếng Việt..."
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
              Cấu trúc nội dung AI sẽ tự động sinh:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600">
              <div className="rounded-lg bg-white p-2.5 border border-slate-200/70 shadow-2xs">
                <span className="font-bold text-slate-800 block mb-0.5">
                  {draft.type === 'reading' ? '1. Văn bản bài đọc' : draft.type.includes('toeic') ? '1. Ngữ cảnh đề thi' : '1. Ngữ cảnh & Đặt câu hỏi'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {draft.type === 'reading'
                    ? 'Bài đọc 150-250 từ chuẩn văn phong học thuật theo cấp độ'
                    : draft.type.includes('toeic')
                    ? 'Format chuẩn đề thi ETS (Part 5/6/7) với ngữ cảnh thương mại thực tế'
                    : 'Tình huống giao tiếp, ngữ pháp hoặc từ vựng ứng dụng'}
                </span>
              </div>

              <div className="rounded-lg bg-white p-2.5 border border-slate-200/70 shadow-2xs">
                <span className="font-bold text-slate-800 block mb-0.5">2. Bộ câu hỏi & Đáp án</span>
                <span className="text-[11px] text-slate-500">
                  {draft.questionCount} câu hỏi trắc nghiệm kèm 4 lựa chọn (A, B, C, D) có bẫy ngữ pháp / từ vựng hợp lý
                </span>
              </div>

              <div className="rounded-lg bg-white p-2.5 border border-slate-200/70 shadow-2xs">
                <span className="font-bold text-slate-800 block mb-0.5">3. Giải thích song ngữ</span>
                <span className="text-[11px] text-slate-500">
                  Đáp án chuẩn xác kèm lời giải thích ngữ pháp và dịch nghĩa câu chi tiết bằng Tiếng Việt
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
