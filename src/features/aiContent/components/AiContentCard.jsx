import {
  ArchiveRestore,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Headphones,
  HelpCircle,
  Leaf,
  Sparkles,
  SpellCheck,
  Trash2,
  X,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import {
  confidenceTone,
  STATUS_BADGE,
  mapAiTypeToExamCategory,
  EXAM_CATEGORY_NAMES,
} from './aiContentConstants'

/**
 * Trả về Icon & Màu sắc độc quyền cho từng chủ đề (Màu sắc CHỈ dùng cho Icon Box)
 */
function getTopicTheme(item) {
  const title = (item.title || '').toLowerCase()
  const rawType = (item.rawType || item.type || '').toLowerCase()

  // 1. Môi trường, Năng lượng, Khoa học & Bài đọc hiểu
  if (
    title.includes('renewable') ||
    title.includes('energy') ||
    title.includes('environment') ||
    title.includes('climate') ||
    title.includes('solar') ||
    title.includes('ecology') ||
    title.includes('science') ||
    rawType === 'reading'
  ) {
    return {
      id: 'environment',
      name: 'Môi trường & Khoa học',
      badgeLabel: 'Bài đọc · Khoa học',
      icon: Leaf,
      iconBg: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20',
    }
  }

  // 2. TOEIC, Kinh doanh, Hợp đồng & Văn phòng
  if (
    title.includes('toeic') ||
    title.includes('contract') ||
    title.includes('office') ||
    title.includes('business') ||
    title.includes('policy') ||
    rawType.includes('toeic')
  ) {
    return {
      id: 'toeic',
      name: 'TOEIC & Công sở',
      badgeLabel: rawType.includes('toeic_part_5') ? 'TOEIC Part 5' : 'TOEIC & Doanh nghiệp',
      icon: Briefcase,
      iconBg: 'bg-blue-50 text-blue-600 ring-1 ring-blue-500/20',
    }
  }

  // 3. Collocations, Cụm từ, Từ vựng chuyên ngành & Giao tiếp quốc tế
  if (
    title.includes('collocation') ||
    title.includes('vocab') ||
    title.includes('idiom') ||
    title.includes('corporate') ||
    title.includes('communication') ||
    rawType.includes('vocab')
  ) {
    return {
      id: 'vocab',
      name: 'Collocations & Từ vựng',
      badgeLabel: 'Cụm từ · Collocations',
      icon: Sparkles,
      iconBg: 'bg-purple-50 text-purple-600 ring-1 ring-purple-500/20',
    }
  }

  // 4. Ngữ pháp học thuật, Các thì & Cấu trúc câu
  if (
    title.includes('grammar') ||
    title.includes('tense') ||
    title.includes('clause') ||
    title.includes('passive') ||
    title.includes('ngữ pháp') ||
    rawType.includes('grammar')
  ) {
    return {
      id: 'grammar',
      name: 'Ngữ pháp ứng dụng',
      badgeLabel: 'Ngữ pháp học thuật',
      icon: SpellCheck,
      iconBg: 'bg-amber-50 text-amber-600 ring-1 ring-amber-500/20',
    }
  }

  // 5. Đánh giá đầu vào & Kiểm tra trình độ
  if (
    title.includes('placement') ||
    title.includes('đầu vào') ||
    title.includes('diagnostic') ||
    rawType.includes('placement')
  ) {
    return {
      id: 'placement',
      name: 'Đánh giá đầu vào',
      badgeLabel: 'Placement Test',
      icon: GraduationCap,
      iconBg: 'bg-rose-50 text-rose-600 ring-1 ring-rose-500/20',
    }
  }

  // 6. Luyện nghe & Hội thoại
  if (
    title.includes('listening') ||
    title.includes('audio') ||
    title.includes('nghe') ||
    rawType.includes('listening')
  ) {
    return {
      id: 'listening',
      name: 'Luyện nghe hiểu',
      badgeLabel: 'Bài nghe · Audio',
      icon: Headphones,
      iconBg: 'bg-sky-50 text-sky-600 ring-1 ring-sky-500/20',
    }
  }

  // 7. Tổng quát / Mặc định
  return {
    id: 'general',
    name: 'Tổng hợp',
    badgeLabel: 'Kiểm tra tổng hợp',
    icon: Award,
    iconBg: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20',
  }
}

export default function AiContentCard({
  item,
  canManage,
  showTrash,
  onClick,
  onApprove,
  onReject,
  onSoftDelete,
  onRestore,
}) {
  const theme = getTopicTheme(item)
  const ThemeIcon = theme.icon
  const statusMeta = STATUS_BADGE[item.status]
  const isApproved = item.status === 'APPROVED'
  const examCat = mapAiTypeToExamCategory(item.type)
  const examCatName = EXAM_CATEGORY_NAMES[examCat] || 'Tổng hợp'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="group relative cursor-pointer flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200 min-h-[270px] focus:outline-none focus:ring-2 focus:ring-brand-500/20"
    >
      <div>
        {/* Header: Icon màu sắc nổi bật + Tiêu đề + Meta chips + Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Điểm nhấn màu sắc DUY NHẤT: Icon Box mềm mại */}
            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 shadow-2xs',
                theme.iconBg
              )}
            >
              <ThemeIcon size={20} strokeWidth={2.2} />
            </span>

            <div className="min-w-0">
              <h3
                className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-brand-600 transition-colors"
                title={item.title}
              >
                {item.title}
              </h3>
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  {theme.badgeLabel}
                </span>
                <span className="rounded-md border border-slate-200/90 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                  Cấp {item.level || 'B2'}
                </span>
              </div>
            </div>
          </div>

          {statusMeta && (
            <Badge tone={statusMeta.tone} className="shrink-0 text-[10px] font-semibold px-2 py-0.5">
              {statusMeta.label}
            </Badge>
          )}
        </div>

        {/* Khối trích đoạn tóm tắt nội dung học tập: Tinh tế, trung tính, không màu mè */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Nội dung tóm tắt
            </span>
            {isApproved && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                <CheckCircle2 size={11} />
                Quiz: {examCatName}
              </span>
            )}
          </div>
          <div className="rounded-xl bg-slate-50/70 border border-slate-100 p-3 text-xs leading-relaxed text-slate-600 line-clamp-3 h-[78px] overflow-hidden">
            {item.content || item.definition || 'Chưa có nội dung tóm tắt cho bài học này.'}
          </div>
        </div>
      </div>

      {/* Footer: Số câu hỏi, % độ tin cậy và nút thao tác */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {item.questions?.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              <HelpCircle size={12} className="text-slate-400" />
              {item.questions.length} câu hỏi
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200/70">
            <Sparkles size={11} className="text-amber-500 fill-amber-400" />
            {item.confidenceScore ?? 92}% tin cậy
          </span>
        </div>

        {/* Action buttons */}
        {canManage && !showTrash && item.status !== 'DELETED' && (
          <div className="flex items-center gap-1.5">
            {item.status === 'PENDING_REVIEW' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onApprove(item.id)
                }}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors cursor-pointer shadow-2xs"
                title="Duyệt và xuất bản vào Ngân hàng Quiz"
              >
                Duyệt
              </button>
            )}
            {item.status === 'PENDING_REVIEW' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onReject(item.id)
                }}
                className="rounded-lg border border-slate-200 bg-white p-1 text-slate-400 transition-colors hover:border-red-300 hover:text-red-500 cursor-pointer"
                aria-label="Từ chối"
                title="Từ chối nội dung"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSoftDelete(item.id)
              }}
              className="rounded-lg border border-slate-200 bg-white p-1 text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 cursor-pointer"
              aria-label="Xóa mềm"
              title="Chuyển vào thùng rác"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        {showTrash && canManage && item.status === 'DELETED' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRestore(item.id)
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 cursor-pointer"
          >
            <ArchiveRestore size={13} />
            Khôi phục
          </button>
        )}
      </div>
    </div>
  )
}
