import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Headphones,
  Image as ImageIcon,
  Layers,
  Plus,
  Radio,
  Save,
  Search,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useTwoLayerAudio } from '@/lib/useTwoLayerAudio'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuthStore } from '@/store/authStore'
import {
  createExam,
  getExamById,
  updateExam,
  CEFR_LEVELS,
  EXAM_CATEGORIES,
} from './examApi'

const PART_NAMES = {
  1: 'Part 1: Photographs (Tranh ảnh)',
  2: 'Part 2: Question-Response (Hỏi - Đáp)',
  3: 'Part 3: Conversations (Hội thoại ngắn)',
  4: 'Part 4: Short Talks (Bài nói ngắn)',
  5: 'Part 5: Incomplete Sentences (Hoàn thành câu)',
  6: 'Part 6: Text Completion (Điền đoạn văn)',
  7: 'Part 7: Reading Comprehension (Đọc hiểu)',
}

const SAMPLE_PART1_IMAGES = [
  { label: 'Văn phòng làm việc', url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80' },
  { label: 'Phòng họp hội thảo', url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80' },
  { label: 'Quầy tiếp tân', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80' },
  { label: 'Kho bãi & Logistics', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80' },
]

const EMPTY_QUESTION = {
  part: 5,
  questionText: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
  point: 5,
  imageUrl: '',
  audioUrl: '',
  audioScript: '',
  passageText: '',
  groupRangeText: '',
  groupAudioBadge: '',
}

function QuestionCard({
  question,
  index,
  isOpen,
  onToggle,
  onChange,
  onRemove,
  audioEngine,
  prevQuestion,
  onApplyAudioToGroup,
  onApplyPassageToGroup,
  isAudioGroupLeader = true,
  audioLeaderQuestion = null,
  isPassageGroupLeader = true,
  passageLeaderQuestion = null,
}) {
  const hasContent = question.questionText?.trim()
  const partNum = Number(question.part) || 1
  const isListening = partNum <= 4
  const isListeningGroupPart = partNum === 3 || partNum === 4
  const isReadingWithPassage = partNum === 6 || partNum === 7
  const isPart1 = partNum === 1
  const isCurrentPlaying = audioEngine?.playingId === `form-q-${index}`

  const targetAudioQ = (!isAudioGroupLeader && audioLeaderQuestion) ? audioLeaderQuestion : question

  const handleTestAudio = (e) => {
    e.stopPropagation()
    const fallback =
      targetAudioQ.audioScript ||
      targetAudioQ.questionText ||
      targetAudioQ.options?.filter(Boolean).join('. ')
    audioEngine.play(`form-q-${index}`, {
      audioUrl: targetAudioQ.audioUrl,
      fallbackText: fallback,
    })
  }

  const handleCopyPrevPassage = () => {
    if (prevQuestion?.passageText) {
      onChange({
        ...question,
        passageText: prevQuestion.passageText,
        groupRangeText: prevQuestion.groupRangeText || question.groupRangeText,
        groupAudioBadge: prevQuestion.groupAudioBadge || question.groupAudioBadge,
      })
      toast.success('Đã sao chép đoạn văn từ câu trước!')
    }
  }

  const handleCopyPrevAudio = () => {
    if (prevQuestion?.audioUrl || prevQuestion?.audioScript) {
      onChange({
        ...question,
        audioUrl: prevQuestion.audioUrl || question.audioUrl,
        audioScript: prevQuestion.audioScript || question.audioScript,
        groupAudioBadge: prevQuestion.groupAudioBadge || question.groupAudioBadge,
        groupRangeText: prevQuestion.groupRangeText || question.groupRangeText,
      })
      toast.success('Đã sao chép file âm thanh & kịch bản từ câu trước!')
    }
  }

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isOpen
          ? 'border-brand-400 bg-white shadow-md ring-1 ring-brand-100'
          : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
      }`}
    >
      {/* Header bar of question card */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy-800 text-white text-xs font-bold shadow-2xs">
          {index + 1}
        </div>

        {/* Part Badge */}
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold border ${
            isListening
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : partNum === 5
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {isListening ? (
            <span className="flex items-center gap-1">
              <Headphones size={11} /> Part {partNum}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <FileText size={11} /> Part {partNum}
            </span>
          )}
        </span>

        {/* Thumbnail Preview for Part 1 (visible even when collapsed) */}
        {isPart1 && question.imageUrl && (
          <div className="shrink-0 relative group">
            <img
              src={question.imageUrl}
              alt={`Ảnh câu ${index + 1}`}
              className="h-10 w-14 rounded-lg object-cover border border-blue-200 shadow-2xs group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
        )}

        {/* Summary text */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm truncate ${
              hasContent ? 'text-slate-800 font-semibold' : 'text-slate-400 italic'
            }`}
          >
            {hasContent ? question.questionText : `Câu hỏi ${index + 1} — chưa nhập nội dung`}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500">
            {question.options?.[question.correctIndex] && (
              <span className="text-emerald-700 font-medium">
                ✓ Đáp án {String.fromCharCode(65 + question.correctIndex)}:{' '}
                {question.options[question.correctIndex]}
              </span>
            )}
            {question.imageUrl && !isPart1 && (
              <span className="text-blue-600 flex items-center gap-0.5 text-[11px]">
                <ImageIcon size={11} /> Có ảnh
              </span>
            )}
            {question.audioUrl && (
              <span className="text-indigo-600 flex items-center gap-0.5 text-[11px]">
                <Volume2 size={11} /> Có audio
              </span>
            )}
            {question.passageText && (
              <span className="text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded flex items-center gap-1 text-[11px] truncate max-w-[260px]">
                <FileText size={11} className="shrink-0" />
                <span className="truncate">{question.passageText}</span>
              </span>
            )}
          </div>
        </div>

        {/* Quick Audio Test Button in Header */}
        {isListening && (
          isListeningGroupPart ? (
            isAudioGroupLeader ? (
              <button
                type="button"
                onClick={handleTestAudio}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  isCurrentPlaying
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs'
                }`}
                title="Nghe thử file âm thanh chính của cả nhóm (hội thoại + 3 câu hỏi)"
              >
                {isCurrentPlaying ? (
                  <>
                    <VolumeX size={13} className="text-amber-700 animate-pulse" />
                    <span>Dừng</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={13} className="text-indigo-600" />
                    <span>Audio nhóm (3 câu)</span>
                  </>
                )}
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                <Headphones size={11} className="text-slate-400" />
                <span>Audio chung câu {audioLeaderQuestion?.questionNumber || (audioLeaderQuestion?.originalIndex + 1)}</span>
              </span>
            )
          ) : (
            <button
              type="button"
              onClick={handleTestAudio}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                isCurrentPlaying
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-white hover:bg-brand-50 text-slate-700 hover:text-brand-700 border border-slate-200 shadow-2xs'
              }`}
              title="Nghe thử âm thanh câu hỏi"
            >
              {isCurrentPlaying ? (
                <>
                  <VolumeX size={13} className="text-amber-700 animate-pulse" />
                  <span>Dừng</span>
                </>
              ) : (
                <>
                  <Volume2 size={13} className="text-brand-600" />
                  <span>Nghe thử</span>
                </>
              )}
            </button>
          )
        )}

        <div className="flex items-center gap-1 text-slate-400">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
            title="Xóa câu hỏi"
          >
            <Trash2 size={14} />
          </button>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded detailed editing section */}
      {isOpen && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
          {/* Part Selection & Group Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Phần thi *</label>
              <Select
                value={question.part || 5}
                onChange={(e) => onChange({ ...question, part: Number(e.target.value) })}
              >
                {Object.entries(PART_NAMES).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Phạm vi nhóm (nếu có)</label>
              <Input
                value={question.groupRangeText || ''}
                onChange={(e) => onChange({ ...question, groupRangeText: e.target.value })}
                placeholder="VD: Nhóm câu 32–34, Nhóm câu 147–148"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Chủ đề bài nghe / bài đọc</label>
              <Input
                value={question.groupAudioBadge || ''}
                onChange={(e) => onChange({ ...question, groupAudioBadge: e.target.value })}
                placeholder="VD: Hội thoại: IT Support, Email: Delta Airlines"
              />
            </div>
          </div>

          {/* ─── Part 1: Ảnh chụp (Photograph) ─── */}
          {isPart1 && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <ImageIcon size={15} className="text-blue-600" />
                  <span>Hình ảnh câu hỏi (Part 1)</span>
                </div>

                {/* Quick Sample Image Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">Mẫu nhanh:</span>
                  {SAMPLE_PART1_IMAGES.map((sample, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => onChange({ ...question, imageUrl: sample.url })}
                      className="px-2 py-0.5 text-[10px] bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 rounded-md font-medium transition-colors cursor-pointer"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  URL Hình ảnh tranh chụp *
                </label>
                <Input
                  type="url"
                  value={question.imageUrl || ''}
                  onChange={(e) => onChange({ ...question, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/... hoặc link ảnh CDN"
                />
              </div>

              {question.imageUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg border border-blue-100">
                  <img
                    src={question.imageUrl}
                    alt="Xem trước tranh chụp"
                    className="h-36 w-full sm:w-56 rounded-lg object-cover border border-slate-200 shadow-2xs"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80'
                    }}
                  />
                  <div className="text-xs text-slate-600 space-y-1 flex-1">
                    <p className="font-semibold text-slate-800">✓ Đang xem trước hình ảnh Part 1</p>
                    <p className="text-slate-500 text-[11px] break-all">{question.imageUrl}</p>
                    <a
                      href={question.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-brand-600 hover:underline pt-1"
                    >
                      <ExternalLink size={11} /> Mở ảnh trong tab mới
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Chưa có hình ảnh. Bạn có thể dán đường link ảnh bên trên hoặc chọn một trong các ảnh mẫu gợi ý.
                </p>
              )}
            </div>
          )}

          {/* ─── Part 1, 2, 3, 4: Audio Section ─── */}
          {isListening && (
            isListeningGroupPart && !isAudioGroupLeader ? (
              /* Câu hỏi con trong nhóm Part 3 / Part 4: Dùng chung audio chính từ câu đầu nhóm */
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <Headphones size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-950">
                        Sử dụng 1 Audio chính chung từ câu {audioLeaderQuestion?.questionNumber || (audioLeaderQuestion?.originalIndex + 1)}
                        {audioLeaderQuestion?.groupRangeText ? ` — ${audioLeaderQuestion.groupRangeText}` : ''}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Theo cấu trúc đề TOEIC, file audio chính ở câu {audioLeaderQuestion?.questionNumber || (audioLeaderQuestion?.originalIndex + 1)} sẽ đọc toàn bộ đoạn {partNum === 4 ? 'bài nói' : 'hội thoại'} và lần lượt cả 3 câu hỏi. Câu {question.questionNumber || (index + 1)} là câu hỏi con trong nhóm, không cần nhập file audio riêng.
                      </p>
                    </div>
                  </div>

                  {(audioLeaderQuestion?.audioUrl || audioLeaderQuestion?.audioScript) && (
                    <button
                      type="button"
                      onClick={handleTestAudio}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      <Volume2 size={13} className="text-indigo-600" />
                      <span>Nghe audio nhóm (câu {audioLeaderQuestion?.questionNumber || (audioLeaderQuestion?.originalIndex + 1)})</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Câu đầu nhóm Part 3/4 hoặc câu độc lập Part 1/2: Quản lý file Audio chính */
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                    <Headphones size={15} className="text-indigo-600" />
                    <span>
                      {isListeningGroupPart
                        ? `Âm thanh chính của nhóm (${partNum === 4 ? 'Bài nói' : 'Hội thoại'} + 3 câu hỏi)`
                        : 'Âm thanh bài nghe'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Áp dụng cho nhóm 3 câu (Part 3 & 4) */}
                    {isListeningGroupPart && onApplyAudioToGroup && (question.audioUrl || question.audioScript) && (
                      <button
                        type="button"
                        onClick={() => onApplyAudioToGroup(index, 3)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-brand-700 bg-white border border-brand-300 hover:bg-brand-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title="Tự động đồng bộ file audio và kịch bản này cho 3 câu hỏi trong nhóm"
                      >
                        <Layers size={12} /> Đồng bộ audio nhóm 3 câu
                      </button>
                    )}

                    {/* Test Audio Button */}
                    <button
                      type="button"
                      onClick={handleTestAudio}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                        isCurrentPlaying
                          ? 'bg-amber-500 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isCurrentPlaying ? (
                        <>
                          <VolumeX size={14} className="animate-pulse" />
                          <span>Dừng</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={14} />
                          <span>{isListeningGroupPart ? 'Nghe thử audio nhóm' : 'Nghe thử'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {isListeningGroupPart && (
                  <p className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                    💡 <strong>Quy chuẩn TOEIC:</strong> Nhóm 3 câu hỏi này chỉ sử dụng <strong>1 file âm thanh chính duy nhất</strong> để đọc nội dung hội thoại/bài nói và lần lượt 3 câu hỏi. Các câu hỏi tiếp theo trong nhóm sẽ tự động dùng chung audio này.
                  </p>
                )}

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Đường dẫn file âm thanh chính (MP3)
                  </label>
                  <Input
                    type="url"
                    value={question.audioUrl || ''}
                    onChange={(e) => onChange({ ...question, audioUrl: e.target.value })}
                    placeholder="https://actions.google.com/sounds/v1/... hoặc link file MP3"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Lời thoại bài nghe (Transcript):</span>
                    <span className="text-[11px] text-slate-400 font-normal">Lời thoại dùng để phát âm thanh tự động & giải thích</span>
                  </label>
                  <Textarea
                    rows={2}
                    autoResize
                    value={question.audioScript || ''}
                    onChange={(e) => onChange({ ...question, audioScript: e.target.value })}
                    placeholder="Kịch bản hội thoại hoặc câu nói tiếng Anh..."
                  />
                </div>
              </div>
            )
          )}

          {/* ─── Part 6, 7: Đoạn văn đọc hiểu (Passage Text) ─── */}
          {isReadingWithPassage && (
            !isPassageGroupLeader ? (
              /* Câu hỏi con trong nhóm Part 6/7: Dùng chung bài đọc từ câu đầu nhóm */
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-950">
                      Sử dụng chung đoạn văn từ câu {passageLeaderQuestion?.questionNumber || (passageLeaderQuestion?.originalIndex + 1)}
                      {passageLeaderQuestion?.groupRangeText ? ` — ${passageLeaderQuestion.groupRangeText}` : ''}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Đoạn văn đọc hiểu được quản lý tại câu đầu nhóm. Câu {question.questionNumber || (index + 1)} trả lời theo ngữ cảnh bài đọc này.
                    </p>
                  </div>
                </div>
                {passageLeaderQuestion?.passageText && (
                  <div className="text-xs text-slate-700 font-serif line-clamp-3 bg-white/80 p-2.5 rounded-lg border border-amber-100 italic whitespace-pre-line">
                    {passageLeaderQuestion.passageText}
                  </div>
                )}
              </div>
            ) : (
              /* Câu đầu nhóm: Quản lý nội dung đoạn văn */
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <FileText size={15} className="text-amber-700" />
                    <span>
                      Đoạn văn đọc hiểu{' '}
                      {partNum === 6 ? '(Part 6 — 4 câu/bài đọc)' : '(Part 7 — 2-5 câu/bài đọc)'}
                    </span>
                  </div>

                  {onApplyPassageToGroup && question.passageText && (
                    <button
                      type="button"
                      onClick={() => onApplyPassageToGroup(index, partNum === 6 ? 4 : 3)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-white border border-amber-300 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
                      title={`Đồng bộ đoạn văn này cho ${partNum === 6 ? '4' : '3'} câu liên tiếp`}
                    >
                      <Layers size={12} /> Đồng bộ bài đọc nhóm {partNum === 6 ? '4' : '3'} câu
                    </button>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Nội dung đoạn văn đọc hiểu *
                  </label>
                  <Textarea
                    rows={5}
                    autoResize
                    value={question.passageText || ''}
                    onChange={(e) => onChange({ ...question, passageText: e.target.value })}
                    placeholder="Dán nội dung bài báo, email, thông báo, hợp đồng hoặc bảng biểu tại đây..."
                  />
                </div>

                {question.passageText && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-amber-900 uppercase">Xem trước định dạng bài đọc:</span>
                    <div className="rounded-lg bg-white p-3.5 border border-amber-100 text-xs text-slate-800 font-serif leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto custom-scrollbar shadow-2xs">
                      {question.passageText}
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* Câu hỏi chính */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Nội dung câu hỏi *
            </label>
            <Textarea
              rows={2}
              autoResize
              value={question.questionText}
              onChange={(e) => onChange({ ...question, questionText: e.target.value })}
              placeholder={isPart1 ? 'Look at photograph and select the statement that best corresponds with the scene.' : 'VD: What is the main purpose of the announcement?...'}
              required
            />
          </div>

          {/* Đáp án A-B-C-D */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Các phương án lựa chọn:</span>
              <span className="text-emerald-700 font-medium text-[11px]">
                (Nhấn nút tròn để chọn phương án đúng)
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {question.options.map((opt, optIdx) => (
                <div
                  key={optIdx}
                  className={`flex items-center gap-2 rounded-xl p-2.5 border transition-colors ${
                    question.correctIndex === optIdx
                      ? 'border-emerald-300 bg-emerald-50/70 shadow-2xs'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onChange({ ...question, correctIndex: optIdx })}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all cursor-pointer font-bold text-xs ${
                      question.correctIndex === optIdx
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 bg-white text-slate-500 hover:border-slate-400'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </button>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const next = [...question.options]
                      next[optIdx] = e.target.value
                      onChange({ ...question, options: next })
                    }}
                    placeholder={`Đáp án ${String.fromCharCode(65 + optIdx)}`}
                    className="flex-1 bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400"
                  />
                  {question.correctIndex === optIdx && (
                    <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 shrink-0">
                      ĐÚNG
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Lời giải thích & Điểm số */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
            <div className="sm:col-span-9">
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Giải thích đáp án
              </label>
              <Textarea
                rows={2}
                autoResize
                value={question.explanation || ''}
                onChange={(e) => onChange({ ...question, explanation: e.target.value })}
                placeholder="Giải thích chi tiết từ vựng, ngữ pháp hoặc vị trí manh mối trong bài đọc..."
              />
            </div>
            <div className="sm:col-span-3">
              <label className="mb-1 block text-xs font-bold text-slate-700">Điểm số câu hỏi</label>
              <Input
                type="number"
                min={1}
                max={100}
                value={question.point ?? 5}
                onChange={(e) => onChange({ ...question, point: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ExamFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isEditing = Boolean(id)
  const audioEngine = useTwoLayerAudio()

  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'TOEIC_FULL',
    cefrLevel: 'B2',
    durationMinutes: 120,
    passingScore: 550,
    xpReward: 150,
    status: 'published',
  })

  const [questions, setQuestions] = useState([])
  const [expandedMap, setExpandedMap] = useState({ 0: true })
  const [selectedPartFilter, setSelectedPartFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Load existing exam if editing
  useEffect(() => {
    if (!isEditing) return

    let isMounted = true
    setIsLoading(true)

    getExamById(id)
      .then((data) => {
        if (!isMounted || !data) return
        setForm({
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'TOEIC_FULL',
          cefrLevel: data.cefrLevel || 'B2',
          durationMinutes: data.durationMinutes ?? 120,
          passingScore: data.passingScore ?? 550,
          xpReward: data.xpReward ?? 150,
          status: data.status || 'published',
        })

        if (Array.isArray(data.questions) && data.questions.length > 0) {
          const mapped = data.questions.map((q, idx) => {
            const rawOpts = Array.isArray(q.options) ? q.options : ['', '', '', '']
            const cleanOpts = rawOpts.map((opt) => {
              if (typeof opt === 'object' && opt !== null) return opt.text || ''
              return String(opt).replace(/^[A-D]\.\s*/, '')
            })
            while (cleanOpts.length < 4) cleanOpts.push('')

            let cIdx = 0
            if (q.correctAnswer) {
              const letterIdx = ['A', 'B', 'C', 'D'].indexOf(String(q.correctAnswer).trim().toUpperCase())
              if (letterIdx >= 0) cIdx = letterIdx
            }

            // Suy luận part mặc định nếu chưa có
            const inferredPart = q.part ? Number(q.part) : (idx < 6 ? 1 : idx < 31 ? 2 : idx < 70 ? 3 : idx < 100 ? 4 : idx < 130 ? 5 : idx < 146 ? 6 : 7)

            return {
              id: q.id || `q-${idx + 1}`,
              questionNumber: q.questionNumber || idx + 1,
              part: inferredPart,
              partName: q.partName || `Part ${inferredPart}`,
              partTitle: q.partTitle || '',
              questionText: q.questionText || q.question || '',
              options: cleanOpts.slice(0, 4),
              correctIndex: cIdx,
              explanation: q.explanation || q.explanationVi || '',
              point: q.point ?? 5,
              imageUrl: q.imageUrl || '',
              audioUrl: q.audioUrl || '',
              audioScript: q.audioScript || '',
              passageText: q.passageText || '',
              groupRangeText: q.groupRangeText || '',
              groupAudioBadge: q.groupAudioBadge || '',
            }
          })
          setQuestions(mapped)
          setExpandedMap({ 0: true })
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải chi tiết bài thi:', err)
        toast.error('Không tìm thấy thông tin bài thi')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id, isEditing])

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const toggleQuestion = (idx) => {
    setExpandedMap((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }))
  }

  const expandAll = () => {
    const nextMap = {}
    questions.forEach((_, i) => {
      nextMap[i] = true
    })
    setExpandedMap(nextMap)
  }

  const collapseAll = () => {
    setExpandedMap({})
  }

  const addQuestion = () => {
    if (questions.length >= 200) {
      toast.error('Tối đa 200 câu hỏi')
      return
    }
    const newIdx = questions.length
    const currentPart = selectedPartFilter !== 'ALL' ? Number(selectedPartFilter) : 5
    setQuestions((prev) => [...prev, { ...EMPTY_QUESTION, part: currentPart }])
    setExpandedMap((prev) => ({ ...prev, [newIdx]: true }))
  }

  const handleApplyAudioToGroup = (startIndex, count = 3) => {
    const sourceQ = questions[startIndex]
    if (!sourceQ) return
    const sNum = sourceQ.questionNumber || startIndex + 1
    const endNum = sNum + count - 1
    const defaultGroupText = `Questions ${sNum}-${endNum} refer to the following ${
      Number(sourceQ.part) === 4 ? 'talk' : 'conversation'
    }`

    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i >= startIndex && i < startIndex + count) {
          return {
            ...q,
            audioUrl: sourceQ.audioUrl || q.audioUrl,
            audioScript: sourceQ.audioScript || q.audioScript,
            groupAudioBadge: sourceQ.groupAudioBadge || q.groupAudioBadge,
            groupRangeText: sourceQ.groupRangeText || defaultGroupText,
          }
        }
        return q
      })
    )
    toast.success(`Đã áp dụng âm thanh & kịch bản cho nhóm ${count} câu (${sNum} - ${endNum})!`)
  }

  const handleApplyPassageToGroup = (startIndex, count = 4) => {
    const sourceQ = questions[startIndex]
    if (!sourceQ) return
    const sNum = sourceQ.questionNumber || startIndex + 1
    const endNum = sNum + count - 1
    const defaultGroupText = `Questions ${sNum}-${endNum} refer to the following text`

    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i >= startIndex && i < startIndex + count) {
          return {
            ...q,
            passageText: sourceQ.passageText || q.passageText,
            groupAudioBadge: sourceQ.groupAudioBadge || q.groupAudioBadge,
            groupRangeText: sourceQ.groupRangeText || defaultGroupText,
          }
        }
        return q
      })
    )
    toast.success(`Đã áp dụng đoạn văn đọc hiểu cho nhóm ${count} câu (${sNum} - ${endNum})!`)
  }

  // Pre-calculate group leadership and shared context
  const questionsWithGroupInfo = useMemo(() => {
    let audioLeader = null
    let passageLeader = null

    return questions.map((q, idx) => {
      const partNum = Number(q.part) || 1
      const qNum = Number(q.questionNumber) || idx + 1
      const prevQ = idx > 0 ? questions[idx - 1] : null
      const prevPart = prevQ ? Number(prevQ.part) : null

      // Audio leader detection (Part 3 & 4)
      let isAudioLead = true
      if (partNum === 3 || partNum === 4) {
        if (
          partNum !== prevPart ||
          idx === 0 ||
          (q.groupRangeText && q.groupRangeText !== prevQ?.groupRangeText) ||
          (q.audioUrl && q.audioUrl !== prevQ?.audioUrl) ||
          (partNum === 3 && (qNum - 32) % 3 === 0) ||
          (partNum === 4 && (qNum - 71) % 3 === 0)
        ) {
          isAudioLead = true
          audioLeader = q
        } else {
          isAudioLead = false
        }
      } else {
        isAudioLead = true
        audioLeader = q
      }

      // Passage leader detection (Part 6 & 7)
      let isPassageLead = true
      if (partNum === 6 || partNum === 7) {
        if (
          partNum !== prevPart ||
          idx === 0 ||
          (q.groupRangeText && q.groupRangeText !== prevQ?.groupRangeText) ||
          (q.passageText && q.passageText !== prevQ?.passageText) ||
          (partNum === 6 && (qNum - 131) % 4 === 0)
        ) {
          isPassageLead = true
          passageLeader = q
        } else {
          isPassageLead = false
        }
      } else {
        isPassageLead = true
        passageLeader = q
      }

      return {
        ...q,
        originalIndex: idx,
        isAudioGroupLeader: isAudioLead,
        audioLeaderQuestion: audioLeader,
        isPassageGroupLeader: isPassageLead,
        passageLeaderQuestion: passageLeader,
      }
    })
  }, [questions])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tên đề thi')
      return
    }

    setIsSaving(true)
    try {
      const formattedQuestions = questionsWithGroupInfo
        .filter((q) => q.questionText?.trim() || q.imageUrl || q.passageText || q.passageLeaderQuestion?.passageText)
        .map((q, idx) => ({
          id: q.id || idx + 1,
          questionNumber: idx + 1,
          part: q.part ? Number(q.part) : (idx < 6 ? 1 : idx < 31 ? 2 : idx < 70 ? 3 : idx < 100 ? 4 : idx < 130 ? 5 : idx < 146 ? 6 : 7),
          partName: q.partName || `Part ${q.part || 1}`,
          partTitle: q.partTitle || '',
          questionText: (q.questionText || '').trim(),
          options: q.options.map((opt, i) => ({
            id: String.fromCharCode(65 + i),
            label: String.fromCharCode(65 + i),
            key: String.fromCharCode(65 + i),
            text: opt.trim(),
          })),
          correctAnswer: String.fromCharCode(65 + (q.correctIndex || 0)),
          explanation: q.explanation?.trim() || '',
          explanationVi: q.explanation?.trim() || '',
          point: q.point ? Number(q.point) : 5,
          imageUrl: q.imageUrl?.trim() || null,
          audioUrl: q.audioUrl?.trim() || q.audioLeaderQuestion?.audioUrl?.trim() || null,
          audioScript: q.audioScript?.trim() || q.audioLeaderQuestion?.audioScript?.trim() || null,
          passageText: q.passageText?.trim() || q.passageLeaderQuestion?.passageText?.trim() || null,
          groupRangeText: q.groupRangeText || q.audioLeaderQuestion?.groupRangeText || q.passageLeaderQuestion?.groupRangeText || null,
          groupAudioBadge: q.groupAudioBadge || q.audioLeaderQuestion?.groupAudioBadge || q.passageLeaderQuestion?.groupAudioBadge || null,
        }))

      const payload = {
        title: form.title.trim(),
        description: form.description?.trim() || '',
        category: form.category || 'TOEIC_FULL',
        cefrLevel: form.cefrLevel || 'B2',
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : 120,
        totalQuestions: formattedQuestions.length,
        passingScore: form.passingScore ? Number(form.passingScore) : 0,
        xpReward: form.xpReward ? Number(form.xpReward) : 150,
        questions: formattedQuestions,
        status: form.status || 'published',
        authorName: user?.displayName || 'Quản trị viên Hệ thống',
        authorEmail: user?.email || 'admin@smartenglish.vn',
      }

      if (isEditing) {
        await updateExam(id, payload)
        toast.success(`Đã cập nhật bài thi "${payload.title}"`)
      } else {
        await createExam(payload)
        toast.success(`Đã tạo bài thi "${payload.title}" thành công!`)
      }
      navigate('/app/hoc-lieu/bai-kiem-tra')
    } catch (err) {
      console.error(err)
      toast.error('Lưu bài thi thất bại: ' + (err.message || ''))
    } finally {
      setIsSaving(false)
    }
  }

  // Count questions by part
  const partCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }
    questions.forEach((q, idx) => {
      const p = Number(q.part) || (idx < 6 ? 1 : idx < 31 ? 2 : idx < 70 ? 3 : idx < 100 ? 4 : idx < 130 ? 5 : idx < 146 ? 6 : 7)
      if (counts[p] !== undefined) counts[p]++
    })
    return counts
  }, [questions])

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner text="Đang tải dữ liệu bài thi..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/app/hoc-lieu/bai-kiem-tra"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEditing ? 'Chỉnh sửa bài thi TOEIC / Kiểm tra' : 'Tạo bài thi / Kiểm tra mới'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? `Cập nhật thông tin, hình ảnh Part 1, âm thanh và đoạn văn Part 6, 7 cho đề thi #${id}`
                : 'Thêm mới đề thi chuẩn hóa TOEIC 200 câu hoặc bài kiểm tra định kỳ'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/app/hoc-lieu/bai-kiem-tra"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Hủy bỏ
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Save size={14} />
            <span>{isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo bài thi'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-6">
          {/* Card 1: Thông tin chung bài thi */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-xs font-bold">1</span>
              Thông tin cấu hình bài thi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tên bài thi *</label>
                <Input
                  value={form.title}
                  onChange={set('title')}
                  placeholder="VD: ETS TOEIC 2024 - Test 03"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Thể loại bài thi</label>
                <Select value={form.category} onChange={set('category')}>
                  {EXAM_CATEGORIES.filter((c) => c.value !== 'ALL').map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Cấp độ CEFR</label>
                <Select value={form.cefrLevel} onChange={set('cefrLevel')}>
                  {CEFR_LEVELS.map((l) => (
                    <option key={l} value={l}>Cấp độ {l}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Thời gian làm bài (phút)</label>
                <Input
                  type="number"
                  min={1}
                  max={300}
                  value={form.durationMinutes}
                  onChange={set('durationMinutes')}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Điểm đạt yêu cầu</label>
                <Input
                  type="number"
                  min={0}
                  value={form.passingScore}
                  onChange={set('passingScore')}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Điểm thưởng (XP)</label>
                <Input
                  type="number"
                  min={0}
                  max={1000}
                  value={form.xpReward}
                  onChange={set('xpReward')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Mô tả bài thi</label>
                <Textarea
                  rows={2}
                  autoResize
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Mô tả tóm tắt nội dung, cấu trúc và đối tượng bài thi..."
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Trạng thái đề thi</label>
                <Select value={form.status} onChange={set('status')}>
                  <option value="published">Đang hoạt động</option>
                  <option value="draft">Bản nháp</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Card 2: Danh sách câu hỏi */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">2</span>
                <h3 className="text-sm font-bold text-slate-800">
                  Danh sách câu hỏi bài thi
                </h3>
                <span className="ml-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {questions.length} câu hỏi
                </span>
              </div>

              <div className="flex items-center gap-2">
                {questions.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={expandAll}
                      className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      <Eye size={13} /> Mở tất cả
                    </button>
                    <button
                      type="button"
                      onClick={collapseAll}
                      className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      <EyeOff size={13} /> Thu gọn tất cả
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
                >
                  <Plus size={14} /> Thêm câu hỏi
                </button>
              </div>
            </div>

            {/* Part Counts & Filters */}
            {questions.length > 0 && (
              <div className="space-y-3 pt-1">
                {/* Search & Quick Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-80">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm câu hỏi, số thứ tự, bài đọc..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 w-full sm:w-auto justify-end">
                    <span>
                      Đang hiển thị{' '}
                      <strong className="text-slate-800">
                        {
                          questions.filter((q, i) => {
                            if (selectedPartFilter !== 'ALL' && Number(q.part) !== Number(selectedPartFilter)) return false
                            if (searchQuery.trim()) {
                              const numStr = String(q.questionNumber || i + 1)
                              const query = searchQuery.toLowerCase().trim()
                              return (
                                numStr === query ||
                                numStr.includes(query) ||
                                (q.questionText || '').toLowerCase().includes(query) ||
                                (q.passageText || '').toLowerCase().includes(query)
                              )
                            }
                            return true
                          }).length
                        }
                      </strong>{' '}
                      / {questions.length} câu
                    </span>
                  </div>
                </div>

                {/* Part Filter Pills */}
                <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPartFilter('ALL')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      selectedPartFilter === 'ALL'
                        ? 'bg-navy-800 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Tất cả ({questions.length})
                  </button>
                  {[
                    { p: 1, label: 'Part 1: Ảnh', icon: ImageIcon },
                    { p: 2, label: 'Part 2: Hỏi-Đáp', icon: Headphones },
                    { p: 3, label: 'Part 3: Hội thoại', icon: Headphones },
                    { p: 4, label: 'Part 4: Bài nói', icon: Headphones },
                    { p: 5, label: 'Part 5: Điền câu', icon: FileText },
                    { p: 6, label: 'Part 6: Điền đoạn', icon: FileText },
                    { p: 7, label: 'Part 7: Đọc hiểu', icon: FileText },
                  ].map(({ p, label, icon: Icon }) => {
                    const count = partCounts[p] || 0
                    const isActive = selectedPartFilter === p
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSelectedPartFilter(p)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-brand-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Icon size={12} />
                        <span>{label}</span>
                        <span className={`text-[10px] px-1 rounded ${isActive ? 'bg-white/20' : 'bg-slate-200 text-slate-600'}`}>
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {questions.length === 0 ? (
              <div
                onClick={addQuestion}
                className="flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-slate-200 py-12 text-center hover:border-brand-300 hover:bg-brand-50/30 transition-colors cursor-pointer"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Plus size={20} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Chưa có câu hỏi nào trong đề thi</p>
                  <p className="text-xs text-slate-400 mt-0.5">Nhấn để thêm câu hỏi trắc nghiệm A-B-C-D</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {questionsWithGroupInfo
                  .filter((q) => {
                    if (selectedPartFilter !== 'ALL' && Number(q.part) !== Number(selectedPartFilter)) return false
                    if (searchQuery.trim()) {
                      const numStr = String(q.questionNumber || q.originalIndex + 1)
                      const query = searchQuery.toLowerCase().trim()
                      return (
                        numStr === query ||
                        numStr.includes(query) ||
                        (q.questionText || '').toLowerCase().includes(query) ||
                        (q.passageText || '').toLowerCase().includes(query)
                      )
                    }
                    return true
                  })
                  .map((q, filteredIdx, filteredArr) => {
                    const idx = q.originalIndex
                    const prevQ = idx > 0 ? questions[idx - 1] : null
                    const partNum = Number(q.part) || 1
                    const qNum = Number(q.questionNumber) || idx + 1

                    // Detect cluster start for Listening (Part 3 & 4)
                    const isNewAudioGroup =
                      (partNum === 3 || partNum === 4) &&
                      (filteredIdx === 0 ||
                        (q.groupRangeText && q.groupRangeText !== filteredArr[filteredIdx - 1]?.groupRangeText) ||
                        (q.audioUrl && q.audioUrl !== filteredArr[filteredIdx - 1]?.audioUrl) ||
                        (partNum === 3 && (qNum - 32) % 3 === 0) ||
                        (partNum === 4 && (qNum - 71) % 3 === 0))

                    // Detect cluster start for Reading (Part 6 & 7)
                    const isNewPassageGroup =
                      (partNum === 6 || partNum === 7) &&
                      (filteredIdx === 0 ||
                        (q.groupRangeText && q.groupRangeText !== filteredArr[filteredIdx - 1]?.groupRangeText) ||
                        (q.passageText && q.passageText !== filteredArr[filteredIdx - 1]?.passageText) ||
                        (partNum === 6 && (qNum - 131) % 4 === 0))

                    return (
                      <div key={idx} className="space-y-2">
                        {isNewAudioGroup && (
                          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-900 font-semibold shadow-2xs mt-3 mb-1">
                            <div className="flex items-center gap-2">
                              <Headphones size={15} className="text-indigo-600 shrink-0" />
                              <span>
                                {q.groupRangeText ||
                                  `Nhóm bài nghe Part ${partNum} (Câu ${qNum} – ${qNum + 2})`}
                              </span>
                              {q.groupAudioBadge && (
                                <span className="text-[11px] font-normal text-indigo-600 bg-white/90 px-2 py-0.5 rounded-md border border-indigo-200">
                                  {q.groupAudioBadge}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {(q.audioUrl || q.audioScript) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const fallback = q.audioScript || 'Đoạn nghe nhóm ' + qNum
                                    audioEngine.play(`group-banner-${idx}`, { audioUrl: q.audioUrl, fallbackText: fallback })
                                  }}
                                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer border ${
                                    audioEngine.playingId === `group-banner-${idx}`
                                      ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
                                      : 'bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200'
                                  }`}
                                >
                                  {audioEngine.playingId === `group-banner-${idx}` ? (
                                    <>
                                      <VolumeX size={13} />
                                      <span>Dừng</span>
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 size={13} className="text-indigo-600" />
                                      <span>Nghe</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {isNewPassageGroup && (
                          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 font-semibold shadow-2xs mt-3 mb-1">
                            <div className="flex items-center gap-2">
                              <FileText size={15} className="text-amber-700 shrink-0" />
                              <span>
                                {q.groupRangeText ||
                                  `Nhóm bài đọc Part ${partNum} (Câu ${qNum} – ${
                                    qNum + (partNum === 6 ? 3 : 2)
                                  })`}
                              </span>
                              {q.groupAudioBadge && (
                                <span className="text-[11px] font-normal text-amber-700 bg-white/90 px-2 py-0.5 rounded-md border border-amber-200">
                                  {q.groupAudioBadge}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-medium text-amber-600">
                              Chung 1 đoạn văn ({partNum === 6 ? '4 câu hỏi' : 'nhóm câu'})
                            </span>
                          </div>
                        )}

                        <QuestionCard
                          question={q}
                          index={idx}
                          isOpen={Boolean(expandedMap[idx])}
                          onToggle={() => toggleQuestion(idx)}
                          onChange={(updated) =>
                            setQuestions((prev) => prev.map((x, i) => (i === idx ? updated : x)))
                          }
                          onRemove={() => {
                            setQuestions((prev) => prev.filter((_, i) => i !== idx))
                            setExpandedMap((prev) => {
                              const copy = { ...prev }
                              delete copy[idx]
                              return copy
                            })
                          }}
                          audioEngine={audioEngine}
                          prevQuestion={prevQ}
                          onApplyAudioToGroup={handleApplyAudioToGroup}
                          onApplyPassageToGroup={handleApplyPassageToGroup}
                          isAudioGroupLeader={q.isAudioGroupLeader}
                          audioLeaderQuestion={q.audioLeaderQuestion}
                          isPassageGroupLeader={q.isPassageGroupLeader}
                          passageLeaderQuestion={q.passageLeaderQuestion}
                        />
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
