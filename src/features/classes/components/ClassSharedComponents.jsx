// Avatar: nếu có ảnh thì dùng, không thì hiện initials
export function StudentAvatar({ student, size = 'md' }) {
  const s = size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-xs'
  if (student.avatarUrl) {
    return (
      <img
        src={student.avatarUrl}
        alt={student.name}
        className={`${s} rounded-full object-cover`}
      />
    )
  }
  return (
    <span
      className={`${s} flex shrink-0 items-center justify-center rounded-full font-bold text-white`}
      style={{ backgroundColor: student.avatarColor }}
    >
      {student.initials}
    </span>
  )
}

// Thanh tiến độ học tập
export function ProgressBar({ value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-ink-muted">{value}%</span>
    </div>
  )
}

// Badge điểm trung bình — màu theo điểm
export function ScoreBadge({ score }) {
  const color =
    score >= 8.5
      ? '#15803d'
      : score >= 7.0
        ? '#1d4ed8'
        : '#b45309'
  const bg =
    score >= 8.5
      ? '#dcfce7'
      : score >= 7.0
        ? '#dbeafe'
        : '#fef3c7'
  return (
    <span
      className="inline-flex h-7 w-10 items-center justify-center rounded-lg text-xs font-bold"
      style={{ backgroundColor: bg, color }}
    >
      {score}
    </span>
  )
}
