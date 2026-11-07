import { Bell, Layers, Mail, Send, Smartphone, User } from 'lucide-react'
import Drawer from '@/components/ui/Drawer'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { cn } from '@/lib/utils'

export default function CreateNotificationDrawer({
  isOpen,
  onClose,
  onSubmit,
  title,
  setTitle,
  content,
  setContent,
  type,
  setType,
  channel,
  setChannel,
  userEmail,
  setUserEmail,
  targetGroup,
  setTargetGroup,
  selectedUserId,
  setSelectedUserId,
  userList = [],
  isScheduled,
  setIsScheduled,
  scheduleTime,
  setScheduleTime,
}) {
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Tạo Thông Báo Mới"
      className="max-w-[500px]"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
            Tiêu đề thông báo *
          </label>
          <Input
            placeholder="VD: Nhắc nhở nộp bài tập Speaking Unit 4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 font-semibold text-sm"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
            Nội dung chi tiết *
          </label>
          <textarea
            rows={4}
            placeholder="Nhập nội dung thông báo gửi tới học viên hoặc người dùng..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-canvas p-3 text-sm focus:border-brand-500 focus:outline-none"
            required
          />
        </div>

        {/* Kênh phát thông báo */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
            Kênh phát thông báo
          </label>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            {[
              { id: 'ALL', label: 'Tất cả (Đa kênh)', icon: Layers },
              { id: 'IN_APP', label: 'Web In-App (Chuông)', icon: Bell },
              { id: 'EMAIL', label: 'Email HTML', icon: Mail },
              { id: 'PUSH', label: 'Mobile Push', icon: Smartphone },
            ].map((c) => {
              const IconComponent = c.icon
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChannel(c.id)}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer',
                    channel === c.id
                      ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500'
                      : 'border-line bg-white hover:bg-slate-50 text-slate-700',
                  )}
                >
                  <IconComponent size={14} className={channel === c.id ? 'text-brand-600' : 'text-slate-400'} />
                  <span>{c.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Nếu chọn Email hoặc ALL: Hiển thị trường email nhận */}
        {(channel === 'EMAIL' || channel === 'ALL') && (
          <div className="rounded-xl border border-line p-3 bg-amber-50/40 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-amber-900 flex items-center gap-1.5">
              <Mail size={13} />
              Địa chỉ email người nhận (Thử nghiệm template HTML)
            </label>
            <Input
              type="email"
              placeholder="VD: student@smartenglish.edu.vn"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="text-xs"
            />
            <p className="text-[11px] text-amber-800">
              Hệ thống sẽ render email HTML chuẩn thương hiệu SmartEnglish kèm nút bấm hành động.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Loại thông báo
            </label>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 text-sm font-medium"
            >
              <option value="info">Thông tin chung</option>
              <option value="critical">Khẩn cấp / Quan trọng</option>
              <option value="homework_reminder">Nhắc bài tập về nhà</option>
              <option value="payment_receipt">Biên lai thanh toán</option>
              <option value="welcome">Chào mừng tài khoản mới</option>
            </Select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Đối tượng nhận
            </label>
            <Select
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              className="mt-1 text-sm font-medium"
            >
              <option value="All Users">Toàn bộ người dùng</option>
              <option value="Students">Tất cả Học viên</option>
              <option value="Teachers">Tất cả Giáo viên</option>
              <option value="Specific">Người dùng cụ thể (Đích danh)</option>
            </Select>
          </div>
        </div>

        {targetGroup === 'Specific' && (
          <div className="rounded-xl border border-line p-3 bg-slate-50/70 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
              <User size={13} className="text-brand-600" />
              Chọn người nhận cụ thể *
            </label>
            <Select
              value={selectedUserId}
              onChange={(e) => {
                const uid = e.target.value ? Number(e.target.value) : ''
                setSelectedUserId(uid)
                const found = userList.find((u) => u.id === uid)
                if (found?.email) {
                  setUserEmail(found.email)
                }
              }}
              size="sm"
              options={[
                { value: '', label: '-- Chọn học viên hoặc giáo viên --' },
                ...userList.map((u) => ({
                  value: u.id,
                  label: `${u.displayName || u.username || 'User'} (${u.email}) - #${u.id} [${u.role?.toUpperCase()}]`,
                })),
              ]}
            />
            <p className="text-[11px] text-slate-500">
              Thông báo sẽ gửi đích danh tới tài khoản này (kèm email nếu chọn kênh Email/Đa kênh).
            </p>
          </div>
        )}

        {/* Lên lịch gửi trong lịch */}
        <div className="rounded-xl border border-line p-3 space-y-2 bg-slate-50/50">
          <label className="flex items-center gap-2 text-sm font-semibold text-navy-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              className="rounded border-line text-brand-500 focus:ring-brand-500"
            />
            Lên lịch gửi thông báo / Đặt trong lịch
          </label>

          {isScheduled && (
            <div className="space-y-1">
              <Input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="text-sm mt-1"
                required={isScheduled}
              />
              <p className="text-[11px] text-ink-muted">
                Đồng bộ vào lịch giảng viên và tự động quét gửi theo chu kỳ.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t border-line">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button type="submit" variant="primary" fullWidth icon={Send}>
            {isScheduled ? 'Lên lịch gửi vào lịch' : 'Phát thông báo ngay'}
          </Button>
        </div>
      </form>
    </Drawer>
  )
}

