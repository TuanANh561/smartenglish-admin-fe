export const DATE_RANGES = [
  { value: '7d', label: '7 ngày qua' },
  { value: '30d', label: '30 ngày qua' },
  { value: 'month', label: 'Tháng này' },
]

export const GATEWAY_META = {
  sepay: { label: 'VietQR', dotClass: 'bg-emerald-500' },
  momo: { label: 'MoMo', dotClass: 'bg-[#D82D8B]' },
  vnpay: { label: 'VNPay', dotClass: 'bg-brand-500' },
  stripe: { label: 'Stripe', dotClass: 'bg-navy-700' },
  zalopay: { label: 'ZaloPay', dotClass: 'bg-brand-400' },
  bank_transfer: { label: 'Chuyển khoản', dotClass: 'bg-ink-muted' },
}

export const TXN_STATUS_META = {
  success: { label: 'Thành công', tone: 'success' },
  completed: { label: 'Thành công', tone: 'success' },
  cancelled: { label: 'Đã hủy', tone: 'neutral' },
  canceled: { label: 'Đã hủy', tone: 'neutral' },
  refund_requested: { label: 'Yêu cầu hoàn', tone: 'warning' },
  refunded: { label: 'Đã hoàn tiền', tone: 'danger' },
  failed: { label: 'Thất bại', tone: 'danger' },
  pending: { label: 'Chờ thanh toán', tone: 'info' },
  underpaid: { label: 'Thiếu tiền', tone: 'warning' },
  matched: { label: 'Đã khớp', tone: 'success' },
  unmatched: { label: 'Chưa khớp', tone: 'warning' },
  manual_matched: { label: 'Khớp thủ công', tone: 'info' },
  partially_paid: { label: 'Thiếu tiền', tone: 'warning' },
  expired: { label: 'Đã hết hạn', tone: 'neutral' },
}

