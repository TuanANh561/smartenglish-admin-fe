import { useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  HelpCircle,
  Lock,
  Pencil,
  Share2,
  Trash2,
  User,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import { SHORT_TEST_TYPE_META } from '@/mocks/data/shortTests'

export default function ShortTestDetailDrawer({
  test,
  onClose,
  isOwner,
  isAdmin,
  onDeleteRequest,
  onEditRequest,
  onAssignRequest,
}) {
  const [activeQuestionTab, setActiveQuestionTab] = useState(0)

  if (!test) return null

  const canModify = isOwner || isAdmin
  const questions = test.questions || []
  const currentQ = questions[activeQuestionTab] || questions[0]
  const typeMeta = SHORT_TEST_TYPE_META[test.testType] || {
    label: test.testTypeLabel || 'Bài test ngắn',
    tone: 'info',
  }

  // Format đoạn văn và làm nổi bật các vị trí điền khuyết như [131], [132]...
  const renderPassageWithHighlights = (text) => {
    if (!text) return 'Chưa có nội dung đoạn văn.'

    // Tách theo các đoạn xuống dòng
    const paragraphs = text.split(/\n\s*\n/)

    return paragraphs.map((para, pIdx) => {
      // Regex tìm các marker dạng [131], [132] hoặc [1], [2]
      const parts = para.split(/(\[\d+\]\s*_{0,5})/)

      return (
        <p key={pIdx} className="mb-3.5 text-sm leading-relaxed text-slate-800 font-normal">
          {parts.map((part, idx) => {
            const match = part.match(/^\[(\d+)\]/)
            if (match) {
              const qNum = match[1]
              const isSelected =
                questions[activeQuestionTab]?.questionNumber === qNum ||
                questions[activeQuestionTab]?.id === qNum

              return (
                <span
                  key={idx}
                  onClick={() => {
                    const qIdx = questions.findIndex(
                      (q) => q.questionNumber === qNum || q.id === qNum,
                    )
                    if (qIdx !== -1) setActiveQuestionTab(qIdx)
                  }}
                  className={`inline-flex items-center px-2 py-0.5 mx-1 font-mono text-xs font-bold rounded-md cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-brand-600 text-white border-brand-700 shadow-sm scale-105 ring-2 ring-brand-200'
                      : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                  }`}
                  title={`Bấm để xem câu hỏi [${qNum}]`}
                >
                  [{qNum}] _____
                </span>
              )
            }
            return part
          })}
        </p>
      )
    })
  }

  return (
    <Drawer
      open={Boolean(test)}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-brand-600 shrink-0" />
          <span className="truncate max-w-[380px]">{test.title}</span>
        </div>
      }
      className="max-w-[580px]"
    >
      <div className="space-y-5">
        {/* Meta badges row */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="info" className="font-bold">
            {test.level || 'B2'}
          </Badge>
          <Badge tone={typeMeta.tone || 'neutral'}>
            {test.testTypeLabel || typeMeta.label}
          </Badge>
          <Badge tone="neutral" className="inline-flex items-center gap-1">
            <HelpCircle size={12} />
            {questions.length} câu hỏi
          </Badge>
          <Badge tone="neutral" className="inline-flex items-center gap-1">
            <Clock size={12} />
            {test.durationMinutes || 5} phút
          </Badge>
          <Badge tone={isOwner ? 'success' : 'neutral'} className="inline-flex items-center gap-1">
            {isOwner ? <User size={12} /> : <GraduationCap size={12} />}
            {test.authorName || 'Hệ thống'}
          </Badge>
        </div>

        {/* Reading Passage Box */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookOpen size={14} className="text-brand-500" />
              Đoạn văn đọc hiểu / Ngữ cảnh bài test
            </h4>
            <span className="text-[11px] text-slate-400">
              (Bấm vào các số [xxx] để nhảy đến câu hỏi)
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 max-h-[260px] overflow-y-auto shadow-inner custom-scrollbar">
            {renderPassageWithHighlights(test.passage)}
          </div>
        </div>

        {/* Questions Section */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <HelpCircle size={14} className="text-brand-500" />
              Danh sách câu hỏi ({questions.length})
            </h4>
            <span className="text-xs font-semibold text-brand-600">
              Câu {activeQuestionTab + 1}/{questions.length}
            </span>
          </div>

          {/* Question Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3">
            {questions.map((q, idx) => {
              const isSelected = activeQuestionTab === idx
              const label = q.questionNumber ? `[${q.questionNumber}]` : `Câu ${idx + 1}`
              return (
                <button
                  key={q.id || idx}
                  type="button"
                  onClick={() => setActiveQuestionTab(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* Active Question Card */}
          {currentQ ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5 shadow-2xs">
              <div className="text-sm font-semibold text-slate-900">
                <span className="text-brand-600 font-bold mr-1.5">
                  {currentQ.questionNumber ? `[${currentQ.questionNumber}]` : `Câu ${activeQuestionTab + 1}:`}
                </span>
                {currentQ.questionText}
              </div>

              {/* Options list */}
              <div className="space-y-2">
                {(currentQ.options || []).map((opt, optIdx) => {
                  const isCorrect =
                    opt === currentQ.correctAnswer ||
                    (typeof currentQ.correctAnswer === 'string' &&
                      currentQ.correctAnswer.trim().toLowerCase() === opt.trim().toLowerCase())

                  const letter = String.fromCharCode(65 + optIdx)

                  return (
                    <div
                      key={optIdx}
                      className={`flex items-start gap-2.5 rounded-lg p-2.5 text-sm transition-all ${
                        isCorrect
                          ? 'bg-emerald-50 border border-emerald-300 text-emerald-900 font-medium'
                          : 'bg-slate-50 border border-slate-100 text-slate-700'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="flex-1 text-xs sm:text-sm">{opt}</span>
                      {isCorrect && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 shrink-0">
                          <CheckCircle2 size={15} />
                          Đáp án đúng
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Explanation */}
              {currentQ.explanationVi && (
                <div className="rounded-lg bg-amber-50/70 border border-amber-200/80 p-3 text-xs leading-relaxed text-amber-900">
                  <strong className="font-semibold block mb-1">💡 Giải thích chi tiết:</strong>
                  {currentQ.explanationVi}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Không có dữ liệu câu hỏi.</p>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
          <Button
            variant="secondary"
            icon={Share2}
            onClick={() => {
              if (onAssignRequest) onAssignRequest(test)
            }}
            title="Giao bài test cho lớp"
            aria-label="Giao bài test"
            className="h-10 w-10 p-0 shrink-0"
          />

          {canModify ? (
            <>
              <Button
                variant="secondary"
                icon={Trash2}
                onClick={onDeleteRequest}
                title="Xóa bài test"
                aria-label="Xóa bài test"
                className="h-10 w-10 p-0 shrink-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
              />
              <Button
                variant="primary"
                fullWidth
                icon={Pencil}
                onClick={onEditRequest}
              >
                Chỉnh sửa bài test
              </Button>
            </>
          ) : (
            <div className="w-full text-center text-xs text-slate-500 py-2 bg-slate-50 rounded-lg">
              <Lock size={13} className="inline mr-1" />
              Bạn đang xem bài test của tác giả khác (Chế độ xem)
            </div>
          )}
        </div>
      </div>
    </Drawer>
  )
}
