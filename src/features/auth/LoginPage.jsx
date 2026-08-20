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
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: true },
  })

  const onSubmit = (values) => {
    login.mutate(values, {
      onSuccess: () => {
        const redirectTo = location.state?.from?.pathname ?? '/'
        navigate(redirectTo, { replace: true })
      },
      onError: (error) => {
        setError('root', { message: error.message })
      },
    })
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
          <p className="text-sm text-ink-muted">Chào mừng trở lại, Quản trị viên.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 py-6">
          <Input
            label="Địa chỉ email"
            type="email"
            placeholder="admin@smartenglish.vn"
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
              onClick={() => toast('Tính năng đang được xây dựng.')}
              className="text-sm font-medium text-brand-500 hover:text-brand-600"
            >
              Quên mật khẩu?
            </button>
          </div>

          {errors.root?.message && (
            <p className="text-sm text-[#B91C1C]">{errors.root.message}</p>
          )}

          <Button type="submit" fullWidth loading={isSubmitting || login.isPending}>
            Đăng nhập
          </Button>

          <div className="text-center text-xs pt-1 border-t border-line">
            <span className="text-ink-muted">Bạn là Giáo viên mới? </span>
            <Link to="/dang-ky-giao-vien" className="font-bold text-brand-600 hover:underline">
              Đăng ký tài khoản Giảng dạy →
            </Link>
          </div>

          <p className="text-center text-xs text-ink-muted">
            Tài khoản demo: admin@smartenglish.vn / admin123 · mai.ht@gmail.com / teacher123
          </p>
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
