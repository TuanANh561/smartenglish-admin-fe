import { useState } from 'react'
import {
  CheckCircle2,
  QrCode,
  Bot,
  Mic,
  FileText,
  Camera,
  Users,
  BookOpen,
  ShieldCheck,
  Tag,
  Gift,
  X,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { CORE_STUDENT_BENEFITS } from '../constants/pricingConstants'

/**
 * Giao diện xem trước Paywall Học viên (Mobile Preview) dành cho Admin và kiểm thử:
 * - 4 Quyền lợi nổi bật khi lên Pro
 * - Lưới các gói dịch vụ học viên (Free, Pro Tháng, Pro Năm, Trọn đời) kèm nút VietQR
 * - Bảng so sánh hạn mức Quota chi tiết
 */
export function StudentMobilePreviewSection({
  studentPlansList = [],
  isAdmin,
  selectedUser,
  studentSimMode,
  onSubscribeStudentPlan,
}) {
  const [voucherInput, setVoucherInput] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(null)

  const handleApplyVoucher = (e) => {
    e.preventDefault()
    const clean = voucherInput.trim().toUpperCase()
    if (!clean) return
    if (clean === 'VIP99' || clean === 'TEST99') {
      setAppliedVoucher({ code: clean, percent: 99, label: 'Giảm 99%' })
    } else if (clean === 'TEST90' || clean === 'VIP90') {
      setAppliedVoucher({ code: clean, percent: 90, label: 'Giảm 90%' })
    } else if (clean === 'TEACHER-MAI20' || clean.startsWith('TEACHER-')) {
      setAppliedVoucher({ code: clean, percent: 20, label: 'Giảm 20%' })
    } else {
      setAppliedVoucher({ code: clean, percent: 20, label: 'Giảm 20%' })
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherInput('')
  }
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Bốn Quyền lợi cốt lõi */}
      <div>
        <div className="text-center mb-6">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
            QUYỀN LỢI NỔI BẬT KHI LÊN PRO
          </h3>
          <p className="text-base font-bold text-slate-900 mt-1">
            Trải nghiệm sức mạnh công nghệ AI thế hệ mới
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CORE_STUDENT_BENEFITS.map((item, idx) => {
            const IconComponent = item.icon
            return (
              <div
                key={idx}
                className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:shadow-md hover:border-slate-300"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg} ${item.color} border ${item.border} mb-3.5`}
                >
                  <IconComponent size={22} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. Lưới các gói Học viên */}
      <div>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Bảng gói dịch vụ Học viên từ hệ thống</h3>
            <p className="text-xs text-slate-500">
              Đồng bộ trực tiếp từ cấu hình cơ sở dữ liệu Payment Service
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Tổng cộng: {studentPlansList.length} gói học viên
          </span>
        </div>

        {/* Khối áp dụng Voucher / Mã ưu đãi */}
        <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100 shrink-0">
              <Gift size={20} />
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Mã ưu đãi / Voucher kiểm thử
                {appliedVoucher && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Đã áp dụng {appliedVoucher.code} ({appliedVoucher.label})
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-500">
                Nhập mã ưu đãi (VD: <code className="font-mono text-brand-700 font-bold">VIP99</code> giảm 99%, <code className="font-mono text-brand-700 font-bold">TEST90</code> giảm 90%, <code className="font-mono text-brand-700 font-bold">TEACHER-MAI20</code> giảm 20%)
              </p>
            </div>
          </div>

          {appliedVoucher ? (
            <button
              type="button"
              onClick={handleRemoveVoucher}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition shadow-2xs cursor-pointer shrink-0"
            >
              <X size={14} />
              <span>Hủy áp dụng mã</span>
            </button>
          ) : (
            <form onSubmit={handleApplyVoucher} className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <div className="relative flex-1 sm:w-56">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value)}
                  placeholder="Nhập mã (VIP99, TEST90...)"
                  className="w-full pl-8.5 pr-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={!voucherInput.trim()}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 text-xs font-bold text-white shadow-xs transition cursor-pointer"
              >
                Áp dụng
              </button>
            </form>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {studentPlansList.map((plan) => {
            const isFree = plan.id === 'S-PLAN-FREE' || (!plan.priceMonthly && !plan.priceYearly)
            const isMonthly = plan.id === 'S-PLAN-MONTHLY' || plan.priceMonthly === 20000
            const isYearly = plan.id === 'S-PLAN-YEARLY' || plan.priceYearly === 1490000
            const isLifetime = plan.id === 'S-PLAN-LIFETIME' || plan.priceYearly === 3990000

            const isCurrent =
              studentSimMode === 'pro' ? isYearly || isLifetime : isFree

            const rawPrice = plan.priceYearly > 0 ? plan.priceYearly : plan.priceMonthly
            const hasDiscount = appliedVoucher && rawPrice > 0
            const displayPrice = hasDiscount
              ? Math.max(2000, Math.round(rawPrice * (1 - appliedVoucher.percent / 100)))
              : rawPrice

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-xs transition-all hover:shadow-md ${
                  isCurrent
                    ? 'border-2 border-amber-500 ring-2 ring-amber-500/10'
                    : isMonthly
                    ? 'border-2 border-brand-500 ring-2 ring-brand-500/10'
                    : 'border-slate-200'
                }`}
              >
                {/* Badge góc trên */}
                {plan.badge && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-bold shadow-xs ${
                      isCurrent
                        ? 'bg-amber-600 text-white'
                        : isMonthly
                        ? 'bg-rose-600 text-white'
                        : 'bg-navy-700 text-white'
                    }`}
                  >
                    {isCurrent ? 'Đang sử dụng' : plan.badge}
                  </span>
                )}

                <div className="space-y-4">
                  {/* Tiêu đề & giá */}
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{plan.name}</h4>
                    <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
                      <span className={`text-2xl font-black tracking-tight ${hasDiscount ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {formatCurrency(displayPrice)}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {isFree ? '' : isMonthly ? '/ tháng' : isYearly ? '/ năm' : 'trọn đời'}
                      </span>
                    </div>
                    {hasDiscount ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-slate-400 line-through">{formatCurrency(rawPrice)}</span>
                        <span className="rounded-md bg-emerald-50 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          {appliedVoucher.label}
                        </span>
                      </div>
                    ) : isMonthly ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-slate-400 line-through">199.000đ</span>
                        <span className="rounded-md bg-rose-50 px-1.5 py-0.2 text-[10px] font-bold text-rose-600 border border-rose-200">
                          Giảm 90%
                        </span>
                      </div>
                    ) : isYearly ? (
                      <p className="text-[11px] text-emerald-600 font-medium mt-1">
                        Chỉ ~124.000đ/tháng (Tiết kiệm 37%)
                      </p>
                    ) : null}
                  </div>

                  {/* Hạn mức tóm tắt */}
                  <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1.5 border border-slate-100 font-medium text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Chat AI hội thoại:</span>
                      <span className="font-bold text-slate-900">
                        {plan.dailyAiChat >= 9999 ? '∞ Không giới hạn' : `${plan.dailyAiChat ?? 15} tin/ngày`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Luyện nói & phát âm:</span>
                      <span className="font-bold text-slate-900">
                        {plan.dailyAiSpeaking >= 9999
                          ? '∞ Không giới hạn'
                          : `${plan.dailyAiSpeaking ?? 10} câu/ngày`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Chấm viết luận AI:</span>
                      <span className="font-bold text-slate-900">
                        {plan.weeklyAiWriting >= 9999
                          ? '∞ Không giới hạn'
                          : `${plan.weeklyAiWriting ?? 2} bài/tuần`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Quét ảnh giải đề AI:</span>
                      <span className="font-bold text-slate-900">
                        {plan.dailyAiScan >= 9999 ? '∞ Không giới hạn' : `${plan.dailyAiScan ?? 5} ảnh/ngày`}
                      </span>
                    </div>
                  </div>

                  {/* Danh sách tính năng */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {(plan.features || []).slice(0, 5).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-slate-600 leading-snug">{feat.label || feat.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="mt-6 pt-3 border-t border-slate-100">
                  {isAdmin ? (
                    isFree ? (
                      <div className="w-full rounded-xl bg-slate-100 py-2.5 text-center text-xs font-bold text-slate-500">
                        Gói Mặc Định Miễn Phí
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSubscribeStudentPlan(plan, appliedVoucher)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:shadow-md cursor-pointer bg-brand-600 hover:bg-brand-700"
                      >
                        <QrCode size={14} />
                        <span>
                          {selectedUser ? 'Quét VietQR đăng ký hộ' : 'Xem trước VietQR'} ({formatCurrency(displayPrice)})
                        </span>
                      </button>
                    )
                  ) : isCurrent ? (
                    <div className="w-full rounded-xl bg-slate-100 py-2.5 text-center text-xs font-bold text-slate-500">
                      Đang sử dụng gói này
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSubscribeStudentPlan(plan, appliedVoucher)}
                      className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:shadow-md cursor-pointer ${
                        isMonthly
                          ? 'bg-rose-600 hover:bg-rose-700'
                          : isYearly
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'bg-brand-600 hover:bg-brand-700'
                      }`}
                    >
                      <QrCode size={14} />
                      <span>Xem thử VietQR ({formatCurrency(displayPrice)})</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Bảng so sánh hạn mức chi tiết giữa các gói học viên */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs overflow-hidden">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900">Bảng so sánh hạn mức & quyền lợi học viên</h3>
          <p className="text-xs text-slate-500">
            So sánh chi tiết hạn mức Quota giữa gói Miễn Phí và các gói Nâng Cấp Pro
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                <th className="py-3 px-4 font-bold">Tính năng / Quyền lợi</th>
                <th className="py-3 px-4 font-bold text-center">Gói Miễn Phí</th>
                <th className="py-3 px-4 font-bold text-center text-rose-600">Pro Tháng (20k)</th>
                <th className="py-3 px-4 font-bold text-center text-amber-600">Pro Năm (1.490k)</th>
                <th className="py-3 px-4 font-bold text-center text-indigo-600">Trọn Đời (Lifetime)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              <tr>
                <td className="py-3 px-4 flex items-center gap-2 font-semibold text-slate-900">
                  <Bot size={15} className="text-brand-600" /> AI Chatbot hội thoại thông minh
                </td>
                <td className="py-3 px-4 text-center">15 tin nhắn / ngày</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
              </tr>
              <tr>
                <td className="py-3 px-4 flex items-center gap-2 font-semibold text-slate-900">
                  <Mic size={15} className="text-sky-600" /> Luyện nói & Chấm phát âm IPA
                </td>
                <td className="py-3 px-4 text-center">10 câu / ngày</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
              </tr>
              <tr>
                <td className="py-3 px-4 flex items-center gap-2 font-semibold text-slate-900">
                  <FileText size={15} className="text-emerald-600" /> Chấm viết luận Writing
                </td>
                <td className="py-3 px-4 text-center">2 bài / tuần</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
              </tr>
              <tr>
                <td className="py-3 px-4 flex items-center gap-2 font-semibold text-slate-900">
                  <Camera size={15} className="text-amber-600" /> Quét ảnh giải bài tập AI
                </td>
                <td className="py-3 px-4 text-center">5 ảnh / ngày</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
              </tr>
              <tr>
                <td className="py-3 px-4 flex items-center gap-2 font-semibold text-slate-900">
                  <Users size={15} className="text-indigo-600" /> Tham gia lớp học của giáo viên
                </td>
                <td className="py-3 px-4 text-center">Tối đa 3 lớp</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
              </tr>
              <tr>
                <td className="py-3 px-4 flex items-center gap-2 font-semibold text-slate-900">
                  <BookOpen size={15} className="text-purple-600" /> Kho đề thi TOEIC & Mock Test
                </td>
                <td className="py-3 px-4 text-center text-slate-400">Đề thi cơ bản</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">100% Đầy đủ đề mới</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">100% Đầy đủ đề mới</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">100% Đầy đủ đề mới</td>
              </tr>
              <tr>
                <td className="py-3 px-4 flex items-center gap-2 font-semibold text-slate-900">
                  <ShieldCheck size={15} className="text-rose-600" /> Trải nghiệm không quảng cáo
                </td>
                <td className="py-3 px-4 text-center text-slate-400">—</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">✓ Có</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">✓ Có</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">✓ Có</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default StudentMobilePreviewSection

