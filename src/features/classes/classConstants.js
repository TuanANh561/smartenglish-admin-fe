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
