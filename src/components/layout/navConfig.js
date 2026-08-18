import {
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  Crown,
  Flag,
  GraduationCap,
  History,
  LayoutDashboard,
  Library,
  MessageSquare,
  Receipt,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Wand2,
} from 'lucide-react'

export const ROLE_ACCESS = {
  admin: ['*'],
  teacher: [
    '/',
    '/lop-hoc',
    '/cong-dong',
    '/goi-dich-vu',
    '/hoc-lieu/khoa-hoc',
    '/hoc-lieu/bai-doc',
    '/hoc-lieu/bai-nghe',
    '/hoc-lieu/bai-kiem-tra',
    '/noi-dung-ai',
    '/thong-bao',
    '/nhat-ky',
    '/cai-dat',
  ],
}

export function isRouteAllowed(pathname, role = 'admin') {
  if (role === 'admin') return true
  if (!pathname) return false

  return ROLE_ACCESS.teacher.some((allowed) =>
    pathname === allowed || pathname.startsWith(`${allowed}/`),
  )
}

export const NAV_GROUPS = [
  {
    label: 'Menu',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, roles: ['admin', 'teacher'] },
      { to: '/cong-dong', label: 'Cộng đồng', icon: MessageSquare, roles: ['admin', 'teacher'] },
      {
        to: '/du-lieu-chi-tiet',
        label: 'Dữ liệu chi tiết',
        icon: BarChart3,
        roles: ['admin'],
      },
      { to: '/hoc-vien', label: 'Quản lý người dùng', icon: Users, roles: ['admin'] },
      { to: '/lop-hoc', label: 'Lớp học', icon: GraduationCap, roles: ['teacher'] },
      { to: '/goi-dich-vu', label: 'Gói dịch vụ', icon: Crown, roles: ['teacher'] },
    ],
  },
  {
    label: 'Học liệu',
    items: [
      {
        label: 'Bài học',
        icon: BookOpen,
        roles: ['admin', 'teacher'],
        children: [
          { to: '/hoc-lieu/tu-vung', label: 'Từ vựng', roles: ['admin'] },
          { to: '/hoc-lieu/ngu-phap', label: 'Ngữ pháp', roles: ['admin', 'teacher'] },
          { to: '/hoc-lieu/phat-am', label: 'Phát âm', roles: ['admin', 'teacher'] },
          { to: '/hoc-lieu/bai-doc', label: 'Đọc hiểu', roles: ['admin', 'teacher'] },
          { to: '/hoc-lieu/bai-nghe', label: 'Nghe hiểu', roles: ['admin', 'teacher'] },
        ],
      },
      { to: '/hoc-lieu/bai-kiem-tra', label: 'Bài Thi', icon: ClipboardList, roles: ['admin', 'teacher'] },
      { to: '/hoc-lieu/khoa-hoc', label: 'Khoá học', icon: Library, roles: ['admin', 'teacher'] },
    ],
  },
  {
    label: 'Nội dung AI',
    items: [
      { to: '/noi-dung-ai', label: 'Duyệt nội dung AI', icon: Sparkles, roles: ['admin', 'teacher'] },
      { to: '/voice-ai', label: 'Cấu hình AI', icon: Wand2, roles: ['admin'] },
    ],
  },
  {
    label: 'Kinh doanh',
    items: [
      { to: '/doanh-thu', label: 'Doanh thu', icon: Wallet, roles: ['admin'] },
      { to: '/doi-soat', label: 'Giao dịch & Đối soát', icon: Receipt, roles: ['admin'] },
      { to: '/goi-premium', label: 'Gói Premium', icon: Crown, roles: ['admin'] },
    ],
  },
  {
    label: 'Cài đặt hệ thống',
    items: [
      { to: '/phan-quyen', label: 'Phân quyền', icon: ShieldCheck, roles: ['admin'] },
      { to: '/thong-bao', label: 'Thông báo', icon: Bell, roles: ['admin', 'teacher'] },
      { to: '/bao-cao', label: 'Báo cáo vi phạm', icon: Flag, roles: ['admin'] },
      { to: '/nhat-ky', label: 'Nhật ký hoạt động', icon: History, roles: ['admin', 'teacher'] },
      { to: '/cai-dat', label: 'Cài đặt', icon: Settings, roles: ['admin', 'teacher'] },
    ],
  },
]

