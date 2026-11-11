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
  MessagesSquare,
  Receipt,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Cpu,
  User,
} from 'lucide-react'
import { hasRolePermission } from '@/lib/rbac'

const ROUTE_PERMISSION_MAP = {
  '/app/lop-hoc': ['create_classes', 'view_students', 'assign_homework'],
  '/app/hoc-lieu/khoa-hoc': ['create_lessons'],
  '/app/hoc-lieu/bai-kiem-tra': ['publish_exams'],
  '/app/noi-dung-ai': ['access_ai_tools'],
  '/app/nhat-ky': ['view_audit_logs'],
}

function checkRoutePermission(to, normRole) {
  if (!to || normRole === 'admin') return true
  const requiredPerms = ROUTE_PERMISSION_MAP[to]
  if (!requiredPerms || requiredPerms.length === 0) return true
  return requiredPerms.some((perm) => hasRolePermission(normRole, perm))
}

export const ROLE_ACCESS = {
  admin: ['*'],
  teacher: [
    '/app',
    '/app/lop-hoc',
    '/app/cong-dong',
    '/app/goi-dich-vu',
    '/app/giao-dich',
    '/app/hoc-lieu/khoa-hoc',
    '/app/hoc-lieu/bai-kiem-tra',
    '/app/noi-dung-ai',
    '/app/thong-bao',
    '/app/nhat-ky',
    '/app/cai-dat',
    '/app/ho-so',
  ],
}

export function isRouteAllowed(pathname, role = 'admin') {
  if (!role) return false
  const normRole = String(role).trim().toLowerCase()
  if (normRole === 'admin') return true
  if (normRole === 'teacher') {
    if (!pathname) return false
    const cleanPath = pathname.replace(/\/+$/, '') || '/'
    return ROLE_ACCESS.teacher.some((allowed) => {
      if (allowed === '/app') {
        return cleanPath === '/app'
      }
      return cleanPath === allowed || cleanPath.startsWith(`${allowed}/`)
    })
  }
  return false
}

export const NAV_GROUPS = [
  {
    label: 'Menu',
    items: [
      { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true, roles: ['admin', 'teacher'] },
      { to: '/app/cong-dong', label: 'Cộng đồng', icon: MessagesSquare, unreadCount: 0, roles: ['admin', 'teacher'] },
      { to: '/app/hoc-vien', label: 'Người dùng', icon: Users, roles: ['admin'] },
      { to: '/app/lop-hoc', label: 'Lớp học', icon: GraduationCap, roles: ['teacher', 'admin'] },
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
          { to: '/app/hoc-lieu/phat-am', label: 'Luyện nói & Phát âm', roles: ['admin'] },
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
      {
        to: '/app/noi-dung-ai',
        label: 'Duyệt nội dung AI',
        labelByRole: {
          teacher: 'Tạo nội dung AI',
          admin: 'Duyệt nội dung AI',
        },
        icon: Sparkles,
        roles: ['admin', 'teacher'],
      },
      { to: '/app/voice-ai', label: 'Cấu hình AI', icon: Cpu, roles: ['admin'] },
    ],
  },
  {
    label: 'Kinh doanh',
    items: [
      { to: '/app/doanh-thu', label: 'Doanh thu', icon: Wallet, roles: ['admin'] },
      { to: '/app/doi-soat', label: 'Giao dịch & Đối soát', icon: Receipt, roles: ['admin'] },
      {
        label: 'Gói & Giao dịch',
        icon: Crown,
        roles: ['teacher', 'admin'],
        children: [
          { to: '/app/goi-premium', label: 'Cấu hình gói Premium', roles: ['admin'] },
          { to: '/app/goi-dich-vu', label: 'Gói dịch vụ', roles: ['teacher', 'admin'] },
          { to: '/app/giao-dich', label: 'Lịch sử giao dịch', roles: ['teacher'] },
        ],
      },
    ],
  },
  {
    label: 'Cài đặt hệ thống',
    items: [
      { to: '/app/phan-quyen', label: 'Phân quyền', icon: ShieldCheck, roles: ['admin'] },
      { to: '/app/thong-bao', label: 'Thông báo', icon: Bell, roles: ['admin'] },
      { to: '/app/bao-cao', label: 'Báo cáo vi phạm', icon: Flag, roles: ['admin'] },
      { to: '/app/nhat-ky', label: 'Nhật ký hoạt động', icon: History, roles: ['admin', 'teacher'] },
      { to: '/app/cai-dat', label: 'Cài đặt', icon: Settings, roles: ['admin', 'teacher'] },
    ],
  },
]

