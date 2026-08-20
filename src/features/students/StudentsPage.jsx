import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  UserPlus,
  Plus,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  ShieldCheck,
  Award,
  Download,
  X,
  User,
  Mail,
  Lock,
  Phone,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import DataTable from '@/components/ui/DataTable/DataTable'
import DataTableToolbar from '@/components/ui/DataTable/DataTableToolbar'
import FilterChipRow from '@/components/ui/DataTable/FilterChipRow'
import Modal from '@/components/ui/Modal'
import Tabs from '@/components/ui/Tabs'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { useDataTable } from '@/components/ui/DataTable/useDataTable'
import { getUsers, lockUser, unlockUser } from '@/features/users/api'
import { buildUserColumns } from '@/features/users/columns'
import { INITIAL_TEACHER_REGISTRATIONS } from '@/mocks/data/teacherRegistrations'
import { useAuthStore } from '@/store/authStore'

const ROLE_CHIPS = [
  { key: 'student', label: 'Học viên' },
  { key: 'teacher', label: 'Giáo viên' },
  { key: 'admin', label: 'Quản trị viên' },
]

const MAIN_TABS = [
  { value: 'users', label: 'Danh sách người dùng' },
  { value: 'teacher-approvals', label: 'Phê duyệt hồ sơ Giáo viên' },
]

