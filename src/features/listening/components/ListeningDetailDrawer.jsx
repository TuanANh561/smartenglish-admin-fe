import { useEffect, useMemo, useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  HelpCircle,
  ImageIcon,
  Languages,
  Lock,
  Pencil,
  Play,
  RotateCcw,
  RotateCw,
  Send,
  Sparkles,
  Volume2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTime, parseDuration } from '@/lib/ipaHelper'

const CATEGORY_MAP = {
  TOEIC_PART_1: { label: 'Part 1: Mô tả tranh (Photographs)', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  TOEIC_PART_2: { label: 'Part 2: Hỏi & Đáp (Question - Response)', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
  TOEIC_PART_3: { label: 'Part 3: Đoạn hội thoại (Conversations)', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  TOEIC_PART_4: { label: 'Part 4: Bài nói ngắn (Short Talks)', bg: 'bg-purple-50 text-purple-800 border-purple-200' },
  CONVERSATION: { label: 'Hội thoại giao tiếp', bg: 'bg-teal-50 text-teal-800 border-teal-200' },
  SHORT_TALK: { label: 'Bài nói theo chủ đề', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  NEWS_PODCAST: { label: 'Tin tức & Podcast', bg: 'bg-rose-50 text-rose-800 border-rose-200' },
  DICTATION: { label: 'Chép chính tả chuyên sâu', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
}

export default function ListeningDetailDrawer({
  lesson,
  onClose,
  isOwner,
  canManage,
  isTeacher,
  isPlaying,
  currentTime = 0,
  onPlayToggle,
  onSeek,
  onAssignToClass,
  onEditClick,
}) {
  const [scriptMode, setScriptMode] = useState('bilingual') // 'bilingual', 'english', 'hidden'
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0)
  const [questionViewMode, setQuestionViewMode] = useState('single') // 'single' | 'all'

  // Reset về câu đầu tiên khi mở bài nghe mới
  useEffect(() => {
    setActiveQuestionIdx(0)
  }, [lesson?.id])

  const totalDuration = useMemo(() => parseDuration(lesson?.duration), [lesson?.duration])
  const effectiveDuration = Math.max(totalDuration, currentTime || 0)
  const safeCurrentTime = isPlaying ? Math.max(0, currentTime) : 0
  const remainingTime = Math.max(0, effectiveDuration - safeCurrentTime)
  const progressPercent = effectiveDuration > 0 ? Math.min(100, (safeCurrentTime / effectiveDuration) * 100) : 0

  // Kiểm tra xem bài nghe có file audio thực tế từ Backend hay không (loại bỏ trường hợp nhầm link ảnh)
  const hasAudio = Boolean(
    lesson?.audioUrl &&
      String(lesson.audioUrl).trim().length > 0 &&
      !String(lesson.audioUrl).match(/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i),
  )
  const categoryInfo = CATEGORY_MAP[lesson?.category] || {
    label: lesson?.category || 'Luyện nghe',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
  }

  // Tác giả hiển thị thân thiện (không dùng từ ngữ kỹ thuật)
  const authorDisplay =
    lesson?.authorEmail === 'system@smartenglish.vn' || lesson?.authorName?.includes('Hệ thống')
      ? 'SmartEnglish'
      : lesson?.authorName || 'Giáo viên'

  const handleProgressBarClick = (e) => {
    if (!hasAudio) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const ratio = Math.max(0, Math.min(1, clickX / rect.width))
    const target = Math.floor(ratio * totalDuration)
    onSeek?.(target)
  }

  const handleSkip = (seconds) => {
    if (!hasAudio) return
    onSeek?.(safeCurrentTime + seconds)
  }

  // Lập bản đồ màu sắc cố định theo từng người nói (không đổi màu lung tung qua mỗi dòng)
  const getSpeakerBadgeStyle = (speaker) => {
    const s = (speaker || '').toUpperCase()
    if (s.startsWith('(') || ['A', 'B', 'C', 'D'].includes(s)) {
      return 'bg-amber-100 text-amber-900 border-amber-200'
    }
    if (s.includes('NARRATOR')) {
      return 'bg-purple-100 text-purple-900 border-purple-200'
    }
    if (s.includes('QUESTION')) {
      return 'bg-sky-100 text-sky-900 border-sky-200'
    }
    // Gán màu cố định và duy nhất cho từng tên người nói dựa trên mã băm
    const colors = [
      'bg-blue-100 text-blue-900 border-blue-200',
      'bg-emerald-100 text-emerald-900 border-emerald-200',
      'bg-indigo-100 text-indigo-900 border-indigo-200',
      'bg-teal-100 text-teal-900 border-teal-200',
      'bg-rose-100 text-rose-900 border-rose-200',
    ]
    let hash = 0
    for (let i = 0; i < s.length; i++) {
      hash = (hash << 5) - hash + s.charCodeAt(i)
      hash |= 0
    }
    return colors[Math.abs(hash) % colors.length]
  }

  // Lấy danh sách câu thoại có timestamp hoặc tự động bóc tách từ transcript thô
  const parsedTranscripts = useMemo(() => {
    let rawList = []
    if (Array.isArray(lesson?.syncedTranscripts) && lesson.syncedTranscripts.length > 0) {
      rawList = lesson.syncedTranscripts
    } else if (lesson?.transcript) {
      rawList = lesson.transcript
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, idx) => {
          const match = line.match(/^([A-Za-z0-9\s]+):\s*(.+)$/)
          return {
            startMs: idx * 4000,
            endMs: (idx + 1) * 4000,
            speaker: match ? match[1].trim() : `Đoạn ${idx + 1}`,
            text: match ? match[2].trim() : line,
            textVi: '',
          }
        })
    }

    // Chuẩn hóa: Nếu nội dung bắt đầu bằng (A), (B), (C), (D) -> tự động chuyển thành nhãn phương án
    return rawList.map((item) => {
      const optMatch = item.text?.match(/^(\([A-D1-4]\)|[A-D]\.)\s*(.+)$/i)
      if (optMatch) {
        const rawOpt = optMatch[1].replace(/[().]/g, '').toUpperCase()
        return {
          ...item,
          speaker: `(${rawOpt})`,
          text: optMatch[2].trim(),
          textVi: item.textVi ? item.textVi.replace(/^(\([A-D1-4]\)|[A-D]\.)\s*/i, '') : '',
        }
      }
      return item
    })
  }, [lesson])

  const questionsList = useMemo(() => {
    if (!Array.isArray(lesson?.questions)) return []
    return lesson.questions
  }, [lesson?.questions])

  const currentQuestion = questionsList[activeQuestionIdx] || questionsList[0]

  if (!lesson) return null

  return (
    <Drawer open={Boolean(lesson)} onClose={onClose} title={lesson?.title} size="2xl">
      <div className="space-y-4">
        {/* Badges thông tin bài nghe gọn gàng, thân thiện */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className={cn('inline-flex items-center rounded-lg px-2.5 py-1 font-bold border shadow-2xs', categoryInfo.bg)}>
            {categoryInfo.label}
          </span>
          <Badge tone="info">Cấp độ {lesson.level || lesson.cefrLevel || 'B1'}</Badge>
          <Badge tone="neutral">{lesson.topic || 'Tổng hợp'}</Badge>
          <Badge tone="neutral">{lesson.accent || 'US Accent'}</Badge>
          {hasAudio ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 border border-emerald-200">
              <Volume2 size={12} /> Có sẵn file audio
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700 border border-indigo-200">
              <Sparkles size={12} /> Giọng đọc AI
            </span>
          )}
          <Badge tone={isOwner ? 'success' : 'neutral'}>Tác giả: {authorDisplay}</Badge>
        </div>

        {/* ─── Trình phát âm thanh TRÀN NGANG (Full Width) ─── */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/90 to-slate-100/70 p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => onPlayToggle(e, lesson)}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-2xl shadow-xs transition-all duration-200 cursor-pointer',
                  isPlaying
                    ? 'bg-brand-500 text-white shadow-brand-200 shadow-md ring-4 ring-brand-100 animate-pulse'
                    : 'bg-navy-800 text-white hover:bg-navy-900 hover:scale-102',
                )}
                title={isPlaying ? 'Tạm dừng audio' : 'Phát audio'}
              >
                {isPlaying ? <Volume2 size={22} /> : <Play size={22} className="ml-1" />}
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-bold text-slate-900">
                    {isPlaying ? 'Đang phát bài nghe...' : 'Bài nghe Audio'}
                  </h5>
                  {isPlaying && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      PHÁT
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thời lượng: <strong>{lesson.duration || '01:00'}</strong> · {hasAudio ? 'Âm thanh chuẩn' : 'Giọng đọc AI'}
                </p>
              </div>
            </div>

            {/* Nút tua 10 giây (CHỈ hiển thị khi có file audio thực tế từ Backend) */}
            {hasAudio && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSkip(-10)}
                  className="flex items-center gap-0.5 rounded-lg px-2.5 py-1 text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-2xs transition-colors"
                  title="Tua lùi 10 giây"
                >
                  <RotateCcw size={12} /> -10s
                </button>
                <button
                  type="button"
                  onClick={() => handleSkip(10)}
                  className="flex items-center gap-0.5 rounded-lg px-2.5 py-1 text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-2xs transition-colors"
                  title="Tua tới 10 giây"
                >
                  <RotateCw size={12} /> +10s
                </button>
              </div>
            )}
          </div>

          {/* Thanh tiến độ phát */}
          <div className="space-y-1.5 pt-1">
            <div
              onClick={handleProgressBarClick}
              className={cn(
                'group relative h-2 w-full rounded-full bg-slate-200 transition-all',
                hasAudio ? 'cursor-pointer hover:h-2.5' : 'cursor-default',
              )}
              title={hasAudio ? 'Bấm để tua nhanh' : 'Tiến trình phát'}
            >
              <div
                className="relative h-full rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 transition-[width] duration-300 ease-linear"
                style={{ width: `${progressPercent}%` }}
              >
                {hasAudio && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white border-2 border-brand-600 shadow-md transition-transform group-hover:scale-125" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-0.5">
              <span className="font-mono text-slate-700 font-bold">{formatTime(currentTime)}</span>
              {hasAudio && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Còn lại:</span>
                  <span className="font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100 shadow-2xs">
                    -{formatTime(remainingTime)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── BỐ CỤC 2 CỘT CÂN ĐỐI (TRÁI: KỊCH BẢN & ẢNH - PHẢI: BỘ CÂU HỎI & MÔ TẢ) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* CỘT TRÁI (6/12): Ảnh đề bài (nếu có) + Bản chép lời bài nghe */}
          <div className="lg:col-span-6 space-y-4">
            {/* TOEIC Part 1: Bức ảnh quan sát đề thi */}
            {lesson.imageUrl && (
              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <ImageIcon size={14} className="text-amber-600" />
                    Hình ảnh đề bài (Part 1)
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">Quan sát tranh đối chiếu</span>
                </div>
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900 max-h-56 flex items-center justify-center">
                  <img
                    src={lesson.imageUrl}
                    alt={lesson.title}
                    className="max-h-56 w-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Bản chép lời bài nghe (Audio Script) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Languages size={15} className="text-brand-600" />
                  Bản chép lời (Audio Script)
                </h4>

                {/* Chuyển đổi chế độ xem: Song ngữ / Tiếng Anh / Ẩn kịch bản */}
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setScriptMode('bilingual')}
                    className={cn(
                      'rounded-md px-2 py-0.5 font-semibold transition-all cursor-pointer',
                      scriptMode === 'bilingual' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900',
                    )}
                    title="Hiển thị cả tiếng Anh và bản dịch tiếng Việt"
                  >
                    Song ngữ
                  </button>
                  <button
                    type="button"
                    onClick={() => setScriptMode('english')}
                    className={cn(
                      'rounded-md px-2 py-0.5 font-semibold transition-all cursor-pointer',
                      scriptMode === 'english' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900',
                    )}
                    title="Chỉ hiển thị tiếng Anh chuẩn"
                  >
                    Tiếng Anh
                  </button>
                  <button
                    type="button"
                    onClick={() => setScriptMode('hidden')}
                    className={cn(
                      'rounded-md px-2 py-0.5 font-semibold transition-all cursor-pointer',
                      scriptMode === 'hidden' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900',
                    )}
                    title="Ẩn kịch bản để tập trung nghe"
                  >
                    Ẩn script
                  </button>
                </div>
              </div>

              {/* Danh sách lời thoại */}
              {scriptMode === 'hidden' ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-xs text-slate-500 space-y-1">
                  <EyeOff size={18} className="mx-auto text-slate-400 mb-1" />
                  <p className="font-semibold text-slate-700">Đã ẩn bản chép lời</p>
                  <p className="text-[11px] text-slate-400">
                    Hãy lắng nghe audio và suy luận đáp án để rèn luyện phản xạ như khi đi thi thật.
                  </p>
                </div>
              ) : parsedTranscripts.length > 0 ? (
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {parsedTranscripts.map((item, idx) => {
                    const isCurrentSpeaking =
                      isPlaying &&
                      currentTime >= item.startMs / 1000 &&
                      currentTime <= item.endMs / 1000

                    const prevItem = idx > 0 ? parsedTranscripts[idx - 1] : null
                    const isOption = item.speaker?.startsWith('(') || ['A', 'B', 'C', 'D'].includes(item.speaker)
                    const isSameSpeaker = !isOption && prevItem && prevItem.speaker === item.speaker

                    return (
                      <div
                        key={idx}
                        className={cn(
                          'rounded-xl p-2.5 text-xs transition-colors space-y-1',
                          isCurrentSpeaking
                            ? 'bg-brand-50/90 border border-brand-200 shadow-2xs'
                            : 'hover:bg-slate-50/80',
                        )}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Người nói / Phương án lựa chọn (Không lặp lại nếu cùng 1 người nói liên tiếp) */}
                          {isSameSpeaker ? (
                            <div className="w-12 shrink-0 flex items-center justify-center pt-1" title={`Tiếp tục: ${item.speaker}`}>
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                            </div>
                          ) : (
                            <span
                              className={cn(
                                'shrink-0 rounded-md px-1.5 py-0.5 font-bold text-[10px] border shadow-2xs text-center min-w-8',
                                getSpeakerBadgeStyle(item.speaker),
                              )}
                            >
                              {item.speaker || 'Speaker'}
                            </span>
                          )}

                          {/* Câu thoại tiếng Anh */}
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-slate-800 font-medium leading-relaxed', isCurrentSpeaking && 'text-brand-900 font-bold')}>
                              {item.text}
                            </p>

                            {/* Bản dịch tiếng Việt nếu chọn chế độ Song ngữ */}
                            {scriptMode === 'bilingual' && item.textVi && (
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed italic">
                                {item.textVi}
                              </p>
                            )}
                          </div>

                          {/* Timestamp (bấm vào để tua nhanh tới câu này) */}
                          {hasAudio && (
                            <button
                              type="button"
                              onClick={() => onSeek?.(Math.floor(item.startMs / 1000))}
                              className="shrink-0 text-[10px] font-mono text-slate-400 hover:text-brand-600 hover:underline pt-0.5 cursor-pointer"
                              title="Tua đến đoạn này"
                            >
                              {formatTime(item.startMs / 1000)}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  Chưa có bản chép lời cho bài nghe này.
                </p>
              )}
            </div>
          </div>

          {/* CỘT PHẢI (6/12): Mô tả bài học & Bộ câu hỏi trắc nghiệm thông minh */}
          <div className="lg:col-span-6 space-y-4">
            {/* Lời dẫn / Mô tả bài nghe */}
            {lesson.description && (
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3.5 space-y-1">
                <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Mô tả bài học</h4>
                <p className="text-xs leading-relaxed text-slate-700">
                  {lesson.description}
                </p>
              </div>
            )}

            {/* Bộ câu hỏi trắc nghiệm nghe hiểu (Questions) */}
            {questionsList.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3.5">
                {/* Header bộ câu hỏi kèm Tabs chọn câu hỏi nhanh */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle size={15} className="text-brand-600" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Câu hỏi luyện tập ({questionsList.length} câu)
                    </h4>
                  </div>

                  {/* Nút điều hướng nhanh giữa các câu hỏi nếu có nhiều hơn 1 câu */}
                  {questionsList.length > 1 && (
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        {questionsList.map((_, qIdx) => (
                          <button
                            key={qIdx}
                            type="button"
                            onClick={() => {
                              setActiveQuestionIdx(qIdx)
                              setQuestionViewMode('single')
                            }}
                            className={cn(
                              'h-6 min-w-6 px-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer',
                              questionViewMode === 'single' && activeQuestionIdx === qIdx
                                ? 'bg-navy-800 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white',
                            )}
                            title={`Xem câu số ${qIdx + 1}`}
                          >
                            {qIdx + 1}
                          </button>
                        ))}
                      </div>

                      {/* Chế độ xem: Từng câu vs Xem hết */}
                      <button
                        type="button"
                        onClick={() => setQuestionViewMode(questionViewMode === 'single' ? 'all' : 'single')}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Chuyển chế độ xem từng câu hoặc tất cả các câu"
                      >
                        {questionViewMode === 'single' ? 'Xem hết' : 'Từng câu'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Nội dung câu hỏi:
                    1. Chế độ 'single' (Mặc định): Hiển thị 1 câu hỏi tập trung, chiều cao cố định cân đối với cột kịch bản
                    2. Chế độ 'all': Hiển thị danh sách toàn bộ các câu hỏi */}
                {questionViewMode === 'single' && currentQuestion ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        <span className="inline-block rounded-md bg-brand-50 text-brand-700 px-1.5 py-0.5 text-[11px] mr-1.5 border border-brand-200">
                          Câu {activeQuestionIdx + 1} / {questionsList.length}
                        </span>
                        {currentQuestion.question || currentQuestion.questionText}
                      </p>
                    </div>

                    {/* Danh sách 4 phương án lựa chọn */}
                    <div className="space-y-1.5">
                      {(currentQuestion.options || []).map((opt, optIdx) => {
                        const optLabel = ['(A)', '(B)', '(C)', '(D)'][optIdx] || `(${optIdx + 1})`
                        const isCorrect =
                          currentQuestion.correctIndex === optIdx ||
                          currentQuestion.correctAnswer === opt ||
                          currentQuestion.correctAnswer === ['A', 'B', 'C', 'D'][optIdx]

                        return (
                          <div
                            key={optIdx}
                            className={cn(
                              'flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors',
                              isCorrect
                                ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200 shadow-2xs'
                                : 'bg-slate-50/80 text-slate-700 border border-slate-100',
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className={cn('font-bold', isCorrect ? 'text-emerald-700' : 'text-slate-500')}>
                                {opt.startsWith('(') ? '' : `${optLabel} `}
                              </span>
                              <span>{opt}</span>
                            </div>
                            {isCorrect && (
                              <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold shrink-0">
                                <CheckCircle2 size={14} /> Đáp án đúng
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Giải thích chi tiết */}
                    {currentQuestion.explanation && (
                      <div className="rounded-xl bg-amber-50/70 border border-amber-100 p-2.5 text-[11px] text-amber-900 leading-relaxed">
                        <strong className="font-semibold text-amber-800">Giải thích: </strong>
                        {currentQuestion.explanation}
                      </div>
                    )}

                    {/* Chuyển câu trước / câu sau nếu có nhiều câu hỏi */}
                    {questionsList.length > 1 && (
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                        <button
                          type="button"
                          disabled={activeQuestionIdx === 0}
                          onClick={() => setActiveQuestionIdx((prev) => Math.max(0, prev - 1))}
                          className={cn(
                            'flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-colors',
                            activeQuestionIdx === 0
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-700 hover:bg-slate-100 cursor-pointer',
                          )}
                        >
                          <ChevronLeft size={14} /> Câu trước
                        </button>

                        <span className="text-[11px] text-slate-400 font-medium">
                          {activeQuestionIdx + 1} của {questionsList.length} câu
                        </span>

                        <button
                          type="button"
                          disabled={activeQuestionIdx === questionsList.length - 1}
                          onClick={() => setActiveQuestionIdx((prev) => Math.min(questionsList.length - 1, prev + 1))}
                          className={cn(
                            'flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-colors',
                            activeQuestionIdx === questionsList.length - 1
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-brand-600 hover:bg-brand-50 cursor-pointer',
                          )}
                        >
                          Câu tiếp theo <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Chế độ xem hết: cuộn toàn bộ câu hỏi */
                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                    {questionsList.map((q, qIdx) => (
                      <div key={q.id || qIdx} className="rounded-xl border border-slate-200 bg-slate-50/40 p-3 space-y-2">
                        <p className="text-xs font-bold text-slate-900">
                          Câu {qIdx + 1}: {q.question || q.questionText}
                        </p>
                        <div className="space-y-1.5">
                          {(q.options || []).map((opt, optIdx) => {
                            const optLabel = ['(A)', '(B)', '(C)', '(D)'][optIdx] || `(${optIdx + 1})`
                            const isCorrect =
                              q.correctIndex === optIdx ||
                              q.correctAnswer === opt ||
                              q.correctAnswer === ['A', 'B', 'C', 'D'][optIdx]
                            return (
                              <div
                                key={optIdx}
                                className={cn(
                                  'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs',
                                  isCorrect
                                    ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200'
                                    : 'bg-white text-slate-700 border border-slate-100',
                                )}
                              >
                                <span>{opt.startsWith('(') ? '' : `${optLabel} `}{opt}</span>
                                {isCorrect && (
                                  <span className="text-[10px] text-emerald-700 font-bold">✓ Đúng</span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        {q.explanation && (
                          <p className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-100">
                            <strong>Giải thích: </strong>{q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-2 border-t border-slate-100 pt-4">
          {isTeacher && isOwner && (
            <Button
              variant="primary"
              fullWidth
              icon={Send}
              onClick={(e) => onAssignToClass(e, lesson)}
            >
              Giao bài nghe cho lớp học
            </Button>
          )}
          {canManage ? (
            <Button
              variant={isTeacher && isOwner ? 'secondary' : 'primary'}
              fullWidth={!isTeacher || !isOwner}
              icon={Pencil}
              onClick={(e) => {
                onClose()
                onEditClick(e, lesson)
              }}
            >
              Chỉnh sửa bài nghe
            </Button>
          ) : (
            <div className="w-full text-center text-xs text-slate-400 py-2 bg-slate-50 rounded-lg">
              <Lock size={13} className="inline mr-1" />
              Bạn đang xem bài nghe ở chế độ chỉ đọc
            </div>
          )}
        </div>
      </div>
    </Drawer>
  )
}
