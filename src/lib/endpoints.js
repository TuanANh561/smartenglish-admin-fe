/**
 * TOÀN BỘ ĐƯỜNG DẪN API CỦA ADMIN NẰM Ở ĐÂY — và chỉ ở đây.
 *
 * Quy tắc:
 * - File này chỉ chứa chuỗi đường dẫn, không có logic, không gọi HTTP.
 * - Tham số động viết dạng `:ten`, ví dụ '/admin/users/:id'.
 *   Truyền giá trị qua `api.get(ENDPOINTS.users.detail, { path: { id } })`.
 * - Đường dẫn hiện là DỰ KIẾN (backend chưa có). Khi backend chốt URL thật,
 *   sửa đúng file này, không cần đụng tới code feature.
 * - Nhóm theo 8 service trong schema PostgreSQL (.db/SmartEnglishAI_db.txt).
 */

export const ENDPOINTS = {
  // ── auth-service ────────────────────────────────────────────────
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    updateProfile: '/auth/me',
    changePassword: '/auth/me/password',
  },

  // Quản lý người dùng & phân quyền
  users: {
    list: '/admin/users',
    detail: '/admin/users/:id',
    create: '/admin/users',
    update: '/admin/users/:id',
    remove: '/admin/users/:id',
    lock: '/admin/users/:id/lock',
    unlock: '/admin/users/:id/unlock',
    resetPassword: '/admin/users/:id/reset-password',
    devices: '/admin/users/:id/devices',
  },
  roles: {
    list: '/admin/roles',
    detail: '/admin/roles/:id',
    create: '/admin/roles',
    update: '/admin/roles/:id',
    remove: '/admin/roles/:id',
    permissions: '/admin/permissions',
    assign: '/admin/users/:id/roles',
  },

  // ── content-service ─────────────────────────────────────────────
  topics: {
    list: '/admin/topics',
    detail: '/admin/topics/:id',
    create: '/admin/topics',
    update: '/admin/topics/:id',
    remove: '/admin/topics/:id',
  },
  words: {
    list: '/admin/words',
    detail: '/admin/words/:id',
    create: '/admin/words',
    update: '/admin/words/:id',
    remove: '/admin/words/:id',
    meanings: '/admin/words/:id/meanings',
    examples: '/admin/words/:id/examples',
    import: '/admin/words/import',
  },
  phrases: {
    list: '/admin/phrases',
    detail: '/admin/phrases/:id',
    create: '/admin/phrases',
    update: '/admin/phrases/:id',
    remove: '/admin/phrases/:id',
  },
  courses: {
    list: '/admin/courses',
    detail: '/admin/courses/:id',
    create: '/admin/courses',
    update: '/admin/courses/:id',
    remove: '/admin/courses/:id',
    publish: '/admin/courses/:id/publish',
  },
  lessons: {
    list: '/admin/lessons',
    byCourse: '/admin/courses/:courseId/lessons',
    detail: '/admin/lessons/:id',
    create: '/admin/lessons',
    update: '/admin/lessons/:id',
    remove: '/admin/lessons/:id',
    reorder: '/admin/courses/:courseId/lessons/reorder',
  },
  readings: {
    list: '/admin/readings',
    detail: '/admin/readings/:id',
    create: '/admin/readings',
    update: '/admin/readings/:id',
    remove: '/admin/readings/:id',
  },
  listenings: {
    list: '/admin/listenings',
    detail: '/admin/listenings/:id',
    create: '/admin/listenings',
    update: '/admin/listenings/:id',
    remove: '/admin/listenings/:id',
    uploadAudio: '/admin/listenings/:id/audio',
  },

  // ── learning-service (nội dung kiểm tra) ────────────────────────
  quizzes: {
    list: '/admin/quizzes',
    detail: '/admin/quizzes/:id',
    create: '/admin/quizzes',
    update: '/admin/quizzes/:id',
    remove: '/admin/quizzes/:id',
    questions: '/admin/quizzes/:id/questions',
  },
  questions: {
    detail: '/admin/questions/:id',
    create: '/admin/questions',
    update: '/admin/questions/:id',
    remove: '/admin/questions/:id',
  },

  // ── ai-practice-service ─────────────────────────────────────────
  aiContent: {
    list: '/admin/ai/contents',
    detail: '/admin/ai/contents/:id',
    approve: '/admin/ai/contents/:id/approve',
    reject: '/admin/ai/contents/:id/reject',
    update: '/admin/ai/contents/:id',
  },
  aiSettings: {
    prompts: '/admin/ai/prompts',
    promptDetail: '/admin/ai/prompts/:id',
    updatePrompt: '/admin/ai/prompts/:id',
    quotas: '/admin/ai/quotas',
    updateQuota: '/admin/ai/quotas/:id',
    usage: '/admin/ai/usage',
  },

  // ── payment-service ─────────────────────────────────────────────
  plans: {
    list: '/admin/plans',
    detail: '/admin/plans/:id',
    create: '/admin/plans',
    update: '/admin/plans/:id',
    remove: '/admin/plans/:id',
  },
  coupons: {
    list: '/admin/coupons',
    detail: '/admin/coupons/:id',
    create: '/admin/coupons',
    update: '/admin/coupons/:id',
    remove: '/admin/coupons/:id',
    usages: '/admin/coupons/:id/usages',
  },
  orders: {
    list: '/admin/orders',
    detail: '/admin/orders/:id',
    refund: '/admin/orders/:id/refund',
    reconcile: '/admin/orders/reconcile',
    export: '/admin/orders/export',
  },
  subscriptions: {
    list: '/admin/subscriptions',
    detail: '/admin/subscriptions/:id',
    cancel: '/admin/subscriptions/:id/cancel',
  },
  revenue: {
    summary: '/admin/revenue/summary',
    byMonth: '/admin/revenue/by-month',
    byPlan: '/admin/revenue/by-plan',
    report: '/admin/revenue/report',
    transactions: '/admin/revenue/transactions',
    stats: '/admin/revenue/stats',
  },

  // ── Thống kê tổng hợp ───────────────────────────────────────────
  stats: {
    overview: '/admin/stats/overview',
    activeUsers: '/admin/stats/active-users',
    userGrowth: '/admin/stats/user-growth',
    conversion: '/admin/stats/conversion',
    churn: '/admin/stats/churn',
    retention: '/admin/stats/retention',
    featureUsage: '/admin/stats/feature-usage',
    aiUsage: '/admin/stats/ai-usage',
    recentActivity: '/admin/stats/recent-activity',
  },

  // ── notification-service & vận hành hệ thống ────────────────────
  notifications: {
    list: '/admin/notifications',
    detail: '/admin/notifications/:id',
    create: '/admin/notifications',
    send: '/admin/notifications/:id/send',
    remove: '/admin/notifications/:id',
    templates: '/admin/notifications/templates',
    templateDetail: '/admin/notifications/templates/:id',
  },
  reports: {
    list: '/admin/reports',
    detail: '/admin/reports/:id',
    resolve: '/admin/reports/:id/resolve',
    dismiss: '/admin/reports/:id/dismiss',
  },
  system: {
    activityLog: '/admin/system/activity-log',
    health: '/admin/system/health',
  },
}
