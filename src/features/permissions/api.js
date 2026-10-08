import { api } from '@/lib/api'
import { ENDPOINTS } from '@/lib/endpoints'

/** Lấy danh sách tất cả vai trò kèm ma trận quyền và số lượng người dùng thực tế */
export const getRoles = () => api.get(ENDPOINTS.roles.list)

/** Xem chi tiết một vai trò theo ID */
export const getRole = (id) => api.get(ENDPOINTS.roles.detail, { path: { id } })

/** Tạo vai trò tùy chỉnh mới */
export const createRole = (data) => api.post(ENDPOINTS.roles.create, { data })

/** Cập nhật quyền hạn hoặc thông tin vai trò */
export const updateRole = (id, data) => api.put(ENDPOINTS.roles.update, { path: { id }, data })

/** Xóa vai trò tùy chỉnh */
export const deleteRole = (id) => api.del(ENDPOINTS.roles.remove, { path: { id } })

/** Khôi phục cấu hình quyền mặc định của hệ thống */
export const resetRoleDefaults = (id) => api.post(ENDPOINTS.roles.resetDefaults, { path: { id } })

/** Lấy danh sách các nhóm quyền của hệ thống */
export const getPermissionGroups = () => api.get(ENDPOINTS.roles.permissionGroups)
