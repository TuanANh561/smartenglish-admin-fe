import { useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  FileQuestion,
  FileText,
  Headphones,
  HelpCircle,
  Layers,
  MessageSquare,
  Play,
  Volume2,
  X,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

/**
 * Modal Xem Chi Tiết Bài Học Dành Cho Người Học (Read-Only Learner View)
 * Hiển thị trọn vẹn nội dung học tập:
 * - Lý thuyết & Ngữ pháp
 * - Từ vựng & IPA
 * - Đoạn hội thoại mẫu
 * - Trắc nghiệm củng cố (có thể bấm thử xem đáp án)
 * - Video & Tài liệu đính kèm
 */
export default function LessonStudentViewModal({ isOpen, onClose, lesson, courseTitle }) {
  const [activeTab, setActiveTab] = useState('theory')
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showExplanation, setShowExplanation] = useState({})

  if (!isOpen || !lesson) return null

  const contentBlocks = Array.isArray(lesson.contentBlocks) ? lesson.contentBlocks : []
  const theoryBlock = contentBlocks.find((b) => b.type === 'theory')
  const vocabBlock = contentBlocks.find((b) => b.type === 'vocabulary')
  const dialogueBlock = contentBlocks.find((b) => b.type === 'dialogue')
  const quizBlock = contentBlocks.find((b) => b.type === 'quiz')
  const videoBlock = contentBlocks.find((b) => b.type === 'video')
  const attachmentBlock = contentBlocks.find(
    (b) => b.type === 'attachment' || b.type === 'file' || b.type === 'document',
  )

  const vocabs = vocabBlock?.items || []
  const dialogues = dialogueBlock?.lines || []
  const quizzes = quizBlock?.questions || []

  const handleSelectOption = (qIdx, optIdx) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
    setShowExplanation((prev) => ({ ...prev, [qIdx]: true }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white font-bold text-sm shadow-xs">
              U{lesson.position || 1}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-bold text-slate-900 text-base">
                  {lesson.titleVi || lesson.title}
                </h3>
                {lesson.isFreePreview ? (
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-200">
                    Học thử miễn phí
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-200">
                    Premium
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-slate-500 mt-0.5">
                {courseTitle ? `Khóa học: ${courseTitle}` : 'Xem bài học ở góc độ người học'} • {lesson.estimatedMin || 15} phút • +{lesson.xpReward || 30} XP
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 transition-colors cursor-pointer"
            title="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation (Góc độ học viên) */}
        <div className="flex overflow-x-auto border-b border-slate-100 bg-white px-6 gap-2 pt-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('theory')}
            className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'theory'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen size={15} />
            <span>1. Lý thuyết & Ngữ pháp</span>
          </button>

          {vocabs.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('vocab')}
              className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'vocab'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Volume2 size={15} />
              <span>2. Từ vựng ({vocabs.length})</span>
            </button>
          )}

          {dialogues.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('dialogue')}
              className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'dialogue'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare size={15} />
              <span>3. Hội thoại ({dialogues.length})</span>
            </button>
          )}

          {quizzes.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'quiz'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileQuestion size={15} />
              <span>4. Trắc nghiệm ({quizzes.length})</span>
            </button>
          )}

          {videoBlock?.videoUrl && (
            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'video'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Play size={15} />
              <span>5. Video bài giảng</span>
            </button>
          )}

          {attachmentBlock?.fileUrl && (
            <button
              type="button"
              onClick={() => setActiveTab('attachment')}
              className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'attachment'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText size={15} />
              <span>6. Tài liệu</span>
            </button>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/40">
          {/* TAB 1: LÝ THUYẾT */}
          {activeTab === 'theory' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-3">
                  <BookOpen size={16} className="text-brand-500" />
                  {theoryBlock?.title || 'Lý thuyết trọng tâm bài học'}
                </h4>
                <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {theoryBlock?.content ||
                    lesson.theoryContent ||
                    'Nội dung lý thuyết đang được cập nhật cho bài học này.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TỪ VỰNG */}
          {activeTab === 'vocab' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vocabs.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-brand-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-bold text-slate-900 text-base">{item.word}</h5>
                      <p className="font-mono text-xs text-brand-600 mt-0.5">{item.ipa || '/.../'}</p>
                    </div>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                      {item.pos || 'n'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 mt-2">{item.meaningVi}</p>
                  {item.exampleEn && (
                    <div className="mt-2.5 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600 border border-slate-100">
                      <p className="font-semibold text-slate-800 italic">"{item.exampleEn}"</p>
                      {item.exampleVi && <p className="text-slate-500 mt-0.5">{item.exampleVi}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: HỘI THOẠI */}
          {activeTab === 'dialogue' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-2">
                <MessageSquare size={16} className="text-emerald-500" />
                Hội thoại giao tiếp phản xạ
              </h4>
              <div className="space-y-3">
                {dialogues.map((line, idx) => {
                  const isA = idx % 2 === 0
                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 ${isA ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-3.5 text-xs shadow-2xs ${
                          isA
                            ? 'bg-slate-100 text-slate-800 rounded-tl-xs'
                            : 'bg-brand-500 text-white rounded-tr-xs'
                        }`}
                      >
                        <p className="text-[10px] font-bold opacity-75 mb-1">
                          {line.speaker || (isA ? 'Speaker A' : 'Speaker B')}
                        </p>
                        <p className="font-semibold text-sm leading-snug">{line.textEn || line.text}</p>
                        {line.textVi && (
                          <p className={`mt-1 text-[11px] ${isA ? 'text-slate-500' : 'text-brand-100'}`}>
                            {line.textVi}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 4: TRẮC NGHIỆM */}
          {activeTab === 'quiz' && (
            <div className="space-y-4">
              {quizzes.map((q, qIdx) => {
                const userAns = selectedAnswers[qIdx]
                const correctAns = q.correctIndex ?? 0
                const answered = userAns !== undefined

                return (
                  <div
                    key={qIdx}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                        {qIdx + 1}
                      </span>
                      <h5 className="font-bold text-slate-800 text-sm">{q.question}</h5>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {(q.options || []).map((opt, optIdx) => {
                        const isChosen = userAns === optIdx
                        const isThisCorrect = optIdx === correctAns

                        let btnStyle = 'border-slate-200 bg-white text-slate-700 hover:border-brand-400'
                        if (answered) {
                          if (isThisCorrect) {
                            btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                          } else if (isChosen) {
                            btnStyle = 'border-rose-400 bg-rose-50 text-rose-800'
                          } else {
                            btnStyle = 'border-slate-100 bg-slate-50/50 text-slate-400'
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs text-left transition-colors cursor-pointer ${btnStyle}`}
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 font-bold text-[11px] text-slate-600">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                          </button>
                        )
                      })}
                    </div>

                    {showExplanation[qIdx] && q.explanation && (
                      <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3 text-xs text-blue-800">
                        <span className="font-bold">Giải thích: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* TAB 5: VIDEO */}
          {activeTab === 'video' && videoBlock?.videoUrl && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">
                {videoBlock.title || 'Video bài giảng'}
              </h4>
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-sm">
                <iframe
                  src={videoBlock.videoUrl}
                  title="Lesson Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

          {/* TAB 6: TÀI LIỆU */}
          {activeTab === 'attachment' && attachmentBlock?.fileUrl && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText size={22} />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">
                    {attachmentBlock.fileName || 'Tài liệu bài học'}
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5">Tài liệu học tập đi kèm bài học</p>
                </div>
              </div>
              <a
                href={attachmentBlock.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-4 py-2 shadow-xs transition-colors"
              >
                Mở tài liệu
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-3.5">
          <span className="text-xs text-slate-400">
            Chế độ xem học viên (Read-only) • Không hiển thị bảng chỉnh sửa
          </span>
          <Button size="sm" variant="secondary" onClick={onClose}>
            Đóng bài học
          </Button>
        </div>
      </div>
    </div>
  )
}
