import { useEffect, useState } from 'react'
import { BookOpen, Calendar, CheckCircle2, GraduationCap, Loader2, Send, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { createAssignment } from '@/features/classes/classApi'
import { getMyClasses } from '@/features/dashboard/teacherDashboardApi'
import { useAuthStore } from '@/store/authStore'

/**
 * Modal Giao Đề Thi / Bài Kiểm Tra Đến Lớp Học Cho Giáo Viên
 */
export default function AssignExamToClassModal({ isOpen, onClose, exam }) {
  const user = useAuthStore((s) => s.user)
  const [classes, setClasses] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [passingScore, setPassingScore] = useState(exam?.passingScore || 5.0)
  const [instructions, setInstructions] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    // Set default due date: 7 ngày tới
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    nextWeek.setHours(23, 59, 0, 0)
    const localIso = new Date(nextWeek.getTime() - nextWeek.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    setDueDate(localIso)

    setInstructions(
      `Yêu cầu học viên hoàn thành bài kiểm tra "${exam?.title || ''}". Thời gian làm bài: ${
        exam?.durationMinutes || 45
      } phút. Đạt từ ${exam?.passingScore || 5.0} điểm trở lên.`
    )

    // Tải danh sách lớp học - Chỉ lấy các lớp do chính giáo viên này tạo/phụ trách
    const fetchClasses = async () => {
      setLoadingClasses(true)
      try {
        const res = await getMyClasses({ teacherId: user?.id })
        const classList = res?.classes || []
        // Lọc cách ly: Giáo viên chỉ được giao bài cho lớp do mình phụ trách
        const myClassesOnly = classList.filter((c) => {
          if (!user || user.role === 'admin') return true
          const isMyId = c.teacherId != null && user.id != null && String(c.teacherId) === String(user.id)
          const isMyEmail = c.teacherEmail && user.email && c.teacherEmail.toLowerCase() === user.email.toLowerCase()
          return isMyId || isMyEmail
        })
        setClasses(myClassesOnly)
        if (myClassesOnly.length > 0) {
          setSelectedClassId(myClassesOnly[0].id)
        } else {
          setSelectedClassId('')
        }
      } catch (err) {
        console.warn('Lỗi khi tải danh sách lớp học:', err)
        toast.error('Không thể lấy danh sách lớp học')
      } finally {
        setLoadingClasses(false)
      }
    }
    fetchClasses()
  }, [isOpen, exam, user])

  if (!isOpen || !exam) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedClassId) {
      toast.error('Vui lòng chọn lớp học để giao bài thi')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        title: `[Bài thi] ${exam.title}`,
        assignmentType: 'QUIZ',
        referenceId: exam.id,
        instructions: instructions.trim() || `Hoàn thành bài thi ID #${exam.id}`,
        dueDate: dueDate ? `${dueDate}:00Z` : null,
        passingScore: Number(passingScore) || 5.0,
        isGraded: true,
      }

      await createAssignment(selectedClassId, payload, { teacherId: user?.id })
      const targetClass = classes.find((c) => String(c.id) === String(selectedClassId))
      toast.success(
        `Đã giao bài thi "${exam.title}" cho lớp "${targetClass?.name || 'đã chọn'}" thành công!`
      )
      onClose()
    } catch (err) {
      console.error('Lỗi khi giao bài thi:', err)
      toast.error(err?.message || 'Không thể giao bài thi đến lớp học')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Send size={18} />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Giao Bài Thi Đến Lớp Học</h3>
              <p className="text-xs text-slate-500">Tạo bài tập kiểm tra đánh giá cho học viên</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Thông tin đề thi tóm tắt */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 flex items-center justify-between">
            <div className="min-w-0 pr-3">
              <p className="text-[11px] font-bold text-brand-600 uppercase tracking-wide">
                Đề thi được chọn
              </p>
              <h4 className="font-bold text-sm text-slate-900 truncate mt-0.5">{exam.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {exam.category || 'Tổng hợp'} • {exam.durationMinutes || 60} phút • Cấp độ {exam.cefrLevel || 'B1'}
              </p>
            </div>
            <span className="shrink-0 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs px-2.5 py-1 border border-emerald-200">
              {exam.totalQuestions || 20} câu
            </span>
          </div>

          {/* Chọn Lớp học */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Chọn Lớp Học Của Bạn <span className="text-red-500">*</span>
            </label>
            {loadingClasses ? (
              <div className="flex items-center gap-2 py-2 text-xs text-slate-500">
                <Loader2 size={15} className="animate-spin text-brand-500" /> Đang tải danh sách lớp...
              </div>
            ) : classes.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                Bạn chưa phụ trách lớp học nào. Vui lòng tạo lớp học trước khi giao bài thi.
              </div>
            ) : (
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-brand-500 focus:outline-none shadow-2xs cursor-pointer"
                required
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.totalStudents || 0} học viên • {cls.cefrTarget || 'B1'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Hạn nộp bài & Điểm đạt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Calendar size={13} className="text-slate-500" />
                Hạn chót nộp bài
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-brand-500 focus:outline-none shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <CheckCircle2 size={13} className="text-slate-500" />
                Điểm đạt yêu cầu (Thang 10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-brand-500 focus:outline-none shadow-2xs"
                required
              />
            </div>
          </div>

          {/* Hướng dẫn & Dặn dò học viên */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Dặn dò / Hướng dẫn học viên làm bài
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Nhập ghi chú hoặc nhắc nhở trước khi làm bài..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none shadow-2xs resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button size="sm" variant="secondary" onClick={onClose} type="button">
              Hủy
            </Button>
            <button
              type="submit"
              disabled={isSubmitting || classes.length === 0}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Đang giao bài...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Xác nhận giao bài</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
