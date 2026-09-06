import { BookOpen, ClipboardList } from 'lucide-react'

export const TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'reading', label: 'Bài đọc' },
  { value: 'quiz', label: 'Bài kiểm tra' },
  { value: 'others', label: 'Khác' },
]

export const CONTENT_TYPE_OPTIONS = [
  { value: 'reading', label: 'Bài đọc' },
  { value: 'quiz', label: 'Bài kiểm tra' },
  { value: 'toeic_part_5', label: 'TOEIC Part 5' },
  { value: 'toeic_part_6', label: 'TOEIC Part 6' },
  { value: 'toeic_part_7', label: 'TOEIC Part 7' },
  { value: 'cloze_sentence', label: 'Điền khuyết câu' },
  { value: 'cloze_paragraph', label: 'Điền khuyết đoạn văn' },
]

export const TYPE_LABELS = {
  reading: 'Bài đọc',
  quiz: 'Bài kiểm tra',
  toeic_part_5: 'TOEIC Part 5',
  toeic_part_6: 'TOEIC Part 6',
  toeic_part_7: 'TOEIC Part 7',
  cloze_sentence: 'Điền khuyết câu',
  cloze_paragraph: 'Điền khuyết đoạn văn',
}

export const STATUS_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'GENERATING', label: 'Đang tạo' },
  { value: 'PENDING_REVIEW', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
  { value: 'DELETED', label: 'Đã xóa' },
]

export const TYPE_ICON = {
  reading: BookOpen,
  quiz: ClipboardList,
  toeic_part_5: ClipboardList,
  toeic_part_6: ClipboardList,
  toeic_part_7: BookOpen,
  cloze_sentence: ClipboardList,
  cloze_paragraph: ClipboardList,
}

export const STATUS_BADGE = {
  PENDING_REVIEW: { label: 'Chờ duyệt', tone: 'warning' },
  APPROVED: { label: 'Đã duyệt', tone: 'success' },
  REJECTED: { label: 'Từ chối', tone: 'danger' },
  GENERATING: { label: 'Đang tạo', tone: 'info' },
  DELETED: { label: 'Đã xóa', tone: 'danger' },
}

export function confidenceTone(score) {
  if (score >= 90) return 'success'
  if (score >= 80) return 'info'
  if (score >= 70) return 'warning'
  return 'danger'
}
