import { cn } from '@/lib/utils'

export default function FeaturedTeachersCard({
  teachers = [],
  onToggleFollow,
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
        Giáo Viên Nổi Bật
      </h2>

      <div className="space-y-3">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={teacher.avatar}
                alt={teacher.name}
                className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="font-bold text-xs text-slate-900 truncate">{teacher.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{teacher.role}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleFollow(teacher.id)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer shrink-0',
                teacher.isFollowing
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-navy-800 text-white hover:bg-navy-900',
              )}
            >
              {teacher.isFollowing ? 'Đã theo dõi' : 'Theo dõi'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
