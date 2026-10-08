import { updateUser, getUser } from '@/features/users/api'
import {
  DEFAULT_ADMIN_SETTINGS,
  DEFAULT_TEACHER_SETTINGS,
} from './settingsConstants'

const ADMIN_STORAGE_KEY = 'smartenglish_system_settings_admin'

/**
 * Tải cài đặt hệ thống Admin
 */
export const loadAdminSettings = () => {
  try {
    const saved = localStorage.getItem(ADMIN_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.warn('Lỗi đọc settings admin từ localStorage:', e)
  }
  return DEFAULT_ADMIN_SETTINGS
}

/**
 * Lưu cài đặt hệ thống Admin
 */
export const saveAdminSettings = (settings) => {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(settings))
}

/**
 * Tải cài đặt Giảng viên
 */
export const loadTeacherSettings = (userId) => {
  const key = userId ? `smartenglish_teacher_settings_${userId}` : 'smartenglish_teacher_settings'
  try {
    const saved = localStorage.getItem(key)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.warn('Lỗi đọc settings teacher từ localStorage:', e)
  }
  return DEFAULT_TEACHER_SETTINGS
}

/**
 * Lưu cài đặt Giảng viên
 */
export const saveTeacherSettings = (userId, settings) => {
  const key = userId ? `smartenglish_teacher_settings_${userId}` : 'smartenglish_teacher_settings'
  localStorage.setItem(key, JSON.stringify(settings))
}

/**
 * Đồng bộ cài đặt người dùng (Ngôn ngữ, Múi giờ) trực tiếp vào cơ sở dữ liệu backend
 */
export const syncUserSettingsWithBackend = async (userId, { uiLanguage, timezone }) => {
  if (!userId) return null
  return updateUser(userId, { uiLanguage, timezone })
}

/**
 * Lấy thông tin người dùng từ backend
 */
export const fetchUserDetail = async (userId) => {
  if (!userId) return null
  return getUser(userId)
}
