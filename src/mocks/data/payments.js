import { daysAgo } from '../utils'
import { users } from './users'

/** Shape bám theo payment.orders / payment.coupons / payment.subscriptions. */

const GATEWAYS = ['vnpay', 'momo', 'zalopay', 'stripe']
const STATUSES = ['success', 'success', 'success', 'pending', 'failed', 'refunded']

export const orders = Array.from({ length: 24 }, (_, index) => {
  const user = users[index % users.length]
  const amount = [99_000, 299_000, 899_000, 1_990_000][index % 4]
  const status = STATUSES[index % STATUSES.length]
  return {
    id: `o-${String(index + 1).padStart(3, '0')}`,
    invoiceNumber: `HD2026${String(index + 1).padStart(4, '0')}`,
    userId: user.id,
    userName: user.displayName,
    userEmail: user.email,
    amountOriginal: amount,
    discountAmount: index % 5 === 0 ? Math.round(amount * 0.2) : 0,
    amountFinal: index % 5 === 0 ? Math.round(amount * 0.8) : amount,
    gateway: GATEWAYS[index % GATEWAYS.length],
    status,
    createdAt: daysAgo(index),
    refundedAt: status === 'refunded' ? daysAgo(index - 1) : null,
  }
})

export const plans = [
  {
    id: 'p-1',
    code: 'premium_monthly',
    name: 'Premium theo tháng',
    priceVnd: 99_000,
    durationDays: 30,
    isActive: true,
    subscriberCount: 1_842,
  },
  {
    id: 'p-2',
    code: 'premium_yearly',
    name: 'Premium theo năm',
    priceVnd: 899_000,
    durationDays: 365,
    isActive: true,
    subscriberCount: 964,
  },
  {
    id: 'p-3',
    code: 'lifetime',
    name: 'Trọn đời',
    priceVnd: 1_990_000,
    durationDays: null,
    isActive: true,
    subscriberCount: 128,
  },
  {
    id: 'p-4',
    code: 'student',
    name: 'Gói học sinh, sinh viên',
    priceVnd: 59_000,
    durationDays: 30,
    isActive: false,
    subscriberCount: 0,
  },
]

export const coupons = [
  {
    id: 'c-1',
    code: 'KHAIGIANG25',
    discountType: 'percent',
    discountValue: 25,
    couponType: 'public',
    maxUses: 500,
    usedCount: 213,
    validFrom: daysAgo(20),
    validUntil: daysAgo(-10),
    firstPurchaseOnly: false,
  },
  {
    id: 'c-2',
    code: 'GIOITHIEU50',
    discountType: 'fixed',
    discountValue: 50_000,
    couponType: 'referral',
    maxUses: 1000,
    usedCount: 487,
    validFrom: daysAgo(45),
    validUntil: daysAgo(-30),
    firstPurchaseOnly: true,
  },
  {
    id: 'c-3',
    code: 'QUAYLAI30',
    discountType: 'percent',
    discountValue: 30,
    couponType: 'welcome_back',
    maxUses: 200,
    usedCount: 200,
    validFrom: daysAgo(60),
    validUntil: daysAgo(5),
    firstPurchaseOnly: false,
  },
]

export const revenueSummary = {
  totalRevenue: 45_200_000,
  orderCount: 312,
  refundAmount: 1_180_000,
  averageOrderValue: 144_871,
  changePercent: 22,
}
