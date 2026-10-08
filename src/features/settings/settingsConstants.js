/**
 * Cấu hình mặc định cho Quản trị viên (Admin)
 */
export const DEFAULT_ADMIN_SETTINGS = {
  general: {
    appName: 'SmartEnglish AI',
    appSlogan: 'Nền tảng học tiếng Anh thông minh cá nhân hóa hàng đầu',
    defaultLanguage: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    supportEmail: 'support@smartenglish.vn',
    supportPhone: '1900 6868',
    maintenanceMode: false,
    allowRegistration: true,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeoutMinutes: 60,
    minPasswordLength: 8,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    ipWhitelist: '127.0.0.1\n192.168.1.0/24',
  },
  payment: {
    vnpayEnabled: true,
    vnpayMerchantId: 'SMARTENG_VNPAY',
    vnpaySecretKey: '••••••••••••••••••••••••',
    vnpaySandbox: true,
    momoEnabled: true,
    momoPartnerCode: 'MOMO_SMARTENG_2026',
    momoAccessKey: '••••••••••••••••••••••••',
    webhookUrl: 'https://api.smartenglish.vn/api/v1/payment/webhook/ipn',
  },
  email: {
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'notifications@smartenglish.vn',
    senderName: 'SmartEnglish AI System',
    fcmServerKey: '••••••••••••••••••••••••',
    notifyNewRegistration: true,
    notifyPaymentSuccess: true,
    notifyAssignmentSubmission: true,
  },
}

/**
 * Cấu hình mặc định cho Giảng viên (Teacher)
 */
export const DEFAULT_TEACHER_SETTINGS = {
  teaching: {
    allowJoinByPin: true,
    autoApproveStudents: true,
    allowLateSubmissions: true,
    defaultPassingScore: 70,
    autoSendDeadlineReminder: true,
  },
  notifications: {
    notifyNewStudentJoin: true,
    notifyAssignmentSubmitted: true,
    weeklyProgressDigest: true,
    playNotificationSound: true,
  },
  preferences: {
    uiLanguage: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    dateFormat: 'DD/MM/YYYY',
  },
  banking: {
    bankName: 'Vietcombank',
    accountNumber: '',
    accountHolder: '',
    branch: '',
    accountType: 'personal',
  },
}

/**
 * Danh sách ngân hàng phổ biến tại Việt Nam
 */
export const VIETNAM_BANKS = [
  { code: 'VCB', name: 'Vietcombank (Ngoại Thương Việt Nam)' },
  { code: 'MB', name: 'MB Bank (Quân Đội)' },
  { code: 'TCB', name: 'Techcombank (Kỹ Thương Việt Nam)' },
  { code: 'BIDV', name: 'BIDV (Đầu tư và Phát triển Việt Nam)' },
  { code: 'CTG', name: 'VietinBank (Công Thương Việt Nam)' },
  { code: 'ACB', name: 'ACB (Á Châu)' },
  { code: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)' },
  { code: 'TPB', name: 'TPBank (Tiên Phong)' },
]
