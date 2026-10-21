/**
 * classConstants.js
 * Các hằng số hiển thị trạng thái và cấp độ cho Lớp học
 */

// Trạng thái lớp học
export const CLASS_STATUS = {
  active:   { label: 'Đang diễn ra', tone: 'success',  dot: '#22c55e' },
  ACTIVE:   { label: 'Đang diễn ra', tone: 'success',  dot: '#22c55e' },
  ended:    { label: 'Đã kết thúc',  tone: 'neutral',  dot: '#94a3b8' },
  ENDED:    { label: 'Đã kết thúc',  tone: 'neutral',  dot: '#94a3b8' },
  upcoming: { label: 'Sắp khai giảng', tone: 'warning', dot: '#f59e0b' },
  UPCOMING: { label: 'Sắp khai giảng', tone: 'warning', dot: '#f59e0b' },
}

// Màu badge cấp độ CEFR
export const LEVEL_COLOR = {
  A1: { bg: '#f0fdf4', text: '#15803d' },
  A2: { bg: '#f0fdf4', text: '#15803d' },
  B1: { bg: '#eff6ff', text: '#1d4ed8' },
  B2: { bg: '#eff6ff', text: '#1d4ed8' },
  C1: { bg: '#faf5ff', text: '#7c3aed' },
  C2: { bg: '#faf5ff', text: '#7c3aed' },
}

// Danh bạ tên giảng viên hệ thống
export const KNOWN_TEACHER_NAMES = {
  1: 'Admin SmartEnglish Pro',
  2: 'Thầy John Smith',
  8: 'Vũ Đức Thắng',
  29: 'Cô Mai Phương',
  32: 'Vũ Đình Trọng',
  33: 'Thầy Nguyễn Văn Hùng',
  34: 'Cô Trần Thị Mai',
  35: 'Thầy Lê Quốc Bảo',
  36: 'Cô Phạm Thùy Linh',
  37: 'Thầy Hoàng Đức Minh',
  38: 'Cô Vũ Thu Trang',
  39: 'Thầy Đỗ Anh Tuấn',
  40: 'Cô Ngô Quỳnh Chi',
  41: 'Thầy Bùi Quang Huy',
  42: 'Cô Đặng Thanh Hà',
  43: 'Thầy Nguyễn Tuấn Anh',
  44: 'Thay Nguyen Van Binh',
}

/**
 * Chuẩn hóa và hiển thị tên giảng viên thật thay vì hiển thị placeholder "Người dùng #id"
 * @param {string} teacherName Tên trả về từ API
 * @param {number|string} teacherId ID của giảng viên
 * @param {Record<number|string, string>} userMap Danh bạ người dùng tải từ /admin/users
 */
export function formatTeacherName(teacherName, teacherId, userMap = {}) {
  // 1. Kiểm tra danh bạ động từ API
  if (teacherId && userMap[teacherId]) {
    return userMap[teacherId]
  }
  // 2. Kiểm tra danh bạ giáo viên mẫu
  if (teacherId && KNOWN_TEACHER_NAMES[teacherId]) {
    return KNOWN_TEACHER_NAMES[teacherId]
  }
  // 3. Nếu là chuỗi placeholder dạng Người dùng #id hoặc Giáo viên #id
  const raw = (teacherName || '').trim()
  if (!raw || raw.startsWith('Người dùng #') || raw.startsWith('Giáo viên #') || raw.startsWith('User #')) {
    const idMatch = raw.match(/#(\d+)/) || (teacherId ? [null, teacherId] : null)
    if (idMatch && idMatch[1]) {
      const tid = Number(idMatch[1])
      if (userMap[tid]) return userMap[tid]
      if (KNOWN_TEACHER_NAMES[tid]) return KNOWN_TEACHER_NAMES[tid]
      return `Giảng viên #${tid}`
    }
    return teacherId ? `Giảng viên #${teacherId}` : 'Chưa phân công'
  }
  return raw
}

