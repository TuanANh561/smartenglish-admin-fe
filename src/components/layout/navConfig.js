import {
  Bell,
  BookOpen,
  ClipboardList,
  Crown,
  Flag,
  GraduationCap,
  History,
  LayoutDashboard,
  Library,
  Receipt,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  UsersRound,
  Wallet,
  Wand2,
} from 'lucide-react'

export const ROLE_ACCESS = {
  admin: ['*'],
  teacher: [
    '/app',
    '/app/lop-hoc',
    '/app/cong-dong',
    '/app/goi-dich-vu',
    '/app/hoc-lieu/khoa-hoc',
    '/app/hoc-lieu/bai-kiem-tra',
    '/app/noi-dung-ai',
    '/app/thong-bao',
    '/app/nhat-ky',
    '/app/cai-dat',
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
      { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true, roles: ['admin', 'teacher'] },
      { to: '/app/cong-dong', label: 'Cộng đồng', icon: UsersRound, unreadCount: 6, roles: ['admin', 'teacher'] },
      { to: '/app/hoc-vien', label: 'Quản lý người dùng', icon: Users, roles: ['admin'] },
      { to: '/app/lop-hoc', label: 'Lớp học', icon: GraduationCap, roles: ['teacher'] },
      { to: '/app/goi-dich-vu', label: 'Gói dịch vụ', icon: Crown, roles: ['teacher'] },
    ],
  },
  {
    label: 'Học liệu',
    items: [
      {
        label: 'Bài học',
        icon: BookOpen,
        roles: ['admin'],
        children: [
          { to: '/app/hoc-lieu/tu-vung', label: 'Từ vựng', roles: ['admin'] },
          { to: '/app/hoc-lieu/ngu-phap', label: 'Ngữ pháp', roles: ['admin'] },
          { to: '/app/hoc-lieu/phat-am', label: 'Phát âm', roles: ['admin'] },
          { to: '/app/hoc-lieu/bai-doc', label: 'Đọc hiểu', roles: ['admin'] },
          { to: '/app/hoc-lieu/bai-nghe', label: 'Nghe hiểu', roles: ['admin'] },
        ],
      },
      { to: '/app/hoc-lieu/bai-kiem-tra', label: 'Bài Thi', icon: ClipboardList, roles: ['admin', 'teacher'] },
      { to: '/app/hoc-lieu/khoa-hoc', label: 'Khoá học', icon: Library, roles: ['admin', 'teacher'] },
    ],
  },
  {
    label: 'Nội dung AI',
    items: [
      { to: '/app/noi-dung-ai', label: 'Duyệt nội dung AI', icon: Sparkles, roles: ['admin', 'teacher'] },
      { to: '/app/voice-ai', label: 'Cấu hình AI', icon: Wand2, roles: ['admin'] },
    ],
  },
  {
    label: 'Kinh doanh',
    items: [
      { to: '/app/doanh-thu', label: 'Doanh thu', icon: Wallet, roles: ['admin'] },
      { to: '/app/doi-soat', label: 'Giao dịch & Đối soát', icon: Receipt, roles: ['admin'] },
      { to: '/app/goi-premium', label: 'Gói Premium', icon: Crown, roles: ['admin'] },
    ],
  },
  {
    label: 'Cài đặt hệ thống',
    items: [
      { to: '/app/phan-quyen', label: 'Phân quyền', icon: ShieldCheck, roles: ['admin'] },
      { to: '/app/thong-bao', label: 'Thông báo', icon: Bell, roles: ['admin', 'teacher'] },
      { to: '/app/bao-cao', label: 'Báo cáo vi phạm', icon: Flag, roles: ['admin'] },
      { to: '/app/nhat-ky', label: 'Nhật ký hoạt động', icon: History, roles: ['admin', 'teacher'] },
      { to: '/app/cai-dat', label: 'Cài đặt', icon: Settings, roles: ['admin', 'teacher'] },
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
  '/app': {
    title: 'Dashboard Tổng quan',
    description: 'Chào mừng trở lại, hệ thống đang hoạt động ổn định.',
  },
  '/app/cong-dong': {
    title: 'Cộng đồng Giáo viên & Học liệu',
    description: 'Không gian chia sẻ kiến thức, tài liệu bài giảng, mẹo luyện thi và thảo luận học thuật.',
  },
  '/app/hoc-vien': { title: 'Quản lý người dùng', description: 'Quản lý danh sách tất cả người dùng hệ thống' },
  '/app/lop-hoc': { title: 'Lớp học', description: 'Quản lý các lớp học bạn đang phụ trách' },
  '/app/goi-dich-vu': { title: 'Gói dịch vụ giảng dạy', description: 'Quản lý gói quyền lợi giảng dạy và ưu đãi học viên' },
  '/app/hoc-lieu/tu-vung': { title: 'Kho từ vựng', description: 'Quản lý kho từ vựng gốc của hệ thống' },
  '/app/hoc-lieu/ngu-phap': {
    title: 'Quản lý Bài học Ngữ pháp',
    description: 'Biên soạn và quản lý các bài học cấu trúc ngữ pháp hệ thống.',
  },
  '/app/hoc-lieu/ngu-phap/tao-moi': {
    title: 'Biên soạn Bài học Ngữ pháp',
    description: 'Thiết lập cấu trúc, quy tắc ngữ pháp và hệ thống bài tập trắc nghiệm.',
  },
  '/app/hoc-lieu/phat-am': {
    title: 'Quản lý Bài học Phát âm',
    description: 'Quản lý học liệu luyện phát âm, trọng âm và ngữ điệu AI.',
  },
  '/app/hoc-lieu/phat-am/tao-moi': {
    title: 'Biên soạn Bài học Phát âm',
    description: 'Thiết lập ký hiệu IPA, từ mẫu âm thanh và bài tập nhận diện âm.',
  },
  '/app/hoc-lieu/khoa-hoc': { title: 'Khoá học & Bài học', description: 'Quản lý khoá học và bài học' },
  '/app/hoc-lieu/khoa-hoc/tao-moi': { title: 'Tạo Khóa học mới', description: 'Thiết lập thông tin cơ bản và cấu trúc chương trình học.' },
  '/app/hoc-lieu/bai-doc': { title: 'Bài đọc', description: 'Quản lý bài đọc và câu hỏi đọc hiểu' },
  '/app/hoc-lieu/bai-nghe': { title: 'Bài nghe', description: 'Quản lý bài nghe, bản ghi âm và bản chép lời' },
  '/app/hoc-lieu/bai-kiem-tra': {
    title: 'Quản lý Bài Kiểm Tra (Quiz Bank)',
    description: 'Quản lý ngân hàng câu hỏi và duyệt nội dung do AI sinh ra',
  },
  '/app/noi-dung-ai': {
    title: 'Tạo — Duyệt nội dung AI',
    description: 'Quản lý nội dung do AI sinh ra',
  },
  '/app/voice-ai': { title: 'Cấu hình AI', description: 'Cấu hình Voice AI và các tham số liên quan' },
  '/app/doanh-thu': { title: 'Doanh thu', description: 'Theo dõi doanh thu và tăng trưởng' },
  '/app/doi-soat': {
    title: 'Giao dịch & Đối soát',
    description: 'Quản lý dòng tiền, theo dõi thanh toán và xử lý các yêu cầu hoàn tiền từ học viên',
  },
  '/app/goi-premium': {
    title: 'Premium Package & Pricing Configurator',
    description: 'Quản lý các gói dịch vụ và mã giảm giá cho hệ thống SmartEnglish AI',
  },
  '/app/phan-quyen': { title: 'Phân quyền', description: 'Quản lý vai trò và phân quyền' },
  '/app/thong-bao': { title: 'Thông báo', description: 'Quản lý thông báo hệ thống' },
  '/app/bao-cao': { title: 'Báo cáo vi phạm', description: 'Theo dõi báo cáo vi phạm từ người dùng' },
  '/app/nhat-ky': { title: 'Nhật ký hoạt động', description: 'Nhật ký hoạt động của quản trị viên' },
  '/app/cai-dat': { title: 'Cài đặt', description: 'Cấu hình chung cho hệ thống' },
  '/ui': { title: 'Bộ nguyên thuỷ giao diện', description: 'Kitchen sink — chỉ dùng để phát triển' },
}

