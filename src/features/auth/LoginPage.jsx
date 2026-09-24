import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Eye, EyeOff, GraduationCap, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { useLogin } from '@/features/auth/hooks/useAuth'
import { useAuthStore, TEST_USERS } from '@/store/authStore'

const schema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  remember: z.boolean().optional(),
})

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: true },
  })

  const onSubmit = (values) => {
    clearErrors('root')
    login.mutate(values, {
      onSuccess: () => {
        const redirectTo = location.state?.from?.pathname ?? '/app'
        navigate(redirectTo, { replace: true })
      },
      onError: (error) => {
        setError('root', { message: error.message || 'Đăng nhập không thành công. Vui lòng thử lại.' })
      },
    })
  }

  const handleFillCredentials = (email, password) => {
    setValue('email', email, { shouldValidate: true })
    setValue('password', password, { shouldValidate: true })
    clearErrors('root')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-6">
      <Card className="w-full max-w-sm p-0">
        <div className="flex flex-col items-center gap-1 border-b border-line px-6 py-6 text-center">
          <div className="mb-1 flex items-center gap-2">
            <GraduationCap size={18} strokeWidth={1.75} className="text-navy-700" />
            <span className="text-base font-bold text-navy-700">SmartEnglish AI</span>
          </div>
          <p className="text-lg font-semibold text-navy-700">Đăng nhập trang quản trị</p>
          <p className="text-sm text-ink-muted">Chỉ dành cho Quản trị viên & Giáo viên</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 py-6">
          <Input
            label="Địa chỉ email"
            type="email"
            placeholder="admin@smartenglish.com"
            leadingIcon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leadingIcon={Lock}
            error={errors.password?.message}
            trailingAction={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="rounded-full p-1 text-ink-muted hover:bg-canvas hover:text-ink"
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={1.75} />
                ) : (
                  <Eye size={18} strokeWidth={1.75} />
                )}
              </button>
            }
            {...register('password')}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                {...register('remember')}
                className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-500"
              />
              Ghi nhớ đăng nhập
            </label>
            <button
              type="button"
              onClick={() => toast('Vui lòng liên hệ Quản trị viên hệ thống để khôi phục mật khẩu.')}
              className="text-sm font-medium text-brand-500 hover:text-brand-600"
            >
              Quên mật khẩu?
            </button>
          </div>

          {errors.root?.message && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-left">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" />
              <div className="text-xs text-red-700 leading-relaxed font-medium">
                {errors.root.message}
              </div>
            </div>
          )}

          <Button type="submit" fullWidth loading={isSubmitting || login.isPending}>
            Đăng nhập
          </Button>

          {/* Quick test credentials */}
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-3 space-y-2">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
              Tài khoản mẫu (Nhấp để điền)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillCredentials('admin@smartenglish.com', 'Password123@')}
                className="rounded-lg border border-slate-200 bg-white p-2 text-left hover:border-brand-500 transition-all cursor-pointer shadow-2xs"
              >
                <div className="text-xs font-bold text-slate-800">Quản trị viên</div>
                <div className="text-[10px] text-slate-400 truncate">admin@smartenglish.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleFillCredentials('teacher.john@smartenglish.com', 'Password123@')}
                className="rounded-lg border border-slate-200 bg-white p-2 text-left hover:border-brand-500 transition-all cursor-pointer shadow-2xs"
              >
                <div className="text-xs font-bold text-slate-800">Giáo viên</div>
                <div className="text-[10px] text-slate-400 truncate">teacher.john@smart...</div>
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleFillCredentials('student.theanh@gmail.com', 'Password123@')}
              className="w-full rounded-lg border border-amber-200 bg-amber-50/60 p-1.5 text-center hover:bg-amber-100/60 transition-all cursor-pointer"
            >
              <span className="text-[11px] font-medium text-amber-800">
                Thử đăng nhập tài khoản Học viên (Kiểm tra chặn 403)
              </span>
            </button>
          </div>

          <div className="text-center text-xs pt-1 border-t border-line">
            <span className="text-ink-muted">Bạn là Giáo viên mới? </span>
            <Link to="/dang-ky-giao-vien" className="font-bold text-brand-600 hover:underline">
              Đăng ký tài khoản Giảng dạy →
            </Link>
          </div>
        </form>

        <div className="flex items-start gap-2 rounded-b-xl bg-canvas px-6 py-4">
          <AlertTriangle size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[#B91C1C]" />
          <p className="text-xs text-ink-muted">
            Đây là khu vực hạn chế. Mọi truy cập trái phép đều bị nghiêm cấm. Toàn bộ hoạt động
            trên hệ thống đều được ghi lại.
          </p>
        </div>
      </Card>
    </div>
  )
}

export default LoginPage
