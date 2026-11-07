import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Users,
  Calendar,
  Clock,
  Lock,
  Unlock,
  ChevronRight,
  AlertCircle,
  Check,
  User as UserIcon,
  MessageSquare,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'
import { http } from '@/lib/api'
import { getUser, lockUser, unlockUser } from './api'
import { useAuthStore } from '@/store/authStore'
import { useTopbarStore } from '@/store/topbarStore'
import { getTeacherClasses } from '@/features/classes/classApi'
import { fetchCoursesApi } from '@/features/courses/courseApi'
import ProfilePostsTab from '@/features/profile/components/ProfilePostsTab'

const ROLE_LABEL = {
  admin: 'Quản trị viên',
  teacher: 'Giáo viên',
  student: 'Học viên',
}

const ROLE_TONE = {
  admin: 'gold',
  teacher: 'info',
  student: 'success',
}

const PLAN_LABEL = {
  free: 'Free',
  premium_monthly: 'Premium Tháng',
  premium_yearly: 'Premium Năm',
  lifetime: 'Trọn Đời VIP',
  teacher_pro: 'Teacher Pro',
  school_center: 'School & Center',
}

const BANNER_PRESETS = [
  {
    id: 'ocean',
    name: 'Đại dương xanh',
    gradient: 'from-[#0A2540] via-[#0F609B] to-[#0284C7]',
    preview: 'bg-gradient-to-r from-[#0A2540] to-[#0284C7]',
  },
  {
    id: 'aurora',
    name: 'Cực quang tím',
    gradient: 'from-[#1E1B4B] via-[#4338CA] to-[#06B6D4]',
    preview: 'bg-gradient-to-r from-[#1E1B4B] to-[#06B6D4]',
  },
  {
    id: 'sunset',
    name: 'Hoàng hôn ấm',
    gradient: 'from-[#1E1B4B] via-[#9333EA] to-[#F43F5E]',
    preview: 'bg-gradient-to-r from-[#1E1B4B] to-[#F43F5E]',
  },
  {
    id: 'emerald',
    name: 'Ngọc bích học thuật',
    gradient: 'from-[#064E3B] via-[#0D9488] to-[#10B981]',
    preview: 'bg-gradient-to-r from-[#064E3B] to-[#10B981]',
  },
  {
    id: 'wave-3d',
    name: 'Sóng lụa 3D Minimal',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=80',
    preview: 'bg-gradient-to-r from-[#0F172A] to-[#38BDF8]',
  },
]

