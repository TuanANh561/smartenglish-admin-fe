import { CheckCircle2, QrCode, CreditCard } from 'lucide-react'

export default function AdminPaymentTab() {
  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-3">
        <h3 className="text-base font-bold text-navy-800">Cổng thanh toán</h3>
        <p className="text-xs text-ink-muted mt-0.5">
          Quản lý các phương thức thanh toán và tài khoản nhận thanh toán của hệ thống.
        </p>
      </div>

      {/* 1. CỔNG THANH TOÁN CHÍNH: VietQR TỰ ĐỘNG */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs shrink-0">
              <QrCode size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-navy-800 text-sm">Chuyển khoản VietQR (Tự động kích hoạt)</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2.5 py-0.5 border border-emerald-200">
                  <CheckCircle2 size={11} className="text-emerald-600" />
                  Đang hoạt động
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kiểm tra giao dịch tự động qua mã QR và kích hoạt tài khoản ngay khi nhận thanh toán.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Ngân hàng thụ hưởng</span>
            <span className="font-bold text-navy-800 mt-0.5 block">MB Bank (Quân Đội)</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Số tài khoản</span>
            <span className="font-mono font-bold text-navy-800 mt-0.5 block">0963684871</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Chủ tài khoản</span>
            <span className="font-bold text-navy-800 mt-0.5 block">NGUYEN TUAN ANH</span>
          </div>
        </div>
      </div>

      {/* 2. CÁC PHƯƠNG THỨC BỔ SUNG */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 shrink-0">
            <CreditCard size={20} />
          </div>
          <div>
            <h4 className="font-bold text-navy-800 text-sm">Cổng thanh toán thẻ & Ví điện tử</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Hỗ trợ thêm thẻ quốc tế (Visa/Mastercard) và ví điện tử trong các phiên bản tiếp theo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
