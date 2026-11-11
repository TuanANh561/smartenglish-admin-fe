import { useState, useMemo } from 'react'
import { Zap, X, ShieldCheck, Check, AlertCircle, Calendar, FileText, Crown } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import api from '@/lib/api'
import { adminGrantPlan } from '../api/premiumApi'

const DURATION_OPTIONS = [
  { label: '30 ngày (1 tháng)', value: 30 },
  { label: '90 ngày (3 tháng)', value: 90 },
  { label: '365 ngày (1 năm)', value: 365 },
  { label: 'Trọn đời (10 năm)', value: 3650 },
]

export default function AdminDirectGrantModal({
  isOpen,
  onClose,
  targetUser,
  onSuccess,
}) {
  const isTeacher = targetUser?.role === 'teacher'
  const hasActivePlan = Boolean(targetUser?.plan && targetUser.plan.toLowerCase() !== 'free')

  const availablePlans = useMemo(() => {
    return isTeacher
      ? [
          {
            id: 2,
            planId: 2,
            defaultDays: 30,
            name: 'Teacher Pro (Gói Chuyên Nghiệp)',
            desc: '15 lớp học, 300 học viên/lớp, AI không giới hạn',
            enumCode: 'TEACHER_PRO',
          },
          {
            id: 3,
            planId: 3,
            defaultDays: 30,
            name: 'School & Center (Doanh nghiệp/Trường học)',
            desc: 'Không giới hạn lớp & học viên, hỗ trợ kỹ thuật 1-1',
            enumCode: 'SCHOOL_CENTER',
          },
        ]
      : [
          {
            id: 1,
            planId: 2,
            defaultDays: 30,
            name: 'Học Viên Premium Tháng',
            desc: 'Gia sư AI 1-1, Chấm phát âm từng âm vị, Mock Test chuẩn CEFR',
            enumCode: 'PREMIUM_MONTHLY',
          },
          {
            id: 2,
            planId: 2,
            defaultDays: 365,
            name: 'Học Viên Premium Năm (Tiết kiệm 30%)',
            desc: 'Toàn bộ quyền lợi VIP 12 tháng, Luyện phản xạ giao tiếp 24/7',
            enumCode: 'PREMIUM_YEARLY',
          },
          {
            id: 4,
            planId: 4,
            defaultDays: 3650,
            name: 'Học Viên Trọn Đời (Lifetime VIP)',
            desc: 'Sở hữu vĩnh viễn không giới hạn toàn bộ tính năng và khóa học',
            enumCode: 'LIFETIME',
          },
        ]
  }, [isTeacher])

  const [selectedPlanId, setSelectedPlanId] = useState(isTeacher ? 2 : 1)
  const [durationDays, setDurationDays] = useState(30)
  const [grantMode, setGrantMode] = useState('PAID') // 'PAID' | 'FREE'
  const [customAmount, setCustomAmount] = useState('')
  const [reason, setReason] = useState('Khách hàng đã chuyển khoản thanh toán trực tiếp')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Gợi ý giá tiền niêm yết theo gói và thời hạn
  const defaultPlanPrice = useMemo(() => {
    if (isTeacher) {
      if (selectedPlanId === 3) return durationDays >= 365 ? 7990000 : 799000
      return durationDays >= 365 ? 3990000 : 399000
    }
    if (selectedPlanId === 4) return 3990000
    if (selectedPlanId === 2 || durationDays >= 365) return 1490000
    return 199000
  }, [isTeacher, selectedPlanId, durationDays])

  if (!isOpen || !targetUser) return null

  const handleGrant = async () => {
    setIsSubmitting(true)
    try {
      const selectedPlanObj = availablePlans.find((p) => p.id === selectedPlanId)
      const targetRole = (targetUser.role || (isTeacher ? 'teacher' : 'student')).toLowerCase()

      // Enum hợp lệ với SubscriptionPlan trong auth-service: TEACHER_PRO, PREMIUM_MONTHLY, PREMIUM_YEARLY, LIFETIME
      const authPlanEnum = isTeacher
        ? 'TEACHER_PRO'
        : durationDays >= 3650 || selectedPlanId === 4
          ? 'LIFETIME'
          : durationDays >= 365 || selectedPlanId === 2
            ? 'PREMIUM_YEARLY'
            : 'PREMIUM_MONTHLY'

      const effectiveAmount = grantMode === 'PAID'
        ? (customAmount !== '' ? Number(customAmount) : defaultPlanPrice)
        : 0

      const effectivePaymentMethod = grantMode === 'PAID' ? 'BANK_TRANSFER' : 'ADMIN_GRANT'
      const defaultReason = grantMode === 'PAID'
        ? 'Khách hàng đã chuyển khoản thanh toán trực tiếp'
        : 'Cấp quyền trải nghiệm / Học bổng trực tiếp từ Quản trị viên'

      // 1. Gọi backend payment-service để cấp quyền và lưu Order Audit log thật
      const grantResult = await adminGrantPlan(targetUser.id, {
        planId: selectedPlanObj?.planId ?? selectedPlanId,
        durationDays,
        reason: reason.trim() || defaultReason,
        customerName: targetUser.displayName || targetUser.username,
        customerEmail: targetUser.email,
        customerRole: targetRole,
        planName: selectedPlanObj?.name || (isTeacher ? 'Teacher Pro (Gói Chuyên Nghiệp)' : 'Học Viên Premium Tháng'),
        plan: selectedPlanObj?.enumCode || (isTeacher ? 'T-PLAN-PRO' : 'S-PLAN-MONTHLY'),
        amount: effectiveAmount,
        paymentMethod: effectivePaymentMethod,
      })

      // 2. Xác định ngày hết hạn mới để cập nhật đồng bộ sang auth-service
      const newExpiresAt = grantResult?.currentPeriodEnd
        ? new Date(grantResult.currentPeriodEnd)
        : new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)

      // 3. Đồng bộ trực tiếp sang auth-service (REST PATCH)
      try {
        await api.patch(`/admin/users/${targetUser.id}`, {
          plan: authPlanEnum,
          planExpiresAt: newExpiresAt.toISOString(),
        })
      } catch (syncErr) {
        console.warn('Lỗi đồng bộ trực tiếp auth-service (đã có backend fallback):', syncErr)
      }

      const updatedUser = {
        ...targetUser,
        plan: authPlanEnum.toLowerCase(),
        planExpiresAt: newExpiresAt.toISOString(),
      }

      // Phát sự kiện toàn cục để các bảng và thanh tìm kiếm tự động cập nhật ngay tức thì
      window.dispatchEvent(new CustomEvent('user-plan-updated', { detail: updatedUser }))

      toast.success(
        `Đã ${hasActivePlan ? 'gia hạn' : 'kích hoạt'} thành công gói cho ${
          targetUser.displayName || targetUser.username
        }!`,
      )
      onSuccess?.(updatedUser)
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Kích hoạt gói thất bại: ' + (err?.message || 'Lỗi server'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      showCloseButton={false}
      className="max-w-md w-full p-0 overflow-hidden rounded-2xl border border-slate-200/90 shadow-2xl"
    >
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <Zap size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {hasActivePlan ? 'Gia hạn / Nâng cấp gói trực tiếp' : 'Kích hoạt gói dịch vụ trực tiếp'}
            </h3>
            <p className="text-[11px] text-slate-500">
              Cấp quyền ngay cho tài khoản mà không cần quét mã QR
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
        {/* Người nhận */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {targetUser.avatarUrl ? (
              <img
                src={targetUser.avatarUrl}
                alt={targetUser.displayName}
                className="h-9 w-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600 font-bold text-xs shrink-0">
                {(targetUser.displayName || targetUser.username || 'U').slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-slate-900 truncate">
                {targetUser.displayName || targetUser.username}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{targetUser.email}</p>
            </div>
          </div>
          <span className="shrink-0 rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
            {isTeacher ? 'Giáo viên' : 'Học viên'}
          </span>
        </div>

        {/* Thông báo nếu tài khoản ĐÃ CÓ GÓI PREMIUM */}
        {hasActivePlan && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3 flex items-start gap-2.5">
            <Crown size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-amber-900 min-w-0">
              <span className="font-bold">Tài khoản này hiện đang có gói: </span>
              <span className="font-extrabold uppercase text-amber-800 tracking-wide">
                {targetUser.plan}
              </span>
              {targetUser.planExpiresAt && (
                <span className="text-amber-800 block text-[11px] mt-0.5">
                  Thời hạn hiện tại đến:{' '}
                  <strong>{new Date(targetUser.planExpiresAt).toLocaleDateString('vi-VN')}</strong>
                </span>
              )}
              <p className="mt-1 text-[11px] text-amber-700">
                Thao tác kích hoạt tiếp theo sẽ tự động{' '}
                <strong>cộng dồn thêm thời gian</strong> vào hạn dùng hiện tại.
              </p>
            </div>
          </div>
        )}

        {/* Chọn gói */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 block">Chọn gói đăng ký</label>
          <div className="space-y-1.5">
            {availablePlans.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedPlanId(p.id)
                  setDurationDays(p.defaultDays)
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                  selectedPlanId === p.id
                    ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    selectedPlanId === p.id
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {selectedPlanId === p.id && <Check size={10} strokeWidth={3} />}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{p.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chọn thời hạn */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 block">Thời hạn áp dụng</label>
          <Select
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            size="sm"
            options={DURATION_OPTIONS}
          />
        </div>

        {/* Phân loại nghiệp vụ: Đã thanh toán chuyển khoản ngoài HOẶC Cấp học bổng miễn phí */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100">
          <label className="font-bold text-slate-700 block">Hình thức ghi nhận</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setGrantMode('PAID')
                setReason('Khách hàng đã chuyển khoản thanh toán trực tiếp')
              }}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                grantMode === 'PAID'
                  ? 'border-brand-500 bg-brand-50/50 text-brand-900 ring-1 ring-brand-500'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <p className="text-xs font-bold">Chuyển khoản ngoài</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Ghi nhận doanh thu thực tế</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setGrantMode('FREE')
                setReason('Cấp quyền trải nghiệm / Học bổng trực tiếp từ Quản trị viên')
              }}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                grantMode === 'FREE'
                  ? 'border-purple-500 bg-purple-50/50 text-purple-900 ring-1 ring-purple-500'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <p className="text-xs font-bold">Cấp miễn phí (0đ)</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Học bổng / Hỗ trợ kỹ thuật</p>
            </button>
          </div>
        </div>

        {/* Số tiền thực thu (khi chọn Chuyển khoản ngoài) */}
        {grantMode === 'PAID' ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 block">Số tiền thanh toán (VNĐ)</label>
              <span className="text-[11px] text-slate-400 font-medium">
                Giá niêm yết: {defaultPlanPrice.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <input
              type="number"
              value={customAmount !== '' ? customAmount : defaultPlanPrice}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Nhập số tiền thực thu (VNĐ)..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-purple-200/70 bg-purple-50/50 p-2.5 flex items-center justify-between text-xs">
            <span className="text-purple-700 font-medium">Số tiền ghi nhận:</span>
            <span className="font-bold text-purple-800 bg-purple-100/80 px-2 py-0.5 rounded-md border border-purple-200">
              0đ (Miễn phí)
            </span>
          </div>
        )}

        {/* Lý do / Ghi chú */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 block">Lý do cấp quyền (Lưu Audit Log)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do hoặc mã chứng từ thanh toán..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
          Hủy bỏ
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleGrant}
          loading={isSubmitting}
          disabled={isSubmitting}
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold cursor-pointer"
        >
          {hasActivePlan ? 'Xác nhận gia hạn / nâng cấp' : 'Xác nhận kích hoạt'}
        </Button>
      </div>
    </Modal>
  )
}
