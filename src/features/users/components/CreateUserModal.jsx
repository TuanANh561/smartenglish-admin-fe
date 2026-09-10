import { useState } from 'react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import { createUser } from '../api'

const INITIAL_FORM_STATE = {
  displayName: '',
  email: '',
  password: '',
  role: 'student',
  plan: 'free',
}

/**
 * Modal tạo tài khoản người dùng mới (Admin tạo trực tiếp)
 */
export default function CreateUserModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const name = formData.displayName.trim()
    const email = formData.email.trim()

    if (!name) return toast.error('Vui lòng nhập họ và tên')
    if (!email || !email.includes('@')) return toast.error('Vui lòng nhập email hợp lệ')
    if (!formData.password || formData.password.length < 6) {
      return toast.error('Mật khẩu khởi tạo tối thiểu 6 ký tự')
    }

    setIsSubmitting(true)
    try {
      await createUser({
        displayName: name,
        email: email,
        password: formData.password,
        role: formData.role,
        plan: formData.plan,
      })

      toast.success(`Đã tạo thành công tài khoản cho "${name}"!`)
      setFormData(INITIAL_FORM_STATE)
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra khi tạo tài khoản!')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo tài khoản người dùng mới"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label className="block font-bold text-slate-800 mb-1">Họ và tên *</label>
          <Input
            placeholder="VD: Nguyễn Văn A..."
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">Địa chỉ Email *</label>
          <Input
            type="email"
            placeholder="nguyenvana@gmail.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">Mật khẩu khởi tạo *</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Vai trò người dùng *</label>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="student">Học viên (Student)</option>
              <option value="teacher">Giáo viên (Teacher)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </Select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Gói quyền lợi *</label>
            <Select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            >
              <option value="free">Gói Miễn phí (Free)</option>
              <option value="premium_monthly">Premium Tháng</option>
              <option value="premium_yearly">Premium Năm</option>
              <option value="teacher_pro">Teacher Pro (Giảng dạy)</option>
              <option value="lifetime">Trọn đời (Lifetime)</option>
            </Select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="bg-navy-800 hover:bg-navy-900 text-white font-semibold"
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
