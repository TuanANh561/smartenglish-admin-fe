/**
 * examConstants.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Định nghĩa hằng số, metadata phân loại và cấu hình cho module Quản lý Đề thi & Quiz.
 * KHÔNG phụ thuộc vào thư mục mocks.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const SHORT_TEST_TYPE_META = {
  toeic_part_6: { label: 'TOEIC Part 6 (Điền đoạn văn)', tone: 'info', color: '#0284c7' },
  toeic_part_7: { label: 'TOEIC Part 7 (Đọc hiểu ngắn)', tone: 'success', color: '#16a34a' },
  reading_short: { label: 'Đọc hiểu đoạn văn ngắn', tone: 'purple', color: '#7c3aed' },
  cloze_paragraph: { label: 'Điền khuyết văn bản', tone: 'warning', color: '#ea580c' },
}

export const EXAM_TRACK_META = {
  toeic2: { label: 'TOEIC 2 kỹ năng', dotClass: 'bg-brand-500' },
  placement: { label: 'Placement Test', dotClass: 'bg-navy-700' },
  ielts: { label: 'IELTS Academic', dotClass: 'bg-amber-500' },
}

export const VERIFICATION_META = {
  verified: { label: 'Đã xác minh', tone: 'success' },
  pending: { label: 'Đang duyệt', tone: 'warning' },
}

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'ALL']

export const EXAM_CATEGORIES = [
  { value: 'ALL',        label: 'Tất cả thể loại' },
  { value: 'TOEIC_FULL', label: 'TOEIC Full 200 câu' },
  { value: 'TOEIC_MINI', label: 'TOEIC Mini Test' },
  { value: 'PLACEMENT',  label: 'Đề test đầu vào (Placement)' },
  { value: 'GRAMMAR',    label: 'Kiểm tra Ngữ pháp' },
  { value: 'VOCABULARY', label: 'Kiểm tra Từ vựng' },
  { value: 'READING',    label: 'Kiểm tra Đọc hiểu' },
  { value: 'LISTENING',  label: 'Kiểm tra Nghe hiểu' },
  { value: 'GENERAL',    label: 'Bài kiểm tra tổng hợp' },
]

export const PART_NAMES = {
  1: 'Part 1: Photographs (Tranh ảnh)',
  2: 'Part 2: Question-Response (Hỏi - Đáp)',
  3: 'Part 3: Conversations (Hội thoại ngắn)',
  4: 'Part 4: Short Talks (Bài nói ngắn)',
  5: 'Part 5: Incomplete Sentences (Hoàn thành câu)',
  6: 'Part 6: Text Completion (Điền đoạn văn)',
  7: 'Part 7: Reading Comprehension (Đọc hiểu)',
}

export const SAMPLE_PART1_IMAGES = [
  { label: 'Văn phòng làm việc', url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80' },
  { label: 'Phòng họp hội thảo', url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80' },
  { label: 'Quầy tiếp tân', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80' },
  { label: 'Kho bãi & Logistics', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80' },
]

export const EMPTY_QUESTION = {
  part: 5,
  questionText: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
  point: 5,
  imageUrl: '',
  audioUrl: '',
  audioScript: '',
  passageText: '',
  groupRangeText: '',
  groupAudioBadge: '',
}