function StudentsPage() {
  const currentUser = useAuthStore((s) => s.user)
  const isAdmin = currentUser?.role === 'admin'
  const dataTable = useDataTable()

  const [activeTab, setActiveTab] = useState('users')
  const [lockTarget, setLockTarget] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Teacher Registrations State
  const [registrations, setRegistrations] = useState(INITIAL_TEACHER_REGISTRATIONS)
  const [selectedProofReg, setSelectedProofReg] = useState(null)

  // Create User Modal State
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [createUserForm, setCreateUserForm] = useState({
    displayName: '',
    email: '',
    password: '',
    role: 'student',
    plan: 'free',
  })

  // Dynamic user list state for client-side creation demo
  const [customCreatedUsers, setCustomCreatedUsers] = useState([])

  const usersQuery = useQuery({
    queryKey: ['students', dataTable.params],
    queryFn: () => getUsers(dataTable.params),
  })

  const mergedUsers = useMemo(() => {
    const fetched = usersQuery.data?.items ?? []
    return [...customCreatedUsers, ...fetched]
  }, [usersQuery.data?.items, customCreatedUsers])

  const handleToggleLock = (user) => {
    if (user.id === currentUser?.id) {
      toast.error('Bạn không thể tự khóa tài khoản quản trị viên của chính mình!')
      return
    }
    setLockTarget(user)
  }

  const handleConfirmLockToggle = async () => {
    if (!lockTarget) return
    setIsProcessing(true)

    try {
      if (lockTarget.isActive) {
        await lockUser(lockTarget.id)
        toast.success(`Đã khóa tài khoản của "${lockTarget.displayName}"`)
      } else {
        await unlockUser(lockTarget.id)
        toast.success(`Đã mở khóa tài khoản của "${lockTarget.displayName}"`)
      }
      await usersQuery.refetch()
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra khi cập nhật trạng thái!')
    } finally {
      setIsProcessing(false)
      setLockTarget(null)
    }
  }

  // Handle Admin Create New User
  const handleSaveNewUser = (e) => {
    e.preventDefault()
    if (!createUserForm.displayName.trim()) return toast.error('Vui lòng nhập họ tên')
    if (!createUserForm.email.trim() || !createUserForm.email.includes('@'))
      return toast.error('Vui lòng nhập email hợp lệ')
    if (!createUserForm.password || createUserForm.password.length < 6)
      return toast.error('Mật khẩu tối thiểu 6 ký tự')

    const newUser = {
      id: `user-new-${Date.now()}`,
      displayName: createUserForm.displayName.trim(),
      email: createUserForm.email.trim(),
      role: createUserForm.role,
      plan: createUserForm.plan,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    }

    setCustomCreatedUsers((prev) => [newUser, ...prev])
    setIsCreateUserOpen(false)
    setCreateUserForm({
      displayName: '',
      email: '',
      password: '',
      role: 'student',
      plan: 'free',
    })
    toast.success(`Đã tạo thành công tài khoản cho "${newUser.displayName}"!`)
  }

  // Teacher Approval Actions
  const handleApproveTeacher = (regId) => {
    setRegistrations((prev) =>
      prev.map((item) =>
        item.id === regId
          ? { ...item, status: 'approved', note: 'Đã xác minh bằng cấp & cấp quyền Teacher Pro' }
          : item,
      ),
    )
    const target = registrations.find((r) => r.id === regId)
    if (target) {
      // Auto create teacher user account
      const teacherUser = {
        id: `user-teacher-${Date.now()}`,
        displayName: target.fullName,
        email: target.email,
        role: 'teacher',
        plan: 'teacher_pro',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      }
      setCustomCreatedUsers((prev) => [teacherUser, ...prev])
      toast.success(`Đã phê duyệt hồ sơ và cấp tài khoản Teacher Pro cho "${target.fullName}"!`)
    }
  }

  const handleRejectTeacher = (regId) => {
    setRegistrations((prev) =>
      prev.map((item) =>
        item.id === regId ? { ...item, status: 'rejected', note: 'Tệp minh chứng không rõ ràng' } : item,
      ),
    )
    toast.success('Đã từ chối hồ sơ đăng ký giáo viên')
  }

  const columns = useMemo(() => {
    return buildUserColumns({
      isAdmin,
      onToggleLock: handleToggleLock,
      currentUser,
    })
  }, [isAdmin, currentUser])

  const pendingRegsCount = registrations.filter((r) => r.status === 'pending').length

  return (
    <div className="space-y-4">
      {/* Header Bar with Tabs & Create User Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <Tabs tabs={MAIN_TABS} value={activeTab} onChange={setActiveTab} />
          {pendingRegsCount > 0 && (
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-white animate-pulse">
              {pendingRegsCount} hồ sơ chờ duyệt
            </span>
          )}
        </div>

        {isAdmin && (
          <Button
            size="sm"
            icon={UserPlus}
            onClick={() => setIsCreateUserOpen(true)}
            className="bg-navy-800 hover:bg-navy-900 text-white font-semibold shadow-xs shrink-0"
          >
            Tạo tài khoản mới
          </Button>
        )}
      </div>

      {/* TAB 1: ALL USERS TABLE */}
      {activeTab === 'users' && (
        <Card>
          <DataTableToolbar
            searchValue={dataTable.search}
            onSearchChange={dataTable.setSearch}
            searchPlaceholder="Tìm theo tên hoặc email..."
          >
            <FilterChipRow
              chips={ROLE_CHIPS}
              value={dataTable.filters.role}
              onChange={(value) => dataTable.setFilter('role', value)}
            />
          </DataTableToolbar>

          <div className="mt-4">
            <DataTable
              columns={columns}
              data={mergedUsers}
              isLoading={usersQuery.isLoading}
              error={usersQuery.error}
              onRetry={usersQuery.refetch}
              pagination={usersQuery.data}
              onPageChange={dataTable.setPage}
              sorting={dataTable.sorting}
              onSortingChange={dataTable.setSorting}
              emptyMessage="Chưa có người dùng nào khớp bộ lọc"
              enableSelection
              expandable
              renderExpandedRow={(user) => (
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-ink-muted">Ngày tạo tài khoản</p>
                    <p className="text-ink font-medium">{user.createdAt ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-muted">Khóa học đăng ký</p>
                    <p className="text-ink">{user.enrolledCoursesCount ?? 0} khóa</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-muted">Số bài nộp</p>
                    <p className="text-ink">{user.submissionCount ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-muted">Điểm trung bình</p>
                    <p className="text-ink">{user.averageScore ?? '—'}</p>
                  </div>
                </div>
              )}
            />
          </div>
        </Card>
      )}

      {/* TAB 2: TEACHER REGISTRATION APPROVALS */}
      {activeTab === 'teacher-approvals' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 size={18} className="text-brand-600" />
                Danh Sách Hồ Sơ Đăng Ký Giáo Viên Chờ Quản Trị Viên Phê Duyệt
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kiểm tra thông tin chuyên môn và tệp minh chứng bằng cấp/CCCD để quyết định phê duyệt tài khoản Giáo Viên.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="p-3">Giáo viên ứng tuyển</th>
                    <th className="p-3">Học vấn & Trình độ</th>
                    <th className="p-3">Chứng chỉ Tiếng Anh</th>
                    <th className="p-3">Kinh nghiệm & Chuyên môn</th>
                    <th className="p-3 text-center">Tệp minh chứng</th>
                    <th className="p-3 text-center">Trạng thái</th>
                    <th className="p-3 text-right">Thao tác phê duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {registrations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{item.fullName}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.email}</p>
                          <p className="text-[11px] text-slate-400">CCCD: {item.identityCard}</p>
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
                          className="inline-flex items-center gap-1 bg-brand-50 hover:bg-brand-100 text-brand-700 px-2.5 py-1 rounded-lg font-bold border border-brand-200 transition-colors cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Xem {item.proofFiles.length} file</span>
                        </button>
                      </td>

                      <td className="p-3 text-center whitespace-nowrap">
                        {item.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full font-semibold border border-amber-200">
                            <Clock size={12} /> Chờ duyệt
                          </span>
                        )}
                        {item.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                            <CheckCircle2 size={12} /> Đã duyệt
                          </span>
                        )}
                        {item.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full font-semibold border border-red-200">
                            <XCircle size={12} /> Từ chối
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right whitespace-nowrap">
                        {item.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApproveTeacher(item.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg font-semibold text-[11px] cursor-pointer transition-colors shadow-2xs"
                            >
                              Duyệt & Cấp quyền
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectTeacher(item.id)}
                              className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 px-2.5 py-1 rounded-lg font-semibold text-[11px] cursor-pointer transition-colors"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Hoàn tất</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL TẠO TÀI KHOẢN MỚI ────────────────────────────────────── */}
      <Modal
        open={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        title="Tạo tài khoản người dùng mới"
        className="max-w-md"
      >
        <form onSubmit={handleSaveNewUser} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Họ và tên *</label>
            <Input
              placeholder="VD: Nguyễn Văn A..."
              value={createUserForm.displayName}
              onChange={(e) =>
                setCreateUserForm({ ...createUserForm, displayName: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Địa chỉ Email *</label>
            <Input
              type="email"
              placeholder="nguyenvana@gmail.com"
              value={createUserForm.email}
              onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Mật khẩu khởi tạo *</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={createUserForm.password}
              onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Vai trò người dùng *</label>
              <Select
                value={createUserForm.role}
                onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
              >
                <option value="student">Học viên (Student)</option>
                <option value="teacher">Giáo viên (Teacher)</option>
                <option value="admin">Quản trị viên (Admin)</option>
              </Select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Gói quyền lợi *</label>
              <Select
                value={createUserForm.plan}
                onChange={(e) => setCreateUserForm({ ...createUserForm, plan: e.target.value })}
              >
                <option value="free">Gói Miễn phí (Free)</option>
                <option value="premium_monthly">Premium Tháng</option>
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
              onClick={() => setIsCreateUserOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button type="submit" size="sm" className="bg-navy-800 hover:bg-navy-900 text-white font-semibold">
              Tạo tài khoản
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL XEM TỆP MINH CHỨNG GIÁO VIÊN ─────────────────────────── */}
      <Modal
        open={Boolean(selectedProofReg)}
        onClose={() => setSelectedProofReg(null)}
        title={`Tệp Minh Chứng: ${selectedProofReg?.fullName}`}
        className="max-w-lg"
      >
        {selectedProofReg && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900 text-xs">{selectedProofReg.fullName}</p>
              <p className="text-slate-600">{selectedProofReg.education}</p>
              <p className="text-brand-600 font-bold">{selectedProofReg.certificateType}</p>
              <p className="text-slate-500">Số CCCD: {selectedProofReg.identityCard}</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-2 text-[11px]">
                Danh sách tệp minh chứng đính kèm ({selectedProofReg.proofFiles.length})
              </h4>
              <div className="space-y-2">
                {selectedProofReg.proofFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText size={18} className="text-red-500 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800">{file.name}</p>
                        <p className="text-[11px] text-slate-400">{file.size}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.success(`Đang mở xem file: ${file.name}`)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 text-[11px] cursor-pointer"
                    >
                      Xem tệp
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => setSelectedProofReg(null)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── CONFIRM DIALOG KHÓA / MỞ KHÓA TÀI KHOẢN ────────────────────── */}
      <ConfirmDialog
        open={Boolean(lockTarget)}
        title={lockTarget?.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        description={
          lockTarget?.isActive
            ? `Bạn có chắc chắn muốn khóa tài khoản "${lockTarget?.displayName}" (${lockTarget?.email})?`
            : `Xác nhận mở khóa tài khoản "${lockTarget?.displayName}" (${lockTarget?.email})?`
        }
        confirmText={isProcessing ? 'Đang xử lý...' : lockTarget?.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
        cancelText="Hủy"
        variant={lockTarget?.isActive ? 'danger' : 'primary'}
        onConfirm={handleConfirmLockToggle}
        onClose={() => setLockTarget(null)}
        loading={isProcessing}
      />
    </div>
  )
}

export default StudentsPage
