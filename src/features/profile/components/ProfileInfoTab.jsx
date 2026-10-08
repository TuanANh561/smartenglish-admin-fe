import { useRef } from 'react'
import { Save, Upload } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export default function ProfileInfoTab({
  currentUser,
  formData,
  setFormData,
  isTeacher,
  isSaving,
  isUploadingAvatar,
  onSave,
  onAvatarFileChange,
}) {
  const manualFileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 border border-line bg-white shadow-xs space-y-6">
        <div className="border-b border-line pb-4">
          <h3 className="text-base font-bold text-navy-800">Chi tiết hồ sơ cá nhân</h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Cập nhật thông tin nhận diện tài khoản, liên hệ và chuyên môn giảng dạy trên hệ thống.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Họ và tên hiển thị <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.displayName}
              onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
              placeholder="Nhập họ và tên đầy đủ..."
              className="font-semibold text-slate-800"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Địa chỉ Email (Tài khoản)
            </label>
            <div className="relative">
              <Input
                value={formData.email}
                disabled
                className="bg-slate-50 text-slate-500 cursor-not-allowed pr-24"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                Đã xác thực
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Số điện thoại liên hệ
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="Ví dụ: 0912 345 678..."
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Tên đăng nhập (Username)
            </label>
            <Input
              value={formData.username || currentUser?.username || '—'}
              disabled
              className="bg-slate-50 text-slate-500 cursor-not-allowed font-mono text-xs"
            />
          </div>

          {/* DÀNH CHO GIÁO VIÊN: TRÌNH ĐỘ CEFR & MỤC TIÊU GIẢNG DẠY */}
          {isTeacher && (
            <>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  Trình độ ngoại ngữ / Chứng chỉ chuyên môn
                </label>
                <Select
                  value={formData.cefrLevel}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cefrLevel: e.target.value }))}
                  className="text-xs font-semibold"
                >
                  <option value="B1">CEFR B1 (Intermediate)</option>
                  <option value="B2">CEFR B2 (Vantage - Tiêu chuẩn giảng dạy)</option>
                  <option value="C1">CEFR C1 (Effective Operational Proficiency)</option>
                  <option value="C2">CEFR C2 (Mastery / Bản ngữ)</option>
                  <option value="IELTS 7.5+">IELTS 7.5 - 8.5+</option>
                  <option value="TOEIC 900+">TOEIC 900 - 990</option>
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  Lĩnh vực & Chuyên đề giảng dạy chính
                </label>
                <Input
                  value={formData.targetGoal}
                  onChange={(e) => setFormData((prev) => ({ ...prev, targetGoal: e.target.value }))}
                  placeholder="Ví dụ: Luyện thi TOEIC 4 kỹ năng, Phát âm chuẩn IPA..."
                />
              </div>
            </>
          )}

          {/* DÀNH CHO ADMIN: PHÒNG BAN QUẢN TRỊ */}
          {!isTeacher && (
            <>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  Cấp độ phân quyền hệ thống
                </label>
                <Input
                  value="Toàn quyền Quản trị tối cao (Super Administrator)"
                  disabled
                  className="bg-amber-50/60 text-amber-900 border-amber-200 font-medium text-xs cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  Trực ban kỹ thuật
                </label>
                <Input
                  value="Hội đồng Học thuật & Quản trị Nội dung AI"
                  disabled
                  className="bg-slate-50 text-slate-600 text-xs cursor-not-allowed"
                />
              </div>
            </>
          )}

          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Tiểu sử & Giới thiệu bản thân (Bio)
            </label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder={
                isTeacher
                  ? 'Chia sẻ kinh nghiệm giảng dạy, phương pháp sư phạm hoặc thông điệp gửi tới học viên của bạn...'
                  : 'Ghi chú tiểu sử hoặc thông tin nhiệm vụ quản trị viên...'
              }
              className="w-full rounded-xl border border-line bg-canvas p-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Link ảnh đại diện URL thủ công */}
        <div className="pt-2 border-t border-line">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Đường dẫn ảnh đại diện (Avatar URL)
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={formData.avatarUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, avatarUrl: e.target.value }))}
              placeholder="https://example.com/avatar.jpg..."
              className="font-mono text-xs flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Upload}
              onClick={() => manualFileInputRef.current?.click()}
              loading={isUploadingAvatar}
            >
              Chọn ảnh từ máy
            </Button>
            <input
              ref={manualFileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onAvatarFileChange(file)
                if (manualFileInputRef.current) manualFileInputRef.current.value = ''
              }}
              className="hidden"
            />
          </div>
          <p className="text-[11px] text-ink-muted mt-1">
            Bạn có thể chọn ảnh trực tiếp từ máy tính hoặc dán đường dẫn hình ảnh có sẵn trên internet.
          </p>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
          <Button
            type="submit"
            variant="primary"
            icon={Save}
            loading={isSaving}
            className="px-6"
          >
            Lưu Thay Đổi
          </Button>
        </div>
      </Card>
    </form>
  )
}
