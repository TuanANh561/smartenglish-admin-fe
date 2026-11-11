import { useNavigate, Link } from 'react-router-dom'
import {
  Sparkles,
  Briefcase,
  Building2,
  Mail,
  Phone,
  AtSign,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  BarChart3,
  ExternalLink,
  Image as ImageIcon,
  FileText,
  PlusCircle,
  GraduationCap,
  Calendar,
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import ProfilePostsTab from './ProfilePostsTab'

/**
 * ProfileOverviewTab
 * ─────────────────────────────────────────────────────────────────────────────
 * Bố cục 2 cột phong cách Timeline / Profile chuẩn Facebook:
 * - Cột trái (38%): Khối Giới thiệu (Intro Card), tiểu sử, thông tin chi tiết & thống kê đóng góp.
 * - Cột phải (62%): Hộp tạo bài viết nhanh (What's on your mind?) + Dòng thời gian bài viết của tôi.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function ProfileOverviewTab({
  currentUser,
  profileData,
  isTeacher,
  postsCount,
  onEditInfo,
  onPostCountChange,
}) {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
      {/* ─── CỘT TRÁI (COL-SPAN-5 / 38%): GIỚI THIỆU & THỐNG KÊ (STYLE FB INTRO) ─── */}
      <div className="lg:col-span-5 space-y-4">
        {/* 1. THẺ GIỚI THIỆU (INTRO CARD) */}
        <Card className="p-4 sm:p-5 border border-slate-200/90 bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={16} className="text-brand-600" />
              <span>Giới thiệu</span>
            </h3>
            <button
              type="button"
              onClick={onEditInfo}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Edit3 size={12} />
              <span>Chỉnh sửa</span>
            </button>
          </div>

          {/* Tiểu sử ngắn / Bio */}
          <div>
            <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50/80 p-3 rounded-xl border border-slate-100">
              &ldquo;
              {profileData.bio?.trim() ||
                (isTeacher
                  ? 'Giảng viên chuyên môn SmartEnglish AI — Đồng hành cùng học viên chinh phục tiếng Anh và tối ưu lộ trình học tập.'
                  : 'Quản trị viên Hệ thống SmartEnglish AI — Điều hành hệ thống học liệu, giám sát an toàn cộng đồng và vận hành nền tảng.')}
              &rdquo;
            </p>
          </div>

          {/* Danh sách thông tin chi tiết */}
          <div className="space-y-2.5 text-xs text-slate-700 pt-0.5">
            {/* Vai trò */}
            <div className="flex items-center gap-2.5">
              {isTeacher ? (
                <GraduationCap size={15} className="text-blue-600 shrink-0" />
              ) : (
                <Briefcase size={15} className="text-amber-600 shrink-0" />
              )}
              <span className="truncate">
                Vai trò:{' '}
                <strong className="text-slate-900">
                  {isTeacher ? 'Giảng viên SmartEnglish' : 'Quản trị viên Hệ thống (Admin)'}
                </strong>
              </span>
            </div>

            {/* Đơn vị / Trực ban */}
            <div className="flex items-center gap-2.5">
              <Building2 size={15} className="text-slate-400 shrink-0" />
              <span className="truncate">
                Bộ phận:{' '}
                <strong className="text-slate-900">
                  {profileData.department || 'Hội đồng Học thuật & Quản trị Nội dung AI'}
                </strong>
              </span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2.5">
              <Mail size={15} className="text-slate-400 shrink-0" />
              <span className="truncate">
                Email:{' '}
                <strong className="text-slate-900 font-mono text-[11.5px]">
                  {profileData.email || 'Chưa cập nhật'}
                </strong>
              </span>
            </div>

            {/* Số điện thoại */}
            <div className="flex items-center gap-2.5">
              <Phone size={15} className="text-slate-400 shrink-0" />
              <span>
                Điện thoại:{' '}
                <strong className="text-slate-900">
                  {profileData.phone || 'Chưa cập nhật'}
                </strong>
              </span>
            </div>

            {/* Username */}
            <div className="flex items-center gap-2.5">
              <AtSign size={15} className="text-slate-400 shrink-0" />
              <span className="flex items-center gap-1.5">
                Username:
                <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold border border-slate-200/60">
                  @{currentUser?.username || 'admin'}
                </code>
              </span>
            </div>

            {/* Quyền hạn */}
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
              <span>
                Phân quyền:{' '}
                <strong className="text-emerald-700">
                  {isTeacher ? 'Quyền hạn Giảng viên' : 'Toàn quyền Quản trị (Super Admin)'}
                </strong>
              </span>
            </div>

            {/* Trạng thái tài khoản */}
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              <span className="flex items-center gap-1.5">
                Trạng thái: <strong className="text-emerald-600">Đang hoạt động</strong>
              </span>
            </div>
          </div>

          {/* Nút bấm chuyển sang tab chỉnh sửa chi tiết */}
          <div className="pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              size="sm"
              icon={Edit3}
              onClick={onEditInfo}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs font-semibold cursor-pointer"
            >
              Chỉnh sửa thông tin chi tiết
            </Button>
          </div>
        </Card>

        {/* 2. THẺ THỐNG KÊ HOẠT ĐỘNG (OVERVIEW STATS) */}
        <Card className="p-4 sm:p-5 border border-slate-200/90 bg-white shadow-xs space-y-3.5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 size={16} className="text-brand-600" />
            <span>Hoạt động & Đóng góp</span>
          </h3>

          <div className="grid grid-cols-2 gap-2.5 pt-0.5">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Bài viết
              </span>
              <span className="text-xl font-extrabold text-brand-600">
                {postsCount ?? 0}
              </span>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Tương tác
              </span>
              <span className="text-xl font-extrabold text-emerald-600">
                Tích cực
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/app/cong-dong"
              className="inline-flex items-center justify-between w-full text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors p-1"
            >
              <span>Đến Bảng tin Cộng đồng để thảo luận</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </Card>
      </div>

      {/* ─── CỘT PHẢI (COL-SPAN-7 / 62%): TIMELINE & POSTS FEED KIỂU FACEBOOK ─── */}
      <div className="lg:col-span-7 space-y-4">
        {/* HỘP SOẠN BÀI VIẾT NHANH (WHAT'S ON YOUR MIND?) */}
        <Card className="p-4 sm:p-4.5 border border-slate-200/90 bg-white shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <Avatar
              name={profileData.displayName || 'Người dùng'}
              src={profileData.avatarUrl}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
            />
            <button
              type="button"
              onClick={() => navigate('/app/cong-dong')}
              className="flex-1 text-left rounded-full bg-slate-100/90 hover:bg-slate-200/80 transition-all px-4 py-2.5 text-xs text-slate-500 font-medium cursor-pointer border border-transparent hover:border-slate-200"
            >
              Bạn đang nghĩ gì thế, {profileData.displayName?.split(' ').pop() || 'bạn'}? Chia sẻ học liệu hoặc bài viết...
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 px-1 text-xs">
            <button
              type="button"
              onClick={() => navigate('/app/cong-dong')}
              className="flex items-center gap-1.5 font-semibold text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-50"
            >
              <ImageIcon size={16} className="text-emerald-500" />
              <span>Ảnh / Video</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/app/cong-dong')}
              className="flex items-center gap-1.5 font-semibold text-slate-600 hover:text-red-600 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-50"
            >
              <FileText size={16} className="text-red-500" />
              <span>Tài liệu bài tập</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/app/cong-dong')}
              className="flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-brand-50"
            >
              <PlusCircle size={16} />
              <span>Đăng bài ngay</span>
            </button>
          </div>
        </Card>

        {/* FEED BÀI VIẾT ĐÃ ĐĂNG */}
        <ProfilePostsTab
          userId={currentUser?.id}
          userName={profileData.displayName || currentUser?.displayName || 'Bạn'}
          isSelf={true}
          onPostCountChange={onPostCountChange}
        />
      </div>
    </div>
  )
}

