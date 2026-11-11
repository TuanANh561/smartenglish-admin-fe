import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import api from '@/lib/api'
import { maskEmail } from '@/lib/utils'
import * as authApi from './api'
import { useAuthStore } from '@/store/authStore'
import OtpInputGroup from './components/OtpInputGroup'

const schema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email hoặc tên đăng nhập'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  remember: z.boolean().optional(),
})

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState('CREDENTIALS') // 'CREDENTIALS' | 'OTP'
  const [pendingAuth, setPendingAuth] = useState(null)
  const [expectedOtp, setExpectedOtp] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [isResendingOtp, setIsResendingOtp] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((s) => s.setSession)
  const clearSession = useAuthStore((s) => s.clearSession)

  const timerRef = useRef(null)

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: true },
  })

  // Đếm ngược 60 giây khi ở màn hình nhập mã OTP
  useEffect(() => {
    if (step === 'OTP' && resendTimer > 0) {
      timerRef.current = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [step, resendTimer])

  /**
   * Sinh mã ngẫu nhiên 6 chữ số và gửi qua hệ thống email notification
   */
  const sendOtpEmail = async (targetUser, token) => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString()
    setExpectedOtp(newOtp)
    console.log('[SmartEnglish Auth] Mã xác thực OTP 2FA:', newOtp)

    const authToken = token || pendingAuth?.accessToken
    try {
      await api.post('/notifications/email', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        data: {
          to: targetUser.email,
          subject: '[SmartEnglish AI] Mã xác thực đăng nhập Quản trị',
          templateType: 'AUTH_OTP',
          templateVariables: {
            otp: newOtp,
            name: targetUser.displayName || targetUser.username,
          },
        },
      })
    } catch (err) {
      console.warn('Cảnh báo gửi email OTP từ server:', err)
      if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
        toast.error('Không thể gửi mã xác thực qua email: ' + (err.message || 'Lỗi server'))
        throw err
      }
    }

    return newOtp
  }

  /**
   * Bước 1: Xác thực Email/Username và Mật khẩu
   */
  const onSubmitCredentials = async (values) => {
    clearErrors('root')
    clearSession()

    try {
      const data = await authApi.login({
        emailOrUsername: values.email.trim(),
        password: values.password,
      })

      const user = data?.user
      if (!user) {
        throw new Error('Dữ liệu tài khoản trả về không hợp lệ')
      }

      const role = String(user.role || '').toLowerCase()
      if (role === 'student') {
        throw new Error('Tài khoản học viên không thể truy cập trang Quản trị. Vui lòng dùng ứng dụng di động SmartEnglish!')
      }

      // Lưu phiên xác thực tạm thời và gửi mã OTP qua hòm thư thật
      setPendingAuth(data)
      await sendOtpEmail(user, data.accessToken)

      setStep('OTP')
      setResendTimer(60)
      setOtpDigits(['', '', '', '', '', ''])
      setOtpError('')
      toast.success(`Đã gửi mã xác thực 6 số đến ${maskEmail(user.email)}. Vui lòng kiểm tra hộp thư!`)
    } catch (err) {
      console.error('Đăng nhập thất bại:', err)
      setError('root', {
        message: err.message || 'Tài khoản hoặc mật khẩu không chính xác. Vui lòng thử lại.',
      })
    }
  }

  /**
   * Bước 2: Xác nhận mã OTP đã nhận qua mail
   */
  const handleConfirmOtp = async (codeToVerify) => {
    const code = codeToVerify || otpDigits.join('')
    if (code.length < 6) {
      setOtpError('Vui lòng nhập đủ 6 chữ số của mã xác thực.')
      return
    }

    setIsVerifyingOtp(true)
    setOtpError('')

    try {
      // Kiểm tra tính hợp lệ của mã OTP
      if (code !== expectedOtp) {
        setOtpError('Mã OTP không chính xác. Vui lòng kiểm tra lại hộp thư hoặc nhấn gửi lại mã.')
        setIsVerifyingOtp(false)
        return
      }

      // Hoàn tất xác thực 2 bước -> Lưu session chính thức
      setSession(pendingAuth)
      toast.success('Xác thực bảo mật thành công!')

      const redirectTo = location.state?.from?.pathname ?? '/app'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setOtpError(err.message || 'Có lỗi xảy ra khi xác thực mã. Vui lòng thử lại.')
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  /**
   * Gửi lại mã OTP mới qua email
   */
  const handleResendOtp = async () => {
    if (resendTimer > 0 || isResendingOtp || !pendingAuth?.user) return

    setIsResendingOtp(true)
    setOtpError('')
    try {
      await sendOtpEmail(pendingAuth.user, pendingAuth.accessToken)
      setResendTimer(60)
      setOtpDigits(['', '', '', '', '', ''])
      toast.success(`Đã gửi lại mã xác thực mới đến ${maskEmail(pendingAuth.user.email)}. Vui lòng kiểm tra hộp thư!`)
    } catch (err) {
      toast.error('Gửi lại mã thất bại: ' + (err.message || 'Lỗi server'))
    } finally {
      setIsResendingOtp(false)
    }
  }

  /**
   * Quay lại bước 1 để đổi tài khoản
   */
  const handleBackToCredentials = () => {
    setStep('CREDENTIALS')
    setPendingAuth(null)
    setExpectedOtp('')
    setOtpDigits(['', '', '', '', '', ''])
    setOtpError('')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-6">
      <Card className="w-full max-w-sm p-0 shadow-lg border border-line overflow-hidden">
        {/* ── HEADER CHUNG ── */}
        <div className="flex flex-col items-center gap-1 border-b border-line px-6 py-6 text-center bg-white">
          <div className="mb-1 flex items-center gap-2">
            <GraduationCap size={20} strokeWidth={2} className="text-brand-600" />
            <span className="text-base font-bold text-navy-800">SmartEnglish AI</span>
          </div>
          <p className="text-lg font-bold text-navy-900">
            {step === 'OTP' ? 'Xác thực bảo mật 2 lớp' : 'Đăng nhập tài khoản'}
          </p>
          <p className="text-xs text-ink-muted">
            {step === 'OTP'
              ? 'Nhập mã 6 chữ số được gửi về email của bạn'
              : 'Dành cho Quản trị viên và Giáo viên hệ thống'}
          </p>
        </div>

        {/* ── BƯỚC 1: NHẬP TÀI KHOẢN & MẬT KHẨU ── */}
        {step === 'CREDENTIALS' && (
          <form onSubmit={handleSubmit(onSubmitCredentials)} className="flex flex-col gap-4 px-6 py-6 bg-white">
            <Input
              label="Email hoặc Tên đăng nhập"
              type="text"
              placeholder="Nhập email hoặc username..."
              leadingIcon={Mail}
              error={errors.email?.message}
              autoComplete="username"
              {...register('email')}
            />
            <Input
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu của bạn..."
              leadingIcon={Lock}
              autoComplete="current-password"
              error={errors.password?.message}
              trailingAction={
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="rounded-full p-1 text-ink-muted hover:bg-canvas hover:text-ink cursor-pointer"
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
              <label className="flex items-center gap-2 text-xs text-ink cursor-pointer font-medium">
                <input
                  type="checkbox"
                  {...register('remember')}
                  className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-500 cursor-pointer"
                />
                Ghi nhớ đăng nhập
              </label>
              <button
                type="button"
                onClick={() => toast('Vui lòng liên hệ Quản trị viên hệ thống để khôi phục mật khẩu.')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>

            {errors.root?.message && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-left">
                <AlertTriangle size={17} className="mt-0.5 shrink-0 text-red-600" />
                <div className="text-xs text-red-700 leading-relaxed font-medium">
                  {errors.root.message}
                </div>
              </div>
            )}

            <Button type="submit" fullWidth loading={isSubmitting}>
              Đăng nhập ngay
            </Button>

            <div className="text-center text-xs pt-2 border-t border-line">
              <span className="text-ink-muted">Bạn là Giáo viên mới? </span>
              <Link to="/dang-ky-giao-vien" className="font-bold text-brand-600 hover:underline">
                Đăng ký tài khoản Giảng dạy →
              </Link>
            </div>
          </form>
        )}

        {/* ── BƯỚC 2: XÁC THỰC MÃ OTP QUA EMAIL ── */}
        {step === 'OTP' && (
          <div className="flex flex-col gap-4 px-6 py-6 bg-white">
            {/* Thông tin người nhận email */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-center">
              <p className="text-[11px] text-slate-500">Mã xác thực đã được gửi tới địa chỉ:</p>
              <p className="text-xs font-bold text-slate-900 mt-0.5 font-mono">
                {maskEmail(pendingAuth?.user?.email)}
              </p>
            </div>

            {/* 6 ô nhập mã OTP tách rời */}
            <div className="py-1">
              <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
                Mã xác thực 6 chữ số
              </label>
              <OtpInputGroup
                value={otpDigits}
                onChange={(nextDigits) => {
                  setOtpDigits(nextDigits)
                  if (otpError) setOtpError('')
                }}
                onComplete={handleConfirmOtp}
                error={Boolean(otpError)}
                disabled={isVerifyingOtp}
              />
            </div>

            {/* Lỗi OTP nếu nhập sai */}
            {otpError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-2.5 text-left">
                <AlertTriangle size={15} className="mt-0.5 shrink-0 text-red-600" />
                <p className="text-xs text-red-700 leading-relaxed font-medium">{otpError}</p>
              </div>
            )}

            {/* Hướng dẫn kiểm tra hộp thư thực tế & Đếm ngược gửi lại */}
            <div className="flex flex-col items-center gap-2.5 pt-1">
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-center text-xs text-blue-800">
                <Mail size={15} className="shrink-0 text-blue-600" />
                <span>Vui lòng mở hộp thư email của bạn để lấy mã xác thực 6 số.</span>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                {resendTimer > 0 ? (
                  <span>
                    Gửi lại mã sau <strong>{resendTimer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResendingOtp}
                    className="inline-flex items-center gap-1 text-slate-700 hover:text-brand-600 font-semibold cursor-pointer transition-colors"
                  >
                    <RefreshCw size={11} className={isResendingOtp ? 'animate-spin' : ''} />
                    <span>Gửi lại mã OTP</span>
                  </button>
                )}
              </div>
            </div>

            {/* Nút hành động */}
            <div className="space-y-2 pt-2">
              <Button
                type="button"
                fullWidth
                onClick={() => handleConfirmOtp()}
                loading={isVerifyingOtp}
                disabled={otpDigits.join('').length < 6}
              >
                Xác nhận đăng nhập
              </Button>

              <button
                type="button"
                onClick={handleBackToCredentials}
                disabled={isVerifyingOtp}
                className="w-full inline-flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium py-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Đổi tài khoản khác</span>
              </button>
            </div>
          </div>
        )}

        {/* ── FOOTER BẢO MẬT ── */}
        <div className="flex items-start gap-2 bg-canvas px-6 py-3.5 border-t border-slate-100">
          <ShieldCheck size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-brand-600" />
          <p className="text-[11px] text-ink-muted leading-relaxed">
            Xác thực 2 bước (2FA OTP) bảo vệ phiên làm việc của Quản trị viên và Giáo viên.
          </p>
        </div>
      </Card>
    </div>
  )
}
