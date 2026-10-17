import { api } from '@/lib/api'
import { updateUser, getUser } from '@/features/users/api'
import {
  DEFAULT_ADMIN_SETTINGS,
  DEFAULT_TEACHER_SETTINGS,
} from './settingsConstants'

const ADMIN_STORAGE_KEY = 'smartenglish_system_settings_admin'

/**
 * Tải cài đặt hệ thống Admin (đọc từ cache cục bộ + đồng bộ DB)
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
 * Đồng bộ cài đặt người dùng (Ngôn ngữ, Múi giờ) trực tiếp vào cơ sở dữ liệu backend auth-service
 */
export const syncUserSettingsWithBackend = async (userId, { uiLanguage, timezone }) => {
  if (!userId) return null
  return updateUser(userId, { uiLanguage, timezone })
}

/**
 * Lấy thông tin người dùng từ backend auth-service
 */
export const fetchUserDetail = async (userId) => {
  if (!userId) return null
  return getUser(userId)
}

/**
 * Lấy thiết lập học tập / giảng dạy từ backend auth-service (/users/me/learning-settings)
 */
export const fetchLearningSettings = async (userId) => {
  if (!userId) return null
  try {
    const res = await api.get('/users/me/learning-settings', { params: { userId } })
    return res?.data || res
  } catch (err) {
    console.warn('Lỗi tải learning settings từ backend:', err)
    return null
  }
}

/**
 * Cập nhật thiết lập học tập / giảng dạy lên backend auth-service (/users/me/learning-settings)
 */
export const updateLearningSettings = async (userId, data) => {
  if (!userId) return null
  return api.put('/users/me/learning-settings', { params: { userId }, data })
}

/**
 * Lấy thiết lập thông báo từ backend notification-service (/notifications/preferences)
 */
export const fetchNotificationPreferences = async () => {
  try {
    const res = await api.get('/notifications/preferences')
    return res?.data || res
  } catch (err) {
    console.warn('Lỗi tải cài đặt thông báo từ notification-service:', err)
    return null
  }
}

/**
 * Cập nhật thiết lập thông báo lên backend notification-service (/notifications/preferences)
 */
export const updateNotificationPreferences = async (data) => {
  return api.put('/notifications/preferences', { data })
}
