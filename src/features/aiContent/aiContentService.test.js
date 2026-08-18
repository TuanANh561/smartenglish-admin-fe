import { describe, expect, it } from 'vitest'
import {
  getAIContentRecords,
  saveGeminiContent,
  softDeleteAIContent,
  restoreAIContent,
} from './aiContentService'

describe('ai content soft delete', () => {
  it('xóa mềm nội dung và ẩn khỏi danh sách đang hoạt động', () => {
    const created = saveGeminiContent({
      type: 'reading',
      title: 'Bài đọc test soft delete',
      content: 'Nội dung mẫu để kiểm tra xóa mềm.',
      level: 'B2',
      questions: [],
      createdBy: 'Admin',
    })

    const deleted = softDeleteAIContent(created.id, { displayName: 'Admin' })
    expect(deleted.status).toBe('DELETED')
    expect(deleted.deletedAt).toBeTruthy()

    const records = getAIContentRecords()
    const target = records.find((item) => item.id === created.id)
    expect(target.status).toBe('DELETED')
    expect(target.deletedBy).toBe('Admin')
  })

  it('khôi phục nội dung từ thùng rác về trạng thái chờ duyệt', () => {
    const created = saveGeminiContent({
      type: 'quiz',
      title: 'Bài kiểm tra restore',
      content: 'Nội dung cần khôi phục',
      level: 'B1',
      questions: [{ questionText: 'Câu hỏi 1', options: ['A', 'B', 'C'], correctAnswer: 'A' }],
      createdBy: 'Admin',
    })

    softDeleteAIContent(created.id, { displayName: 'Admin' })
    const restored = restoreAIContent(created.id)

    expect(restored.status).toBe('PENDING_REVIEW')
    expect(restored.deletedAt).toBeNull()
  })
})
