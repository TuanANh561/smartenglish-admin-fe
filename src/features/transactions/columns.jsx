import { createColumnHelper } from '@tanstack/react-table'
import Badge from '@/components/ui/Badge'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { GATEWAY_META, TXN_STATUS_META } from './transactionsConstants'

const columnHelper = createColumnHelper()

export const transactionColumns = [
  columnHelper.accessor('id', {
    header: 'Mã giao dịch',
    cell: (info) => {
      const row = info.row.original
      const isRefunded = row.status === 'refunded'
      const displayCode = row.orderCode || (typeof info.getValue() === 'number' ? `ORD-${info.getValue()}` : info.getValue())
      return (
        <span className={cn('font-mono font-bold text-sm text-brand-600', isRefunded && 'text-slate-400 line-through')}>
          {displayCode}
        </span>
      )
    },
  }),
  columnHelper.accessor('customerEmail', {
    header: 'Khách hàng',
    cell: (info) => {
      const row = info.row.original
      const isRefunded = row.status === 'refunded'
      const email = info.getValue() || row.studentEmail || 'Chưa có email'
      const name = row.customerName || row.studentName
      return (
        <div>
          {name && <div className={cn('text-xs font-semibold text-slate-900', isRefunded && 'text-slate-400')}>{name}</div>}
          <span className={cn('text-sm font-medium text-slate-700', isRefunded && 'text-slate-400 line-through')}>{email}</span>
        </div>
      )
    },
  }),
  columnHelper.accessor('planName', {
    header: 'Gói đăng ký',
    cell: (info) => {
      const isRefunded = info.row.original.status === 'refunded'
      return <span className={cn('text-sm text-slate-700', isRefunded && 'text-slate-400 line-through')}>{info.getValue() || 'Gói Premium'}</span>
    },
  }),
  columnHelper.accessor('amount', {
    header: 'Số tiền (đ)',
    meta: { align: 'right' },
    cell: (info) => {
      const isRefunded = info.row.original.status === 'refunded'
      return (
        <span className={cn('font-bold text-sm text-slate-900', isRefunded && 'text-slate-400 line-through')}>
          {formatCurrency(info.getValue())}
        </span>
      )
    },
  }),
  columnHelper.accessor('gateway', {
    header: 'Cổng thanh toán',
    cell: (info) => {
      const val = (info.getValue() || 'vnpay').toLowerCase()
      const meta = GATEWAY_META[val] || { label: val.toUpperCase(), dotClass: 'bg-slate-400' }
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} />
          {meta.label}
        </span>
      )
    },
  }),
  columnHelper.accessor('createdAt', {
    header: 'Thời gian',
    cell: (info) => <span className="text-sm text-slate-500">{formatDate(info.getValue(), 'dd/MM/yyyy HH:mm')}</span>,
  }),
  columnHelper.accessor('status', {
    header: 'Trạng thái',
    cell: (info) => {
      const val = (info.getValue() || 'completed').toLowerCase()
      const meta = TXN_STATUS_META[val] || { label: val, tone: 'neutral' }
      return <Badge tone={meta.tone}>{meta.label}</Badge>
    },
  }),
]

export const transactionCsvColumns = [
  { key: 'orderCode', label: 'Mã giao dịch', value: (row) => row.orderCode || `ORD-${row.id}` },
  { key: 'customerName', label: 'Tên khách hàng', value: (row) => row.customerName || row.studentName || '' },
  { key: 'customerEmail', label: 'Email', value: (row) => row.customerEmail || row.studentEmail || '' },
  { key: 'planName', label: 'Gói đăng ký', value: (row) => row.planName || row.plan || '' },
  { key: 'amount', label: 'Số tiền (đ)', value: (row) => formatCurrency(row.amount, { compact: false }).replace('đ', '').trim() },
  { key: 'gateway', label: 'Cổng thanh toán', value: (row) => GATEWAY_META[(row.gateway || '').toLowerCase()]?.label || row.gateway || '' },
  { key: 'status', label: 'Trạng thái', value: (row) => TXN_STATUS_META[(row.status || '').toLowerCase()]?.label || row.status },
  { key: 'createdAt', label: 'Thời gian', value: (row) => formatDate(row.createdAt, 'dd/MM/yyyy HH:mm') },
  { key: 'refundReason', label: 'Lý do hoàn tiền', value: (row) => row.refundReason || '' },
]

