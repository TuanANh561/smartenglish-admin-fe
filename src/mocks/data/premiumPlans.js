export const premiumPlans = [
  {
    id: 'PLAN-MONTHLY',
    name: 'Premium Monthly',
    icon: 'award',
    price: 199000,
    durationMonths: 1,
    isPopular: false,
    features: [
      { key: 'ai_chat', label: 'AI Chat (Không giới hạn)', enabled: true },
      { key: 'speaking_score', label: 'Chấm điểm Speaking', enabled: true },
      { key: 'writing_fix', label: 'Sửa lỗi Writing', enabled: true },
      { key: 'no_ads', label: 'Không quảng cáo', enabled: true },
    ],
  },
  {
    id: 'PLAN-YEARLY',
    name: 'Premium Yearly',
    icon: 'star',
    price: 1490000,
    durationMonths: 12,
    isPopular: true,
    features: [
      { key: 'ai_chat', label: 'AI Chat (Không giới hạn)', enabled: true },
      { key: 'speaking_score', label: 'Chấm điểm Speaking', enabled: true },
      { key: 'writing_fix', label: 'Sửa lỗi Writing', enabled: true },
      { key: 'no_ads', label: 'Không quảng cáo', enabled: true },
    ],
  },
]

export const coupons = [
  { id: 'CPN-1', code: 'STUDENT45', discountPercent: 45, usedCount: 128, maxUses: 500 },
  { id: 'CPN-2', code: 'SUMMER2026', discountPercent: 20, usedCount: 45, maxUses: 100 },
  { id: 'CPN-3', code: 'FLASH10', discountPercent: 10, usedCount: 1000, maxUses: 1000 },
]
