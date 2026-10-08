import Switch from '@/components/ui/Switch'
import Select from '@/components/ui/Select'

export default function TeacherTeachingTab({ settings, onUpdateField }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-3">
        <h3 className="text-base font-bold text-navy-800">Cài đặt Lớp học & Giảng dạy</h3>
        <p className="text-xs text-ink-muted mt-0.5">
          Quản lý cơ chế tham gia lớp học, nộp bài tập và tiêu chuẩn đánh giá học viên.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-line p-4 bg-slate-50/50">
          <div>
            <p className="text-xs font-bold text-navy-800">
              Cho phép học viên tham gia bằng Mã PIN
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Học viên có thể nhập mã lớp để gửi yêu cầu vào lớp học của bạn trên ứng dụng mobile.
            </p>
          </div>
          <Switch
            checked={settings.teaching.allowJoinByPin}
            onChange={(checked) => onUpdateField('teaching', 'allowJoinByPin', checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-line p-4 bg-slate-50/50">
          <div>
            <p className="text-xs font-bold text-navy-800">
              Tự động phê duyệt học viên vào lớp
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Nếu bật, học viên sẽ được vào lớp ngay lập tức mà không cần bạn phải bấm duyệt thủ công.
            </p>
          </div>
          <Switch
            checked={settings.teaching.autoApproveStudents}
            onChange={(checked) => onUpdateField('teaching', 'autoApproveStudents', checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-line p-4 bg-slate-50/50">
          <div>
            <p className="text-xs font-bold text-navy-800">
              Cho phép nộp bài tập quá hạn (Late Submission)
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Học viên vẫn có thể nộp bài sau deadline (hệ thống sẽ gắn cờ đánh dấu nộp muộn).
            </p>
          </div>
          <Switch
            checked={settings.teaching.allowLateSubmissions}
            onChange={(checked) => onUpdateField('teaching', 'allowLateSubmissions', checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-line p-4 bg-slate-50/50">
          <div>
            <p className="text-xs font-bold text-navy-800">
              Tự động gửi lời nhắc hạn nộp bài trước 24 giờ
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Hệ thống tự động gửi thông báo nhắc nhở các học viên chưa hoàn thành bài tập.
            </p>
          </div>
          <Switch
            checked={settings.teaching.autoSendDeadlineReminder}
            onChange={(checked) => onUpdateField('teaching', 'autoSendDeadlineReminder', checked)}
          />
        </div>

        <div className="pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Ngưỡng điểm đạt tối thiểu mặc định (%)
          </label>
          <Select
            value={settings.teaching.defaultPassingScore}
            onChange={(e) => onUpdateField('teaching', 'defaultPassingScore', Number(e.target.value))}
            className="max-w-xs text-xs font-semibold"
          >
            <option value={50}>50% (Mức cơ bản)</option>
            <option value={60}>60% (Trung bình khá)</option>
            <option value={70}>70% (Mức chuẩn khuyên dùng)</option>
            <option value={80}>80% (Mức giỏi)</option>
          </Select>
        </div>
      </div>
    </div>
  )
}
