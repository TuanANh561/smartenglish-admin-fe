import { createColumnHelper } from '@tanstack/react-table'
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
  columnHelper.accessor('createdAt', {
    header: 'Ngày',
    enableSorting: true,
    cell: (info) => <span className="text-sm text-slate-600 font-medium">{formatDate(info.getValue())}</span>,
  }),
  columnHelper.accessor('studentName', {
    header: 'Học viên',
    enableSorting: true,
    cell: (info) => {
      const transaction = info.row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar name={transaction.studentName} src={transaction.studentAvatar} size="md" />
          <div>
            <p className="font-bold text-slate-900 text-sm">{transaction.studentName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{transaction.studentEmail}</p>
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor('plan', {
    header: 'Gói dịch vụ',
    enableSorting: false,
    cell: (info) => {
      const raw = info.row.original.planName || PLAN_LABEL[info.getValue()] || info.getValue() || 'Gói Premium'
      const cleanName = raw.replace(/\s*\([^)]*\)/g, '').trim()
      return (
        <span className="text-sm font-medium text-slate-700">
          {cleanName}
        </span>
      )
    },
  }),
  columnHelper.accessor('amount', {
    header: 'Khoản tiền',
    enableSorting: true,
    meta: { align: 'right' },
    cell: (info) => {
      const status = (info.row.original.status || '').toLowerCase()
      const isCancelled = ['cancelled', 'canceled', 'expired', 'failed'].includes(status)
      const isRefunded = status === 'refunded'
      const isInactive = isCancelled || isRefunded
      return (
        <span
          className={cn(
            'text-sm',
            isInactive ? 'font-normal text-slate-400 line-through' : 'font-bold text-slate-900'
          )}
          title={isCancelled ? 'Đơn hàng đã hủy (0đ thực thu)' : isRefunded ? 'Đã hoàn tiền' : ''}
        >
          {formatCurrency(info.getValue(), { compact: false })}
        </span>
      )
    },
  }),
  columnHelper.accessor('status', {
    header: 'Trạng thái',
    enableSorting: false,
    cell: (info) => {
      const status = (info.getValue() || 'completed').toLowerCase()
      return <Badge tone={STATUS_TONE[status] ?? 'neutral'}>{STATUS_LABEL[status] ?? status}</Badge>
    },
  }),
  columnHelper.accessor('paymentMethod', {
    header: 'Phương thức thanh toán',
    enableSorting: false,
    cell: (info) => {
      const method = info.getValue()
      const methodLabel = {
        credit_card: 'Thẻ tín dụng',
        bank_transfer: 'Chuyển khoản',
        e_wallet: 'Ví điện tử',
      }
      return <span className="text-sm text-slate-600">{methodLabel[method] ?? method}</span>
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
