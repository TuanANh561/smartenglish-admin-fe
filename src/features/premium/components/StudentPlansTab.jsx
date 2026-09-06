import { CheckCircle2, Plus, Star, Trash2, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Switch from '@/components/ui/Switch'
import { cn, formatCurrency } from '@/lib/utils'
import CurrencyInput from './CurrencyInput'

export default function StudentPlansTab({
  studentPlans,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan,
  onToggleFeature,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          <span className="text-xs font-bold text-navy-700 uppercase tracking-wide">
            Các gói dành cho Học viên ({studentPlans.length})
          </span>
        </div>
        <Button icon={Plus} size="sm" onClick={onAddPlan}>
          Thêm Gói Mới
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {studentPlans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              'flex flex-col justify-between border-2 transition-all relative',
              plan.isPopular
                ? 'border-brand-500 shadow-md ring-2 ring-brand-500/10'
                : 'border-line hover:border-slate-300',
            )}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-navy-700 px-3 py-0.5 text-[11px] font-bold text-white shadow-sm flex items-center gap-1">
                  <Star size={11} fill="#f59e0b" className="text-amber-400" /> Khuyên dùng
                </span>
              </div>
            )}

            <div className="space-y-4 pt-1">
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
                  className="p-1.5 text-ink-muted hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer mt-3.5"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-ink-muted uppercase">Nhãn phụ</label>
                  <Input
                    value={plan.badge || ''}
                    onChange={(e) => onUpdatePlan(plan.id, 'badge', e.target.value)}
                    className="text-xs mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-ink-muted uppercase">Thời hạn (Tháng)</label>
                  <Input
                    type="number"
                    value={plan.durationMonths}
                    onChange={(e) => onUpdatePlan(plan.id, 'durationMonths', Number(e.target.value))}
                    className="text-xs mt-0.5"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-200/80">
                <label className="text-[10px] font-bold text-ink-muted uppercase">Giá bán (VNĐ)</label>
                <CurrencyInput
                  value={plan.priceYearly > 0 ? plan.priceYearly : plan.priceMonthly}
                  onChange={(val) => {
                    if (plan.durationMonths >= 12) {
                      onUpdatePlan(plan.id, 'priceYearly', val)
                    } else {
                      onUpdatePlan(plan.id, 'priceMonthly', val)
                    }
                  }}
                  className="font-bold text-navy-700 text-sm mt-0.5"
                />
                <span className="text-[11px] font-semibold text-brand-600 mt-1 block">
                  {(plan.priceYearly > 0 ? plan.priceYearly : plan.priceMonthly) === 0
                    ? '0 đ (Miễn phí)'
                    : `${formatCurrency(plan.priceYearly > 0 ? plan.priceYearly : plan.priceMonthly)} / ${plan.durationMonths === 999 ? 'Trọn đời' : `${plan.durationMonths || 1} tháng`}`}
                </span>
              </div>

              {/* Tính năng */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-navy-700 uppercase tracking-wide block">
                  Quyền lợi ({plan.features.filter((f) => f.enabled).length})
                </span>
                <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                  {plan.features.map((feature) => (
                    <div
                      key={feature.key}
                      className="flex items-center justify-between gap-1 rounded-lg border border-line bg-white p-2 text-xs"
                    >
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {feature.enabled ? (
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                        ) : (
                          <X size={13} className="text-slate-300 shrink-0" />
                        )}
                        <span className={cn('text-[11px] truncate', !feature.enabled && 'line-through text-slate-400')}>
                          {feature.label}
                        </span>
                      </div>
                      <Switch
                        checked={feature.enabled}
                        onChange={() => onToggleFeature(plan.id, feature.key)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
              <span className="text-xs font-medium text-ink-muted">Mở bán:</span>
              <Switch
                checked={plan.isActive}
                onChange={(checked) => onUpdatePlan(plan.id, 'isActive', checked)}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
