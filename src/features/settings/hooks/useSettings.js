import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import {
  DEFAULT_ADMIN_SETTINGS,
  DEFAULT_TEACHER_SETTINGS,
} from '../settingsConstants'
import {
  loadAdminSettings,
  saveAdminSettings,
  loadTeacherSettings,
  saveTeacherSettings,
  syncUserSettingsWithBackend,
  fetchUserDetail,
} from '../settingsApi'

export function useSettings() {
  const currentUser = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const isTeacher = currentUser?.role === 'teacher'

  const [activeTab, setActiveTab] = useState(isTeacher ? 'teaching' : 'general')
  const [isSaving, setIsSaving] = useState(false)

  // State cài đặt Admin
  const [adminSettings, setAdminSettings] = useState(() => loadAdminSettings())

  // State cài đặt Giáo viên
  const [teacherSettings, setTeacherSettings] = useState(() => {
    const loaded = loadTeacherSettings(currentUser?.id)
    return {
      ...loaded,
      preferences: {
        ...loaded.preferences,
        uiLanguage: currentUser?.uiLanguage || loaded.preferences.uiLanguage,
        timezone: currentUser?.timezone || loaded.preferences.timezone,
      },
    }
  })

  // Đồng bộ cài đặt từ backend chi tiết người dùng
  useEffect(() => {
    if (!currentUser?.id) return
    let isMounted = true

    fetchUserDetail(currentUser.id)
      .then((res) => {
        if (!isMounted) return
        const u = res?.data || res
        if (u) {
          if (isTeacher) {
            setTeacherSettings((prev) => ({
              ...prev,
              preferences: {
                ...prev.preferences,
                uiLanguage: u.uiLanguage || prev.preferences.uiLanguage,
                timezone: u.timezone || prev.preferences.timezone,
              },
            }))
          } else {
            setAdminSettings((prev) => ({
              ...prev,
              general: {
                ...prev.general,
                defaultLanguage: u.uiLanguage || prev.general.defaultLanguage,
                timezone: u.timezone || prev.general.timezone,
              },
            }))
          }
        }
      })
      .catch((err) => {
        console.warn('Lấy thông tin người dùng từ server thất bại:', err)
      })

    return () => {
      isMounted = false
    }
  }, [currentUser?.id, isTeacher])

  // Cập nhật trường Admin
  const updateAdminField = (section, field, value) => {
    setAdminSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }))
  }

  // Cập nhật trường Teacher
  const updateTeacherField = (section, field, value) => {
    setTeacherSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }))
  }

  // Lưu cài đặt
  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (isTeacher) {
        // 1. Lưu localStorage
        saveTeacherSettings(currentUser?.id, teacherSettings)

        // 2. Đồng bộ lên backend CSDL
        if (currentUser?.id) {
          await syncUserSettingsWithBackend(currentUser.id, {
            uiLanguage: teacherSettings.preferences.uiLanguage,
            timezone: teacherSettings.preferences.timezone,
          })

          setUser({
            ...currentUser,
            uiLanguage: teacherSettings.preferences.uiLanguage,
            timezone: teacherSettings.preferences.timezone,
          })
        }

        toast.success('Đã lưu cấu hình giảng dạy thành công!')
      } else {
        // 1. Lưu localStorage
        saveAdminSettings(adminSettings)

        // 2. Đồng bộ lên backend CSDL
        if (currentUser?.id) {
          await syncUserSettingsWithBackend(currentUser.id, {
            uiLanguage: adminSettings.general.defaultLanguage,
            timezone: adminSettings.general.timezone,
          })

          setUser({
            ...currentUser,
            uiLanguage: adminSettings.general.defaultLanguage,
            timezone: adminSettings.general.timezone,
          })
        }

        toast.success('Đã lưu cấu hình hệ thống thành công!')
      }
    } catch (err) {
      console.warn('Lỗi khi lưu cài đặt backend:', err)
      toast.success('Đã lưu cài đặt vào bộ nhớ cục bộ!')
    } finally {
      setIsSaving(false)
    }
  }

  // Khôi phục cài đặt mặc định
  const handleReset = () => {
    if (isTeacher) {
      setTeacherSettings(DEFAULT_TEACHER_SETTINGS)
      toast.success('Đã khôi phục cài đặt giảng dạy mặc định')
    } else {
      setAdminSettings(DEFAULT_ADMIN_SETTINGS)
      toast.success('Đã khôi phục cài đặt hệ thống mặc định')
    }
  }

  return {
    currentUser,
    isTeacher,
    activeTab,
    setActiveTab,
    adminSettings,
    teacherSettings,
    isSaving,
    updateAdminField,
    updateTeacherField,
    handleSave,
    handleReset,
  }
}
