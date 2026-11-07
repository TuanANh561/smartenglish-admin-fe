import Card from '@/components/ui/Card'

export default function AiQuotaPolicyCard({ quotas, onChangeQuota }) {
  if (!quotas) return null

  return (
    <Card className="p-6 space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Hạn ngạch AI & Chính sách Tiết kiệm Chi phí</span>
            <span className="rounded-full bg-slate-100 text-slate-700 text-[11px] px-2.5 py-0.5 font-bold">
              Hạn ngạch 24 Giờ
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Kiểm soát số lượt gọi AI hàng ngày cho từng phân hạng tài khoản nhằm đảm bảo hiệu năng và tối ưu chi phí vận hành.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Tier 1: Free User */}
        <div className="rounded-2xl border border-slate-200 p-5 bg-white shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Học viên Miễn phí</h4>
              <span className="text-[11px] text-slate-400">Tài khoản Standard (Free)</span>
            </div>
            <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[10px] font-bold">
              Cơ bản
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Hội thoại Trợ lý AI:</span>
                <span className="font-bold text-slate-800 font-mono">{quotas.freeUserChatLimitPerDay} tin/ngày</span>
              </div>
              <input
                type="number"
                value={quotas.freeUserChatLimitPerDay}
                onChange={(e) => onChangeQuota('freeUserChatLimitPerDay', parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-brand-400 bg-slate-50/50"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Lượt chấm phát âm:</span>
                <span className="font-bold text-slate-800 font-mono">{quotas.freeUserSpeakingLimitPerDay} lần/ngày</span>
              </div>
              <input
                type="number"
                value={quotas.freeUserSpeakingLimitPerDay}
                onChange={(e) => onChangeQuota('freeUserSpeakingLimitPerDay', parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-brand-400 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Tự động làm mới hạn ngạch vào 00:00 hàng ngày.
          </div>
        </div>

        {/* Tier 2: Premium User */}
        <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-b from-amber-50/30 to-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Học viên Premium</h4>
              <span className="text-[11px] text-amber-700 font-medium">Gói Pro / VIP Student</span>
            </div>
            <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-bold border border-amber-200">
              Không giới hạn
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Hội thoại Trợ lý AI:</span>
                <span className="font-bold text-emerald-600 font-mono">Không giới hạn</span>
              </div>
              <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50/40 px-3 py-2 text-xs text-emerald-800 font-semibold">
                ✓ Không áp dụng hạn ngạch
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Luyện nói AI & Phân tích âm:</span>
                <span className="font-bold text-emerald-600 font-mono">Không giới hạn</span>
              </div>
              <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50/40 px-3 py-2 text-xs text-emerald-800 font-semibold">
                ✓ Chấm điểm không giới hạn
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-amber-200/60 text-[11px] text-amber-800/80">
            Được ưu tiên băng thông phản hồi nhanh nhất và mô hình chất lượng cao.
          </div>
        </div>

        {/* Tier 3: Teacher */}
        <div className="rounded-2xl border border-slate-200 p-5 bg-white shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Giảng viên (Teacher)</h4>
              <span className="text-[11px] text-slate-400">Soạn học liệu & Quản lý lớp</span>
            </div>
            <span className="rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-0.5 text-[10px] font-bold border border-indigo-200">
              Giảng dạy
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Sinh học liệu & Đề thi AI:</span>
                <span className="font-bold text-slate-800 font-mono">{quotas.teacherGenLimitPerDay} bài/ngày</span>
              </div>
              <input
                type="number"
                value={quotas.teacherGenLimitPerDay}
                onChange={(e) => onChangeQuota('teacherGenLimitPerDay', parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-brand-400 bg-slate-50/50"
              />
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/60 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Đề thi tối đa / lần:</span>
                <span className="font-mono text-slate-900">20 câu hỏi</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Dung lượng PDF tối đa:</span>
                <span className="font-mono text-slate-900">20 MB</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Dành cho giáo viên được Admin xác thực danh tính sư phạm.
          </div>
        </div>
      </div>

      {/* Chính sách bảo vệ hạ tầng & Chống tràn tải */}
      <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          <span className="font-bold text-slate-800 block mb-0.5">
            Cơ chế Chống tràn tải thông minh (Smart Rate Limiting)
          </span>
          <p className="text-[11px] text-slate-500">
            Hệ thống tự động kích hoạt bộ đệm và hàng đợi tin nhắn khi lưu lượng vượt quá 60 yêu cầu/phút nhằm bảo vệ kết nối API.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100/70 text-emerald-800 font-bold text-xs shrink-0">
          ✓ Đang bật bảo vệ
        </span>
      </div>
    </Card>
  )
}