export function getVisibleNavGroups(role = 'admin') {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: (group.items || []).filter((item) => {
      if (item.children) {
        const children = (item.children || []).filter((child) =>
          !child.roles || child.roles.includes(role),
        )

        return children.length > 0
      }

      return !item.roles || item.roles.includes(role)
    }),
  })).filter((group) => group.items.length > 0)
}

export const ROUTE_META = {
  '/': {
    title: 'Dashboard Tổng quan',
    description: 'Chào mừng trở lại, hệ thống đang hoạt động ổn định.',
  },
  '/du-lieu-chi-tiet': { title: 'Dữ liệu chi tiết', description: 'Thống kê chi tiết theo thời gian' },
  '/hoc-vien': { title: 'Quản lý người dùng', description: 'Quản lý danh sách tất cả người dùng hệ thống' },
  '/lop-hoc': { title: 'Lớp học', description: 'Quản lý các lớp học bạn đang phụ trách' },
  '/goi-dich-vu': { title: 'Gói dịch vụ giảng dạy', description: 'Quản lý gói quyền lợi giảng dạy và ưu đãi học viên' },
  '/hoc-lieu/tu-vung': { title: 'Kho từ vựng', description: 'Quản lý kho từ vựng gốc của hệ thống' },
  '/hoc-lieu/khoa-hoc': { title: 'Khoá học & Bài học', description: 'Quản lý khoá học và bài học' },
  '/hoc-lieu/bai-doc': { title: 'Bài đọc', description: 'Quản lý bài đọc và câu hỏi đọc hiểu' },
  '/hoc-lieu/bai-nghe': { title: 'Bài nghe', description: 'Quản lý bài nghe, bản ghi âm và bản chép lời' },
  '/hoc-lieu/bai-kiem-tra': {
    title: 'Quản lý Bài Kiểm Tra (Quiz Bank)',
    description: 'Quản lý ngân hàng câu hỏi và duyệt nội dung do AI sinh ra',
  },
  '/noi-dung-ai': {
    title: 'Tạo — Duyệt nội dung AI',
    description: 'Quản lý nội dung do AI sinh ra',
  },
  '/voice-ai': { title: 'Cấu hình AI', description: 'Cấu hình Voice AI và các tham số liên quan' },
  '/doanh-thu': { title: 'Doanh thu', description: 'Theo dõi doanh thu và tăng trưởng' },
  '/doi-soat': {
    title: 'Giao dịch & Đối soát',
    description: 'Quản lý dòng tiền, theo dõi thanh toán và xử lý các yêu cầu hoàn tiền từ học viên',
  },
  '/goi-premium': {
    title: 'Premium Package & Pricing Configurator',
    description: 'Quản lý các gói dịch vụ và mã giảm giá cho hệ thống SmartEnglish AI',
  },
  '/phan-quyen': { title: 'Phân quyền', description: 'Quản lý vai trò và phân quyền' },
  '/thong-bao': { title: 'Thông báo', description: 'Quản lý thông báo hệ thống' },
  '/bao-cao': { title: 'Báo cáo vi phạm', description: 'Theo dõi báo cáo vi phạm từ người dùng' },
  '/nhat-ky': { title: 'Nhật ký hoạt động', description: 'Nhật ký hoạt động của quản trị viên' },
  '/cai-dat': { title: 'Cài đặt', description: 'Cấu hình chung cho hệ thống' },
  '/ui': { title: 'Bộ nguyên thuỷ giao diện', description: 'Kitchen sink — chỉ dùng để phát triển' },
}
