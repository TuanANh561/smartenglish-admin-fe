import { ShieldCheck } from 'lucide-react'

/**
 * Banner hiển thị trạng thái hạn mức tài nguyên (Quota):
 * - Nếu là Quản trị viên: Hiển thị chế độ xem trước không giới hạn (∞ Vô hạn) với phong cách sáng, tự nhiên, đồng bộ hệ thống
 * - Nếu là Giáo viên: Hiển thị hạn mức thực tế (Lớp học, Sĩ số/lớp, AI Quota) kèm nút bật/tắt tự động gia hạn
 */
export function TeacherQuotaBanner({
  isAdmin,
  effectiveQuota,
  cancellingRenewal,
  onCancelRenewal,
  onResumeRenewal,
  onCancelPlan,
}) {
  if (isAdmin) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-r from-white via-brand-50/30 to-slate-50/70 p-5 shadow-2xs">
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200/80 px-2.5 py-0.5 text-[11px] font-bold tracking-wide">
                <ShieldCheck size={13} className="text-brand-600" />
                Quản trị viên
              </span>
              <span className="text-xs text-slate-500">• Chế độ xem trước</span>
            </div>

            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-navy-900 sm:text-2xl">
              Tài khoản Quản trị viên
            </h2>

            <p className="mt-1 text-xs text-slate-500 max-w-xl leading-relaxed">
              Tài khoản sở hữu toàn quyền không giới hạn tài nguyên trên hệ thống.
            </p>
          </div>

          {/* 3 Đồng hồ Quota của Admin: Không giới hạn */}
          <div className="grid grid-cols-3 gap-3 border-t border-slate-200/80 pt-3 lg:border-t-0 lg:pt-0 sm:gap-6">
            <div className="text-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Lớp học</span>
              <span className="mt-1 text-lg font-bold text-brand-600 sm:text-xl block">
                ∞ Vô hạn
              </span>
            </div>

            <div className="text-center border-x border-slate-200/80 px-2 sm:px-6">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Sĩ số mỗi lớp</span>
              <span className="mt-1 text-lg font-bold text-brand-600 sm:text-xl block">
                ∞ Vô hạn
              </span>
            </div>

            <div className="text-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">AI Quota</span>
              <span className="mt-1 text-lg font-bold text-brand-600 sm:text-xl block">
                ∞ Vô hạn
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-2xs transition-all ${
        effectiveQuota?.isPremium
          ? 'border-brand-200/90 bg-gradient-to-r from-brand-50/50 via-white to-blue-50/30'
          : 'border-slate-200/90 bg-white'
      }`}
    >
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                effectiveQuota?.isPremium
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                  : 'bg-slate-100 text-slate-700 border border-slate-200/80'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  effectiveQuota?.isPremium ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              GÓI HIỆN TẠI
            </span>
            <span className="text-xs text-slate-500">
              • {effectiveQuota?.isPremium ? 'Đang kích hoạt gói Premium' : 'Gói Miễn Phí (Starter)'}
            </span>
          </div>

          <h2 className="mt-1.5 text-xl font-bold tracking-tight text-navy-900 sm:text-2xl">
            {effectiveQuota?.planName || 'Teacher Starter'}
          </h2>

          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            {effectiveQuota?.currentPeriodEnd && (
              <span>
                Hết hạn: <strong className="text-slate-800">
                  {new Intl.DateTimeFormat('vi-VN').format(new Date(effectiveQuota.currentPeriodEnd))}
                </strong>
              </span>
            )}
            {effectiveQuota?.isPremium && (
              <span>
                • Trạng thái gia hạn: <strong className="text-slate-800">
                  {effectiveQuota?.autoRenew ? 'Tự động gia hạn' : 'Không tự động gia hạn'}
                </strong>
              </span>
            )}
          </div>

          {effectiveQuota?.isPremium && onCancelPlan && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={onCancelPlan}
                className="text-xs text-[#B91C1C] underline hover:text-[#991B1B] cursor-pointer transition-colors"
              >
                Hủy gói & hoàn tiền
              </button>
            </div>
          )}
          {effectiveQuota?.isPremium && effectiveQuota.autoRenew === true && (
            <div className="mt-2.5">
              <button
                type="button"
                disabled={cancellingRenewal}
                onClick={onCancelRenewal}
                className="text-xs text-slate-500 underline hover:text-navy-900 cursor-pointer transition-colors"
              >
                {cancellingRenewal ? 'Đang xử lý...' : 'Tắt tự động gia hạn gói này'}
              </button>
            </div>
          )}
          {effectiveQuota?.isPremium && effectiveQuota.autoRenew === false && (
            <div className="mt-2.5">
              <button
                type="button"
                disabled={cancellingRenewal}
                onClick={onResumeRenewal}
                className="text-xs text-brand-600 font-semibold underline hover:text-brand-800 cursor-pointer transition-colors"
              >
                {cancellingRenewal ? 'Đang xử lý...' : 'Bật lại tự động gia hạn'}
              </button>
            </div>
          )}
        </div>

        {/* 3 Đồng hồ Quota */}
        <div className="grid grid-cols-3 gap-3 border-t border-slate-200/80 pt-4 lg:border-t-0 lg:pt-0 sm:gap-6">
          <div className="text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Lớp học</span>
            <span className="mt-1 text-xl font-bold text-navy-900 sm:text-2xl block">
              {effectiveQuota?.activeClasses ?? 0}
              <span className="text-sm font-normal text-slate-500"> / {effectiveQuota?.maxClasses ?? 3}</span>
            </span>
          </div>

          <div className="text-center border-x border-slate-200/80 px-2 sm:px-6">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Sĩ số tối đa</span>
            <span className="mt-1 text-xl font-bold text-navy-900 sm:text-2xl block">
              {effectiveQuota?.maxStudentsPerClass ?? 40}
              <span className="text-sm font-normal text-slate-500"> HV/lớp</span>
            </span>
          </div>

          <div className="text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">AI Quota</span>
            <span className="mt-1 text-xl font-bold text-brand-600 sm:text-2xl block">
              {effectiveQuota?.isPremium ? '∞ Unlimited' : `${effectiveQuota?.aiQuotaMonthly ?? 20} lượt/th`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherQuotaBanner
