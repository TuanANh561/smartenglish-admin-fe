import { useState, useMemo } from 'react'
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Mail,
  Phone,
  ShieldCheck,
  Search,
  Filter,
  Trash2,
  AlertTriangle,
  Info,
} from 'lucide-react'
import toast from 'react-hot-toast'
import TeacherProofModal from './TeacherProofModal'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { maskEmail, maskIdentityCard, maskPhone } from '@/lib/utils'

/**
 * Tab 2: Quản lý và phê duyệt hồ sơ đăng ký của Giáo viên
 */
export default function TeacherApprovalTab({
  registrations = [],
  isLoading = false,
  onApprove,
  onReject,
  onDelete,
}) {
  const [selectedProofReg, setSelectedProofReg] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'pending' | 'approved' | 'rejected'

  // Modal Phê duyệt có ghi chú
  const [approvingReg, setApprovingReg] = useState(null)
  const [approveNote, setApproveNote] = useState('')

  // Modal Từ chối có lý do
  const [rejectingReg, setRejectingReg] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  // Modal Xác nhận Xóa
  const [deletingReg, setDeletingReg] = useState(null)

  // Thống kê số lượng
  const stats = useMemo(() => {
    const total = registrations.length
    const pending = registrations.filter((r) => r.status === 'pending').length
    const approved = registrations.filter((r) => r.status === 'approved').length
    const rejected = registrations.filter((r) => r.status === 'rejected').length
    return { total, pending, approved, rejected }
  }, [registrations])

  // Lọc danh sách
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((item) => {
      // Lọc trạng thái
      if (statusFilter !== 'all' && item.status !== statusFilter) return false

      // Lọc tìm kiếm
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchName = item.fullName?.toLowerCase().includes(query)
        const matchEmail = item.email?.toLowerCase().includes(query)
        const matchCard = item.identityCard?.toLowerCase().includes(query)
        const matchPhone = item.phone?.toLowerCase().includes(query)
        if (!matchName && !matchEmail && !matchCard && !matchPhone) return false
      }

      return true
    })
  }, [registrations, statusFilter, searchTerm])

  // Xử lý mở modal duyệt
  const handleOpenApproveModal = (reg) => {
    setApprovingReg(reg)
    setApproveNote('Đã xác minh bằng cấp & căn cước hợp lệ. Kích hoạt tài khoản Teacher Pro.')
  }

  // Xác nhận duyệt
  const handleConfirmApprove = () => {
    if (!approvingReg) return
    onApprove?.(approvingReg.id, approveNote)
    setApprovingReg(null)
  }

  // Xử lý mở modal từ chối
  const handleOpenRejectModal = (reg) => {
    setRejectingReg(reg)
    setRejectReason('Tệp minh chứng bằng cấp/CCCD chưa hợp lệ hoặc thiếu thông tin đối chiếu.')
  }

  // Xác nhận từ chối
  const handleConfirmReject = () => {
    if (!rejectingReg) return
    if (!rejectReason.trim()) {
      return toast.error('Vui lòng nhập lý do từ chối hồ sơ')
    }
    onReject?.(rejectingReg.id, rejectReason)
    setRejectingReg(null)
  }

  // Xác nhận xóa
  const handleConfirmDelete = () => {
    if (!deletingReg) return
    onDelete?.(deletingReg.id)
    setDeletingReg(null)
  }

  return (
    <div className="space-y-4">
      {/* 1. Thẻ thống kê số lượng hồ sơ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Tổng số hồ sơ</p>
          <p className="text-xl font-black text-slate-900 mt-1">{stats.total}</p>
        </div>

        <div
          onClick={() => setStatusFilter('pending')}
          className={`rounded-2xl border p-3.5 shadow-2xs cursor-pointer transition-all ${
            statusFilter === 'pending'
              ? 'border-amber-400 bg-amber-50/60 ring-2 ring-amber-300'
              : 'border-amber-200 bg-amber-50/30 hover:bg-amber-50/50'
          }`}
        >
          <p className="text-[11px] font-semibold text-amber-700 uppercase flex items-center gap-1">
            <Clock size={13} />
            <span>Chờ xét duyệt</span>
          </p>
          <p className="text-xl font-black text-amber-800 mt-1">{stats.pending}</p>
        </div>

        <div
          onClick={() => setStatusFilter('approved')}
          className={`rounded-2xl border p-3.5 shadow-2xs cursor-pointer transition-all ${
            statusFilter === 'approved'
              ? 'border-emerald-400 bg-emerald-50/60 ring-2 ring-emerald-300'
              : 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/50'
          }`}
        >
          <p className="text-[11px] font-semibold text-emerald-700 uppercase flex items-center gap-1">
            <CheckCircle2 size={13} />
            <span>Đã phê duyệt</span>
          </p>
          <p className="text-xl font-black text-emerald-800 mt-1">{stats.approved}</p>
        </div>

        <div
          onClick={() => setStatusFilter('rejected')}
          className={`rounded-2xl border p-3.5 shadow-2xs cursor-pointer transition-all ${
            statusFilter === 'rejected'
              ? 'border-red-400 bg-red-50/60 ring-2 ring-red-300'
              : 'border-red-200 bg-red-50/30 hover:bg-red-50/50'
          }`}
        >
          <p className="text-[11px] font-semibold text-red-700 uppercase flex items-center gap-1">
            <XCircle size={13} />
            <span>Đã từ chối</span>
          </p>
          <p className="text-xl font-black text-red-800 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* 2. Thanh tìm kiếm và bộ lọc */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 size={17} className="text-brand-600" />
              Danh Sách Hồ Sơ Đăng Ký Giáo Viên Xin Duyệt
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kiểm tra thông tin chuyên môn và tệp minh chứng để cấp quyền tài khoản Giáo Viên (Teacher Pro).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Bộ lọc trạng thái */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">Tất cả trạng thái ({stats.total})</option>
              <option value="pending">Chờ duyệt ({stats.pending})</option>
              <option value="approved">Đã duyệt ({stats.approved})</option>
              <option value="rejected">Đã từ chối ({stats.rejected})</option>
            </select>
          </div>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo họ tên giáo viên, email, số CCCD hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        {/* Bảng danh sách hồ sơ */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[11px]">
              <tr>
                <th className="p-3">Giáo viên ứng tuyển</th>
                <th className="p-3">Học vấn & Bằng cấp</th>
                <th className="p-3">Chứng chỉ Tiếng Anh</th>
                <th className="p-3">Kinh nghiệm & Chuyên môn</th>
                <th className="p-3 text-center">Tệp minh chứng</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <LoadingSpinner
                      size="sm"
                      text="Đang tải danh sách hồ sơ giáo viên từ máy chủ..."
                      className="py-2"
                    />
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    Không tìm thấy hồ sơ nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 text-xs">{item.fullName}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Mail size={12} className="text-slate-400 shrink-0" />
                          <span>{maskEmail(item.email)}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <ShieldCheck size={12} className="text-slate-400 shrink-0" />
                          <span>CCCD: {maskIdentityCard(item.identityCard)}</span>
                        </p>
                        {item.phone && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Phone size={12} className="text-slate-400 shrink-0" />
                            <span>SĐT: {maskPhone(item.phone)}</span>
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="p-3 font-medium text-slate-700 max-w-xs">
                      {item.education}
                    </td>

                    <td className="p-3 font-bold text-brand-700 whitespace-nowrap">
                      {item.certificateType}
                    </td>

                    <td className="p-3 text-slate-600">
                      <span className="font-semibold text-slate-800 block">
                        {item.experienceYears} năm kinh nghiệm
                      </span>
                      <span className="text-[11px] text-slate-500">{item.specialty}</span>
                    </td>

                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedProofReg(item)}
                        className="inline-flex items-center gap-1 bg-brand-50 hover:bg-brand-100 text-brand-700 px-2.5 py-1 rounded-lg font-bold border border-brand-200 transition-colors cursor-pointer text-[11px]"
                      >
                        <Eye size={13} />
                        <span>Xem {item.proofFiles?.length ?? 0} file</span>
                      </button>
                    </td>

                    <td className="p-3 text-center whitespace-nowrap">
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full font-semibold border border-amber-200 text-[11px]">
                          <Clock size={12} /> Chờ duyệt
                        </span>
                      )}
                      {item.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200 text-[11px]">
                          <CheckCircle2 size={12} /> Đã duyệt
                        </span>
                      )}
                      {item.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full font-semibold border border-red-200 text-[11px]">
                          <XCircle size={12} /> Từ chối
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenApproveModal(item)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-semibold text-[11px] cursor-pointer transition-colors shadow-2xs"
                            >
                              Duyệt
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenRejectModal(item)}
                              className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 px-2 py-1 rounded-lg font-semibold text-[11px] cursor-pointer transition-colors"
                            >
                              Từ chối
                            </button>
                          </>
                        )}

                        {/* Nút Xóa hồ sơ */}
                        <button
                          type="button"
                          onClick={() => setDeletingReg(item)}
                          title="Xóa bản ghi hồ sơ"
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal xem tệp minh chứng */}
      <TeacherProofModal
        registration={selectedProofReg}
        onClose={() => setSelectedProofReg(null)}
        onApprove={(reg) => handleOpenApproveModal(reg)}
        onReject={(reg) => handleOpenRejectModal(reg)}
      />

      {/* Modal Phê Duyệt có ghi chú */}
      <Modal
        open={Boolean(approvingReg)}
        onClose={() => setApprovingReg(null)}
        title="Xác Nhận Phê Duyệt Hồ Sơ Giáo Viên"
        className="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 space-y-1">
            <p className="font-bold">Giáo viên: {approvingReg?.fullName}</p>
            <p>Email: {maskEmail(approvingReg?.email)}</p>
            <p>Bằng cấp / Chứng chỉ: {approvingReg?.certificateType}</p>
            <p className="text-[11px] text-emerald-700 pt-1 border-t border-emerald-200/60">
              * Hệ thống sẽ tự động kích hoạt tài khoản Giáo Viên (Teacher Pro) và cho phép đăng nhập ngay lập tức.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Ghi chú phê duyệt / Lời nhắn cho giáo viên:
            </label>
            <textarea
              rows={3}
              value={approveNote}
              onChange={(e) => setApproveNote(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none"
              placeholder="VD: Đã xác minh bằng cấp & CCCD hợp lệ..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button size="sm" variant="secondary" onClick={() => setApprovingReg(null)}>
              Hủy
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              onClick={handleConfirmApprove}
            >
              Xác nhận phê duyệt
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Từ Chối có lý do */}
      <Modal
        open={Boolean(rejectingReg)}
        onClose={() => setRejectingReg(null)}
        title="Từ Chối Hồ Sơ Đăng Ký Giáo Viên"
        className="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-red-800 space-y-1">
            <p className="font-bold">Ứng viên: {rejectingReg?.fullName}</p>
            <p>Email: {maskEmail(rejectingReg?.email)}</p>
            <p className="text-[11px] text-red-700">
              * Vui lòng nêu rõ lý do để ứng viên biết và bổ sung lại hồ sơ khi tra cứu.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Lý do từ chối (bắt buộc) *:
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none"
              placeholder="VD: Ảnh CCCD bị mờ, bằng IELTS hết hạn..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button size="sm" variant="secondary" onClick={() => setRejectingReg(null)}>
              Hủy
            </Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              onClick={handleConfirmReject}
            >
              Xác nhận từ chối
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal xác nhận xóa hồ sơ */}
      <ConfirmDialog
        open={Boolean(deletingReg)}
        title="Xóa Bản Ghi Hồ Sơ Giáo Viên"
        description={`Bạn có chắc muốn xóa bản ghi hồ sơ của "${deletingReg?.fullName}" (${maskEmail(deletingReg?.email)}) khỏi hệ thống? Hành động này không thể hoàn tác.`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingReg(null)}
      />
    </div>
  )
}
