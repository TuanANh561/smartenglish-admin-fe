import { Gift, Copy, Lock, Users } from 'lucide-react'

/**
 * Thẻ thông tin Mã giới thiệu (Affiliate/Referral) và Gói tài trợ theo lớp (Class Pass).
 */
export function TeacherReferralCard({ referralCode = 'TEACHER-MAI20', copiedCode, onCopyCode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Card Mã Giới Thiệu (Affiliate) */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Gift size={20} />
          </span>
          <div>
            <h3 className="font-bold text-navy-700 text-base">Mã Giới Thiệu Học Viên</h3>
            <p className="text-xs text-ink-muted">Nhận 20% hoa hồng khi học viên đăng ký</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-dashed border-brand-300 bg-brand-50/50 p-3">
          <span className="font-mono text-sm font-bold text-brand-700 tracking-wider">
            {referralCode}
          </span>
          <button
            type="button"
            onClick={onCopyCode}
            className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-navy-700 shadow-sm hover:bg-slate-50 border border-line cursor-pointer"
          >
            <Copy size={13} />
            {copiedCode ? 'Đã chép' : 'Sao chép'}
          </button>
        </div>

        <div className="border-t border-line pt-3 flex items-center justify-between text-xs text-ink-muted">
          <span>
            Đã có <strong className="text-navy-700">18 học viên</strong> sử dụng
          </span>
          <span className="text-emerald-600 font-semibold">Tích cực</span>
        </div>
      </div>

      {/* Card Gói Mua Theo Lớp (Class Pass) */}
      <div className="lg:col-span-2 relative rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4 overflow-hidden">
        <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-white/70 flex flex-col items-center justify-center rounded-2xl gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500 shadow-2xs">
            <Lock size={26} strokeWidth={2} />
          </span>
          <div className="text-center px-4">
            <p className="text-sm font-bold text-slate-800">Sắp ra mắt</p>
            <p className="text-xs text-slate-500 mt-0.5 max-w-[280px]">
              Tính năng ưu đãi mua sỉ bản quyền cho lớp học đang được phát triển và sẽ ra mắt sớm
            </p>
          </div>
          <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-600">
            Coming Soon
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <Users size={20} />
            </span>
            <div>
              <h3 className="font-bold text-navy-700 text-base">Gói Tài Trợ Cho Lớp Học (Class Pass)</h3>
              <p className="text-xs text-ink-muted">Mua sỉ gói Premium cho cả lớp với chiết khấu lên đến 60%</p>
            </div>
          </div>
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
            Tiết kiệm tối đa
          </span>
        </div>

        <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
          Tính năng mua sỉ gói lớp học đang được chuẩn bị để tích hợp trực tiếp.
        </div>
      </div>
    </div>
  )
}

export default TeacherReferralCard

