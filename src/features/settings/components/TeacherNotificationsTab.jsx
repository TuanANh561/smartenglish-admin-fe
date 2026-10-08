import Switch from '@/components/ui/Switch'

export default function TeacherNotificationsTab({ settings, onUpdateField }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-3">
        <h3 className="text-base font-bold text-navy-800">Thông báo & Nhắc nhở</h3>
        <p className="text-xs text-ink-muted mt-0.5">
          Tùy chọn cách thức và kênh nhận thông báo về hoạt động học tập của học viên.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-line p-4 bg-slate-50/50">
          <div>
            <p className="text-xs font-bold text-navy-800">
              Thông báo khi có học viên mới tham gia lớp
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Gửi thông báo đẩy và email khi học viên gửi yêu cầu hoặc tham gia lớp.
            </p>
          </div>
          <Switch
            checked={settings.notifications.notifyNewStudentJoin}
            onChange={(checked) => onUpdateField('notifications', 'notifyNewStudentJoin', checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-line p-4 bg-slate-50/50">
          <div>
            <p className="text-xs font-bold text-navy-800">
              Thông báo khi học viên nộp bài tập / làm bài thi
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Nhận chuông thông báo trên web ngay khi bài tập được gửi để chấm điểm kịp thời.
            </p>
          </div>
          <Switch
            checked={settings.notifications.notifyAssignmentSubmitted}
            onChange={(checked) =>
              onUpdateField('notifications', 'notifyAssignmentSubmitted', checked)
            }
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-line p-4 bg-slate-50/50">
          <div>
            <p className="text-xs font-bold text-navy-800">
              Báo cáo tổng kết tiến độ hàng tuần
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Nhận email tổng hợp tình hình chuyên cần và điểm số trung bình của các lớp vào sáng thứ Hai.
            </p>
          </div>
          <Switch
            checked={settings.notifications.weeklyProgressDigest}
            onChange={(checked) =>
              onUpdateField('notifications', 'weeklyProgressDigest', checked)
            }
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-line p-4 bg-slate-50/50">
          <div>
            <p className="text-xs font-bold text-navy-800">
              Bật âm thanh chuông thông báo trên trang web
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Phát âm thanh nhẹ khi có tin nhắn hoặc thông báo lớp học mới.
            </p>
          </div>
          <Switch
            checked={settings.notifications.playNotificationSound}
            onChange={(checked) =>
              onUpdateField('notifications', 'playNotificationSound', checked)
            }
          />
        </div>
      </div>
    </div>
  )
}
