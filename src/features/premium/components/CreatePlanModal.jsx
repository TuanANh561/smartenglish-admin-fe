import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import CurrencyInput from './CurrencyInput'

export default function CreatePlanModal({ open, onClose, target = 'teacher', onCreatePlan }) {
  const isTeacher = target === 'teacher'

  // Common fields
  const [name, setName] = useState('')
  const [badge, setBadge] = useState('')

  // Teacher specific
  const [priceMonthly, setPriceMonthly] = useState(199000)
  const [priceYearly, setPriceYearly] = useState(1990000)
  const [maxClasses, setMaxClasses] = useState(5)
  const [maxStudents, setMaxStudents] = useState(100)
  const [aiQuotaMonthly, setAiQuotaMonthly] = useState(100)

  // Student specific
  const [durationMonths, setDurationMonths] = useState(1)
  const [studentPrice, setStudentPrice] = useState(99000)
  const [dailyAiChat, setDailyAiChat] = useState(20)
  const [dailyAiSpeaking, setDailyAiSpeaking] = useState(15)
  const [weeklyAiWriting, setWeeklyAiWriting] = useState(3)
  const [dailyAiScan, setDailyAiScan] = useState(10)
  const [studentMaxClasses, setStudentMaxClasses] = useState(5)

  const [error, setError] = useState('')

  const handleReset = () => {
    setName('')
    setBadge('')
    setError('')
    setPriceMonthly(199000)
    setPriceYearly(1990000)
    setMaxClasses(5)
    setMaxStudents(100)
    setAiQuotaMonthly(100)
    setDurationMonths(1)
    setStudentPrice(99000)
    setDailyAiChat(20)
    setDailyAiSpeaking(15)
    setWeeklyAiWriting(3)
    setDailyAiScan(10)
    setStudentMaxClasses(5)
  }

  const handleClose = () => {
    handleReset()
    onClose?.()
  }

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!name.trim()) {
      setError('Vui lòng nhập tên gói')
      return
    }

    if (isTeacher) {
      const planData = {
        name: name.trim(),
        badge: badge.trim(),
        target: 'teacher',
        priceMonthly: Number(priceMonthly) || 0,
        priceYearly: Number(priceYearly) || 0,
        maxClasses: Number(maxClasses) || 1,
        maxStudents: Number(maxStudents) || 10,
        aiQuotaMonthly: Number(aiQuotaMonthly) || 20,
        isPopular: false,
        isActive: true,
        features: [
          { key: 'classes', label: `Tối đa ${maxClasses} lớp học`, enabled: true },
          { key: 'students', label: `Tối đa ${maxStudents} học viên`, enabled: true },
          { key: 'ai_content', label: `${aiQuotaMonthly} bài học AI / tháng`, enabled: true },
        ],
      }
      onCreatePlan(planData)
    } else {
      const isYearly = durationMonths >= 12
      const isLifetime = durationMonths === 999
      const planData = {
        name: name.trim(),
        badge: badge.trim(),
        target: 'student',
        durationMonths: Number(durationMonths) || 1,
        priceMonthly: isYearly || isLifetime ? 0 : Number(studentPrice) || 0,
        priceYearly: isYearly || isLifetime ? Number(studentPrice) || 0 : 0,
        dailyAiChat: Number(dailyAiChat) || 15,
        dailyAiSpeaking: Number(dailyAiSpeaking) || 10,
        weeklyAiWriting: Number(weeklyAiWriting) || 2,
        dailyAiScan: Number(dailyAiScan) || 5,
        maxClasses: Number(studentMaxClasses) || 3,
        isPopular: false,
        isActive: true,
        features: [
          { key: 'chat', label: 'AI Chatbot hội thoại thông minh', enabled: true },
          { key: 'speaking', label: 'Luyện nói & Chấm phát âm IPA', enabled: true },
          { key: 'writing', label: 'Chấm viết luận Writing', enabled: true },
          { key: 'scan', label: 'Quét ảnh giải bài tập AI', enabled: true },
        ],
      }
      onCreatePlan(planData)
    }

    handleClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isTeacher ? 'Thêm gói giáo viên' : 'Thêm gói học viên'}
      className="max-w-md w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-slate-800">
        {/* Tên gói & Huy hiệu */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="col-span-2 sm:col-span-1">
            <label className="font-semibold text-slate-700 block mb-1">
              Tên gói <span className="text-rose-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError('')
              }}
              placeholder={isTeacher ? 'VD: Teacher Pro' : 'VD: Học Viên Nâng Cao'}
              className="font-semibold text-navy-800"
              autoFocus
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="font-semibold text-slate-700 block mb-1">Huy hiệu</label>
            <Input
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="VD: Tiết kiệm 37%"
            />
          </div>
        </div>

        {/* Giá bán */}
        {isTeacher ? (
          <div className="grid grid-cols-2 gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Giá / tháng (đ)</label>
              <CurrencyInput
                value={priceMonthly}
                onChange={setPriceMonthly}
                className="font-bold text-navy-800"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Giá / năm (đ)</label>
              <CurrencyInput
                value={priceYearly}
                onChange={setPriceYearly}
                className="font-bold text-navy-800"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Thời hạn</label>
              <Select
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                size="sm"
                options={[
                  { value: 1, label: '1 tháng' },
                  { value: 3, label: '3 tháng' },
                  { value: 6, label: '6 tháng' },
                  { value: 12, label: '12 tháng (Năm)' },
                  { value: 999, label: 'Trọn đời (Lifetime)' },
                ]}
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Giá bán (đ)</label>
              <CurrencyInput
                value={studentPrice}
                onChange={setStudentPrice}
                className="font-bold text-navy-800"
              />
            </div>
          </div>
        )}

        {/* Hạn mức tài nguyên */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
            {isTeacher ? 'Hạn mức tài nguyên' : 'Hạn mức AI'}
          </span>
          {isTeacher ? (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">Lớp tối đa</span>
                <Input
                  type="number"
                  value={maxClasses}
                  onChange={(e) => setMaxClasses(Number(e.target.value))}
                  className="font-semibold text-navy-800 h-8"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">Học viên</span>
                <Input
                  type="number"
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(Number(e.target.value))}
                  className="font-semibold text-navy-800 h-8"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">AI / tháng</span>
                <Input
                  type="number"
                  value={aiQuotaMonthly}
                  onChange={(e) => setAiQuotaMonthly(Number(e.target.value))}
                  className="font-semibold text-navy-800 h-8"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">Chat AI / ngày</span>
                <Input
                  type="number"
                  value={dailyAiChat}
                  onChange={(e) => setDailyAiChat(Number(e.target.value))}
                  className="font-semibold text-navy-800 h-8"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">Luyện nói / ngày</span>
                <Input
                  type="number"
                  value={dailyAiSpeaking}
                  onChange={(e) => setDailyAiSpeaking(Number(e.target.value))}
                  className="font-semibold text-navy-800 h-8"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">Viết luận / tuần</span>
                <Input
                  type="number"
                  value={weeklyAiWriting}
                  onChange={(e) => setWeeklyAiWriting(Number(e.target.value))}
                  className="font-semibold text-navy-800 h-8"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">Quét bài / ngày</span>
                <Input
                  type="number"
                  value={dailyAiScan}
                  onChange={(e) => setDailyAiScan(Number(e.target.value))}
                  className="font-semibold text-navy-800 h-8"
                />
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="ghost" size="sm" type="button" onClick={handleClose}>
            Hủy
          </Button>
          <Button size="sm" type="submit">
            Thêm gói
          </Button>
        </div>
      </form>
    </Modal>
  )
}

