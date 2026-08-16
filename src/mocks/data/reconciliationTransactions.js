export const RECONCILIATION_STATS = {
  todayRevenue: 124500000,
  todayRevenueGrowth: 12,
  successfulTransactions: 842,
  successRate: 98.5,
  pendingRefundRequests: 12,
}

export const GATEWAY_META = {
  momo: { label: 'MoMo', dotClass: 'bg-[#D82D8B]' },
  vnpay: { label: 'VNPay', dotClass: 'bg-brand-500' },
  stripe: { label: 'Visa', dotClass: 'bg-navy-700' },
  zalopay: { label: 'ZaloPay', dotClass: 'bg-brand-400' },
  bank_transfer: { label: 'Chuyển khoản', dotClass: 'bg-ink-muted' },
}

export const TXN_STATUS_META = {
  success: { label: 'Thành công', tone: 'success' },
  refund_requested: { label: 'Yêu cầu hoàn', tone: 'warning' },
  refunded: { label: 'Đã hoàn tiền', tone: 'danger' },
  failed: { label: 'Thất bại', tone: 'danger' },
  pending: { label: 'Đang xử lý', tone: 'info' },
}

export const reconciliationTransactions = [
  {
    id: 'TXN-98234A',
    customerEmail: 'nguyenvana@gmail.com',
    planName: 'IELTS Intensive 6.5+',
    amount: 1450000,
    gateway: 'momo',
    status: 'success',
    createdAt: new Date('2023-10-17T14:32:00'),
  },
  {
    id: 'TXN-98229F',
    customerEmail: 'tranthib@edu.vn',
    planName: 'TOEIC Master 800',
    amount: 890000,
    gateway: 'vnpay',
    status: 'refund_requested',
    createdAt: new Date('2023-10-17T09:15:00'),
    refundReason:
      'Khoá học không phù hợp với trình độ hiện tại, tôi muốn chuyển sang khoá cơ bản hơn. Xin cảm ơn.',
    courseProgress: 2,
    purchaseAgeDays: 5,
    supportTicket: '#TKT-4412',
    webhookLog: `[{ "timestamp": "2023-10-17T09:15:22Z", "event": "PAYMENT_SUCCESS" }]
vnp_Amount=89000000
vnp_BankCode=NCB
vnp_CardType=ATM
vnp_OrderInfo=Thanh toan goi TOEIC Master 800
vnp_ResponseCode=00
vnp_TransactionStatus=00`,
    refundAmount: 890000,
    refundPercent: 100,
  },
  {
    id: 'TXN-98211D',
    customerEmail: 'lethic@gmail.com',
    planName: 'Gói PRO 3',
    amount: 599000,
    gateway: 'stripe',
    status: 'refunded',
    createdAt: new Date('2023-10-16T11:05:00'),
  },
  {
    id: 'TXN-98198B',
    customerEmail: 'phamvane@gmail.com',
    planName: 'Premium Yearly',
    amount: 1490000,
    gateway: 'zalopay',
    status: 'success',
    createdAt: new Date('2023-10-15T16:48:00'),
  },
  {
    id: 'TXN-98180C',
    customerEmail: 'hoangthif@gmail.com',
    planName: 'Premium Monthly',
    amount: 199000,
    gateway: 'bank_transfer',
    status: 'failed',
    createdAt: new Date('2023-10-14T08:22:00'),
  },
]