export default function UserProfileDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)
  const isAdmin = currentUser?.role === 'admin'
  const setCustomHeader = useTopbarStore((s) => s.setCustomHeader)
  const clearCustomHeader = useTopbarStore((s) => s.clearCustomHeader)

  const backUrl = location.pathname.startsWith('/app/nguoi-dung') ? '/app/nguoi-dung' : '/app/hoc-vien'

  const [classes, setClasses] = useState([])
  const [courses, setCourses] = useState([])
  const [isConfirmLockOpen, setIsConfirmLockOpen] = useState(false)
  const [isLocking, setIsLocking] = useState(false)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'posts'
  const [userPostsCount, setUserPostsCount] = useState(null)

  // Quản lý Preset hình nền bìa
  const [selectedBannerId, setSelectedBannerId] = useState(() => {
    return localStorage.getItem('smartenglish_user_banner_preset') || 'ocean'
  })

  const activePreset = BANNER_PRESETS.find((p) => p.id === selectedBannerId) || BANNER_PRESETS[0]


  // 1. Tải thông tin chi tiết người dùng từ API Backend thật (không dùng fallback mock)
  const userQuery = useQuery({
    queryKey: ['user-detail', id],
    queryFn: () => getUser(id),
    enabled: Boolean(id),
  })

  const user = userQuery.data
  const isSelf = currentUser?.id === user?.id
  const isTeacher = user?.role === 'teacher'
  const isStudent = user?.role === 'student'
  const isUserAdmin = user?.role === 'admin'

  // Đồng bộ tiêu đề và nút quay lại lên Topbar hệ thống
  useEffect(() => {
    setCustomHeader({
      backLink: backUrl,
      backText: 'Quay lại',
      title: user?.displayName || 'Chi tiết người dùng',
      subtitle: user
        ? `Quản lý người dùng / ${ROLE_LABEL[user.role] || user.role || 'Người dùng'} / ${user.email || ''}`
        : 'Quản lý người dùng',
    })
    return () => clearCustomHeader()
  }, [user, backUrl, setCustomHeader, clearCustomHeader])

  // 2. Tải thông tin lớp học & khóa học thực tế liên quan đến người dùng
  useEffect(() => {
    if (!user) return
    let isMounted = true

    if (isTeacher) {
      Promise.allSettled([
        getTeacherClasses({ teacherId: user.id }),
        fetchCoursesApi(),
      ]).then(([classesRes, coursesRes]) => {
        if (!isMounted) return

        // Chỉ lưu lớp học thực tế trả về từ API
        if (classesRes.status === 'fulfilled') {
          const classData = classesRes.value
          const items = classData?.items || classData?.content || (Array.isArray(classData) ? classData : [])
          setClasses(items)
        } else {
          setClasses([])
        }

        // Chỉ lưu khóa học do đúng giáo viên này tạo
        if (coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value)) {
          const userCourses = coursesRes.value.filter(
            (c) =>
              String(c.teacherId) === String(user.id) ||
              String(c.createdBy) === String(user.id) ||
              (c.authorName && user.displayName && c.authorName.toLowerCase() === user.displayName.toLowerCase()),
          )
          setCourses(userCourses)
        } else {
          setCourses([])
        }
      })
    } else if (isStudent) {
      // Tìm lớp học thực tế học viên đang tham gia
      getTeacherClasses({ size: 100 })
        .then((res) => {
          if (!isMounted) return
          const items = res?.items || res?.content || (Array.isArray(res) ? res : [])
          const studentClasses = items.filter((cls) => {
            if (Array.isArray(cls.members)) {
              return cls.members.some((m) => String(m.id || m.userId || m.studentId) === String(user.id))
            }
            return false
          })
          setClasses(studentClasses)
        })
        .catch(() => {
          if (isMounted) setClasses([])
        })
      setCourses([])
    }

    return () => {
      isMounted = false
    }
  }, [user, isTeacher, isStudent])

  // 3. Tải tổng số lượng bài viết của người dùng từ Bảng tin Cộng đồng
  useEffect(() => {
    if (!user?.id) return
    let isMounted = true

    http
      .get('/api/v1/social/posts?page=0&size=100')
      .then((res) => {
        if (!isMounted) return
        const data = res?.data || res
        const list = Array.isArray(data?.posts)
          ? data.posts
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : []
        const count = list.filter(
          (p) =>
            String(p.authorId) === String(user.id) ||
            String(p.userId) === String(user.id) ||
            String(p.author?.id) === String(user.id),
        ).length
        setUserPostsCount(count)
      })
      .catch(() => {
        if (isMounted) setUserPostsCount(0)
      })

    return () => {
      isMounted = false
    }
  }, [user?.id])

  // Thao tác Khóa / Mở khóa tài khoản
  const handleToggleLock = async () => {
    if (!user) return
    if (isSelf) {
      toast.error('Không thể tự khóa tài khoản quản trị của chính bạn!')
      return
    }

    setIsLocking(true)
    try {
      if (user.isActive) {
        await lockUser(user.id)
        toast.success(`Đã khóa tài khoản "${user.displayName}"`)
      } else {
        await unlockUser(user.id)
        toast.success(`Đã mở khóa tài khoản "${user.displayName}"`)
      }
      await userQuery.refetch()
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsConfirmLockOpen(false)
    } catch (err) {
      toast.error(err?.message || 'Có lỗi khi cập nhật trạng thái tài khoản!')
    } finally {
      setIsLocking(false)
    }
  }

  // Trạng thái Đang tải đồng bộ chuẩn toàn hệ thống
  if (userQuery.isLoading) {
    return <LoadingSpinner text="Đang tải thông tin người dùng..." className="py-24" />
  }

  // Trạng thái Lỗi hoặc Không tìm thấy
  if (userQuery.isError || !user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-3">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-sm font-bold text-navy-900">Không tìm thấy người dùng</h3>
        <p className="mt-1 text-xs text-ink-muted">
          Người dùng có thể đã bị xóa hoặc đường dẫn không chính xác.
        </p>
        <div className="mt-5 flex justify-center">
          <Link
            to={backUrl}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-canvas shadow-2xs transition-colors"
          >
            <ArrowLeft size={14} /> Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-5 pb-10">
      {/* ─── CARD 1: PROFILE HERO BANNER & AVATAR ─── */}
      <Card className="p-0 overflow-hidden border border-line shadow-2xs">
        <div className="relative h-28 sm:h-36 w-full overflow-hidden select-none">
          {activePreset.imageUrl ? (
            <>
              <img
                src={activePreset.imageUrl}
                alt="Profile Cover"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </>
          ) : (
            <div
              className={cn(
                'h-full w-full bg-gradient-to-r relative overflow-hidden transition-all duration-500',
                activePreset.gradient,
              )}
            >
              <div className="absolute -top-12 -left-12 h-56 w-56 rounded-full bg-white/20 blur-3xl pointer-events-none" />
              <div className="absolute top-2 right-12 h-44 w-44 rounded-full bg-cyan-300/25 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 right-1/4 h-48 w-48 rounded-full bg-indigo-300/20 blur-3xl pointer-events-none" />

              <svg
                className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,60 L1200,120 L0,120 Z"
                  fill="#ffffff"
                />
              </svg>
            </div>
          )}

          {/* Nút Khóa / Mở khóa tài khoản ở góc trên bên phải cover banner */}
          {isAdmin && !isSelf && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
              <Button
                variant={user.isActive ? 'danger' : 'success'}
                size="sm"
                icon={user.isActive ? Lock : Unlock}
                onClick={() => setIsConfirmLockOpen(true)}
                className="shadow-sm backdrop-blur-xs font-semibold"
              >
                {user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
              </Button>
            </div>
          )}
        </div>

        {/* Thông tin chính & Avatar */}
        <div className="px-5 sm:px-6 pb-5 pt-0 bg-surface relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 -mt-9 sm:-mt-12 mb-3">
            <div className="flex items-end gap-3.5">
              <div className="relative shrink-0">
                <Avatar
                  name={user.displayName}
                  src={user.avatarUrl}
                  className="h-18 w-18 sm:h-22 sm:w-22 rounded-full object-cover shadow-md ring-4 ring-white bg-surface"
                />
                <span
                  className={cn(
                    'absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white',
                    user.isActive ? 'bg-emerald-500' : 'bg-red-500',
                  )}
                  title={user.isActive ? 'Tài khoản đang hoạt động' : 'Tài khoản đã khóa'}
                />
              </div>

              <div className="space-y-0.5 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-bold text-navy-900 tracking-tight">
                    {user.displayName}
                  </h1>
                  {isSelf && (
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600 border border-brand-200">
                      Bạn
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-muted font-mono">
                  {user.username ? `@${user.username}` : `UID: #${user.id}`}
                </p>
              </div>
            </div>

            {/* Badges trạng thái & Gói cước */}
            <div className="flex items-center gap-2 flex-wrap pb-0.5">
              <Badge tone={ROLE_TONE[user.role] ?? 'neutral'}>
                {ROLE_LABEL[user.role] ?? user.role}
              </Badge>

              <Badge tone={user.plan === 'free' ? 'neutral' : 'gold'}>
                {PLAN_LABEL[user.plan] ?? user.plan}
              </Badge>

              <Badge tone={user.isActive ? 'success' : 'danger'}>
                {user.isActive ? 'Hoạt động' : 'Đã khóa'}
              </Badge>

              {userPostsCount !== null && (
                <button
                  type="button"
                  onClick={() => setActiveTab('posts')}
                  className="cursor-pointer hover:opacity-85 transition-opacity"
                  title="Nhấn để xem các bài viết của người này"
                >
                  <Badge tone="primary" className="gap-1 cursor-pointer">
                    <MessageSquare size={11} />
                    {userPostsCount} bài viết
                  </Badge>
                </button>
              )}
            </div>
          </div>

          {/* Tiểu sử (chỉ hiển thị nếu người dùng thực sự có bio) */}
          {user.bio && (
            <p className="mt-3 text-xs text-slate-600 bg-canvas p-3 rounded-xl border border-line leading-relaxed max-w-3xl">
              {user.bio}
            </p>
          )}
        </div>
      </Card>

      {/* ─── TABS CHUYỂN ĐỔI: THÔNG TIN & BÀI VIẾT ─── */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-px overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0',
            activeTab === 'overview'
              ? 'border-brand-600 text-brand-700 bg-brand-50/30 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg',
          )}
        >
          <UserIcon size={15} />
          <span>Thông tin & Đào tạo</span>
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
          <span>{isSelf ? 'Bài viết của tôi' : 'Bài viết đã đăng'}</span>
          {userPostsCount !== null && (
            <span
              className={cn(
                'ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold',
                activeTab === 'posts'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-200 text-slate-700',
              )}
            >
              {userPostsCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── NỘI DUNG TAB TỔNG QUAN ─── */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-5">
          {/* ─── CARD 2: THÔNG TIN TÀI KHOẢN & LIÊN HỆ ─── */}
          <Card className="border border-line p-5 space-y-3.5 shadow-2xs">
        <h3 className="text-sm font-bold text-navy-900">Thông tin tài khoản</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-0.5">
          <div className="bg-canvas p-3 rounded-xl border border-line">
            <span className="text-slate-400 text-[11px] block mb-1">Email</span>
            <span className="font-mono text-xs font-semibold text-slate-800 break-all select-all">
              {user.email || '—'}
            </span>
          </div>

          <div className="bg-canvas p-3 rounded-xl border border-line">
            <span className="text-slate-400 text-[11px] block mb-1">Số điện thoại</span>
            <span className="font-mono text-xs font-semibold text-slate-800 select-all">
              {user.phone || 'Chưa cập nhật'}
            </span>
          </div>

          <div className="bg-canvas p-3 rounded-xl border border-line flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[11px] block mb-1">Ngày tham gia</span>
              <span className="font-semibold text-slate-800">{formatDate(user.createdAt)}</span>
            </div>
            <Calendar size={15} className="text-slate-400 shrink-0" />
          </div>

          <div className="bg-canvas p-3 rounded-xl border border-line flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[11px] block mb-1">Đăng nhập gần nhất</span>
              <span className="font-semibold text-slate-800">
                {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : 'Chưa đăng nhập'}
              </span>
            </div>
            <Clock size={15} className="text-slate-400 shrink-0" />
          </div>
        </div>
      </Card>

      {/* ─── CARD 3: NỘI DUNG CHUYÊN BIỆT THEO VAI TRÒ ─── */}

      {/* 3A. ĐỐI VỚI GIÁO VIÊN: THỐNG KÊ, LỚP HỌC & KHÓA HỌC THẬT */}
      {isTeacher && (
        <div className="space-y-4 sm:space-y-5">
          {/* Thẻ thống kê giảng dạy thực tế */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 sm:p-4 text-center border border-line bg-surface rounded-xl shadow-2xs">
              <span className="text-xs text-slate-500 block mb-1">Lớp giảng dạy</span>
              <span className="text-xl sm:text-2xl font-bold text-navy-900">{classes.length}</span>
            </div>

            <div className="p-3.5 sm:p-4 text-center border border-line bg-surface rounded-xl shadow-2xs">
              <span className="text-xs text-slate-500 block mb-1">Tổng học viên</span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-600">
                {classes.reduce((sum, c) => sum + Number(c.studentsCount || c.studentCount || 0), 0)}
              </span>
            </div>

            <div className="p-3.5 sm:p-4 text-center border border-line bg-surface rounded-xl shadow-2xs">
              <span className="text-xs text-slate-500 block mb-1">Khóa học biên soạn</span>
              <span className="text-xl sm:text-2xl font-bold text-brand-600">{courses.length}</span>
            </div>
          </div>

          {/* Danh sách lớp học đang phụ trách */}
          <Card className="border border-line p-5 space-y-3.5 shadow-2xs">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <Users size={16} className="text-brand-600" />
              Lớp học đang phụ trách ({classes.length})
            </h3>

            <div className="space-y-2.5">
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <div
                    key={cls.id || cls.code}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/app/lop-hoc?classId=${cls.id || cls.code}`)}
                    className="p-3.5 bg-canvas rounded-xl border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-brand-400 hover:bg-brand-50/20 transition-all cursor-pointer shadow-2xs group active:scale-[0.99]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-xs text-navy-900 group-hover:text-brand-600 transition-colors">
                          {cls.name}
                        </p>
                        {cls.code && (
                          <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-line text-slate-600 font-semibold">
                            {cls.code}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {cls.level && (
                          <>
                            Trình độ: <span className="font-semibold text-slate-700">{cls.level}</span> ·{' '}
                          </>
                        )}
                        Sĩ số:{' '}
                        <span className="font-semibold text-slate-700">
                          {Number(cls.studentsCount || cls.studentCount || 0)}
                          {cls.maxStudents ? `/${cls.maxStudents}` : ''} học viên
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                      <Badge
                        tone={cls.status === 'ENDED' ? 'neutral' : cls.status === 'UPCOMING' ? 'info' : 'success'}
                        className="text-[10px] px-2 py-0.5"
                      >
                        {cls.status === 'ENDED' ? 'Đã kết thúc' : cls.status === 'UPCOMING' ? 'Sắp diễn ra' : 'Đang diễn ra'}
                      </Badge>
                      <ChevronRight size={15} className="text-slate-400 group-hover:text-brand-600 transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center bg-canvas rounded-xl border border-dashed border-line">
                  Giảng viên chưa phụ trách lớp học nào.
                </p>
              )}
            </div>
          </Card>

          {/* Danh sách khóa học biên soạn */}
          <Card className="border border-line p-5 space-y-3.5 shadow-2xs">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <BookOpen size={16} className="text-brand-600" />
              Khóa học & Giáo trình biên soạn ({courses.length})
            </h3>

            <div className="space-y-2.5">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <div
                    key={course.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/app/hoc-lieu/khoa-hoc/${course.id}`)}
                    className="p-3.5 bg-canvas rounded-xl border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-brand-400 hover:bg-brand-50/20 transition-all cursor-pointer shadow-2xs group active:scale-[0.99]"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-navy-900 group-hover:text-brand-600 transition-colors truncate">
                        {course.title || course.titleVi || 'Khóa học'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {course.cefrLevelMin && (
                          <span>
                            Cấp độ: {course.cefrLevelMin}
                            {course.cefrLevelMax ? ` - ${course.cefrLevelMax}` : ''} ·{' '}
                          </span>
                        )}
                        {course.totalLessons != null || course.lessonCount != null ? (
                          <span>{course.totalLessons || course.lessonCount || 0} bài học</span>
                        ) : null}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                      <Badge
                        tone={course.status === 'draft' ? 'warning' : 'success'}
                        className="text-[10px] px-2 py-0.5"
                      >
                        {course.status === 'draft' ? 'Bản nháp' : 'Đã xuất bản'}
                      </Badge>
                      <ChevronRight size={15} className="text-slate-400 group-hover:text-brand-600 transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center bg-canvas rounded-xl border border-dashed border-line">
                  Giảng viên chưa tạo khóa học nào.
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* 3B. ĐỐI VỚI HỌC VIÊN: TRÌNH ĐỘ, MỤC TIÊU & LỚP HỌC THỰC TẾ */}
      {isStudent && (
        <div className="space-y-4 sm:space-y-5">
          {/* Thống kê học tập thực tế từ dữ liệu người dùng */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 sm:p-4 text-center border border-line bg-surface rounded-xl shadow-2xs">
              <span className="text-xs text-slate-500 block mb-1">Trình độ CEFR</span>
              <span className="text-xl sm:text-2xl font-bold text-brand-600">
                {user.cefrLevel || 'Chưa thiết lập'}
              </span>
            </div>

            <div className="p-3.5 sm:p-4 text-center border border-line bg-surface rounded-xl shadow-2xs">
              <span className="text-xs text-slate-500 block mb-1">Lớp học tham gia</span>
              <span className="text-xl sm:text-2xl font-bold text-navy-900">{classes.length}</span>
            </div>

            <div className="p-3.5 sm:p-4 text-center border border-line bg-surface rounded-xl shadow-2xs">
              <span className="text-xs text-slate-500 block mb-1">Gói dịch vụ</span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-600">
                {PLAN_LABEL[user.plan] ?? user.plan ?? 'Free'}
              </span>
            </div>
          </div>

          {/* Mục tiêu học tập - chỉ render nếu học viên có đặt mục tiêu */}
          {user.targetGoal && (
            <Card className="border border-line p-4 shadow-2xs">
              <span className="text-[11px] text-slate-400 uppercase tracking-wide font-bold block mb-1">
                Mục tiêu học tập
              </span>
              <p className="text-xs font-semibold text-slate-800">{user.targetGoal}</p>
            </Card>
          )}

          {/* Lớp học thực tế đang tham gia */}
          <Card className="border border-line p-5 space-y-3.5 shadow-2xs">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <GraduationCap size={16} className="text-brand-600" />
              Lớp học đang tham gia ({classes.length})
            </h3>

            <div className="space-y-2.5">
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <div
                    key={cls.id || cls.code}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/app/lop-hoc?classId=${cls.id || cls.code}`)}
                    className="p-3.5 bg-canvas rounded-xl border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-brand-400 hover:bg-brand-50/20 transition-all cursor-pointer shadow-2xs group active:scale-[0.99]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-xs text-navy-900 group-hover:text-brand-600 transition-colors truncate">
                          {cls.name}
                        </p>
                        {cls.code && (
                          <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-line text-slate-600 font-semibold">
                            {cls.code}
                          </span>
                        )}
                      </div>
                      {cls.teacherName && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Giảng viên: <span className="font-semibold text-slate-700">{cls.teacherName}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                      <Badge
                        tone={cls.status === 'ENDED' ? 'neutral' : cls.status === 'UPCOMING' ? 'info' : 'success'}
                        className="text-[10px] px-2 py-0.5"
                      >
                        {cls.status === 'ENDED' ? 'Đã kết thúc' : cls.status === 'UPCOMING' ? 'Sắp diễn ra' : 'Đang diễn ra'}
                      </Badge>
                      <ChevronRight size={15} className="text-slate-400 group-hover:text-brand-600 transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center bg-canvas rounded-xl border border-dashed border-line">
                  Học viên chưa tham gia lớp học nào.
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ─── KẾT THÚC TAB TỔNG QUAN ─── */}
        </div>
      )}

      {/* ─── NỘI DUNG TAB BÀI VIẾT CỘNG ĐỒNG ─── */}
      {activeTab === 'posts' && (
        <ProfilePostsTab
          userId={user.id}
          userName={user.displayName}
          isSelf={isSelf}
          onPostCountChange={setUserPostsCount}
        />
      )}

      {/* DIALOG XÁC NHẬN KHÓA / MỞ KHÓA TÀI KHOẢN */}
      <ConfirmDialog
        open={isConfirmLockOpen}
        title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        description={
          user.isActive
            ? `Bạn có chắc chắn muốn khóa tài khoản "${user.displayName}" (${user.email || 'UID: #' + user.id})?`
            : `Xác nhận mở khóa tài khoản "${user.displayName}" (${user.email || 'UID: #' + user.id})?`
        }
        confirmText={isLocking ? 'Đang xử lý...' : user.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
        cancelText="Hủy"
        variant={user.isActive ? 'danger' : 'primary'}
        onConfirm={handleToggleLock}
        onClose={() => setIsConfirmLockOpen(false)}
        loading={isLocking}
      />
    </div>
  )
}
