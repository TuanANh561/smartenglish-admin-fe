import { createColumnHelper } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

const STATUS_LABEL = {
  completed: 'Thành công',
  success: 'Thành công',
  pending: 'Chờ xác thực',
  failed: 'Thất bại',
  refunded: 'Hoàn tiền',
  cancelled: 'Đã hủy',
  canceled: 'Đã hủy',
  expired: 'Đã hết hạn',
}

const STATUS_TONE = {
  completed: 'success',
  success: 'success',
  pending: 'warning',
  failed: 'danger',
  refunded: 'info',
  cancelled: 'neutral',
  canceled: 'neutral',
  expired: 'neutral',
}

const PLAN_LABEL = {
  free: 'Free',
  premium_monthly: 'Premium tháng',
  premium_yearly: 'Premium năm',
  lifetime: 'Trọn đời',
  teacher_pro: 'Giảng viên Pro',
}

const columnHelper = createColumnHelper()

export const transactionColumns = [
  columnHelper.accessor('id', {
    header: 'Mã đơn',
    enableSorting: false,
    meta: { widthClass: 'w-28 min-w-[110px]' },
    cell: (info) => {
      const row = info.row.original
      const code = row.orderCode || (row.id ? `ORD-${row.id}` : '—')
      return (
        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200">
          {code}
        </span>
      )
    },
  }),
  columnHelper.accessor('createdAt', {
    header: 'Ngày giờ',
    enableSorting: true,
    meta: { widthClass: 'w-32 min-w-[120px]' },
    cell: (info) => (
      <div>
        <p className="text-sm text-slate-800 font-semibold">{formatDate(info.getValue())}</p>
        <p className="text-[11px] text-slate-400 font-medium">{formatDate(info.getValue(), 'HH:mm:ss')}</p>
      </div>
    ),
  }),
  columnHelper.accessor('customerName', {
    header: 'Khách hàng',
    enableSorting: true,
    meta: { widthClass: 'min-w-[250px]' },
    cell: (info) => {
      const transaction = info.row.original
      const name = transaction.customerName || transaction.studentName || 'Khách hàng'
      const email = transaction.customerEmail || transaction.studentEmail || '—'
      const role = (transaction.customerRole || '').toLowerCase()
      const isTeacher = role === 'teacher' || name.startsWith('Thầy') || name.startsWith('Thay') || name.startsWith('Cô')

      return (
        <div className="flex items-center gap-3">
          <Avatar name={name} src={transaction.studentAvatar} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-bold text-slate-900 text-sm truncate">{name}</p>
              <span
                className={cn(
                  'rounded-md px-1.5 py-0.2 text-[10px] font-bold border',
                  isTeacher
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-sky-50 text-sky-700 border-sky-200'
                )}
              >
                {isTeacher ? 'Giáo viên' : 'Học viên'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{email}</p>
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor('plan', {
    header: 'Gói dịch vụ',
    enableSorting: false,
    meta: { widthClass: 'w-48 min-w-[160px]' },
    cell: (info) => {
      const row = info.row.original
      const raw = row.planName || row.courseName || PLAN_LABEL[info.getValue()] || info.getValue() || 'Gói Dịch Vụ'
      const cleanName = raw.replace(/\s*\([^)]*\)/g, '').trim()
      return (
        <span className="text-sm font-semibold text-slate-800" title={raw}>
          {cleanName}
        </span>
      )
    },
  }),
  columnHelper.accessor('amount', {
    header: 'Khoản tiền',
    enableSorting: true,
    meta: { align: 'right', widthClass: 'w-32 min-w-[110px]' },
    cell: (info) => {
      const row = info.row.original
      const status = (row.status || '').toLowerCase()
      const isCancelled = ['cancelled', 'canceled', 'expired', 'failed'].includes(status)
      const isRefunded = status === 'refunded'
      const isInactive = isCancelled || isRefunded
      const val = Number(info.getValue()) || 0
      const isGrant = (row.orderCode || '').startsWith('GRANT-') || (row.gateway || '').toLowerCase() === 'admin_grant' || (row.paymentMethod || '').toLowerCase() === 'admin_grant'

      if (isGrant && val === 0) {
        return (
          <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
            Miễn phí (Cấp quyền)
          </span>
        )
      }

      return (
        <span
          className={cn(
            'text-sm',
            isInactive ? 'font-normal text-slate-400 line-through' : 'font-bold text-slate-900'
          )}
          title={isCancelled ? 'Đơn hàng đã hủy (0đ thực thu)' : isRefunded ? 'Đã hoàn tiền' : ''}
        >
          {formatCurrency(val, { compact: false })}
        </span>
      )
    },
  }),
  columnHelper.accessor('status', {
    header: 'Trạng thái',
    enableSorting: false,
    meta: { align: 'center', widthClass: 'w-32 min-w-[110px]' },
    cell: (info) => {
      const status = (info.getValue() || 'completed').toLowerCase()
      return <Badge tone={STATUS_TONE[status] ?? 'neutral'}>{STATUS_LABEL[status] ?? status}</Badge>
    },
  }),
  columnHelper.accessor('paymentMethod', {
    header: 'Phương thức thanh toán',
    enableSorting: false,
    meta: { widthClass: 'w-48 min-w-[160px]' },
    cell: (info) => {
      const row = info.row.original
      const rawMethod = (info.getValue() || row.gateway || '').toLowerCase()
      const isGrant = (row.orderCode || '').startsWith('GRANT-') || rawMethod.includes('grant') || rawMethod.includes('admin')
      const methodLabel = {
        credit_card: 'Thẻ tín dụng',
        bank_transfer: 'Chuyển khoản',
        e_wallet: 'Ví điện tử',
        sepay: 'VietQR SePay',
        admin_grant: 'Admin cấp trực tiếp',
      }
      const label = isGrant ? 'Admin cấp trực tiếp' : (methodLabel[rawMethod] ?? (row.gateway ? String(row.gateway).toUpperCase() : rawMethod))
      return <span className="text-sm text-slate-700 font-medium">{label}</span>
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Thao tác',
    meta: { align: 'right', widthClass: 'w-24 min-w-[90px]' },
    cell: (info) => {
      const onView = info.table.options.meta?.onViewDetail
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onView?.(info.row.original)
          }}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors border border-brand-200 shadow-2xs cursor-pointer"
          title="Xem chi tiết giao dịch"
        >
          <Eye size={13} />
          <span>Chi tiết</span>
        </button>
      )
    },
  }),
]

export const transactionCsvColumns = [
  { key: 'createdAt', label: 'Ngày', value: (row) => formatDate(row.createdAt) },
  { key: 'studentName', label: 'Học viên' },
  { key: 'studentEmail', label: 'Email' },
  { key: 'plan', label: 'Gói', value: (row) => PLAN_LABEL[row.plan] ?? row.plan },
  { key: 'amount', label: 'Khoản tiền (đ)', value: (row) => formatCurrency(row.amount, { compact: false }).replace('đ', '').trim() },
  { key: 'status', label: 'Trạng thái', value: (row) => STATUS_LABEL[row.status] ?? row.status },
  { key: 'paymentMethod', label: 'Phương thức', value: (row) => ({
    credit_card: 'Thẻ tín dụng',
    bank_transfer: 'Chuyển khoản',
    e_wallet: 'Ví điện tử',
  }[row.paymentMethod] ?? row.paymentMethod) },
]
