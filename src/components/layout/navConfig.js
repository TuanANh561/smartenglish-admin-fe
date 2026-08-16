import {
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  Crown,
  Flag,
  Headphones,
  History,
  LayoutDashboard,
  Library,
  Receipt,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Wand2,
} from 'lucide-react'

export const NAV_GROUPS = [
  {
    label: 'Menu',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/du-lieu-chi-tiet', label: 'Dữ liệu chi tiết', icon: BarChart3 },
      { to: '/hoc-vien', label: 'Học viên', icon: Users },
    ],
  },
  {
    label: 'Học liệu',
    items: [
      { to: '/hoc-lieu/tu-vung', label: 'Kho từ vựng', icon: BookOpen },
      { to: '/hoc-lieu/khoa-hoc', label: 'Khoá học & Bài học', icon: Library },
      {
        label: 'Bài đọc và nghe',
        icon: Headphones,
        children: [
          { to: '/hoc-lieu/bai-doc', label: 'Bài đọc' },
          { to: '/hoc-lieu/bai-nghe', label: 'Bài nghe' },
        ],
      },
      { to: '/hoc-lieu/bai-kiem-tra', label: 'Bài kiểm tra', icon: ClipboardList },
    ],
  },
  {
    label: 'Nội dung AI',
    items: [
      { to: '/noi-dung-ai', label: 'Duyệt nội dung AI', icon: Sparkles },
      { to: '/voice-ai', label: 'Cấu hình AI', icon: Wand2 },
    ],
  },
  {
    label: 'Kinh doanh',
    items: [
      { to: '/doanh-thu', label: 'Doanh thu', icon: Wallet },
      { to: '/doi-soat', label: 'Giao dịch & Đối soát', icon: Receipt },
      { to: '/goi-premium', label: 'Gói Premium', icon: Crown },
    ],
  },
  {
    label: 'Cài đặt hệ thống',
    items: [
      { to: '/phan-quyen', label: 'Phân quyền', icon: ShieldCheck },
      { to: '/thong-bao', label: 'Thông báo', icon: Bell },
      { to: '/bao-cao', label: 'Báo cáo vi phạm', icon: Flag },
      { to: '/nhat-ky', label: 'Nhật ký hoạt động', icon: History },
      { to: '/cai-dat', label: 'Cài đặt', icon: Settings },
    ],
  },
]

export const ROUTE_META = {
  '/': {
    title: 'Dashboard Tổng quan',
    description: 'Chào mừng trở lại, hệ thống đang hoạt động ổn định.',
  },
  '/du-lieu-chi-tiet': { title: 'Dữ liệu chi tiết', description: 'Thống kê chi tiết theo thời gian' },
  '/hoc-vien': { title: 'Học viên', description: 'Quản lý danh sách và hồ sơ học viên' },
  '/hoc-lieu/tu-vung': { title: 'Kho từ vựng', description: 'Quản lý kho từ vựng gốc của hệ thống' },
  '/hoc-lieu/khoa-hoc': { title: 'Khoá học & Bài học', description: 'Quản lý khoá học và bài học' },
  '/hoc-lieu/bai-doc': { title: 'Bài đọc', description: 'Quản lý bài đọc và câu hỏi đọc hiểu' },
  '/hoc-lieu/bai-nghe': { title: 'Bài nghe', description: 'Quản lý bài nghe, bản ghi âm và bản chép lời' },
  '/hoc-lieu/bai-kiem-tra': { title: 'Bài kiểm tra', description: 'Quản lý bài kiểm tra và ngân hàng câu hỏi' },
  '/noi-dung-ai': { title: 'Duyệt nội dung AI', description: 'Kiểm duyệt nội dung do AI sinh ra' },
  '/voice-ai': { title: 'Cấu hình AI', description: 'Cấu hình Voice AI và các tham số liên quan' },
  '/doanh-thu': { title: 'Doanh thu', description: 'Theo dõi doanh thu và tăng trưởng' },
  '/doi-soat': { title: 'Giao dịch & Đối soát', description: 'Theo dõi giao dịch và đối soát thanh toán' },
  '/goi-premium': { title: 'Gói Premium', description: 'Cấu hình gói Premium và mã giảm giá' },
  '/phan-quyen': { title: 'Phân quyền', description: 'Quản lý vai trò và phân quyền' },
  '/thong-bao': { title: 'Thông báo', description: 'Quản lý thông báo hệ thống' },
  '/bao-cao': { title: 'Báo cáo vi phạm', description: 'Theo dõi báo cáo vi phạm từ người dùng' },
  '/nhat-ky': { title: 'Nhật ký hoạt động', description: 'Nhật ký hoạt động của quản trị viên' },
  '/cai-dat': { title: 'Cài đặt', description: 'Cấu hình chung cho hệ thống' },
  '/ui': { title: 'Bộ nguyên thuỷ giao diện', description: 'Kitchen sink — chỉ dùng để phát triển' },
}
