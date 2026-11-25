import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '@/lib/api'
import {
  getAIContentRecords,
  saveGeminiContent,
  softDeleteAIContent,
  restoreAIContent,
  revokeAIContent,
} from './aiContentService'

describe('ai content soft delete', () => {
  beforeEach(() => {
    // Backend lưu thành công và trả lại bản ghi
    vi.spyOn(http, 'post').mockImplementation((_url, payload) =>
      Promise.resolve({
        ...payload,
        id: `AIC-test-${Math.random().toString(36).slice(2)}`,
        status: 'PENDING_REVIEW',
        createdAt: new Date().toISOString(),
      }),
    )
    vi.spyOn(http, 'put').mockImplementation((url) => {
      const id = url.split('/')[4]
      const current = getAIContentRecords().find((item) => item.id === id)
      return Promise.resolve({ ...current, status: 'PENDING_REVIEW', deletedAt: null, deletedBy: null })
    })
    vi.spyOn(http, 'delete').mockResolvedValue(null)
  })
  it('xóa mềm nội dung và ẩn khỏi danh sách đang hoạt động', async () => {
    const created = await saveGeminiContent({
      type: 'reading',
      title: 'Bài đọc test soft delete',
      content: 'Nội dung mẫu để kiểm tra xóa mềm.',
      level: 'B2',
      questions: [],
      createdBy: 'Admin',
    })

    const deleted = await softDeleteAIContent(created.id, { displayName: 'Admin' })
    expect(deleted.status).toBe('DELETED')
    expect(deleted.deletedAt).toBeTruthy()

    const records = getAIContentRecords()
    const target = records.find((item) => item.id === created.id)
    expect(target.status).toBe('DELETED')
    expect(target.deletedBy).toBe('Admin')
  })

  it('khôi phục nội dung từ thùng rác về trạng thái chờ duyệt', async () => {
    const created = await saveGeminiContent({
      type: 'quiz',
      title: 'Bài kiểm tra restore',
      content: 'Nội dung cần khôi phục',
      level: 'B1',
      questions: [{ questionText: 'Câu hỏi 1', options: ['A', 'B', 'C'], correctAnswer: 'A' }],
      createdBy: 'Admin',
    })

    await softDeleteAIContent(created.id, { displayName: 'Admin' })
    const restored = await restoreAIContent(created.id)

    expect(restored.status).toBe('PENDING_REVIEW')
    expect(restored.deletedAt).toBeNull()
  })

  it('giáo viên xoá nội dung đã duyệt: chỉ gửi yêu cầu, không đánh dấu đã xoá', async () => {
    const created = await saveGeminiContent({
      type: 'reading', title: 'Chờ duyệt xoá', content: 'x', level: 'B1', questions: [], createdBy: 'GV',
    })
    http.delete.mockResolvedValueOnce({ pendingReview: true, requestId: 9 })
    const res = await softDeleteAIContent(created.id, { displayName: 'GV' })
    expect(res.pendingReview).toBe(true)
    expect(getAIContentRecords().find((item) => item.id === created.id).status).toBe('PENDING_REVIEW')
  })

  it('báo lỗi khi máy chủ từ chối thu hồi, không giả vờ thành công', async () => {
    http.put.mockRejectedValueOnce(new Error('Chỉ quản trị viên mới được duyệt hoặc từ chối nội dung AI.'))
    await expect(revokeAIContent('AIC-x')).rejects.toThrow('Chỉ quản trị viên')
  })

  it('báo lỗi khi backend không lưu được, không âm thầm lưu tạm vào trình duyệt', async () => {
    http.post.mockRejectedValueOnce(new Error('Máy chủ gặp sự cố'))
    const before = getAIContentRecords().length
    await expect(
      saveGeminiContent({ type: 'quiz', title: 'Lưu lỗi', content: 'x', level: 'B1', questions: [], createdBy: 'Admin' }),
    ).rejects.toThrow('Không lưu được nội dung')
    expect(getAIContentRecords().length).toBe(before)
  })
})
