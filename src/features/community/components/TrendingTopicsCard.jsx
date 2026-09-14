import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TrendingTopicsCard({
  topics = [],
  selectedTag,
  onSelectTag,
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Chủ Đề Thảo Luận
        </h2>
        {selectedTag && (
          <button
            type="button"
            onClick={() => onSelectTag(null)}
            className="text-[11px] text-brand-600 hover:underline font-semibold cursor-pointer"
          >
            Bỏ lọc
          </button>
        )}
      </div>

      <div className="space-y-1">
        {topics.map((topic, index) => {
          const tagName = topic.tag || topic.label || ''
          const label = topic.label || (topic.tag ? `#${topic.tag}` : 'Chủ đề')
          const postCountText =
            topic.postCount || (topic.count ? `${topic.count} bài viết` : 'Thảo luận sôi nổi')
          const isSelected = selectedTag === tagName || selectedTag === topic.tag

          return (
            <div
              key={topic.tag || index}
              onClick={() => onSelectTag(isSelected ? null : (topic.tag || topic.label))}
              className={cn(
                'flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer group',
                isSelected
                  ? 'bg-brand-50 border border-brand-200/60 shadow-xs'
                  : 'hover:bg-slate-50',
              )}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold shrink-0',
                    index === 0
                      ? 'bg-amber-100 text-amber-700'
                      : index === 1
                      ? 'bg-slate-200 text-slate-700'
                      : index === 2
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-slate-100 text-slate-500',
                  )}
                >
                  {index + 1}
                </span>
                <div>
                  <p
                    className={cn(
                      'font-semibold text-xs transition-colors',
                      isSelected
                        ? 'text-brand-700 font-bold'
                        : 'text-slate-800 group-hover:text-brand-600',
                    )}
                  >
                    {label}
                  </p>
                  <p className="text-[11px] text-slate-400">{postCountText}</p>
                </div>
              </div>

              <TrendingUp
                size={14}
                className={cn(
                  'transition-colors',
                  isSelected ? 'text-brand-600' : 'text-slate-400 group-hover:text-brand-500',
                )}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
