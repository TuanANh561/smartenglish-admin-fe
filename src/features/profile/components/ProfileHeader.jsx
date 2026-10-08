import { useRef } from 'react'
import {
  Camera,
  GraduationCap,
  Shield,
  Mail,
  Phone,
  Sparkles,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'

export default function ProfileHeader({
  currentUser,
  profileData,
  isTeacher,
  isUploadingAvatar,
  onAvatarFileChange,
}) {
  const fileInputRef = useRef(null)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      {/* Banner Gradient trang trọng & hiện đại */}
      <div className="h-40 sm:h-48 w-full bg-gradient-to-r from-slate-900 via-navy-900 to-brand-800 relative">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-white border border-white/20 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Tài khoản đang hoạt động
          </span>
        </div>
      </div>

      {/* Phần thông tin dưới Banner - bố cục thông thoáng, không bị đè chữ */}
      <div className="px-6 sm:px-8 pb-6 pt-0 bg-white relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5">
          {/* Cột trái: Avatar (nhô lên trên banner) + Họ tên & Thông tin liên hệ */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Vùng Avatar nhô lên khỏi đường chân banner */}
            <div className="relative -mt-14 sm:-mt-20 shrink-0 z-10">
              <Avatar
                name={profileData.displayName || 'Người dùng'}
                src={profileData.avatarUrl}
                className="h-28 w-28 sm:h-36 sm:w-36 rounded-full object-cover shadow-xl ring-4 ring-white"
              />

              {/* Nút bấm tải ảnh lên */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-white shadow-md transition-all hover:bg-brand-600 hover:scale-110 active:scale-95 cursor-pointer border-2 border-white disabled:opacity-50 z-20"
                title="Thay đổi ảnh đại diện"
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onAvatarFileChange(file)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="hidden"
              />
            </div>

            {/* Thông tin Text: Nằm trọn vẹn ở nền trắng với khoảng cách tinh tế */}
            <div className="space-y-2 pt-1 sm:pt-3 sm:pb-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
                  {profileData.displayName || 'Chưa đặt tên'}
                </h2>
                {isTeacher ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/80">
                    <GraduationCap size={14} className="text-blue-600" />
                    Giảng viên SmartEnglish
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200/80">
                    <Shield size={14} className="text-amber-600" />
                    Quản trị viên Hệ thống (Admin)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" />
                  {profileData.email || 'Chưa có email'}
                </span>
                {profileData.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={14} className="text-slate-400" />
                    {profileData.phone}
                  </span>
                )}
                {currentUser?.username && (
                  <span className="flex items-center gap-1.5 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 border border-slate-200/60">
                    @{currentUser.username}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Cột phải: Thẻ trạng thái & Hạn mức AI */}
          <div className="pt-2 sm:pt-3 sm:pb-1 shrink-0 self-stretch sm:self-end">
            {isTeacher ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 shadow-2xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Hạn mức AI Chat
                  </p>
                  <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Đang hoạt động
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 shadow-2xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Quyền hạn
                  </p>
                  <p className="text-xs font-bold text-navy-900 mt-0.5">
                    Toàn quyền hệ thống
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
