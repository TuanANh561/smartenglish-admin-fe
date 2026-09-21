import { Pencil, Trash2 } from 'lucide-react'

const LEVEL_BADGE_STYLE = {
  A1: 'bg-emerald-500/15 text-emerald-700 border-emerald-300/60',
  A2: 'bg-green-500/15 text-green-700 border-green-300/60',
  B1: 'bg-blue-500/15 text-blue-700 border-blue-300/60',
  B2: 'bg-indigo-500/15 text-indigo-700 border-indigo-300/60',
  C1: 'bg-purple-500/15 text-purple-700 border-purple-300/60',
  C2: 'bg-rose-500/15 text-rose-700 border-rose-300/60',
}

export default function SpeakingScenarioCard({
  scenario,
  onEdit,
  onDelete,
  onSimulate,
}) {
  const levelClass = LEVEL_BADGE_STYLE[scenario.cefrLevel] || 'bg-emerald-500/15 text-emerald-700 border-emerald-300/60'
  const fallbackImage = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80'

  return (
    <div
      onClick={() => onSimulate(scenario)}
      className="group relative flex flex-col rounded-2xl border border-slate-200/90 bg-slate-50/40 hover:bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 cursor-pointer"
    >
      {/* 1. Ảnh minh họa (Top Banner) */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={scenario.imageUrl || fallbackImage}
          alt={scenario.titleEn || 'Scenario'}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = fallbackImage
          }}
        />

        {/* Level Tag ở góc trên bên trái giống hệt ảnh mẫu */}
        <div className="absolute left-3 top-3">
          <span className={`inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-xs backdrop-blur-xs ${levelClass}`}>
            {scenario.cefrLevel || 'A1'}
          </span>
        </div>

        {/* Nút Sửa / Xóa hiển thị tinh tế ở góc trên bên phải khi hover dành cho Admin */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-2.5 top-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-xs p-1 rounded-xl shadow-sm border border-slate-200/90"
        >
          <button
            type="button"
            onClick={() => onEdit(scenario)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
            title="Chỉnh sửa kịch bản"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(scenario)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Xóa kịch bản"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* 2. Tiêu đề và Mô tả vắn tắt - Đơn giản, ngắn gọn đúng ảnh tham khảo */}
      <div className="flex flex-col p-4 flex-1">
        <h3 className="line-clamp-1 text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
          {scenario.titleEn || scenario.titleVi || 'Untitled Scenario'}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {scenario.descriptionEn || scenario.descriptionVi || 'Chưa có mô tả ngắn.'}
        </p>
      </div>
    </div>
  )
}

