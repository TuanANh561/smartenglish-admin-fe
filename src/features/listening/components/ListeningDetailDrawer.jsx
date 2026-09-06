import { useEffect, useMemo, useState } from 'react'
import { formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import { Lock, Pencil, Play, Send, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

function parseDuration(durationStr) {
  if (!durationStr) return 105
  const parts = String(durationStr).split(':').map(Number)
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1]
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  return 105
}

function formatTime(seconds) {
  const safeSec = Math.max(0, Math.floor(seconds))
  const m = Math.floor(safeSec / 60)
  const s = safeSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function ListeningDetailDrawer({
  lesson,
  onClose,
  isTeacher,
  isOwner,
  canManage,
  isPlaying,
  onPlayToggle,
  onAssignToClass,
  onEditClick,
}) {
  const totalDuration = useMemo(() => parseDuration(lesson?.duration), [lesson?.duration])
  const [currentTime, setCurrentTime] = useState(0)

  // Reset timer when lesson changes
  useEffect(() => {
    setCurrentTime(0)
  }, [lesson?.id])

  // Timer running progress when isPlaying is true
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 1
        if (next >= totalDuration) {
          onPlayToggle?.({ stopPropagation: () => {} }, lesson)
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, totalDuration, lesson, onPlayToggle])

  const remainingTime = Math.max(0, totalDuration - currentTime)
  const progressPercent = totalDuration > 0 ? Math.min(100, (currentTime / totalDuration) * 100) : 0

  const handleProgressBarClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const ratio = Math.max(0, Math.min(1, clickX / rect.width))
    setCurrentTime(Math.floor(ratio * totalDuration))
  }

  const handleSkip = (seconds) => {
    setCurrentTime((prev) => Math.max(0, Math.min(totalDuration, prev + seconds)))
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
                    {isPlaying ? 'Đang phát âm thanh...' : 'Audio chuẩn Studio'}
                  </h5>
                  {isPlaying && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thời lượng: <strong>{lesson.duration}</strong> · Định dạng MP3 320kbps
                </p>
              </div>
            </div>

            {/* Quick Skip Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSkip(-10)}
                className="rounded-lg bg-white/80 px-2 py-1 text-xs font-semibold text-slate-600 shadow-2xs border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
                title="Tua lùi 10 giây"
              >
                -10s
              </button>
              <button
                type="button"
                onClick={() => handleSkip(10)}
                className="rounded-lg bg-white/80 px-2 py-1 text-xs font-semibold text-slate-600 shadow-2xs border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
                title="Tua tới 10 giây"
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
              className="group relative h-2.5 w-full cursor-pointer rounded-full bg-slate-200/90 transition-all hover:h-3"
              title="Nhấp để tua nhanh / chọn vị trí nghe"
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

        <div>
          <h4 className="mb-2 text-sm font-semibold text-navy-700">Mô tả bài nghe</h4>
          <p className="rounded-lg bg-canvas p-3 text-sm leading-relaxed text-ink">
            {lesson.description}
          </p>
        </div>

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
