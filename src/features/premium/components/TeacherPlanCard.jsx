import React from 'react'
import {
  Check,
  ShieldCheck,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export default function TeacherPlanCard({
  plan,
  pIdx,
  billingCycle,
  currentPlanId,
  currentBillingCycle = 'monthly',
  subscribingId,
  onSubscribe,
}) {
  const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly
  const planId = plan.numericId || pIdx + 1
  const isCurrentPlan = planId === currentPlanId

  // Phân biệt trạng thái chu kỳ thanh toán
  const isExactActivePlan = isCurrentPlan && currentBillingCycle === billingCycle
  const isUpgradingCycleToYearly = isCurrentPlan && currentBillingCycle === 'monthly' && billingCycle === 'yearly'
  const isLowerBillingCycle = isCurrentPlan && currentBillingCycle === 'yearly' && billingCycle === 'monthly'

  const isStarterFallback = planId === 1 && currentPlanId > 1
  const isLowerPaidPlan = planId > 1 && planId < currentPlanId

  return (
    <div
      key={plan.id}
      className={[
        'relative flex flex-col rounded-2xl border bg-white p-6 shadow-xs transition-all hover:shadow-md',
        isExactActivePlan ? 'border-2 border-brand-500 ring-2 ring-brand-500/10' : 'border-line',
      ].join(' ')}
    >
      {/* Badge trên cùng */}
      {(plan.badge || (isExactActivePlan && 'Đang sử dụng')) && (
        <span
          className={[
            'absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-bold shadow-xs',
            isExactActivePlan ? 'bg-brand-500 text-white' : 'bg-navy-700 text-white',
          ].join(' ')}
        >
          {isExactActivePlan ? 'Đang sử dụng' : plan.badge}
        </span>
      )}

      {/* Mác ưu đãi nổi bật góc trên bên phải */}
      {(plan.id.includes('pro') || plan.name.includes('Pro') || price === 20000) && (
        <span className="absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200/90 px-2.5 py-0.5 text-[11px] font-extrabold text-rose-600 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          Ưu đãi 20k
        </span>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold text-navy-700">{plan.name}</h3>
        <p className="mt-1 text-sm text-ink-muted min-h-[36px]">{plan.subtitle}</p>
      </div>

      {/* Price */}
      <div className="mb-6 border-b border-line pb-5">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-3xl font-black text-navy-700">
            {price === 0 ? 'Miễn phí' : formatCurrency(price)}
          </span>
          {(plan.id.includes('pro') || plan.name.includes('Pro') || price === 20000) && (
            <>
              <span className="text-sm font-semibold text-slate-400 line-through">
                {formatCurrency(billingCycle === 'yearly' ? 1990000 : 199000)}
              </span>
              <span className="rounded-md bg-rose-100 text-rose-700 font-extrabold text-[10px] px-1.5 py-0.5 border border-rose-200">
                GIẢM 90%
              </span>
            </>
          )}
          {price > 0 && (
            <span className="text-sm text-ink-muted">
              / {billingCycle === 'yearly' ? 'năm' : 'tháng'}
            </span>
          )}
        </div>
        {billingCycle === 'yearly' && price > 0 && !(plan.id.includes('pro') || plan.name.includes('Pro')) && (
          <p className="mt-1 text-sm text-emerald-600 font-medium">
            Tương đương {formatCurrency(Math.round(price / 12))}/tháng
          </p>
        )}
      </div>

      {/* Features List */}
      <ul className="mb-8 flex-1 space-y-3">
        {(plan.features || []).map((feat, fIdx) => (
          <li key={fIdx} className="flex items-start gap-2.5 text-xs text-ink leading-relaxed">
            <span
              className={[
                'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                feat.included ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400',
              ].join(' ')}
            >
              {feat.included ? <Check size={11} strokeWidth={3} /> : '–'}
            </span>
            <span className={feat.included ? 'font-medium' : 'text-slate-400 line-through'}>
              {feat.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      {isExactActivePlan ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 py-2.5 text-center text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5 shadow-2xs">
          <ShieldCheck size={15} /> Gói Bạn Đang Dùng
        </div>
      ) : isUpgradingCycleToYearly ? (
        <div className="space-y-1.5">
          <Button
            className="w-full justify-center shadow-xs"
            variant="primary"
            loading={subscribingId === plan.id}
            disabled={subscribingId === plan.id}
            onClick={() => onSubscribe(plan)}
          >
            {subscribingId === plan.id ? 'Đang xử lý...' : 'Nâng Cấp Gói 1 Năm'}
          </Button>
          <p className="text-center text-[11px] font-semibold text-emerald-600">
            ✓ Tự động cộng dồn thời hạn 1 tháng hiện tại
          </p>
        </div>
      ) : isLowerBillingCycle ? (
        <button
          disabled
          className="w-full cursor-default rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-center text-xs font-semibold text-slate-500"
        >
          Đang sử dụng gói năm (Hiệu lực cao hơn)
        </button>
      ) : isStarterFallback ? (
        <button
          disabled
          className="w-full cursor-default rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-center text-xs font-semibold text-slate-500"
        >
          Tự động áp dụng khi hết hạn
        </button>
      ) : isLowerPaidPlan ? (
        <button
          disabled
          className="w-full cursor-default rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-center text-xs font-semibold text-slate-500"
        >
          Không thể hạ gói giữa kỳ
        </button>
      ) : (
        <Button
          className="w-full justify-center shadow-xs"
          variant={plan.isPopular ? 'primary' : 'secondary'}
          loading={subscribingId === plan.id}
          disabled={subscribingId === plan.id}
          onClick={() => onSubscribe(plan)}
        >
          {subscribingId === plan.id
            ? 'Đang xử lý...'
            : price === 0
            ? 'Bắt đầu Miễn Phí'
            : (plan.id.includes('pro') || plan.name.includes('Pro') || price === 20000)
            ? 'Nâng Cấp Pro (20.000đ)'
            : 'Nâng Cấp Ngay'}
        </Button>
      )}
    </div>
  )
}
