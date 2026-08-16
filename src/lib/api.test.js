import { describe, expect, it } from 'vitest'
import { api } from './api'
import { ENDPOINTS } from './endpoints'

describe('lớp dữ liệu ở chế độ mock', () => {
  it('trả KPI tổng quan', async () => {
    const data = await api.get(ENDPOINTS.stats.overview)
    expect(data.dau.value).toBeGreaterThan(0)
  })

  it('trả danh sách người dùng đúng shape phân trang', async () => {
    const data = await api.get(ENDPOINTS.users.list, { params: { page: 1, size: 5 } })
    expect(data).toMatchObject({ page: 1, size: 5 })
    expect(data.items).toHaveLength(5)
    expect(data.total).toBeGreaterThan(5)
  })

  it('lọc theo từ khoá tìm kiếm', async () => {
    const data = await api.get(ENDPOINTS.users.list, { params: { search: 'lan' } })
    expect(data.items.every((u) => `${u.displayName} ${u.email}`.toLowerCase().includes('lan')))
      .toBe(true)
  })

  it('thay tham số động vào đường dẫn', async () => {
    const user = await api.get(ENDPOINTS.users.detail, { path: { id: 'u-1' } })
    expect(user.id).toBe('u-1')
  })

  it('báo lỗi đúng shape khi không tìm thấy', async () => {
    await expect(api.get(ENDPOINTS.users.detail, { path: { id: 'khong-ton-tai' } })).rejects
      .toMatchObject({ status: 404, message: expect.any(String) })
  })

  it('báo lỗi khi endpoint chưa có mock', async () => {
    await expect(api.get(ENDPOINTS.system.health)).rejects.toMatchObject({ status: 501 })
  })
})
