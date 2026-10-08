import { useState } from 'react'
import { User, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProfile } from './hooks/useProfile'
import ProfileHeader from './components/ProfileHeader'
import ProfileInfoTab from './components/ProfileInfoTab'
import ProfileSecurityTab from './components/ProfileSecurityTab'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('info') // 'info' | 'security'

  const {
    currentUser,
    profileData,
    setProfileData,
    isSaving,
    isUploadingAvatar,
    isChangingPassword,
    handleUploadAvatarFile,
    handleSaveProfile,
    handleUpdatePassword,
  } = useProfile()

  const isTeacher = currentUser?.role === 'teacher'

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* ── HEADER & BANNER PROFILE ─────────────────────────────────── */}
      <ProfileHeader
        currentUser={currentUser}
        profileData={profileData}
        isTeacher={isTeacher}
        isUploadingAvatar={isUploadingAvatar}
        onAvatarFileChange={handleUploadAvatarFile}
      />

      {/* ── TABS CHUYỂN ĐỔI ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-line pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer',
            activeTab === 'info'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-navy-900',
          )}
        >
          <User size={16} />
          <span>Thông tin cá nhân</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer',
            activeTab === 'security'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-navy-900',
          )}
        >
          <Lock size={16} />
          <span>Bảo mật & Mật khẩu</span>
        </button>
      </div>

      {/* ── TAB CONTENT ───────────────────────────────────────────── */}
      {activeTab === 'info' && (
        <ProfileInfoTab
          currentUser={currentUser}
          formData={profileData}
          setFormData={setProfileData}
          isTeacher={isTeacher}
          isSaving={isSaving}
          isUploadingAvatar={isUploadingAvatar}
          onSave={handleSaveProfile}
          onAvatarFileChange={handleUploadAvatarFile}
        />
      )}

      {activeTab === 'security' && (
        <ProfileSecurityTab
          isChangingPassword={isChangingPassword}
          onUpdatePassword={handleUpdatePassword}
        />
      )}
    </div>
  )
}
