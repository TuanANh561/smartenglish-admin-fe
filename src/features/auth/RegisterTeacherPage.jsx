import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  Upload,
  CheckCircle2,
  FileText,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  CreditCard,
  Award,
  BookOpen,
  X,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

export default function RegisterTeacherPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Personal, 2: Qualification, 3: Proof Files, 4: Success

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    identityCard: '',
    password: '',
    confirmPassword: '',
    education: 'Cử nhân Sư phạm Tiếng Anh',
    certificateType: 'IELTS Academic 8.0+',
    experienceYears: '3',
    specialty: 'Luyện thi IELTS (Writing & Speaking)',
  })

  // Mandatory Upload States
  const [degreeFile, setDegreeFile] = useState(null)
  const [identityFile, setIdentityFile] = useState(null)
  const [cvFile, setCvFile] = useState(null)
  const [agreed, setAgreed] = useState(false)

  // Step 1 Validation
  const handleNextStep1 = (e) => {
    e.preventDefault()
    if (!formData.fullName.trim()) return toast.error('Vui lòng nhập Họ và tên')
    if (!formData.email.trim() || !formData.email.includes('@'))
      return toast.error('Vui lòng nhập Email hợp lệ')
    if (!formData.phone.trim()) return toast.error('Vui lòng nhập Số điện thoại')
    if (!formData.identityCard.trim()) return toast.error('Vui lòng nhập Số CCCD/CMND')
    if (!formData.password || formData.password.length < 6)
      return toast.error('Mật khẩu phải từ 6 ký tự trở lên')
    if (formData.password !== formData.confirmPassword)
      return toast.error('Mật khẩu xác nhận không khớp')

    setStep(2)
  }

  // Step 2 Validation
  const handleNextStep2 = (e) => {
    e.preventDefault()
    setStep(3)
  }

  // Step 3 Submission
  const handleSubmitRegistration = (e) => {
    e.preventDefault()
    if (!degreeFile) {
      return toast.error('Vui lòng tải lên Bằng cấp / Chứng chỉ Tiếng Anh minh chứng!')
    }
    if (!identityFile) {
      return toast.error('Vui lòng tải lên Ảnh CCCD/CMND minh chứng!')
    }
    if (!agreed) {
      return toast.error('Vui lòng cam kết thông tin minh chứng cung cấp là chính xác!')
    }

    setStep(4)
    toast.success('Gửi hồ sơ đăng ký giáo viên thành công!')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900/5 p-4 md:p-6">
      <div className="w-full max-w-2xl space-y-4">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-brand-50 px-3.5 py-1.5 text-xs font-bold text-brand-700 border border-brand-200 shadow-2xs">
            <GraduationCap size={18} className="text-brand-600" />
            <span>SmartEnglish AI • Đăng Ký Giáo Viên & Đối Tác</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-navy-800 tracking-tight">
            Hồ Sơ Đăng Ký Tài Khoản Giảng Dạy (Teacher Pro)
          </h1>
          <p className="text-xs text-ink-muted">
            Vui lòng điền thông tin và cung cấp **tệp minh chứng bằng cấp/CCCD bắt buộc** để Quản trị viên phê duyệt.
          </p>
        </div>

        {/* Stepper Bar */}
        <Card className="p-3 border border-slate-200">
          <div className="flex items-center justify-between text-xs max-w-lg mx-auto">
            <div className={`flex items-center gap-2 font-bold ${step >= 1 ? 'text-brand-600' : 'text-slate-400'}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-200'}`}>
                1
              </span>
              <span>Cá nhân</span>
            </div>
            <div className="h-0.5 flex-1 mx-2 bg-slate-200">
              <div className="h-full bg-brand-600 transition-all duration-300" style={{ width: step >= 2 ? '100%' : '0%' }} />
            </div>

            <div className={`flex items-center gap-2 font-bold ${step >= 2 ? 'text-brand-600' : 'text-slate-400'}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${step >= 2 ? 'bg-brand-600 text-white' : 'bg-slate-200'}`}>
                2
              </span>
              <span>Chuyên môn</span>
            </div>
            <div className="h-0.5 flex-1 mx-2 bg-slate-200">
              <div className="h-full bg-brand-600 transition-all duration-300" style={{ width: step >= 3 ? '100%' : '0%' }} />
            </div>

            <div className={`flex items-center gap-2 font-bold ${step >= 3 ? 'text-brand-600' : 'text-slate-400'}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${step >= 3 ? 'bg-brand-600 text-white' : 'bg-slate-200'}`}>
                3
              </span>
              <span>Minh chứng</span>
            </div>
            <div className="h-0.5 flex-1 mx-2 bg-slate-200">
              <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: step >= 4 ? '100%' : '0%' }} />
            </div>

            <div className={`flex items-center gap-2 font-bold ${step >= 4 ? 'text-emerald-600' : 'text-slate-400'}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${step >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>
                4
              </span>
              <span>Duyệt</span>
            </div>
          </div>
        </Card>

        {/* Main Step Card */}
        <Card className="p-6 border border-slate-200 shadow-sm bg-white rounded-2xl">
          {/* STEP 1: Personal & Account */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-800 border-b border-line pb-2 flex items-center gap-2">
                <User size={16} className="text-brand-600" />
                1. Thông tin cá nhân & Tài khoản
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-navy-800 mb-1">
                    Họ và tên giáo viên *
                  </label>
                  <Input
                    placeholder="VD: Hoàng Thị Mai"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-800 mb-1">
                    Địa chỉ Email đăng ký *
                  </label>
                  <Input
                    type="email"
                    placeholder="mai.ht@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-800 mb-1">
                    Số điện thoại liên hệ *
                  </label>
                  <Input
                    placeholder="0981 234 567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-navy-800 mb-1">
                    Số CCCD / CMND *
                  </label>
                  <Input
                    placeholder="VD: 001198005432"
                    value={formData.identityCard}
                    onChange={(e) => setFormData({ ...formData, identityCard: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-800 mb-1">
                    Mật khẩu khởi tạo *
                  </label>
                  <Input
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-800 mb-1">
                    Xác nhận mật khẩu *
                  </label>
                  <Input
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-line">
                <Link to="/dang-nhap" className="text-xs font-semibold text-slate-500 hover:underline">
                  ← Đã có tài khoản? Đăng nhập
                </Link>
                <Button type="submit" className="bg-navy-800 hover:bg-navy-900 text-white font-semibold">
                  Tiếp theo: Chuyên môn →
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: Qualifications */}
          {step === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-800 border-b border-line pb-2 flex items-center gap-2">
                <Award size={16} className="text-brand-600" />
                2. Trình độ chuyên môn & Chứng chỉ
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-800 mb-1">
                    Trình độ học vấn cao nhất *
                  </label>
                  <select
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="Cử nhân Sư phạm Tiếng Anh">Cử nhân Sư phạm Tiếng Anh</option>
                    <option value="Cử nhân Ngôn ngữ Anh">Cử nhân Ngôn ngữ Anh</option>
                    <option value="Thạc sĩ Ngôn ngữ Anh / Applied Linguistics">Thạc sĩ Ngôn ngữ Anh / TESOL</option>
                    <option value="Tiến sĩ Ngôn ngữ Anh">Tiến sĩ Ngôn ngữ Anh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-800 mb-1">
                    Chứng chỉ Tiếng Anh cao nhất *
                  </label>
                  <select
                    value={formData.certificateType}
                    onChange={(e) => setFormData({ ...formData, certificateType: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="IELTS Academic 8.0+">IELTS Academic 8.0+</option>
                    <option value="IELTS Academic 7.5">IELTS Academic 7.5</option>
                    <option value="TOEIC 900+ / 990">TOEIC 900+ / 990</option>
                    <option value="Chứng chỉ TESOL / CELTA / DELTA">TESOL / CELTA / DELTA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-800 mb-1">
                    Số năm kinh nghiệm giảng dạy *
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={40}
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-800 mb-1">
                    Lĩnh vực chuyên môn chính *
                  </label>
                  <Input
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="VD: IELTS Writing & Speaking, TOEIC 4 kỹ năng..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-line">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                  ← Quay lại
                </Button>
                <Button type="submit" className="bg-navy-800 hover:bg-navy-900 text-white font-semibold">
                  Tiếp theo: Tải file minh chứng →
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: Mandatory Proof File Uploads */}
          {step === 3 && (
            <form onSubmit={handleSubmitRegistration} className="space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-800 border-b border-line pb-2 flex items-center gap-2">
                <Upload size={16} className="text-brand-600" />
                3. Tải lên tệp minh chứng bắt buộc (Required Proof Files)
              </h3>

              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong>Yêu cầu đối soát:</strong> Quản trị viên SmartEnglish AI sẽ đối chiếu tệp minh chứng bằng cấp & CCCD gốc của bạn trước khi phê duyệt tài khoản Giáo Viên.
                </div>
              </div>

              {/* Upload 1: Degree / Certificate */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-navy-800">
                  1. Tệp Bằng cấp Đại học / Chứng chỉ Tiếng Anh (IELTS/TOEIC/TESOL) *
                </label>
                <div
                  onClick={() =>
                    setDegreeFile({ name: 'Bang_Dai_Hoc_Va_IELTS_8.5.pdf', size: '3.2 MB' })
                  }
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                    degreeFile ? 'border-brand-500 bg-brand-50/40' : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {degreeFile ? (
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-bold text-brand-700">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        {degreeFile.name} ({degreeFile.size})
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDegreeFile(null)
                        }}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 space-y-1">
                      <Upload size={22} className="mx-auto text-brand-600" />
                      <p className="font-semibold text-slate-800">Nhấp để chọn file minh chứng bằng cấp</p>
                      <p className="text-[11px] text-slate-400">Định dạng .PDF, .JPG, .PNG (Tối đa 15MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload 2: Identity Card (CCCD) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-navy-800">
                  2. Ảnh CCCD / CMND mặt trước & mặt sau *
                </label>
                <div
                  onClick={() =>
                    setIdentityFile({ name: 'CCCD_Mat_Truoc_Mat_Sau_XacThuc.jpg', size: '2.1 MB' })
                  }
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                    identityFile ? 'border-brand-500 bg-brand-50/40' : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {identityFile ? (
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-bold text-brand-700">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        {identityFile.name} ({identityFile.size})
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIdentityFile(null)
                        }}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 space-y-1">
                      <CreditCard size={22} className="mx-auto text-brand-600" />
                      <p className="font-semibold text-slate-800">Nhấp để chọn ảnh CCCD 2 mặt</p>
                      <p className="text-[11px] text-slate-400">Định dạng .JPG, .PNG, .PDF (Tối đa 10MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload 3: Optional CV */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600">
                  3. Sơ yếu lý lịch / CV Giảng dạy (Tùy chọn)
                </label>
                <div
                  onClick={() =>
                    setCvFile({ name: 'CV_Giang_Day_HoangMai.pdf', size: '1.5 MB' })
                  }
                  className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors ${
                    cvFile ? 'border-brand-500 bg-brand-50/40' : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {cvFile ? (
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-semibold text-slate-800">
                        <FileText size={15} />
                        {cvFile.name} ({cvFile.size})
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCvFile(null)
                        }}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Nhấp để tải lên CV giảng dạy (.PDF / .DOCX)</p>
                  )}
                </div>
              </div>

              {/* Agreement checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-navy-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>
                    Tôi cam kết toàn bộ thông tin cá nhân và tệp bằng cấp minh chứng cung cấp là chính xác và hoàn toàn chịu trách nhiệm trước pháp luật.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-line">
                <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                  ← Quay lại
                </Button>
                <Button
                  type="submit"
                  disabled={!degreeFile || !identityFile || !agreed}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Gửi hồ sơ đăng ký
                </Button>
              </div>
            </form>
          )}

          {/* STEP 4: Success State */}
          {step === 4 && (
            <div className="py-8 text-center space-y-5">
              <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-navy-800">
                  Hồ Sơ Đăng Ký Đã Được Gửi Thành Công!
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
                  Cảm ơn bạn đã đăng ký làm Giáo viên tại <strong>SmartEnglish AI</strong>. Hồ sơ và tệp minh chứng bằng cấp của bạn đã được gửi tới Ban Quản Trị để xác minh.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Giáo viên:</span>
                  <span className="font-bold text-slate-900">{formData.fullName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-800">{formData.email}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Chứng chỉ minh chứng:</span>
                  <span className="font-bold text-brand-600">{formData.certificateType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trạng thái:</span>
                  <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Chờ Admin duyệt (Trong 24h)
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <Button
                  onClick={() => navigate('/dang-nhap')}
                  className="bg-navy-800 hover:bg-navy-900 text-white font-semibold"
                >
                  Quay lại màn hình Đăng Nhập
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
