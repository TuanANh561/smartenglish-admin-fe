import { createColumnHelper } from '@tanstack/react-table'
import { Eye, FileCheck2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { GATEWAY_META, TXN_STATUS_META } from './transactionsConstants'

const columnHelper = createColumnHelper()

export const transactionColumns = [
  columnHelper.accessor('id', {
    header: 'Mã giao dịch',
    cell: (info) => {
      const row = info.row.original
      const rawStatus = (row.status || '').toLowerCase()
      const isInactive = ['cancelled', 'canceled', 'expired', 'failed', 'refunded'].includes(rawStatus)
      const displayCode = row.orderCode || (typeof info.getValue() === 'number' ? `ORD-${info.getValue()}` : info.getValue())
      return (
        <span className={cn('font-mono font-bold text-sm', isInactive ? 'text-slate-400' : 'text-brand-600')}>
          {displayCode}
        </span>
      )
    },
  }),
  columnHelper.accessor('customerEmail', {
    header: 'Khách hàng',
    cell: (info) => {
      const row = info.row.original
      const rawStatus = (row.status || '').toLowerCase()
      const isInactive = ['cancelled', 'canceled', 'expired', 'failed', 'refunded'].includes(rawStatus)
      const email = info.getValue() || row.studentEmail || 'Chưa có email'
      const name = row.customerName || row.studentName
      return (
        <div>
          {name && <div className={cn('text-xs font-semibold', isInactive ? 'text-slate-400' : 'text-slate-900')}>{name}</div>}
          <span className={cn('text-sm font-medium', isInactive ? 'text-slate-400' : 'text-slate-700')}>{email}</span>
        </div>
      )
    },
  }),
  columnHelper.accessor('planName', {
    header: 'Gói đăng ký',
    cell: (info) => {
      const rawStatus = (info.row.original.status || '').toLowerCase()
      const isInactive = ['cancelled', 'canceled', 'expired', 'failed', 'refunded'].includes(rawStatus)
      const raw = info.getValue() || 'Gói Premium'
      const cleanName = raw.replace(/\s*\([^)]*\)/g, '').trim()
      return <span className={cn('text-sm', isInactive ? 'text-slate-400' : 'text-slate-700')}>{cleanName}</span>
    },
  }),
  columnHelper.accessor('amount', {
    header: 'Số tiền',
    meta: { align: 'right' },
    cell: (info) => {
      const rawStatus = (info.row.original.status || '').toLowerCase()
      const isCancelled = ['cancelled', 'canceled', 'expired', 'failed'].includes(rawStatus)
      const isRefunded = rawStatus === 'refunded'
      const isInactive = isCancelled || isRefunded
      return (
        <span
          className={cn(
            'text-sm',
            isInactive ? 'font-normal text-slate-400 line-through' : 'font-bold text-slate-900'
          )}
          title={isCancelled ? 'Đơn hàng đã hủy (0đ thực thu)' : isRefunded ? 'Đã hoàn tiền' : ''}
        >
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
      const cleanLabel = (meta.label || '').replace(/\s*\([^)]*\)/g, '').trim()
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} />
          {cleanLabel}
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
  columnHelper.display({
    id: 'actions',
    header: 'Thao tác',
    cell: (info) => {
      const row = info.row.original
      const rawStatus = (row.status || '').toLowerCase()
      const isPaid = ['completed', 'success', 'paid', 'matched'].includes(rawStatus)

      return (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              info.table.options.meta?.onOpenDetail?.(row)
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs border border-slate-200/80"
            title="Xem chi tiết giao dịch"
          >
            <Eye size={13} strokeWidth={2} />
            <span>Chi tiết</span>
          </button>

          {isPaid ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                info.table.options.meta?.onOpenInvoice?.(row)
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 hover:text-brand-700 transition-colors cursor-pointer shadow-2xs border border-brand-100/60"
              title="Xem & in hóa đơn điện tử"
            >
              <FileCheck2 size={13} strokeWidth={2.2} />
              <span>Hóa đơn</span>
            </button>
          ) : (
            <span className="w-16 text-center text-slate-300 text-xs font-medium select-none">—</span>
          )}
        </div>
      )
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

export const sepayTransactionColumns = [
  columnHelper.accessor('transactionTime', {
    header: 'Thời gian',
    cell: (info) => <span className="text-sm text-slate-500">{formatDate(info.getValue(), 'dd/MM/yyyy HH:mm')}</span>,
  }),
  columnHelper.accessor('bankName', {
    header: 'Ngân hàng',
    cell: (info) => {
      const row = info.row.original
      return (
        <div>
          <span className="font-semibold text-xs text-slate-800">{info.getValue() || 'MBBank'}</span>
          <p className="font-mono text-2xs text-slate-500">{row.bankAccount}</p>
        </div>
      )
    },
  }),
  columnHelper.accessor('amountIn', {
    header: 'Số tiền nhận',
    meta: { align: 'right' },
    cell: (info) => (
      <span className="font-bold text-sm text-emerald-600">
        +{formatCurrency(info.getValue() || 0)}
      </span>
    ),
  }),
  columnHelper.accessor('transactionContent', {
    header: 'Nội dung chuyển khoản',
    cell: (info) => (
      <span className="font-mono text-xs text-slate-700 break-words max-w-xs block line-clamp-2" title={info.getValue()}>
        {info.getValue() || '(Không có nội dung)'}
      </span>
    ),
  }),
  columnHelper.accessor('extractedOrderCode', {
    header: 'Mã bóc tách',
    cell: (info) => {
      const val = info.getValue()
      return val ? (
        <span className="font-mono font-bold text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
          {val}
        </span>
      ) : (
        <span className="text-slate-400 text-xs">—</span>
      )
    },
  }),
  columnHelper.accessor('matchStatus', {
    header: 'Trạng thái đối soát',
    cell: (info) => {
      const val = (info.getValue() || 'UNMATCHED').toLowerCase()
      const meta = TXN_STATUS_META[val] || { label: val, tone: 'neutral' }
      return <Badge tone={meta.tone}>{meta.label}</Badge>
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Thao tác',
    cell: (info) => {
      const row = info.row.original
      const isMatched = row.matchStatus === 'MATCHED' || row.matchStatus === 'MANUAL_MATCHED'

      if (isMatched) {
        return (
          <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
            {row.orderCode || 'Đã khớp'}
          </span>
        )
      }

      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            info.table.options.meta?.onOpenManualMatch?.(row)
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200/60 shadow-2xs"
          title="Khớp lệnh đơn hàng thủ công"
        >
          <span>Khớp lệnh</span>
        </button>
      )
    },
  }),
]

export const sepayTransactionCsvColumns = [
  { key: 'transactionTime', label: 'Thời gian', value: (row) => formatDate(row.transactionTime, 'dd/MM/yyyy HH:mm') },
  { key: 'bankName', label: 'Ngân hàng', value: (row) => `${row.bankName || 'MBBank'} - ${row.bankAccount}` },
  { key: 'amountIn', label: 'Số tiền nhận (đ)', value: (row) => formatCurrency(row.amountIn, { compact: false }).replace('đ', '').trim() },
  { key: 'transactionContent', label: 'Nội dung', value: (row) => row.transactionContent || '' },
  { key: 'extractedOrderCode', label: 'Mã bóc tách', value: (row) => row.extractedOrderCode || '' },
  { key: 'matchStatus', label: 'Trạng thái', value: (row) => TXN_STATUS_META[(row.matchStatus || '').toLowerCase()]?.label || row.matchStatus },
  { key: 'orderCode', label: 'Mã đơn khớp', value: (row) => row.orderCode || '' },
]


