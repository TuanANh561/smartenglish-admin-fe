import { BookOpen, ClipboardList, HelpCircle, GraduationCap, SpellCheck, Layers } from 'lucide-react'

export const TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'grammar', label: 'Ngữ pháp' },
  { value: 'vocab', label: 'Từ vựng' },
  { value: 'toeic', label: 'TOEIC' },
  { value: 'placement', label: 'Đầu vào' },
  { value: 'reading', label: 'Bài đọc' },
  { value: 'quiz', label: 'Quiz tổng hợp' },
]

export const CONTENT_TYPE_OPTIONS = [
  { value: 'quiz_grammar', label: 'Kiểm tra Ngữ pháp (Grammar Quiz)' },
  { value: 'quiz_vocab', label: 'Kiểm tra Từ vựng (Vocabulary Quiz)' },
  { value: 'toeic_part_5', label: 'TOEIC Part 5 (Incomplete Sentences)' },
  { value: 'toeic_part_6', label: 'TOEIC Part 6 (Text Completion)' },
  { value: 'toeic_part_7', label: 'TOEIC Part 7 (Reading Comprehension)' },
  { value: 'quiz_placement', label: 'Đề đánh giá đầu vào (Placement Test)' },
  { value: 'reading', label: 'Bài đọc hiểu (Reading Passage)' },
  { value: 'quiz_general', label: 'Bài kiểm tra tổng hợp (General Quiz)' },
]

export const TYPE_LABELS = {
  quiz_grammar: 'Kiểm tra Ngữ pháp',
  quiz_vocab: 'Kiểm tra Từ vựng',
  toeic_part_5: 'TOEIC Part 5',
  toeic_part_6: 'TOEIC Part 6',
  toeic_part_7: 'TOEIC Part 7',
  quiz_placement: 'Đánh giá đầu vào',
  reading: 'Bài đọc hiểu',
  quiz_general: 'Kiểm tra tổng hợp',
  quiz: 'Bài kiểm tra',
  vocabulary: 'Từ vựng',
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
  quiz_grammar: SpellCheck,
  quiz_vocab: Layers,
  toeic_part_5: ClipboardList,
  toeic_part_6: ClipboardList,
  toeic_part_7: BookOpen,
  quiz_placement: GraduationCap,
  reading: BookOpen,
  quiz_general: HelpCircle,
  quiz: ClipboardList,
  vocabulary: Layers,
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

/**
 * Ánh xạ loại nội dung AI sang Danh mục đề thi chuẩn của Học viên (content.exams)
 */
export function mapAiTypeToExamCategory(aiType) {
  const t = (aiType || '').toLowerCase()
  if (t === 'quiz_grammar' || t === 'grammar') return 'GRAMMAR'
  if (t === 'quiz_vocab' || t === 'vocabulary' || t === 'vocab') return 'VOCABULARY'
  if (t === 'toeic_part_5' || t === 'toeic_part_6' || t === 'toeic_part_7' || t.includes('toeic') || t.includes('cloze')) return 'TOEIC_MINI'
  if (t === 'quiz_placement' || t === 'placement') return 'PLACEMENT'
  if (t === 'reading') return 'READING'
  return 'GENERAL'
}

export const EXAM_CATEGORY_NAMES = {
  GRAMMAR: 'Ngữ pháp',
  VOCABULARY: 'Từ vựng',
  TOEIC_MINI: 'TOEIC Mini',
  TOEIC_FULL: 'TOEIC Full',
  PLACEMENT: 'Đầu vào (Placement)',
  READING: 'Đọc hiểu',
  LISTENING: 'Nghe hiểu',
  GENERAL: 'Tổng hợp',
}

export function confidenceTone(score) {
  if (score >= 90) return 'success'
  if (score >= 80) return 'info'
  if (score >= 70) return 'warning'
  return 'danger'
}
