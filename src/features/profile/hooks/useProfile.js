import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { getProfile, updateProfile, uploadAvatar, changePassword } from '../profileApi'

export function useProfile() {
  const currentUser = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || '',
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    bio: currentUser?.bio || '',
    avatarUrl: currentUser?.avatarUrl || '',
    cefrLevel: currentUser?.cefrLevel || 'B2',
    targetGoal: currentUser?.targetGoal || 'TOEIC & Giao tiếp',
    uiLanguage: currentUser?.uiLanguage || 'vi',
    timezone: currentUser?.timezone || 'Asia/Ho_Chi_Minh',
  })

  // Nạp thông tin hồ sơ từ backend
  useEffect(() => {
    if (!currentUser?.id) return
    let isMounted = true

    setIsLoading(true)
    getProfile(currentUser.id)
      .then((res) => {
        if (!isMounted) return
        const u = res?.data || res
        if (u) {
          setProfileData({
            displayName: u.displayName || currentUser?.displayName || '',
            username: u.username || currentUser?.username || '',
            email: u.email || currentUser?.email || '',
            phone: u.phone || currentUser?.phone || '',
            bio: u.bio || currentUser?.bio || '',
            avatarUrl: u.avatarUrl || currentUser?.avatarUrl || '',
            cefrLevel: u.cefrLevel || currentUser?.cefrLevel || 'B2',
            targetGoal: u.targetGoal || currentUser?.targetGoal || 'TOEIC & Giao tiếp',
            uiLanguage: u.uiLanguage || currentUser?.uiLanguage || 'vi',
            timezone: u.timezone || currentUser?.timezone || 'Asia/Ho_Chi_Minh',
          })
        }
      })
      .catch((err) => {
        console.warn('Không thể nạp hồ sơ từ server, dùng bộ nhớ cục bộ:', err)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [currentUser?.id])

  // Xử lý upload ảnh
  const handleUploadAvatarFile = async (file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp định dạng hình ảnh (.png, .jpg, .jpeg, .webp)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng ảnh không được vượt quá 5MB')
      return
    }

    setIsUploadingAvatar(true)
    try {
      // 1. Gọi API upload
      const uploadedUrl = await uploadAvatar(file)

      if (uploadedUrl) {
        setProfileData((prev) => ({ ...prev, avatarUrl: uploadedUrl }))
        toast.success('Đã tải ảnh đại diện lên máy chủ!')
      } else {
        // Fallback đọc FileReader
        const reader = new FileReader()
        reader.onload = () => {
          setProfileData((prev) => ({ ...prev, avatarUrl: reader.result }))
          toast.success('Đã chọn ảnh đại diện mới!')
        }
        reader.readAsDataURL(file)
      }
    } catch (err) {
      toast.error('Tải ảnh thất bại: ' + (err.message || 'Lỗi không xác định'))
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Xử lý lưu thông tin
  const handleSaveProfile = async (updatedFields) => {
    if (!updatedFields.displayName?.trim()) {
      toast.error('Họ và tên không được để trống')
      return false
    }

    setIsSaving(true)
    const payload = {
      displayName: updatedFields.displayName.trim(),
      phone: (updatedFields.phone || '').trim(),
      bio: (updatedFields.bio || '').trim(),
      avatarUrl: updatedFields.avatarUrl,
      cefrLevel: updatedFields.cefrLevel,
      targetGoal: updatedFields.targetGoal,
      uiLanguage: updatedFields.uiLanguage,
      timezone: updatedFields.timezone,
    }

    try {
      if (currentUser?.id) {
        await updateProfile(currentUser.id, payload)
      }

      // Cập nhật authStore ngay lập tức để Topbar, Sidebar đổi theo
      setUser({
        ...currentUser,
        displayName: payload.displayName,
        phone: payload.phone,
        bio: payload.bio,
        avatarUrl: payload.avatarUrl,
        cefrLevel: payload.cefrLevel,
        targetGoal: payload.targetGoal,
      })

      setProfileData((prev) => ({ ...prev, ...payload }))
      toast.success('Cập nhật thông tin hồ sơ thành công!')
      return true
    } catch (err) {
      console.warn('Lỗi lưu backend, lưu cục bộ:', err)
      setUser({
        ...currentUser,
        displayName: payload.displayName,
        phone: payload.phone,
        bio: payload.bio,
        avatarUrl: payload.avatarUrl,
      })
      toast.success('Đã lưu thông tin hồ sơ!')
      return true
    } finally {
      setIsSaving(false)
    }
  }

  // Xử lý đổi mật khẩu
  const handleUpdatePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
    if (!currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại')
      return false
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự')
      return false
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp')
      return false
    }

    setIsChangingPassword(true)
    try {
      await changePassword({ currentPassword, newPassword })
      toast.success('Đổi mật khẩu thành công!')
      return true
    } catch (err) {
      toast.error('Đổi mật khẩu thất bại: ' + (err.message || 'Lỗi'))
      return false
    } finally {
      setIsChangingPassword(false)
    }
  }

  return {
    currentUser,
    profileData,
    setProfileData,
    isLoading,
    isSaving,
    isUploadingAvatar,
    isChangingPassword,
    handleUploadAvatarFile,
    handleSaveProfile,
    handleUpdatePassword,
  }
}
