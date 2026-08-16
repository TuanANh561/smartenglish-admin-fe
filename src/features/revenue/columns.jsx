import { createColumnHelper } from '@tanstack/react-table'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_LABEL = {
  completed: 'Thành công',
  pending: 'Chờ xác thực',
  failed: 'Thất bại',
  refunded: 'Hoàn tiền',
}

const STATUS_TONE = {
  completed: 'success',
  pending: 'warning',
  failed: 'danger',
  refunded: 'info',
}

const PLAN_LABEL = {
  free: 'Free',
  premium_monthly: 'Premium tháng',
  premium_yearly: 'Premium năm',
  lifetime: 'Trọn đời',
}

const columnHelper = createColumnHelper()

export const transactionColumns = [
  columnHelper.accessor('createdAt', {
    header: 'Ngày',
    enableSorting: true,
    cell: (info) => formatDate(info.getValue()),
  }),
  columnHelper.accessor('studentName', {
    header: 'Học viên',
    enableSorting: true,
    cell: (info) => {
      const transaction = info.row.original
      return (
        <div className="flex items-center gap-2.5">
          <Avatar name={transaction.studentName} src={transaction.studentAvatar} size="sm" />
          <div>
            <p className="font-medium text-navy-700">{transaction.studentName}</p>
            <p className="text-xs text-ink-muted">{transaction.studentEmail}</p>
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor('plan', {
    header: 'Gói',
    enableSorting: false,
    cell: (info) => PLAN_LABEL[info.getValue()] ?? info.getValue(),
  }),
  columnHelper.accessor('amount', {
    header: 'Khoản tiền',
    enableSorting: true,
    meta: { align: 'right' },
    cell: (info) => (
      <span className="font-medium text-navy-700">{formatCurrency(info.getValue(), { compact: false })}</span>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Trạng thái',
    enableSorting: false,
    cell: (info) => {
      const status = info.getValue()
      return <Badge tone={STATUS_TONE[status] ?? 'neutral'}>{STATUS_LABEL[status] ?? status}</Badge>
    },
  }),
  columnHelper.accessor('paymentMethod', {
    header: 'Phương thức',
    enableSorting: false,
    cell: (info) => {
      const method = info.getValue()
      const methodLabel = {
        credit_card: 'Thẻ tín dụng',
        bank_transfer: 'Chuyển khoản',
        e_wallet: 'Ví điện tử',
      }
      return methodLabel[method] ?? method
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
