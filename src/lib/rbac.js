import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { INITIAL_ROLES } from '@/mocks/data/rolesPermissions'
import { api } from '@/lib/api'

export const STORAGE_KEY_ROLES = 'smartenglish_admin_roles_v3'

let hasFetchedRolesFromServer = false

export async function syncRolesFromServer() {
  if (typeof window === 'undefined') return
  try {
    const res = await api.get('/admin/roles')
    const data = Array.isArray(res) ? res : res?.data || res
    if (Array.isArray(data) && data.length > 0) {
      localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(data))
      window.dispatchEvent(new Event('smartenglish:permissions-updated'))
    }
  } catch (_) {}
}

/**
 * Lấy danh sách phân quyền hiện hành của hệ thống từ localStorage hoặc mặc định
 */
export function getStoredRoles() {
  if (typeof window === 'undefined') return INITIAL_ROLES
  try {
    // Dọn dẹp cache mock cũ
    localStorage.removeItem('smartenglish_admin_roles_v1')
    localStorage.removeItem('smartenglish_admin_roles_v2')
    localStorage.removeItem('se_system_roles')

    const raw = localStorage.getItem(STORAGE_KEY_ROLES)
    if (raw) {
      if (raw.includes('28394') || raw.includes('1542')) {
        localStorage.removeItem(STORAGE_KEY_ROLES)
        return INITIAL_ROLES
      }
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length >= 4) {
        return parsed
      }
    }
  } catch (_) {}
  return INITIAL_ROLES
}

/**
 * Kiểm tra xem một vai trò cụ thể có được cấp quyền này hay không
 * @param {string} role - 'admin', 'teacher', 'student', 'guest'
 * @param {string} permissionKey - ví dụ 'view_students', 'create_classes', 'access_ai_tools'
 * @returns {boolean}
 */
export function hasRolePermission(role, permissionKey) {
  if (!permissionKey) return true
  const normRole = String(role || 'admin').toLowerCase()

  // Quản trị viên tối cao luôn có mọi quyền
  if (normRole === 'admin' || normRole === 'role_admin' || normRole === 'super_admin') {
    return true
  }

  const roles = getStoredRoles()
  const targetRole = roles.find(
    (r) =>
      r.id?.toLowerCase() === normRole ||
      r.code?.toLowerCase() === normRole,
  )

  if (targetRole?.permissions && typeof targetRole.permissions[permissionKey] === 'boolean') {
    return targetRole.permissions[permissionKey]
  }

  // Fallback mặc định theo vai trò nếu không tìm thấy key
  if (normRole === 'teacher') {
    // Mặc định giáo viên bị chặn các quyền quản trị cao cấp
    const restrictedKeys = [
      'delete_students',
      'approve_public_content',
      'view_revenue',
      'manage_pricing',
      'manage_reports',
      'manage_settings',
    ]
    return !restrictedKeys.includes(permissionKey)
  }

  if (normRole === 'student') {
    return permissionKey === 'access_ai_tools'
  }

  return false
}

/**
 * React Hook kiểm tra quyền của người dùng hiện đang đăng nhập
 * Tự động re-render khi quyền thay đổi (qua custom event 'smartenglish:permissions-updated')
 */
export function usePermission(permissionKey) {
  const user = useAuthStore((s) => s.user)
  const currentRole = user?.role || 'admin'
  const [allowed, setAllowed] = useState(() => hasRolePermission(currentRole, permissionKey))

  useEffect(() => {
    if (!hasFetchedRolesFromServer) {
      hasFetchedRolesFromServer = true
      syncRolesFromServer()
    }
  }, [])

  useEffect(() => {
    const check = () => {
      setAllowed(hasRolePermission(currentRole, permissionKey))
    }

    check()

    // Lắng nghe sự kiện cập nhật quyền từ trang Quản trị Phân quyền
    window.addEventListener('smartenglish:permissions-updated', check)
    window.addEventListener('storage', check)

    return () => {
      window.removeEventListener('smartenglish:permissions-updated', check)
      window.removeEventListener('storage', check)
    }
  }, [currentRole, permissionKey])

  return allowed
}

