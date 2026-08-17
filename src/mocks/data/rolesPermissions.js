// Mock data cho Phân quyền hệ thống & Vai trò người dùng (Chính xác 3 vai trò: Giáo viên, Học viên, Quản trị viên)

export const INITIAL_ROLES = [
  {
    id: 'teacher',
    name: 'Giáo viên',
    code: 'TEACHER',
    description: 'Quyền quản lý lớp học, học viên, tạo đề thi và chấm điểm bài tập tự động bằng AI.',
    userCount: 420,
    status: 'active',
    isSystem: true,
    permissions: {
      // Quản lý Lớp học
      view_students: true,
      edit_students: true,
      delete_students: false,
      create_classes: true,
      assign_homework: true,

      // Quản lý Nội dung & Học liệu
      access_ai_tools: true,
      create_lessons: true,
      approve_public_content: false,
      publish_exams: true,

      // Kinh doanh & Tài chính
      view_revenue: false,
      manage_pricing: false,

      // Quản trị Hệ thống
      view_audit_logs: true,
      manage_reports: false,
      manage_settings: false,
    },
  },
  {
    id: 'student',
    name: 'Học viên',
    code: 'STUDENT',
    description: 'Người học tham gia làm bài tập, thi thử, nộp bài ghi âm và luyện tập kỹ năng với AI.',
    userCount: 28394,
    status: 'active',
    isSystem: true,
    permissions: {
      view_students: false,
      edit_students: false,
      delete_students: false,
      create_classes: false,
      assign_homework: false,

      access_ai_tools: true,
      create_lessons: false,
      approve_public_content: false,
      publish_exams: false,

      view_revenue: false,
      manage_pricing: false,

      view_audit_logs: false,
      manage_reports: false,
      manage_settings: false,
    },
  },
  {
    id: 'admin',
    name: 'Quản trị viên',
    code: 'ADMIN',
    description: 'Toàn quyền truy cập hệ thống, quản lý người dùng, cài đặt và cấu hình tài chính.',
    userCount: 12,
    status: 'active',
    isSystem: true,
    permissions: {
      view_students: true,
      edit_students: true,
      delete_students: true,
      create_classes: true,
      assign_homework: true,

      access_ai_tools: true,
      create_lessons: true,
      approve_public_content: true,
      publish_exams: true,

      view_revenue: true,
      manage_pricing: true,

      view_audit_logs: true,
      manage_reports: true,
      manage_settings: true,
    },
  },
]

export const PERMISSION_GROUPS = [
  {
    key: 'classes',
    title: 'Quản lý Lớp học',
    icon: 'GraduationCap',
    items: [
      { key: 'view_students', label: 'Xem danh sách học viên' },
      { key: 'edit_students', label: 'Thêm/Sửa thông tin học viên' },
      { key: 'delete_students', label: 'Xóa học viên khỏi lớp' },
      { key: 'create_classes', label: 'Tạo và cấu hình lớp học mới' },
      { key: 'assign_homework', label: 'Giao bài tập & Đề thi vào lớp' },
    ],
  },
  {
    key: 'content_ai',
    title: 'Quản lý Nội dung & AI',
    icon: 'Sparkles',
    items: [
      { key: 'access_ai_tools', label: 'Truy cập công cụ AI chấm điểm & sinh bài' },
      { key: 'create_lessons', label: 'Tạo bài giảng mới (Đọc, Nghe, Đề thi)' },
      { key: 'approve_public_content', label: 'Phê duyệt nội dung chung toàn sàn' },
      { key: 'publish_exams', label: 'Xuất bản và mở khóa đề thi' },
    ],
  },
  {
    key: 'business',
    title: 'Kinh doanh & Tài chính',
    icon: 'Wallet',
    items: [
      { key: 'view_revenue', label: 'Xem báo cáo doanh thu & giao dịch' },
      { key: 'manage_pricing', label: 'Cấu hình gói giá & mã giảm giá' },
    ],
  },
  {
    key: 'system',
    title: 'Quản trị Hệ thống',
    icon: 'Shield',
    items: [
      { key: 'view_audit_logs', label: 'Xem nhật ký hoạt động hệ thống' },
      { key: 'manage_reports', label: 'Xử lý báo cáo vi phạm cộng đồng' },
      { key: 'manage_settings', label: 'Cấu hình cài đặt toàn hệ thống' },
    ],
  },
]
