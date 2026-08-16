import { describe, expect, it } from 'vitest'
import { api } from './api'
import { ENDPOINTS } from './endpoints'
import { createMockToken, decodeMockToken } from '../mocks/tokenUtils'
import { users } from '../mocks/data/users'

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

  it('sắp xếp theo cột khi có sortBy/sortDir (dùng cho DataTable)', async () => {
    const asc = await api.get(ENDPOINTS.users.list, {
      params: { size: 20, sortBy: 'displayName', sortDir: 'asc' },
    })
    const names = asc.items.map((u) => u.displayName)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'vi')))

    const desc = await api.get(ENDPOINTS.users.list, {
      params: { size: 20, sortBy: 'displayName', sortDir: 'desc' },
    })
    expect(desc.items.map((u) => u.displayName)).toEqual([...names].reverse())
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

describe('xác thực — JWT giả (access + refresh token)', () => {
  it('đăng nhập đúng tài khoản trả về cặp token và user admin', async () => {
    const data = await api.post(ENDPOINTS.auth.login, {
      data: { email: 'admin@smartenglish.vn', password: 'admin123' },
    })
    expect(data.user.role).toBe('admin')
    expect(decodeMockToken(data.accessToken)).toMatchObject({ sub: data.user.id, type: 'access' })
    expect(decodeMockToken(data.refreshToken)).toMatchObject({ sub: data.user.id, type: 'refresh' })
  })

  it('sai mật khẩu báo lỗi tiếng Việt, không lộ token', async () => {
    await expect(
      api.post(ENDPOINTS.auth.login, {
        data: { email: 'admin@smartenglish.vn', password: 'sai-mat-khau' },
      }),
    ).rejects.toMatchObject({ status: 401, message: 'Email hoặc mật khẩu không đúng.' })
  })

  it('làm mới access token bằng refresh token còn hạn', async () => {
    const { refreshToken } = await api.post(ENDPOINTS.auth.login, {
      data: { email: 'admin@smartenglish.vn', password: 'admin123' },
    })
    const refreshed = await api.post(ENDPOINTS.auth.refresh, { data: { refreshToken } })
    expect(decodeMockToken(refreshed.accessToken)).toMatchObject({ type: 'access' })
    expect(decodeMockToken(refreshed.refreshToken)).toMatchObject({ type: 'refresh' })
  })

  it('refresh token hết hạn bị từ chối, không cấp token mới', async () => {
    const admin = users.find((user) => user.role === 'admin')
    const expiredRefreshToken = createMockToken(admin, -10, 'refresh')
    await expect(
      api.post(ENDPOINTS.auth.refresh, { data: { refreshToken: expiredRefreshToken } }),
    ).rejects.toMatchObject({ status: 401 })
  })
})
