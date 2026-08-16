import { createColumnHelper } from '@tanstack/react-table'
import Badge from '@/components/ui/Badge'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { GATEWAY_META, TXN_STATUS_META } from '@/mocks/data/reconciliationTransactions'

const columnHelper = createColumnHelper()

export const transactionColumns = [
  columnHelper.accessor('id', {
    header: 'Mã giao dịch',
    cell: (info) => {
      const isRefunded = info.row.original.status === 'refunded'
      return (
        <span className={cn('font-semibold text-brand-500', isRefunded && 'text-ink-muted line-through')}>
          {info.getValue()}
        </span>
      )
    },
  }),
  columnHelper.accessor('customerEmail', {
    header: 'Khách hàng',
    cell: (info) => {
      const isRefunded = info.row.original.status === 'refunded'
      return <span className={cn('text-ink', isRefunded && 'text-ink-muted line-through')}>{info.getValue()}</span>
    },
  }),
  columnHelper.accessor('planName', {
    header: 'Gói đăng ký',
    cell: (info) => {
      const isRefunded = info.row.original.status === 'refunded'
      return <span className={cn('text-ink', isRefunded && 'text-ink-muted line-through')}>{info.getValue()}</span>
    },
  }),
  columnHelper.accessor('amount', {
    header: 'Số tiền (đ)',
    meta: { align: 'right' },
    cell: (info) => {
      const isRefunded = info.row.original.status === 'refunded'
      return (
        <span className={cn('font-medium text-ink', isRefunded && 'text-ink-muted line-through')}>
          {formatCurrency(info.getValue())}
        </span>
      )
    },
  }),
  columnHelper.accessor('gateway', {
    header: 'Cổng TT',
    cell: (info) => {
      const meta = GATEWAY_META[info.getValue()]
      return (
        <span className="inline-flex items-center gap-1.5 text-sm text-ink">
          <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} />
          {meta.label}
        </span>
      )
    },
  }),
  columnHelper.accessor('createdAt', {
    header: 'Thời gian',
    cell: (info) => <span className="text-ink-muted">{formatDate(info.getValue(), 'dd/MM/yyyy HH:mm')}</span>,
  }),
  columnHelper.accessor('status', {
    header: 'Trạng thái',
    cell: (info) => {
      const meta = TXN_STATUS_META[info.getValue()]
      return <Badge tone={meta.tone}>{meta.label}</Badge>
    },
  }),
]
