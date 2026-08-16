import { daysAgo, minutesAgo } from '../utils'

/** Shape bám theo content.system_daily_stats + content.feature_usage_stats. */

export const overview = {
  dau: { value: 1248, changePercent: 12 },
  mau: { value: 28400, changePercent: 8 },
  monthlyRevenue: { value: 45_200_000, currency: 'VND', changePercent: 22 },
  premiumConversionRate: { value: 8.3, changePercent: -1.5 },
}

export const activeUsers = [
  { day: 'T2', date: daysAgo(6), free: 820, premium: 410 },
  { day: 'T3', date: daysAgo(5), free: 910, premium: 445 },
  { day: 'T4', date: daysAgo(4), free: 870, premium: 430 },
  { day: 'T5', date: daysAgo(3), free: 1180, premium: 505 },
  { day: 'T6', date: daysAgo(2), free: 1320, premium: 560 },
  { day: 'T7', date: daysAgo(1), free: 960, premium: 470 },
  { day: 'CN', date: daysAgo(0), free: 1248, premium: 615 },
]

export const featureUsage = [
  { feature: 'flashcard', label: 'Thẻ ghi nhớ', percent: 35, uniqueUsers: 9940 },
  { feature: 'quiz', label: 'Bài kiểm tra', percent: 25, uniqueUsers: 7100 },
  { feature: 'ai_voice_chat', label: 'Luyện nói với AI', percent: 20, uniqueUsers: 5680 },
  { feature: 'others', label: 'Khác', percent: 20, uniqueUsers: 5680 },
]

export const recentActivity = [
  {
    id: 'act-1',
    user: { id: 'u-1', displayName: 'Nguyễn Anh Tuấn', cefrLevel: 'B2', avatarUrl: null },
    action: 'Nâng cấp Premium',
    status: 'success',
    occurredAt: minutesAgo(2),
    amount: 299_000,
  },
  {
    id: 'act-2',
    user: { id: 'u-2', displayName: 'Trần Thị Lan', cefrLevel: 'A2', avatarUrl: null },
    action: "Hoàn thành 'Vocabulary Quiz'",
    status: 'done',
    occurredAt: minutesAgo(15),
    amount: null,
  },
  {
    id: 'act-3',
    user: { id: 'u-3', displayName: 'Lê Hoàng Nam', cefrLevel: 'C1', avatarUrl: null },
    action: 'Đăng ký mới',
    status: 'pending',
    occurredAt: minutesAgo(28),
    amount: null,
  },
  {
    id: 'act-4',
    user: { id: 'u-4', displayName: 'Phạm Mỹ Linh', cefrLevel: 'B1', avatarUrl: null },
    action: 'Nâng cấp Premium',
    status: 'failed',
    occurredAt: minutesAgo(45),
    amount: null,
  },
]

export const revenueByMonth = [
  { month: '2026-03', label: 'Th3', revenue: 24_600_000 },
  { month: '2026-04', label: 'Th4', revenue: 31_200_000 },
  { month: '2026-05', label: 'Th5', revenue: 28_900_000 },
  { month: '2026-06', label: 'Th6', revenue: 38_400_000 },
  { month: '2026-07', label: 'Th7', revenue: 34_100_000 },
  { month: '2026-08', label: 'Th8', revenue: 45_200_000 },
]

export const aiUsage = [
  { date: daysAgo(4), tokens: 1_240_000, requests: 3120 },
  { date: daysAgo(3), tokens: 1_480_000, requests: 3610 },
  { date: daysAgo(2), tokens: 1_390_000, requests: 3480 },
  { date: daysAgo(1), tokens: 1_720_000, requests: 4050 },
  { date: daysAgo(0), tokens: 1_610_000, requests: 3890 },
]
