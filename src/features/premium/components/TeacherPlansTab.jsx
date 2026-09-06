import { CheckCircle2, Plus, Star, Trash2, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Switch from '@/components/ui/Switch'
import { cn, formatCurrency } from '@/lib/utils'
import CurrencyInput from './CurrencyInput'

export default function TeacherPlansTab({
  teacherPlans,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan,
  onToggleFeature,
  onAddFeature,
  onRemoveFeature,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-500" />
          <span className="text-xs font-bold text-navy-700 uppercase tracking-wide">
            Các gói dành cho Giáo viên ({teacherPlans.length})
          </span>
        </div>
        <Button icon={Plus} size="sm" onClick={onAddPlan}>
          Thêm Gói Mới
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {teacherPlans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              'flex flex-col justify-between border-2 transition-all relative',
              plan.isPopular
                ? 'border-brand-500 shadow-md ring-2 ring-brand-500/10'
                : 'border-line hover:border-slate-300',
            )}
          >
            {/* Popular Pill Highlight */}
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-navy-700 px-3 py-0.5 text-[11px] font-bold text-white shadow-sm flex items-center gap-1">
                  <Star size={11} fill="#f59e0b" className="text-amber-400" /> Bán chạy nhất
                </span>
              </div>
            )}

            <div className="space-y-4 pt-1">
              {/* Top Bar: Tên gói & Xoá */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-ink-muted uppercase">Tên gói</label>
                  <Input
                    value={plan.name}
                    onChange={(e) => onUpdatePlan(plan.id, 'name', e.target.value)}
                    className="font-bold text-navy-700 text-sm mt-0.5"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onDeletePlan(plan.id)}
                  className="p-1.5 text-ink-muted hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer mt-3.5 transition-colors"
                  title="Xoá gói"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Badge & Popular Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-ink-muted uppercase">Nhãn phụ</label>
                  <Input
                    value={plan.badge || ''}
                    onChange={(e) => onUpdatePlan(plan.id, 'badge', e.target.value)}
                    placeholder="VD: Khuyên dùng"
                    className="text-xs mt-0.5"
                  />
                </div>
                <div className="flex items-end pb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-navy-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={plan.isPopular}
                      onChange={(e) => onUpdatePlan(plan.id, 'isPopular', e.target.checked)}
                      className="rounded border-line text-brand-500 focus:ring-brand-500"
                    />
                    Đặt làm Nổi bật
                  </label>
                </div>
              </div>

              {/* Giá tháng & năm có Box điểm nhấn */}
              <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-200/80 space-y-2">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-ink-muted uppercase">Giá / Tháng (đ)</label>
                    <CurrencyInput
                      value={plan.priceMonthly}
                      onChange={(val) => onUpdatePlan(plan.id, 'priceMonthly', val)}
                      className="font-bold text-navy-700 text-xs mt-0.5"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-ink-muted uppercase">Giá / Năm (đ)</label>
                    <CurrencyInput
                      value={plan.priceYearly}
                      onChange={(val) => onUpdatePlan(plan.id, 'priceYearly', val)}
                      className="font-bold text-navy-700 text-xs mt-0.5"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 font-semibold">
                  <span className="text-ink-muted">Hiển thị giá:</span>
                  <span className="text-brand-600">
                    {plan.priceMonthly === 0 ? 'Miễn phí' : `${formatCurrency(plan.priceMonthly)} / tháng`}
                  </span>
                </div>
              </div>

              {/* Hạn mức cấu hình (Quotas) */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-navy-700 uppercase tracking-wide block">
                  Hạn mức tài nguyên
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-line bg-white p-2">
                    <span className="text-ink-muted block text-[10px] font-medium">Lớp tối đa:</span>
                    <Input
                      type="number"
                      value={plan.maxClasses}
                      onChange={(e) => onUpdatePlan(plan.id, 'maxClasses', Number(e.target.value))}
                      className="mt-0.5 font-bold text-navy-700 text-xs"
                    />
                  </div>
                  <div className="rounded-lg border border-line bg-white p-2">
                    <span className="text-ink-muted block text-[10px] font-medium">Học viên:</span>
                    <Input
                      type="number"
                      value={plan.maxStudents}
                      onChange={(e) => onUpdatePlan(plan.id, 'maxStudents', Number(e.target.value))}
                      className="mt-0.5 font-bold text-navy-700 text-xs"
                    />
                  </div>
                  <div className="rounded-lg border border-line bg-white p-2">
                    <span className="text-ink-muted block text-[10px] font-medium">AI / tháng:</span>
                    <Input
                      type="number"
                      value={plan.aiQuotaMonthly}
                      onChange={(e) => onUpdatePlan(plan.id, 'aiQuotaMonthly', Number(e.target.value))}
                      className="mt-0.5 font-bold text-navy-700 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Danh sách Tính năng */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-navy-700 uppercase tracking-wide">
                    Tính năng ({plan.features.filter((f) => f.enabled).length}/{plan.features.length})
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {plan.features.map((feature) => (
                    <div
                      key={feature.key}
                      className={cn(
                        'flex items-center justify-between gap-1.5 rounded-lg border p-2 text-xs transition-colors',
                        feature.enabled
                          ? 'border-line bg-white text-navy-700'
                          : 'border-dashed border-slate-200 bg-slate-50/60 text-slate-400',
                      )}
                    >
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {feature.enabled ? (
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                        ) : (
                          <X size={13} className="text-slate-300 shrink-0" />
                        )}
                        <span className={cn('text-[11px] truncate', !feature.enabled && 'line-through')}>
                          {feature.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Switch
                          checked={feature.enabled}
                          onChange={() => onToggleFeature(plan.id, feature.key)}
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveFeature(plan.id, feature.key)}
                          className="text-slate-300 hover:text-red-500 cursor-pointer p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Thêm tính năng nhanh */}
                <div className="flex items-center gap-1 pt-1">
                  <input
                    type="text"
                    id={`new_feat_${plan.id}`}
                    placeholder="+ Thêm tính năng..."
                    className="flex-1 rounded-lg border border-dashed border-line px-2.5 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onAddFeature(plan.id, e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById(`new_feat_${plan.id}`)
                      if (input && input.value) {
                        onAddFeature(plan.id, input.value)
                        input.value = ''
                      }
                    }}
                    className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-navy-700 hover:bg-slate-200 cursor-pointer"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Switch */}
            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
              <span className="text-xs font-medium text-ink-muted">Trạng thái mở bán:</span>
              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                <Switch
                  checked={plan.isActive}
                  onChange={(checked) => onUpdatePlan(plan.id, 'isActive', checked)}
                />
                <span className={plan.isActive ? 'text-emerald-600' : 'text-slate-400'}>
                  {plan.isActive ? 'Đang bán' : 'Tạm dừng'}
                </span>
              </label>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
