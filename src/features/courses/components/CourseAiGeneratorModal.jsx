import { useState } from 'react'
import { Loader2, Sparkles, Wand2, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const QUICK_TOPICS = [
  { topic: 'Giao tiếp Sân bay & Khách sạn Quốc tế', level: 'A2', type: 'STRUCTURED' },
  { topic: 'Phỏng vấn Xin việc & Đàm phán Lương', level: 'B1', type: 'STRUCTURED' },
  { topic: 'Thuyết trình Dự án & Họp Doanh nghiệp', level: 'B2', type: 'STRUCTURED' },
  { topic: 'Luyện thi IELTS Speaking & Tranh luận Phản biện', level: 'B2', type: 'EXAM_PREP' },
  { topic: 'Tiếng Anh Y tế & Chăm sóc Sức khỏe', level: 'B1', type: 'STRUCTURED' },
]

/**
 * Modal Trợ Lý AI Soạn Thảo Toàn Bộ Giáo Trình Chương Học
 */
export default function CourseAiGeneratorModal({
  isOpen,
  onClose,
  onApplyGenerated,
  generateCourseCurriculumWithAi,
}) {
  const [aiTopic, setAiTopic] = useState('')
  const [aiLevel, setAiLevel] = useState('B1')
  const [aiCourseType, setAiCourseType] = useState('STRUCTURED')
  const [isAiGenerating, setIsAiGenerating] = useState(false)

  if (!isOpen) return null

  const handleGenerate = async () => {
    if (!aiTopic.trim()) return
    setIsAiGenerating(true)
    try {
      const generated = await generateCourseCurriculumWithAi({
        topic: aiTopic.trim(),
        level: aiLevel,
        courseType: aiCourseType,
      })
      if (generated) {
        onApplyGenerated(generated)
        onClose()
      }
    } catch (err) {
      console.error('Lỗi khi AI sinh giáo trình:', err)
    } finally {
      setIsAiGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-line overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-line flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-navy-800 text-base">
                AI Trợ Lý Soạn Thảo Chương Trình Học
              </h3>
              <p className="text-xs text-ink-muted">
                Tự động sinh tiêu đề song ngữ, mô tả, CEFR và cấu trúc bài học hoàn chỉnh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-ink-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Preset topics */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Chủ đề gợi ý nhanh:</label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TOPICS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAiTopic(item.topic)
                    setAiLevel(item.level)
                    setAiCourseType(item.type)
                  }}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-700 font-medium transition-colors border border-slate-200"
                >
                  {item.topic}
                </button>
              ))}
            </div>
          </div>

          {/* Topic input */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">
              Nhập chủ đề chương học <span className="text-rose-500">*</span>:
            </label>
            <Input
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="VD: Tiếng Anh Logistics, Luyện nghe phản xạ..."
              className="text-xs"
              autoFocus
            />
          </div>

          {/* Level and Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Khung CEFR mục tiêu:</label>
              <Select
                value={aiLevel}
                onChange={(e) => setAiLevel(e.target.value)}
                className="text-xs"
              >
                <option value="A1">A1 - Sơ cấp</option>
                <option value="A2">A2 - Tiền trung cấp</option>
                <option value="B1">B1 - Trung cấp</option>
                <option value="B2">B2 - Trung cao cấp</option>
                <option value="C1">C1 - Cao cấp</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Loại chương trình:</label>
              <Select
                value={aiCourseType}
                onChange={(e) => setAiCourseType(e.target.value)}
                className="text-xs"
              >
                <option value="STRUCTURED">Lộ trình học chuẩn (Structured Path)</option>
                <option value="EXAM_PREP">Luyện thi chứng chỉ (TOEIC / IELTS)</option>
                <option value="GENERAL">Tiếng Anh chuyên đề mở rộng</option>
              </Select>
            </div>
          </div>

          <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 text-purple-900 leading-relaxed">
            <p className="font-semibold flex items-center gap-1 mb-0.5">
              <Wand2 size={13} /> Sức mạnh công nghệ Gemini AI:
            </p>
            Hệ thống sẽ phân tích và tạo cấu trúc 4 Units gồm từ vựng kèm phát âm IPA, mẫu hội thoại thực chiến, lý thuyết trọng tâm và bộ câu hỏi trắc nghiệm phản xạ.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-line bg-slate-50 flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={isAiGenerating ? Loader2 : Sparkles}
            onClick={handleGenerate}
            disabled={isAiGenerating || !aiTopic.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isAiGenerating ? 'Đang tạo nội dung...' : 'Bắt đầu tạo giáo trình'}
          </Button>
        </div>
      </div>
    </div>
  )
}
