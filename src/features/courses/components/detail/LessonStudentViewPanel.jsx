import { useEffect, useState } from 'react'
import {
  BookOpen,
  Crown,
  FileQuestion,
  FileText,
  MessageSquare,
  Play,
  Volume2,
} from 'lucide-react'
import { speakWord, stopAudio } from '@/lib/ipaHelper'
import { registerAudioStopHandler } from '@/lib/appAudioCoordinator'

/**
 * Panel Xem Chi Tiết Bài Học Dành Cho Người Học / Chế Độ Chỉ Đọc (Inline Read-Only Panel)
 * Bố cục dọc liền mạch (Vertical Scroll Layout) — Người xem chỉ cần cuộn chuột để đọc toàn bộ bài học
 */
export default function LessonStudentViewPanel({ lesson, courseTitle }) {
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showExplanation, setShowExplanation] = useState({})
  const [playingAudioKey, setPlayingAudioKey] = useState(null)

  // Tự động ngắt phát âm khi người dùng chuyển sang bài học khác
  useEffect(() => {
    stopAudio()
    setPlayingAudioKey(null)
  }, [lesson?.id])

  // Lắng nghe tín hiệu ngắt âm thanh toàn cục (khi có âm thanh khác phát)
  useEffect(() => {
    const unregister = registerAudioStopHandler(() => {
      setPlayingAudioKey(null)
    })
    return () => {
      unregister()
      stopAudio()
    }
  }, [])

  const handlePlayAudio = (e, text, audioUrl, key) => {
    e?.stopPropagation?.()
    if (playingAudioKey === key) {
      setPlayingAudioKey(null)
      stopAudio()
      return
    }

    setPlayingAudioKey(key)
    speakWord(text, audioUrl, () => {
      setPlayingAudioKey((curr) => (curr === key ? null : curr))
    })
  }

  if (!lesson) {
    return (
      <div className="w-full h-full min-h-[450px] flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-line text-center">
        <BookOpen size={40} className="text-slate-300 mb-3" />
        <h4 className="font-bold text-navy-800 text-sm">Chưa chọn bài học</h4>
        <p className="text-xs text-ink-muted mt-1 max-w-sm">
          Vui lòng chọn một bài học từ danh sách chương bên trái để xem nội dung chi tiết.
        </p>
      </div>
    )
  }

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

  const hasAnyContent =
    theoryBlock ||
    lesson.theoryContent ||
    vocabs.length > 0 ||
    dialogues.length > 0 ||
    quizzes.length > 0 ||
    videoBlock?.videoUrl ||
    attachmentBlock?.fileUrl

  return (
    <div className="w-full bg-white rounded-2xl border border-line shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5 bg-slate-50/70">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
            U{lesson.position || 1}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-navy-900 text-sm truncate">
                {lesson.titleVi || lesson.title}
              </h3>
              {lesson.isFreePreview ? (
                <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80">
                  Học thử miễn phí
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/80 flex items-center gap-1">
                  <Crown size={10} /> Premium
                </span>
              )}
            </div>
            <p className="text-[11px] text-ink-muted truncate mt-0.5">
              {courseTitle ? `Khóa học: ${courseTitle}` : 'Xem nội dung bài học'} • {lesson.estimatedMin || 15} phút • +{lesson.xpReward || 30} XP
            </p>
          </div>
        </div>

        {/* Badge tóm tắt nhanh các phần có trong bài học */}
        <div className="hidden md:flex items-center gap-1.5 flex-wrap">
          {(theoryBlock || lesson.theoryContent) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-50/70 text-brand-700 text-[10px] font-medium border border-brand-200/60">
              <BookOpen size={10} /> Lý thuyết
            </span>
          )}
          {vocabs.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-50/70 text-brand-700 text-[10px] font-medium border border-brand-200/60">
              <Volume2 size={10} /> {vocabs.length} từ vựng
            </span>
          )}
          {dialogues.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-50/70 text-brand-700 text-[10px] font-medium border border-brand-200/60">
              <MessageSquare size={10} /> {dialogues.length} hội thoại
            </span>
          )}
          {quizzes.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-50/70 text-brand-700 text-[10px] font-medium border border-brand-200/60">
              <FileQuestion size={10} /> {quizzes.length} câu hỏi
            </span>
          )}
        </div>
      </div>

      {/* Body Content: Bố cục dọc nối tiếp (Vertical Flow) — Hiển thị tự nhiên toàn bộ nội dung */}
      <div className="flex-1 p-5 space-y-6 bg-slate-50/50">
        {!hasAnyContent ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center space-y-2">
            <BookOpen size={32} className="text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Nội dung bài học này đang được chuẩn bị cập nhật.</p>
          </div>
        ) : (
          <>
            {/* 1. LÝ THUYẾT TRỌNG TÂM */}
            {(theoryBlock || lesson.theoryContent) && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-200/70 shadow-2xs">
                    <BookOpen size={15} />
                  </div>
                  <h4 className="font-bold text-navy-800 text-xs uppercase tracking-wider">
                    1. Lý thuyết trọng tâm
                  </h4>
                  {theoryBlock?.title && (
                    <span className="text-xs text-slate-500 font-normal truncate">
                      • {theoryBlock.title}
                    </span>
                  )}
                </div>
                <div className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap pl-1">
                  {theoryBlock?.content ||
                    lesson.theoryContent ||
                    'Nội dung lý thuyết đang được cập nhật cho bài học này.'}
                </div>
              </div>
            )}

            {/* 2. TỪ VỰNG CỐT LÕI */}
            {vocabs.length > 0 && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-200/70 shadow-2xs">
                      <Volume2 size={15} />
                    </div>
                    <h4 className="font-bold text-navy-800 text-xs uppercase tracking-wider">
                      2. Từ vựng cốt lõi ({vocabs.length} từ)
                    </h4>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {vocabs.map((item, idx) => {
                    const isWordPlaying = playingAudioKey === `vocab-${idx}`
                    const isExamplePlaying = playingAudioKey === `vocab-example-${idx}`
                    return (
                      <div
                        key={idx}
                        className={`rounded-xl border p-3.5 shadow-2xs transition-all ${
                          isWordPlaying || isExamplePlaying
                            ? 'bg-blue-50/40 border-brand-400 ring-1 ring-brand-300'
                            : 'border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-navy-900 text-sm truncate">{item.word}</h5>
                              <button
                                type="button"
                                onClick={(e) => handlePlayAudio(e, item.word, item.audioUrl || item.audio_url, `vocab-${idx}`)}
                                className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all cursor-pointer shrink-0 ${
                                  isWordPlaying
                                    ? 'bg-brand-600 text-white shadow-xs scale-105 animate-pulse'
                                    : 'bg-white border border-slate-200 text-slate-500 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50/60 shadow-2xs'
                                }`}
                                title="Phát âm từ vựng"
                                aria-label={`Phát âm ${item.word}`}
                              >
                                <Volume2 size={14} className={isWordPlaying ? 'animate-bounce' : ''} />
                              </button>
                            </div>
                            <p className="font-mono text-xs text-purple-700/80 mt-0.5">{item.ipa || '/.../'}</p>
                          </div>
                          <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase shrink-0">
                            {item.pos || 'n'}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-700 mt-2">{item.meaningVi}</p>
                        {item.exampleEn && (
                          <div className="mt-2 rounded-lg bg-white p-2.5 text-[11px] text-slate-600 border border-slate-100 flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-800 italic">"{item.exampleEn}"</p>
                              {item.exampleVi && <p className="text-slate-500 mt-0.5">{item.exampleVi}</p>}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => handlePlayAudio(e, item.exampleEn, null, `vocab-example-${idx}`)}
                              className={`p-1 rounded-md transition-all cursor-pointer shrink-0 ${
                                isExamplePlaying
                                  ? 'text-brand-600 bg-brand-50'
                                  : 'text-slate-400 hover:text-brand-600 hover:bg-slate-100'
                              }`}
                              title="Nghe câu ví dụ"
                              aria-label="Nghe câu ví dụ"
                            >
                              <Volume2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 3. HỘI THOẠI GIAO TIẾP */}
            {dialogues.length > 0 && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-200/70 shadow-2xs">
                    <MessageSquare size={15} />
                  </div>
                  <h4 className="font-bold text-navy-800 text-xs uppercase tracking-wider">
                    3. Hội thoại giao tiếp phản xạ ({dialogues.length} lượt thoại)
                  </h4>
                </div>
                <div className="space-y-3 pt-1">
                  {dialogues.map((line, idx) => {
                    const isA = idx % 2 === 0
                    const isLinePlaying = playingAudioKey === `dialogue-${idx}`
                    return (
                      <div key={idx} className={`flex gap-3 ${isA ? 'justify-start' : 'justify-end'}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-2xs ${
                            isA
                              ? 'bg-slate-100 text-slate-800 rounded-tl-xs'
                              : 'bg-brand-600 text-white rounded-tr-xs shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <p className={`font-bold text-[10px] uppercase ${isA ? 'text-slate-500' : 'text-brand-100'}`}>
                              {line.speaker}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => handlePlayAudio(e, line.text, line.audioUrl, `dialogue-${idx}`)}
                              className={`p-1 rounded-md transition-colors cursor-pointer ${
                                isLinePlaying
                                  ? isA
                                    ? 'text-brand-600 bg-brand-100/70'
                                    : 'text-white bg-brand-700'
                                  : isA
                                  ? 'text-slate-400 hover:text-brand-600 hover:bg-slate-200/60'
                                  : 'text-brand-200 hover:text-white hover:bg-brand-700/60'
                              }`}
                              title={`Nghe lời thoại của ${line.speaker}`}
                            >
                              <Volume2 size={13} />
                            </button>
                          </div>
                          <p className="font-medium text-xs leading-relaxed">{line.text}</p>
                          {line.translation && (
                            <p className={`mt-1 text-[11px] border-t pt-1 italic ${isA ? 'border-slate-200 text-slate-500' : 'border-brand-500/60 text-brand-100'}`}>
                              {line.translation}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 4. TRẮC NGHIỆM CỦNG CỐ */}
            {quizzes.length > 0 && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-200/70 shadow-2xs">
                    <FileQuestion size={15} />
                  </div>
                  <h4 className="font-bold text-navy-800 text-xs uppercase tracking-wider">
                    4. Trắc nghiệm ôn tập ({quizzes.length} câu)
                  </h4>
                </div>
                <div className="space-y-3.5 pt-1">
                  {quizzes.map((q, qIdx) => {
                    const selectedOpt = selectedAnswers[qIdx]
                    const hasAnswered = selectedOpt !== undefined
                    const isCorrect = hasAnswered && (
                      q.correctAnswer === String(selectedOpt) ||
                      q.correctAnswer === String.fromCharCode(65 + selectedOpt) ||
                      q.options?.[selectedOpt]?.startsWith(q.correctAnswer)
                    )

                    return (
                      <div key={qIdx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 shadow-2xs space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-bold text-navy-900 text-xs leading-relaxed">
                            Câu {qIdx + 1}: {q.question}
                          </h5>
                          {hasAnswered && (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${isCorrect ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                              {isCorrect ? 'Chính xác' : 'Chưa đúng'}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options?.map((opt, optIdx) => {
                            const isThisSelected = selectedOpt === optIdx
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectOption(qIdx, optIdx)}
                                className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer ${
                                  isThisSelected
                                    ? 'bg-brand-50/80 border-brand-500 text-brand-900 font-semibold ring-1 ring-brand-300'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {opt}
                              </button>
                            )
                          })}
                        </div>

                        {showExplanation[qIdx] && q.explanation && (
                          <div className="rounded-lg bg-brand-50/50 border border-brand-100 p-2.5 text-[11px] text-slate-700">
                            <strong className="text-brand-700">Giải thích:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 5. VIDEO BÀI GIẢNG */}
            {videoBlock?.videoUrl && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-200/70 shadow-2xs">
                    <Play size={15} />
                  </div>
                  <h4 className="font-bold text-navy-800 text-xs uppercase tracking-wider">
                    5. Video bài giảng
                  </h4>
                </div>
                <video src={videoBlock.videoUrl} controls className="w-full rounded-xl max-h-80 bg-black mt-2" />
              </div>
            )}

            {/* 6. TÀI LIỆU ĐÍNH KÈM */}
            {attachmentBlock?.fileUrl && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-200/70 shadow-2xs">
                    <FileText size={15} />
                  </div>
                  <h4 className="font-bold text-navy-800 text-xs uppercase tracking-wider">
                    6. Tài liệu đính kèm
                  </h4>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 mt-2">
                  <span className="font-semibold text-xs text-navy-900 truncate">
                    {attachmentBlock.fileName || 'Tài liệu bài học'}
                  </span>
                  <a
                    href={attachmentBlock.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700 shadow-2xs transition-colors shrink-0 ml-3"
                  >
                    Tải xuống / Mở tệp
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
