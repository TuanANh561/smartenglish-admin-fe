import { useState, useEffect } from 'react'
import {
  Bell,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { cn } from '@/lib/utils'

const INITIAL_SCHEDULED = [
  {
    id: 'sch-1',
    title: 'Nhắc nhở nộp bài tập Viết Unit 4',
    target: 'Lớp IELTS 6.5 — Tối T3, T5',
    date: '2026-08-20',
    time: '09:00',
    type: 'class',
    content: 'Hạn chót nộp bài essay Task 2 vào 23:59 ngày mai. Các bạn nhớ hoàn thành đúng hạn nhé!',
    status: 'pending',
  },
  {
    id: 'sch-2',
    title: 'Lịch thi thử trắc nghiệm Ngữ pháp tuần 3',
    target: 'Tất cả học viên',
    date: '2026-08-22',
    time: '14:30',
    type: 'exam',
    content: 'Bài kiểm tra trắc nghiệm 30 câu chuẩn CEFR B1 sẽ mở vào 14:30 thứ Bảy tuần này.',
    status: 'pending',
  },
  {
    id: 'sch-3',
    title: 'Cập nhật bài học phát âm âm Schwa /ə/',
    target: 'Lớp Tiếng Anh Giao Tiếp',
    date: '2026-08-25',
    time: '08:00',
    type: 'lesson',
    content: 'Bài học mới đã được đăng tải kèm bài tập thu âm giọng nói chấm điểm AI.',
    status: 'pending',
  },
]

const STORAGE_KEY = 'smartenglish_scheduled_reminders'

function ScheduleNotificationModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('create') // 'create' | 'list'
  const [scheduledList, setScheduledList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULED
    } catch {
      return INITIAL_SCHEDULED
    }
  })

  // Form state
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('Lớp IELTS 6.5 — Tối T3, T5')
  const [date, setDate] = useState('2026-08-21')
  const [time, setTime] = useState('09:00')
  const [type, setType] = useState('class')
  const [content, setContent] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scheduledList))
    } catch {
      // ignore
    }
  }, [scheduledList])

  const handleCreate = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề thông báo')
      return
    }

    const newItem = {
      id: `sch-${Date.now()}`,
      title: title.trim(),
      target,
      date,
      time,
      type,
      content: content.trim(),
      status: 'pending',
    }

    setScheduledList([newItem, ...scheduledList])
    toast.success(`Đã lên lịch thông báo thành công cho ngày ${date}!`)

    // Reset form
    setTitle('')
    setContent('')
    setActiveTab('list')
  }

  const handleDelete = (id) => {
    setScheduledList(scheduledList.filter((item) => item.id !== id))
    toast.success('Đã hủy lịch thông báo')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lên lịch Thông báo & Nhắc nhở"
      description="Đặt lịch phát thông báo tự động tới học viên hoặc lớp học theo ngày giờ xác định."
      size="lg"
    >
      <div className="space-y-4">
        {/* ── Tabs chuyển đổi ──────────────────────────────────────────────── */}
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer',
              activeTab === 'create'
                ? 'bg-white text-brand-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            <Plus size={14} />
            <span>Đặt lịch mới</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer',
              activeTab === 'list'
                ? 'bg-white text-brand-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            <CalendarIcon size={14} />
            <span>Danh sách đã đặt ({scheduledList.length})</span>
          </button>
        </div>

        {/* ── Tab 1: Form tạo lịch ─────────────────────────────────────────── */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreate} className="space-y-3.5 pt-1">
            <Input
              label="Tiêu đề thông báo / nhắc nhở"
              placeholder="VD: Nhắc nhở nộp bài tập Unit 4, Lịch thi thử..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Đối tượng nhận thông báo"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                options={[
                  { value: 'Lớp IELTS 6.5 — Tối T3, T5', label: 'Lớp IELTS 6.5 — Tối T3, T5' },
                  { value: 'Lớp TOEIC Intensive — Sáng CN', label: 'Lớp TOEIC Intensive — Sáng CN' },
                  { value: 'Lớp Tiếng Anh Giao Tiếp B1', label: 'Lớp Tiếng Anh Giao Tiếp B1' },
                  { value: 'Tất cả học viên', label: 'Tất cả học viên trên hệ thống' },
                  { value: 'Chỉ nhắc nhở giáo viên', label: 'Chỉ nhắc nhở riêng cho tôi' },
                ]}
              />

              <Select
                label="Loại thông báo"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={[
                  { value: 'class', label: '📢 Thông báo lớp học & Bài tập' },
                  { value: 'exam', label: '📝 Lịch thi & Kiểm tra định kỳ' },
                  { value: 'lesson', label: '📘 Cập nhật học liệu mới' },
                  { value: 'system', label: '🔔 Thông báo chung hệ thống' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày phát thông báo
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Giờ phát (24h)
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nội dung chi tiết (Tùy chọn)
              </label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung hướng dẫn hoặc ghi chú đính kèm..."
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="secondary" size="sm" onClick={onClose}>
                Đóng
              </Button>
              <Button type="submit" size="sm" icon={Clock}>
                Lên lịch thông báo
              </Button>
            </div>
          </form>
        )}

        {/* ── Tab 2: Danh sách lịch đã đặt ───────────────────────────────── */}
        {activeTab === 'list' && (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {scheduledList.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Chưa có lịch thông báo nào được đặt.
              </div>
            ) : (
              scheduledList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-brand-300 transition-all"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 border border-brand-100">
                      <Clock size={15} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900">{item.title}</h4>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.2 text-[10px] font-semibold text-amber-700 border border-amber-200">
                          Chờ phát
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {item.target} • <strong className="text-slate-700">{item.date} lúc {item.time}</strong>
                      </p>
                      {item.content && (
                        <p className="mt-1 text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          {item.content}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                    title="Hủy lịch này"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ScheduleNotificationModal
