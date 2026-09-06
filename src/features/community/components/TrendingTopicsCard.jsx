import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TrendingTopicsCard({
  topics = [],
  selectedTag,
  onSelectTag,
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
        Chủ Đề Thảo Luận
      </h2>

      <div className="space-y-1">
        {topics.map((topic) => (
          <div
            key={topic.tag}
            onClick={() => onSelectTag(selectedTag === topic.tag ? null : topic.tag)}
            className={cn(
              'flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer group',
              selectedTag === topic.tag
                ? 'bg-slate-100 font-bold'
                : 'hover:bg-slate-50',
            )}
          >
            <div>
              <p className="font-semibold text-xs text-slate-900 group-hover:text-brand-600 transition-colors">
                {topic.label}
              </p>
              <p className="text-[11px] text-slate-400">{topic.postCount}</p>
            </div>

            <TrendingUp size={14} className="text-slate-400" />
          </div>
        ))}
      </div>
    </div>
  )
}
