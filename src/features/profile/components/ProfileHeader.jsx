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
      {/* Banner Gradient thanh thoát, cân đối, tiết kiệm tối đa không gian */}
      <div className="h-16 sm:h-18 w-full bg-gradient-to-r from-slate-900 via-navy-900 to-brand-800 relative">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute top-2.5 right-3 sm:top-2.5 sm:right-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 backdrop-blur-md px-2.5 py-0.5 text-[10.5px] font-semibold text-white border border-white/20 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Tài khoản đang hoạt động
          </span>
        </div>
      </div>

      {/* Phần thông tin dưới Banner - bố cục cân đối và tối ưu chiều cao */}
      <div className="px-5 sm:px-6 pb-3 sm:pb-3.5 pt-0 bg-white relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
          {/* Cột trái: Avatar nhô nhẹ lên banner + Họ tên & Thông tin liên hệ */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3.5">
            {/* Vùng Avatar gọn gàng, tỷ lệ hài hòa */}
            <div className="relative -mt-8 sm:-mt-9 shrink-0 z-10">
              <Avatar
                name={profileData.displayName || 'Người dùng'}
                src={profileData.avatarUrl}
                className="h-16 w-16 sm:h-18 sm:w-18 rounded-full object-cover shadow-md ring-3 ring-white"
              />

              {/* Nút bấm tải ảnh lên */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 flex h-6 w-6 sm:h-6.5 sm:w-6.5 items-center justify-center rounded-lg bg-navy-900 text-white shadow-sm transition-all hover:bg-brand-600 hover:scale-105 active:scale-95 cursor-pointer border-2 border-white disabled:opacity-50 z-20"
                title="Thay đổi ảnh đại diện"
              >
                <Camera size={12} />
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

            {/* Thông tin Text: Gọn gàng và tinh tế */}
            <div className="space-y-1 pt-0.5 sm:pt-1 sm:pb-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-navy-900 tracking-tight">
                  {profileData.displayName || 'Chưa đặt tên'}
                </h2>
                {isTeacher ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10.5px] font-semibold text-blue-700 border border-blue-200/80">
                    <GraduationCap size={12} className="text-blue-600" />
                    Giảng viên SmartEnglish
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10.5px] font-semibold text-amber-700 border border-amber-200/80">
                    <Shield size={12} className="text-amber-600" />
                    Quản trị viên Hệ thống (Admin)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail size={12} className="text-slate-400" />
                  {profileData.email || 'Chưa có email'}
                </span>
                {profileData.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={12} className="text-slate-400" />
                    {profileData.phone}
                  </span>
                )}
                {currentUser?.username && (
                  <span className="flex items-center gap-1 font-mono text-[10.5px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200/60">
                    @{currentUser.username}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Cột phải: Thẻ trạng thái & Hạn mức / Quyền hạn */}
          <div className="shrink-0 self-stretch sm:self-center">
            {isTeacher ? (
              <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 shadow-2xs">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-600 shrink-0">
                  <Sparkles size={14} />
                </div>
                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                    Hạn mức AI Chat
                  </p>
                  <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Đang hoạt động
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 shadow-2xs">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-600 shrink-0">
                  <Shield size={14} />
                </div>
                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                    Quyền hạn
                  </p>
                  <p className="text-xs font-bold text-navy-900 mt-0.2">
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
