import { useState } from 'react'
import {
  Bot,
  Camera,
  CheckCircle2,
  FileText,
  Infinity as InfinityIcon,
  Mic,
  Plus,
  Sparkles,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react'
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
  onAddFeature,
  onRemoveFeature,
}) {
  const [newFeatureText, setNewFeatureText] = useState({})

  const handleAddNewFeature = (planId) => {
    const text = newFeatureText[planId]
    if (!text || !text.trim()) return
    if (onAddFeature) {
      onAddFeature(planId, text.trim())
    }
    setNewFeatureText((prev) => ({ ...prev, [planId]: '' }))
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
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

      {/* Grid 4 columns for Student Plans */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {studentPlans.map((plan) => {
          const isUnlimited = (val) => val == null || val >= 9999
          const currentPrice = plan.priceYearly > 0 ? plan.priceYearly : plan.priceMonthly

          return (
            <Card
              key={plan.id}
              className={cn(
                'flex flex-col justify-between border-2 transition-all relative',
                plan.isPopular
                  ? 'border-brand-500 shadow-md ring-2 ring-brand-500/10'
                  : 'border-line hover:border-slate-300',
              )}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-navy-700 px-3 py-0.5 text-[11px] font-bold text-white shadow-sm flex items-center gap-1">
                    <Star size={11} fill="#f59e0b" className="text-amber-400" /> Khuyên dùng
                  </span>
                </div>
              )}

              <div className="space-y-3.5 pt-1">
                {/* 1. Top Bar: Tên gói & Xoá */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-ink-muted uppercase">Tên gói</label>
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

                {/* 2. Badge & Thời hạn */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-ink-muted uppercase">Nhãn phụ</label>
                    <Input
                      value={plan.badge || ''}
                      onChange={(e) => onUpdatePlan(plan.id, 'badge', e.target.value)}
                      placeholder="VD: Linh hoạt"
                      className="text-sm mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-ink-muted uppercase">
                      {plan.durationMonths === 999 ? 'Thời hạn' : 'Thời hạn (Tháng)'}
                    </label>
                    <Input
                      type="number"
                      value={plan.durationMonths}
                      onChange={(e) => onUpdatePlan(plan.id, 'durationMonths', Number(e.target.value))}
                      className="text-sm mt-0.5 font-semibold text-navy-700"
                    />
                  </div>
                </div>

                {/* 3. Giá bán */}
                <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-ink-muted uppercase">Giá bán (VNĐ)</label>
                    <span className="text-xs text-brand-600 font-semibold">
                      {plan.durationMonths === 999 ? 'Trọn đời' : plan.durationMonths >= 12 ? 'Theo năm' : 'Theo tháng'}
                    </span>
                  </div>
                  <CurrencyInput
                    value={currentPrice}
                    onChange={(val) => {
                      if (plan.durationMonths >= 12 || plan.durationMonths === 999) {
                        onUpdatePlan(plan.id, 'priceYearly', val)
                      } else {
                        onUpdatePlan(plan.id, 'priceMonthly', val)
                      }
                    }}
                    className="font-bold text-navy-700 text-sm"
                  />
                  <div className="mt-1 flex items-center justify-between text-xs font-semibold">
                    <span className="text-ink-muted">Hiển thị:</span>
                    <span className="text-brand-600">
                      {currentPrice === 0
                        ? '0 đ (Miễn phí)'
                        : `${formatCurrency(currentPrice)} / ${plan.durationMonths === 999 ? 'Trọn đời' : `${plan.durationMonths || 1} tháng`}`}
                    </span>
                  </div>
                </div>

                {/* 4. HẠN MỨC QUOTA AI & LỚP HỌC (QUOTA LIMITS SECTION) */}
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-1">
                      <Sparkles size={12} className="text-indigo-600" />
                      Hạn Mức Quota AI & Lớp Học
                    </span>
                    <span className="text-xs text-indigo-600 font-medium">9999 = Vô hạn</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {/* AI Chat */}
                    <div className="rounded-lg bg-white p-1.5 border border-indigo-100/80 shadow-2xs">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-0.5">
                        <span className="flex items-center gap-1 font-medium">
                          <Bot size={12} className="text-indigo-500" /> AI Chat
                        </span>
                        <span className="text-xs text-slate-400">/ngày</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={plan.dailyAiChat ?? 15}
                          onChange={(e) => onUpdatePlan(plan.id, 'dailyAiChat', Number(e.target.value))}
                          className="h-8 text-sm font-bold text-navy-700 py-0 px-2"
                        />
                        {isUnlimited(plan.dailyAiChat) && (
                          <InfinityIcon size={14} className="text-emerald-600 shrink-0" title="Vô hạn" />
                        )}
                      </div>
                    </div>

                    {/* AI Speaking */}
                    <div className="rounded-lg bg-white p-1.5 border border-indigo-100/80 shadow-2xs">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-0.5">
                        <span className="flex items-center gap-1 font-medium">
                          <Mic size={12} className="text-rose-500" /> Phát âm AI
                        </span>
                        <span className="text-xs text-slate-400">/ngày</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={plan.dailyAiSpeaking ?? 10}
                          onChange={(e) => onUpdatePlan(plan.id, 'dailyAiSpeaking', Number(e.target.value))}
                          className="h-8 text-sm font-bold text-navy-700 py-0 px-2"
                        />
                        {isUnlimited(plan.dailyAiSpeaking) && (
                          <InfinityIcon size={14} className="text-emerald-600 shrink-0" title="Vô hạn" />
                        )}
                      </div>
                    </div>

                    {/* AI Writing */}
                    <div className="rounded-lg bg-white p-1.5 border border-indigo-100/80 shadow-2xs">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-0.5">
                        <span className="flex items-center gap-1 font-medium">
                          <FileText size={12} className="text-amber-500" /> Viết luận AI
                        </span>
                        <span className="text-xs text-slate-400">/tuần</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={plan.weeklyAiWriting ?? 2}
                          onChange={(e) => onUpdatePlan(plan.id, 'weeklyAiWriting', Number(e.target.value))}
                          className="h-8 text-sm font-bold text-navy-700 py-0 px-2"
                        />
                        {isUnlimited(plan.weeklyAiWriting) && (
                          <InfinityIcon size={14} className="text-emerald-600 shrink-0" title="Vô hạn" />
                        )}
                      </div>
                    </div>

                    {/* AI Scan */}
                    <div className="rounded-lg bg-white p-1.5 border border-indigo-100/80 shadow-2xs">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-0.5">
                        <span className="flex items-center gap-1 font-medium">
                          <Camera size={12} className="text-cyan-500" /> Quét đề AI
                        </span>
                        <span className="text-xs text-slate-400">/ngày</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={plan.dailyAiScan ?? 5}
                          onChange={(e) => onUpdatePlan(plan.id, 'dailyAiScan', Number(e.target.value))}
                          className="h-8 text-sm font-bold text-navy-700 py-0 px-2"
                        />
                        {isUnlimited(plan.dailyAiScan) && (
                          <InfinityIcon size={14} className="text-emerald-600 shrink-0" title="Vô hạn" />
                        )}
                      </div>
                    </div>

                    {/* Lớp học tối đa (col-span-2) */}
                    <div className="col-span-2 rounded-lg bg-white p-1.5 border border-indigo-100/80 shadow-2xs flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[10px] font-medium text-slate-600">
                        <Users size={11} className="text-emerald-600" /> Số lớp tham gia tối đa:
                      </span>
                      <div className="flex items-center gap-1 w-24">
                        <Input
                          type="number"
                          value={plan.maxClasses ?? 3}
                          onChange={(e) => onUpdatePlan(plan.id, 'maxClasses', Number(e.target.value))}
                          className="h-7 text-xs font-bold text-navy-700 py-0 px-2"
                        />
                        {isUnlimited(plan.maxClasses) && (
                          <InfinityIcon size={14} className="text-emerald-600 shrink-0" title="Vô hạn" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. DANH SÁCH QUYỀN LỢI TÍNH NĂNG */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-navy-700 uppercase tracking-wide">
                      Quyền lợi ({plan.features.filter((f) => f.enabled).length}/{plan.features.length})
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {plan.features.map((feature) => (
                      <div
                        key={feature.key}
                        className={cn(
                          'flex items-center justify-between gap-1 rounded-lg border p-1.5 text-xs transition-colors',
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
                          <span
                            className={cn('text-[11px] truncate', !feature.enabled && 'line-through text-slate-400')}
                            title={feature.label}
                          >
                            {feature.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Switch
                            checked={feature.enabled}
                            onChange={() => onToggleFeature(plan.id, feature.key)}
                          />
                          {onRemoveFeature && (
                            <button
                              type="button"
                              onClick={() => onRemoveFeature(plan.id, feature.key)}
                              className="text-slate-300 hover:text-red-500 p-0.5 rounded cursor-pointer transition-colors"
                              title="Xóa quyền lợi"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input thêm quyền lợi mới */}
                  {onAddFeature && (
                    <div className="pt-1.5 flex items-center gap-1">
                      <Input
                        placeholder="Thêm quyền lợi mới..."
                        value={newFeatureText[plan.id] || ''}
                        onChange={(e) =>
                          setNewFeatureText((prev) => ({ ...prev, [plan.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddNewFeature(plan.id)
                          }
                        }}
                        className="text-xs h-7 py-0"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddNewFeature(plan.id)}
                        className="h-7 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom: Mở bán & Đặt nổi bật */}
              <div className="mt-3 pt-2.5 border-t border-line flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 font-medium text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={plan.isPopular}
                    onChange={(e) => onUpdatePlan(plan.id, 'isPopular', e.target.checked)}
                    className="rounded border-line text-brand-500 focus:ring-brand-500"
                  />
                  <span>Nổi bật</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-500">Mở bán:</span>
                  <Switch
                    checked={plan.isActive}
                    onChange={(checked) => onUpdatePlan(plan.id, 'isActive', checked)}
                  />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
