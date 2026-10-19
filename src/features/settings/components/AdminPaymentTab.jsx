import { CheckCircle2, Lock, QrCode } from 'lucide-react'
import Input from '@/components/ui/Input'
import Switch from '@/components/ui/Switch'

export default function AdminPaymentTab({ settings, onUpdateField }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-3">
        <h3 className="text-base font-bold text-navy-800">Cổng thanh toán</h3>
        <p className="text-xs text-ink-muted mt-0.5">
          Quản lý các phương thức thanh toán và tài khoản nhận thanh toán của hệ thống.
        </p>
      </div>

      {/* 1. CỔNG THANH TOÁN ĐANG HOẠT ĐỘNG: VietQR */}
      <div className="rounded-2xl border-2 border-emerald-300/80 bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-slate-50/60 p-5 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shrink-0">
              <QrCode size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-navy-800 text-sm">Chuyển khoản VietQR 24/7 (Tự động kích hoạt)</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-0.5 border border-emerald-200">
                  <CheckCircle2 size={11} className="text-emerald-600" />
                  Đang hoạt động
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Hệ thống tự động kiểm tra giao dịch chuyển khoản và kích hoạt tài khoản học viên ngay lập tức.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-emerald-200/60 text-xs">
          <div className="bg-white/80 p-3 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Ngân hàng thụ hưởng</span>
            <span className="font-bold text-navy-800 mt-0.5 block">MB Bank (Quân Đội)</span>
          </div>
          <div className="bg-white/80 p-3 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Số tài khoản</span>
            <span className="font-mono font-bold text-navy-800 mt-0.5 block">0963684871</span>
          </div>
          <div className="bg-white/80 p-3 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Chủ tài khoản</span>
            <span className="font-bold text-navy-800 mt-0.5 block">NGUYEN TUAN ANH</span>
          </div>
        </div>

        <div className="bg-white/80 p-3.5 rounded-xl border border-emerald-100 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-600 uppercase block">
            Trạng thái xử lý giao dịch tự động:
          </span>
          <p className="text-xs text-slate-700 leading-relaxed">
            Hệ thống đã được thiết lập kết nối sẵn sàng với tài khoản ngân hàng để tự động đối soát và kích hoạt gói học viên ngay khi có thanh toán.
          </p>
        </div>
      </div>

      {/* 2. CỔNG VNPAY (SẮP RA MẮT) */}
      <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50/50 opacity-80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 text-sm">Cổng thanh toán VNPay</span>
            <span className="rounded bg-red-50 text-red-600 font-mono text-[10px] font-bold px-1.5 py-0.5">
              VNPay
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 border border-amber-300">
              <Lock size={10} />
              Sắp ra mắt
            </span>
          </div>
          <Switch checked={false} disabled onChange={() => {}} />
        </div>
        <p className="text-[11px] text-ink-muted">
          Phương thức thanh toán qua VNPay đang được hoàn thiện và sẽ sớm khả dụng.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 border-t border-slate-200/80">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase">Mã định danh đối tác (Merchant ID)</label>
            <Input
              disabled
              value="SMARTENG_VNPAY"
              className="mt-0.5 font-mono text-xs bg-slate-100 text-slate-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase">Khóa bí mật (Secret Key)</label>
            <Input
              type="password"
              disabled
              value="••••••••••••••••••••"
              className="mt-0.5 font-mono text-xs bg-slate-100 text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* 3. VÍ MOMO (SẮP RA MẮT) */}
      <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50/50 opacity-80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 text-sm">Ví Điện Tử MoMo</span>
            <span className="rounded bg-pink-50 text-pink-600 font-mono text-[10px] font-bold px-1.5 py-0.5">
              MoMo
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 border border-amber-300">
              <Lock size={10} />
              Sắp ra mắt
            </span>
          </div>
          <Switch checked={false} disabled onChange={() => {}} />
        </div>
        <p className="text-[11px] text-ink-muted">
          Phương thức thanh toán qua ví MoMo đang được hoàn thiện và sẽ sớm khả dụng.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 border-t border-slate-200/80">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase">Mã đối tác (Partner Code)</label>
            <Input
              disabled
              value="MOMO_SMARTENG_2026"
              className="mt-0.5 font-mono text-xs bg-slate-100 text-slate-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase">Khóa truy cập (Access Key)</label>
            <Input
              type="password"
              disabled
              value="••••••••••••••••••••"
              className="mt-0.5 font-mono text-xs bg-slate-100 text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

