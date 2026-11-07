import { useState } from 'react'
import { User, Lock, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProfile } from './hooks/useProfile'
import ProfileHeader from './components/ProfileHeader'
import ProfileInfoTab from './components/ProfileInfoTab'
import ProfileSecurityTab from './components/ProfileSecurityTab'
import ProfilePostsTab from './components/ProfilePostsTab'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('info') // 'info' | 'posts' | 'security'
  const [myPostsCount, setMyPostsCount] = useState(null)

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
    <div className="space-y-4 sm:space-y-5 max-w-5xl mx-auto pb-8">
      {/* ── HEADER & BANNER PROFILE ─────────────────────────────────── */}
      <ProfileHeader
        currentUser={currentUser}
        profileData={profileData}
        isTeacher={isTeacher}
        isUploadingAvatar={isUploadingAvatar}
        onAvatarFileChange={handleUploadAvatarFile}
        postsCount={myPostsCount}
      />

      {/* ── TABS CHUYỂN ĐỔI HIỆN ĐẠI ───────────────────────────────── */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-px overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0',
            activeTab === 'info'
              ? 'border-brand-600 text-brand-700 bg-brand-50/30 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg',
          )}
        >
          <User size={15} />
          <span>Thông tin cá nhân</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0',
            activeTab === 'posts'
              ? 'border-brand-600 text-brand-700 bg-brand-50/30 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg',
          )}
        >
          <MessageSquare size={15} />
          <span>Bài viết của tôi</span>
          {myPostsCount !== null && (
            <span
              className={cn(
                'ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold',
                activeTab === 'posts'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-200 text-slate-700',
              )}
            >
              {myPostsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0',
            activeTab === 'security'
              ? 'border-brand-600 text-brand-700 bg-brand-50/30 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg',
          )}
        >
          <Lock size={15} />
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

      {activeTab === 'posts' && (
        <ProfilePostsTab
          userId={currentUser?.id}
          userName={profileData.displayName || currentUser?.displayName || 'Bạn'}
          isSelf={true}
          onPostCountChange={setMyPostsCount}
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
