/**
 * Bài giao từ kho học liệu hệ thống (đề thi, bài đọc, bài nghe, bài giảng…): hệ thống tự chấm khi học viên làm,
 * giáo viên chỉ xem kết quả. Bài giáo viên tự soạn / tải file lên mới cần chấm tay.
 */
export const isSystemAssignment = (assignment) =>
  assignment?.referenceId != null && String(assignment.referenceId).trim() !== ''
