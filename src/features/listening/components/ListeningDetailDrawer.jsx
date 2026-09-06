import { useMemo } from 'react'
import { formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import { Lock, Pencil, Play, Send, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTime, parseDuration } from '@/lib/ipaHelper'
import toast from 'react-hot-toast'

export default function ListeningDetailDrawer({
  lesson,
  onClose,
  isTeacher,
  isOwner,
  canManage,
  isPlaying,
  currentTime = 0,
  onSeek,
  onPlayToggle,
  onAssignToClass,
  onEditClick,
}) {
  const totalDuration = useMemo(() => parseDuration(lesson?.duration), [lesson?.duration])

  const safeCurrentTime = isPlaying ? Math.min(totalDuration, Math.max(0, currentTime)) : 0
  const remainingTime = Math.max(0, totalDuration - safeCurrentTime)
  const progressPercent = totalDuration > 0 ? Math.min(100, (safeCurrentTime / totalDuration) * 100) : 0

  const hasAudio = Boolean(lesson?.audioUrl && String(lesson.audioUrl).trim())

  const handleProgressBarClick = (e) => {
    if (!hasAudio) {
      toast('Tua nhanh bằng thanh tiến độ chỉ khả dụng khi bài nghe có file .mp3 thực tế', {
        icon: 'ℹ️',
      })
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const ratio = Math.max(0, Math.min(1, clickX / rect.width))
    const target = Math.floor(ratio * totalDuration)
    onSeek?.(target)
  }

  const handleSkip = (seconds) => {
    if (!hasAudio) {
      toast('Tính năng tua nhanh chỉ khả dụng khi bài nghe có file .mp3 thực tế', {
        icon: 'ℹ️',
      })
      return
    }
    onSeek?.(safeCurrentTime + seconds)
  }

  if (!lesson) return null

  return (
    <Drawer
      open={Boolean(lesson)}
      onClose={onClose}
      title={lesson?.title}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="info">{lesson.level}</Badge>
          <Badge tone="neutral">{lesson.topic}</Badge>
          <Badge tone="neutral">{lesson.accent}</Badge>
          <Badge tone={isOwner ? 'success' : 'neutral'}>
            Tác giả: {lesson.authorName || 'Hệ thống'}
          </Badge>
          <span className="text-xs text-ink-muted">
            Cập nhật {formatDate(lesson.createdAt)}
          </span>
        </div>

        {/* Audio Waveform Player with Running Progress Bar */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100/80 p-4 space-y-3.5 shadow-2xs">
          {/* Header + Play Button + Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => onPlayToggle(e, lesson)}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-2xl shadow-xs transition-all duration-200 cursor-pointer',
                  isPlaying
                    ? 'bg-brand-500 text-white shadow-brand-200 shadow-md scale-102 ring-4 ring-brand-100'
                    : 'bg-navy-800 text-white hover:bg-navy-900 hover:scale-105',
                )}
                title={isPlaying ? 'Tạm dừng audio' : 'Phát audio'}
              >
                {isPlaying ? (
                  <Volume2 size={22} className="animate-pulse" />
                ) : (
                  <Play size={22} className="ml-1" />
                )}
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-bold text-slate-900">
                    {isPlaying ? 'Đang phát âm thanh...' : hasAudio ? 'Audio chuẩn Studio' : 'Giọng đọc bài nghe'}
                  </h5>
                  {isPlaying && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thời lượng: <strong>{lesson.duration}</strong> ·{' '}
                  {hasAudio ? 'Định dạng MP3' : 'Giọng đọc hỗ trợ'}
                </p>
              </div>
            </div>

            {/* Quick Skip Buttons - Chỉ bấm được khi có file .mp3 thực tế */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={!hasAudio}
                onClick={() => handleSkip(-10)}
                className={cn(
                  'rounded-lg px-2 py-1 text-xs font-semibold shadow-2xs border transition-all',
                  hasAudio
                    ? 'bg-white/80 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border-slate-200/60 opacity-45 cursor-not-allowed',
                )}
                title={hasAudio ? 'Tua lùi 10 giây' : 'Chỉ khả dụng khi bài nghe có file âm thanh .mp3 thực tế'}
              >
                -10s
              </button>
              <button
                type="button"
                disabled={!hasAudio}
                onClick={() => handleSkip(10)}
                className={cn(
                  'rounded-lg px-2 py-1 text-xs font-semibold shadow-2xs border transition-all',
                  hasAudio
                    ? 'bg-white/80 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border-slate-200/60 opacity-45 cursor-not-allowed',
                )}
                title={hasAudio ? 'Tua tới 10 giây' : 'Chỉ khả dụng khi bài nghe có file âm thanh .mp3 thực tế'}
              >
                +10s
              </button>
            </div>
          </div>

          {/* Thanh ngang chạy dựa trên thời lượng còn lại (Progress Bar) */}
          <div className="space-y-1.5 pt-1">
            {/* Interactive Progress Bar */}
            <div
              onClick={handleProgressBarClick}
              className={cn(
                'group relative h-2.5 w-full rounded-full bg-slate-200/90 transition-all',
                hasAudio ? 'cursor-pointer hover:h-3' : 'cursor-default',
              )}
              title={hasAudio ? 'Nhấp để tua nhanh / chọn vị trí nghe' : 'Thanh tiến độ phát âm thanh'}
            >
              {/* Filled Progress Bar */}
              <div
                className="relative h-full rounded-full bg-gradient-to-r from-brand-600 via-blue-500 to-indigo-500 transition-[width] duration-300 ease-linear shadow-xs"
                style={{ width: `${progressPercent}%` }}
              >
                {/* Scrubber Knob */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white border-2 border-brand-600 shadow-md transition-transform group-hover:scale-125" />
              </div>
            </div>

            {/* Thời gian đã nghe & Thời lượng còn lại */}
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-0.5">
              <span className="font-mono text-slate-700 font-semibold">{formatTime(currentTime)}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500">Còn lại:</span>
                <span className="font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100 shadow-2xs">
                  -{formatTime(remainingTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Waveform Bars Visualizer (đồng bộ tiến độ) */}
          {Array.isArray(lesson.waveform) && lesson.waveform.length > 0 && (
            <div className="flex items-end justify-between gap-1 pt-1 px-1 h-7">
              {lesson.waveform.map((height, idx) => {
                const barPercent = (idx / lesson.waveform.length) * 100
                const isPassed = barPercent <= progressPercent
                return (
                  <div
                    key={idx}
                    className={cn(
                      'w-full rounded-full transition-all duration-200',
                      isPassed
                        ? isPlaying
                          ? 'bg-brand-500'
                          : 'bg-brand-400'
                        : 'bg-slate-200',
                    )}
                    style={{
                      height: `${Math.max(4, Math.min(26, height))}px`,
                      opacity: isPassed ? 1 : 0.6,
                    }}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Mô tả ngắn */}
        <div className="space-y-1.5">
          <h4 className="text-sm font-semibold text-navy-700">Mô tả bài nghe</h4>
          <p className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 text-xs leading-relaxed text-slate-700">
            {lesson.description || 'Chưa có mô tả ngắn'}
          </p>
        </div>

        {/* Bản chép lời hội thoại (Transcript) */}
        {lesson.transcript && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-navy-700">Bản chép lời hội thoại (Transcript)</h4>
              <span className="text-[11px] text-slate-400 font-medium">Kịch bản thoại</span>
            </div>
            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs max-h-56 overflow-y-auto pr-2 custom-scrollbar">
              {lesson.transcript.split('\n').filter(Boolean).map((line, idx) => {
                const match = line.match(/^([A-Za-z0-9\s]+):\s*(.+)$/)
                if (match) {
                  const isFirstSpeaker = idx % 2 === 0
                  return (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <span
                        className={cn(
                          'shrink-0 rounded-md px-2 py-0.5 font-bold text-[11px]',
                          isFirstSpeaker
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        )}
                      >
                        {match[1]}:
                      </span>
                      <span className="text-slate-700 leading-relaxed pt-0.5">{match[2]}</span>
                    </div>
                  )
                }
                return <p key={idx} className="text-xs text-slate-600 leading-relaxed">{line}</p>
              })}
            </div>
          </div>
        )}

        {/* Bottom Actions trong Drawer */}
        <div className="flex gap-2 border-t border-line pt-4">
          {isTeacher && isOwner && (
            <Button
              variant="primary"
              fullWidth
              icon={Send}
              onClick={(e) => onAssignToClass(e, lesson)}
            >
              Giao bài nghe này cho lớp
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
            <div className="w-full text-center text-xs text-ink-muted py-2 bg-slate-50 rounded-lg">
              <Lock size={13} className="inline mr-1" />
              Bạn đang xem bài nghe của tác giả khác
            </div>
          )}
        </div>
      </div>
    </Drawer>
  )
}
