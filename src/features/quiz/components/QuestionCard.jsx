import React from 'react'
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Copy,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  FileText,
  Headphones,
  Radio,
  Image as ImageIcon,
  Check,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { PART_NAMES, SAMPLE_PART1_IMAGES } from '../examConstants'

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

export default QuestionCard