export function getVisibleNavGroups(role = 'admin') {
  const normRole = String(role || 'admin').toLowerCase()
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: (group.items || [])
      .filter((item) => {
        if (item.children) {
          const children = (item.children || []).filter((child) =>
            (!child.roles || child.roles.map((r) => r.toLowerCase()).includes(normRole)) &&
            checkRoutePermission(child.to, normRole),
          )

          return children.length > 0
        }

        const roleMatch = !item.roles || item.roles.map((r) => r.toLowerCase()).includes(normRole)
        return roleMatch && checkRoutePermission(item.to, normRole)
      })
      .map((item) => {
        const itemLabel = item.labelByRole?.[normRole] || (item.to === '/app/noi-dung-ai' && normRole === 'teacher' ? 'Tạo nội dung AI' : item.label)
        if (item.children) {
          return {
            ...item,
            label: itemLabel,
            children: (item.children || [])
              .filter((child) => !child.roles || child.roles.map((r) => r.toLowerCase()).includes(normRole))
              .map((child) => ({
                ...child,
                label: child.labelByRole?.[normRole] || child.label,
              })),
          }
        }
        return {
          ...item,
          label: itemLabel,
        }
      }),
  })).filter((group) => group.items.length > 0)
}

export const ROUTE_META = {
  '/app': {
    title: 'Dashboard Tổng quan',
    description: 'Chào mừng trở lại, hệ thống đang hoạt động ổn định.',
  },
  '/app/cong-dong': {
    title: 'Cộng đồng',
    description: '',
  },
  '/app/hoc-vien': { title: 'Người dùng', description: 'Quản lý danh sách tất cả người dùng hệ thống' },
  '/app/lop-hoc': { title: 'Lớp học', description: 'Quản lý các lớp học bạn đang phụ trách' },
  '/app/goi-dich-vu': { title: 'Gói dịch vụ', description: 'Bảng giá và quyền lợi tài nguyên hệ thống' },
  '/app/giao-dich': { title: 'Quản lý Giao dịch & Hóa đơn', description: 'Tra cứu lịch sử thanh toán và xuất hóa đơn điện tử' },
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
    title: 'Quản lý Luyện nói & Phát âm',
    description: 'Quản lý học liệu phát âm IPA, kịch bản đàm thoại và luyện nói AI.',
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
  '/app/voice-ai': { title: 'Cấu hình AI', description: 'Quản lý nhà cung cấp, khóa API và mô hình AI hệ thống' },
  '/app/doanh-thu': { title: 'Doanh thu', description: 'Theo dõi doanh thu và tăng trưởng' },
  '/app/doi-soat': {
    title: 'Giao dịch & Đối soát',
    description: '',
  },
  '/app/goi-premium': {
    title: 'Gói Premium',
    description: '',
  },
  '/app/phan-quyen': { title: 'Phân quyền', description: 'Quản lý vai trò và phân quyền' },
  '/app/thong-bao': { title: 'Thông báo', description: 'Quản lý thông báo hệ thống' },
  '/app/bao-cao': { title: 'Báo cáo vi phạm', description: 'Theo dõi báo cáo vi phạm từ người dùng' },
  '/app/nhat-ky': { title: 'Nhật ký hoạt động', description: 'Theo dõi lịch sử hoạt động, nâng cấp dịch vụ & thao tác hệ thống' },
  '/app/cai-dat': { title: 'Cài đặt', description: 'Cấu hình và tuỳ chọn cho hệ thống' },
  '/app/ho-so': { title: 'Hồ sơ cá nhân', description: 'Quản lý thông tin tài khoản, chuyên môn giảng dạy và bảo mật' },
  '/ui': { title: 'Bộ nguyên thuỷ giao diện', description: 'Kitchen sink — chỉ dùng để phát triển' },
}

