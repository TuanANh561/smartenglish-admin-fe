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
  fetchLearningSettings,
  updateLearningSettings,
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from '../settingsApi'
import { api } from '@/lib/api'
import { ENDPOINTS } from '@/lib/endpoints'

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

  // Đồng bộ cài đặt từ backend chi tiết người dùng, learning settings và notification preferences
  useEffect(() => {
    if (!currentUser?.id) return
    let isMounted = true

    Promise.allSettled([
      fetchUserDetail(currentUser.id),
      fetchLearningSettings(currentUser.id),
      fetchNotificationPreferences(),
    ]).then(([userRes, learningRes, notifRes]) => {
      if (!isMounted) return

      const u = userRes.status === 'fulfilled' ? (userRes.value?.data || userRes.value) : null
      const learning = learningRes.status === 'fulfilled' ? (learningRes.value?.data || learningRes.value) : null
      const notif = notifRes.status === 'fulfilled' ? (notifRes.value?.data || notifRes.value) : null

      const effectiveLang = learning?.uiLanguage || u?.uiLanguage
      const effectiveTimezone = learning?.timezone || u?.timezone

      if (isTeacher) {
        setTeacherSettings((prev) => ({
          ...prev,
          preferences: {
            ...prev.preferences,
            ...(effectiveLang ? { uiLanguage: effectiveLang } : {}),
            ...(effectiveTimezone ? { timezone: effectiveTimezone } : {}),
          },
          notifications: {
            ...prev.notifications,
            ...(typeof notif?.soundEnabled === 'boolean' ? { playNotificationSound: notif.soundEnabled } : {}),
          },
        }))
      } else {
        setAdminSettings((prev) => ({
          ...prev,
          general: {
            ...prev.general,
            ...(effectiveLang ? { defaultLanguage: effectiveLang } : {}),
            ...(effectiveTimezone ? { timezone: effectiveTimezone } : {}),
          },
          email: {
            ...prev.email,
            ...(typeof notif?.emailEnabled === 'boolean' ? { notifyPaymentSuccess: notif.emailEnabled } : {}),
          },
        }))

        // Tải cấu hình AI từ content-service
        api.get(ENDPOINTS.aiConfig.config).then((aiRes) => {
          if (!isMounted) return
          const aiData = aiRes?.data || aiRes
          if (aiData) {
            setAdminSettings((prev) => ({
              ...prev,
              ai: {
                ...prev.ai,
                activeProvider: aiData.activeProvider || prev.ai?.activeProvider || 'gemini',
                primaryModel: aiData.primaryModel || prev.ai?.primaryModel || 'gemini-2.5-flash',
                autoFallbackEnabled: typeof aiData.autoFallbackEnabled === 'boolean' ? aiData.autoFallbackEnabled : (prev.ai?.autoFallbackEnabled ?? true),
                creativityLevel: aiData.creativityLevel || prev.ai?.creativityLevel || 'balanced',
              },
            }))
          }
        }).catch(() => {})
      }
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
        // 1. Lưu localStorage dự phòng offline
        saveTeacherSettings(currentUser?.id, teacherSettings)

        // 2. Đồng bộ lên các dịch vụ backend thật (auth-service, notification-service)
        if (currentUser?.id) {
          const uiLang = teacherSettings.preferences.uiLanguage
          const tz = teacherSettings.preferences.timezone

          await Promise.allSettled([
            syncUserSettingsWithBackend(currentUser.id, { uiLanguage: uiLang, timezone: tz }),
            updateLearningSettings(currentUser.id, { uiLanguage: uiLang, timezone: tz }),
            updateNotificationPreferences({
              soundEnabled: teacherSettings.notifications?.playNotificationSound,
              timezone: tz,
              locale: uiLang,
            }),
          ])

          setUser({
            ...currentUser,
            uiLanguage: uiLang,
            timezone: tz,
          })
        }

        toast.success('Đã lưu cấu hình giảng dạy thành công!')
      } else {
        // 1. Lưu localStorage dự phòng offline
        saveAdminSettings(adminSettings)

        // 2. Đồng bộ lên các dịch vụ backend thật (auth-service, notification-service)
        if (currentUser?.id) {
          const defaultLang = adminSettings.general.defaultLanguage
          const tz = adminSettings.general.timezone

          await Promise.allSettled([
            syncUserSettingsWithBackend(currentUser.id, { uiLanguage: defaultLang, timezone: tz }),
            updateLearningSettings(currentUser.id, { uiLanguage: defaultLang, timezone: tz }),
            updateNotificationPreferences({
              emailEnabled: true,
              timezone: tz,
              locale: defaultLang,
            }),
          ])

          setUser({
            ...currentUser,
            uiLanguage: defaultLang,
            timezone: tz,
          })
        }

        // 3. Đồng bộ cấu hình AI sang content-service nếu có
        if (adminSettings.ai) {
          try {
            await api.put(ENDPOINTS.aiConfig.updateConfig, {
              activeProvider: adminSettings.ai.activeProvider,
              primaryModel: adminSettings.ai.primaryModel,
              autoFallbackEnabled: adminSettings.ai.autoFallbackEnabled,
              creativityLevel: adminSettings.ai.creativityLevel,
            })

            const keyMappings = [
              { provider: 'groq', key: adminSettings.ai.groqApiKey, label: 'Khóa Groq' },
              { provider: 'openrouter', key: adminSettings.ai.openrouterApiKey, label: 'Khóa OpenRouter' },
              { provider: 'gemini', key: adminSettings.ai.geminiApiKey, label: 'Khóa Google Gemini' },
              { provider: 'openai', key: adminSettings.ai.openaiApiKey, label: 'Khóa OpenAI' },
            ]

            for (const item of keyMappings) {
              if (item.key && item.key.trim() && !item.key.includes('••••')) {
                await api.post(ENDPOINTS.aiConfig.keys, {
                  provider: item.provider,
                  label: item.label,
                  apiKey: item.key.trim(),
                  isActive: adminSettings.ai.activeProvider === item.provider,
                }).catch(() => {})
              }
            }
          } catch (aiErr) {
            console.warn('Lỗi đồng bộ AI config:', aiErr)
          }
        }

        toast.success('Đã lưu cấu hình hệ thống thành công!')
      }
    } catch (err) {
      console.warn('Lỗi khi lưu cài đặt backend:', err)
      toast.error('Lỗi khi lưu cài đặt lên máy chủ. Vui lòng thử lại!')
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
