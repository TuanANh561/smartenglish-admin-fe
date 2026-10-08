import { useState } from 'react'
import {
  Lock,
  Sparkles,
  Bell,
  CheckCircle2,
  Building,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { VIETNAM_BANKS } from '../settingsConstants'

export default function TeacherBankingTab({
  currentUser,
  settings,
  onUpdateField,
}) {
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleNotifyMe = () => {
    setIsSubscribed(true)
    toast.success('Đã lưu thông tin! Chúng tôi sẽ thông báo cho bạn ngay khi mở tính năng.')
  }

  return (
    <div className="space-y-6 relative">
      <div className="border-b border-line pb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-navy-800">
              Thông tin Tài khoản nhận tiền & Thẻ ngân hàng
            </h3>
            <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 border border-amber-300">
              Sắp ra mắt (Coming Soon)
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Cài đặt tài khoản ngân hàng để nhận doanh thu khi mở bán khóa học và tài liệu trực tuyến.
          </p>
        </div>
      </div>

      {/* BANNER THÔNG BÁO TÍNH NĂNG COMING SOON */}
      <div className="rounded-2xl border-2 border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-yellow-50/80 p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shrink-0">
            <Lock size={20} />
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
              <Sparkles size={16} className="text-amber-600" />
              Tính năng Bán khóa học & Nhận doanh thu tự động đang phát triển
            </h4>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              Hệ thống đang hoàn thiện phân hệ chia sẻ doanh thu và cổng rút tiền tự động dành cho Giáo viên. 
              Sau khi hoàn tất, bạn có thể thiết lập số tài khoản ngân hàng bên dưới để hệ thống đối soát và chuyển tiền định kỳ hàng tháng.
            </p>

            <div className="pt-2">
              {isSubscribed ? (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 shadow-xs">
                  <CheckCircle2 size={15} />
                  Đã đăng ký nhận thông báo! Chúng tôi sẽ gửi tin khi tính năng mở cổng.
                </span>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  icon={Bell}
                  onClick={handleNotifyMe}
                  className="bg-amber-700 hover:bg-amber-800 text-white border-0"
                >
                  Đăng ký nhận thông báo sớm khi ra mắt
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FORM GIAO DIỆN TÀI KHOẢN NGÂN HÀNG (ĐƯỢC THIẾT KẾ ĐẦY ĐỦ NHƯNG KHÓA / DISABLED) */}
      <div className="relative rounded-2xl border border-slate-200 p-6 bg-slate-50/40 opacity-75 select-none pointer-events-none">
        {/* Watermark Coming Soon mờ */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[0.5px] rounded-2xl z-10">
          <div className="rounded-2xl bg-navy-900/85 text-white px-5 py-3 shadow-2xl flex items-center gap-2.5 border border-white/20">
            <Lock size={18} className="text-amber-400" />
            <span className="text-xs font-bold tracking-wide">
              GIAO DIỆN XEM TRƯỚC — ĐANG TẠM KHÓA
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Ngân hàng thụ hưởng (Việt Nam)
            </label>
            <Select
              value={settings.banking.bankName}
              onChange={(e) => onUpdateField('banking', 'bankName', e.target.value)}
              className="text-xs font-semibold"
              disabled
            >
              {VIETNAM_BANKS.map((b) => (
                <option key={b.code} value={b.name}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Số tài khoản ngân hàng
            </label>
            <Input
              value={settings.banking.accountNumber}
              placeholder="Ví dụ: 0071 0012 34567..."
              className="font-mono text-xs"
              disabled
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Tên chủ tài khoản (In hoa không dấu)
            </label>
            <Input
              value={settings.banking.accountHolder}
              placeholder="NGUYEN VAN A"
              className="font-semibold text-xs uppercase"
              disabled
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Chi nhánh mở tài khoản
            </label>
            <Input
              value={settings.banking.branch}
              placeholder="Ví dụ: Chi nhánh Thăng Long, Hà Nội"
              className="text-xs"
              disabled
            />
          </div>
        </div>

        {/* Demo thẻ liên kết trực quan */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
            Mô phỏng Thẻ liên kết nhận tiền
          </label>
          <div className="max-w-sm rounded-2xl bg-gradient-to-tr from-navy-900 via-navy-800 to-brand-700 p-5 text-white shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold tracking-widest text-white/80">
                SMARTENGLISH PAYOUT
              </span>
              <Building size={18} className="text-white/60" />
            </div>
            <div className="py-2">
              <p className="font-mono text-base tracking-widest text-slate-200">
                •••• •••• •••• 8888
              </p>
            </div>
            <div className="flex justify-between items-end text-[10px]">
              <div>
                <p className="text-white/60 uppercase">Chủ tài khoản</p>
                <p className="font-bold text-xs uppercase text-white mt-0.5">
                  {currentUser?.displayName || 'GIANG VIEN SMARTENGLISH'}
                </p>
              </div>
              <span className="rounded bg-white/20 px-2 py-0.5 font-bold text-white text-[9px]">
                VIETCOMBANK
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
