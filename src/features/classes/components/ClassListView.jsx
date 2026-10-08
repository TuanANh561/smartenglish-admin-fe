import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, Plus, Search, Trash2, BookOpen, Crown, Sparkles, ShieldAlert, ArrowRight } from 'lucide-react'
import Pagination from '@/components/ui/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { CLASS_STATUS, LEVEL_COLOR } from '@/mocks/data/classes'
import { useAuthStore } from '@/store/authStore'
import { createClass, deleteClass, getTeacherClasses, updateClass, getTeacherQuotaStatus } from '../classApi'
import ClassFormModal from './ClassFormModal'

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Đang diễn ra' },
  { value: 'UPCOMING', label: 'Sắp diễn ra' },
  { value: 'ENDED', label: 'Đã kết thúc' },
]

const PAGE_SIZE = 10

export default function ClassListView({ onViewClass }) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const userRole = (user?.role || '').toLowerCase()
  const isAdmin = userRole === 'admin' || userRole === 'role_admin'

  // Quota states
  const [quota, setQuota] = useState(null)
  const [upgradeModal, setUpgradeModal] = useState({ open: false, message: '' })

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)

  const loadQuota = async () => {
    // Admin quản lý toàn hệ thống, không áp dụng quota và không bao giờ yêu cầu nâng cấp gói
    if (isAdmin) {
      setQuota(null)
      return
    }
    const teacherId = user?.id || 2
    try {
      const res = await getTeacherQuotaStatus(teacherId)
      if (res) {
        setQuota(res)
      }
    } catch (err) {
      console.warn('Lỗi tải quota giáo viên:', err)
    }
  }

  const loadClasses = async () => {
    setLoading(true)
    try {
      // Nếu là giáo viên, chỉ lấy lớp của họ. Admin thì lấy tất cả lớp học trong hệ thống.
      const teacherId = !isAdmin ? (user?.id || 2) : undefined
      const data = await getTeacherClasses({
        teacherId,
        status: statusFilter || undefined,
        search: search.trim() || undefined,
      })
      setClasses(Array.isArray(data) ? data : [])
    } catch (err) {
      console.warn('Lỗi khi tải danh sách lớp học từ API:', err)
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClasses()
    loadQuota()
  }, [user?.id, user?.role, statusFilter])

  // Debounced or direct search on Enter / button
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setPage(1)
      loadClasses()
    }
  }

  const handleOpenCreate = () => {
    if (!isAdmin && quota && !quota.canCreateMoreClasses) {
      setUpgradeModal({
        open: true,
        message: `Bạn đã sử dụng tối đa ${quota.activeClasses}/${quota.maxClasses} lớp học của ${quota.planName}. Vui lòng nâng cấp gói Giáo viên để mở thêm lớp mới!`
      })
      return
    }
    setEditingClass(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (cls, e) => {
    e.stopPropagation()
    setEditingClass(cls)
    setIsModalOpen(true)
  }

  const handleDeleteClass = async (cls, e) => {
    e.stopPropagation()
    if (window.confirm(`Bạn có chắc chắn muốn xóa lớp học "${cls.name}" không?`)) {
      try {
        await deleteClass(cls.id)
        await loadClasses()
        await loadQuota()
      } catch (err) {
        alert(err?.message || 'Không thể xóa lớp học này')
      }
    }
  }

  const handleFormSubmit = async (payload) => {
    try {
      if (editingClass) {
        await updateClass(editingClass.id, payload)
      } else {
        const teacherId = user?.id || 2
        await createClass({
          ...payload,
          teacherId,
        })
      }
      setIsModalOpen(false)
      await loadClasses()
      await loadQuota()
    } catch (err) {
      const errMsg = err?.message || err?.error || 'Đã có lỗi xảy ra khi lưu lớp học'
      if (errMsg.includes('gói') || errMsg.includes('hạn mức') || errMsg.includes('PREMIUM_LIMIT_EXCEEDED') || err?.status === 402 || err?.status === 403) {
        setUpgradeModal({ open: true, message: errMsg })
      } else {
        alert(errMsg)
      }
    }
  }

  // Client-side pagination
  const filtered = classes.filter((c) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const name = (c.name || '').toLowerCase()
    const code = (c.code || c.joinCode || '').toLowerCase()
    return name.includes(q) || code.includes(q)
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-4">
      {/* Teacher Quota & Premium Banner — chỉ hiện với giáo viên, tuyệt đối KHÔNG hiện với admin */}
      {!isAdmin && quota && (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-indigo-50/20 to-blue-50/30 p-5 shadow-xs transition-all">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600 shadow-inner">
                <Crown size={24} className="text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {quota.planName || 'Gói Khởi Đầu (Starter)'}
                  </span>
                  {quota.isPremium ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                      <Sparkles size={12} /> Premium
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500">Gói Tiêu Chuẩn</span>
                  )}
                </div>
                <h3 className="mt-1 text-base font-bold text-slate-900">
                  Hạn mức quản lý lớp học của bạn
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              {/* Classes progress */}
              <div className="min-w-[150px]">
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Lớp học đã mở</span>
                  <span className="font-bold text-slate-900">
                    {quota.activeClasses} / {quota.maxClasses}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      quota.activeClasses >= quota.maxClasses
                        ? 'bg-rose-500'
                        : quota.activeClasses >= quota.maxClasses * 0.7
                        ? 'bg-amber-500'
                        : 'bg-indigo-600'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((quota.activeClasses / (quota.maxClasses || 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Sĩ số tối đa */}
              <div className="border-l border-slate-200/80 pl-4">
                <div className="text-xs font-medium text-slate-500">Sĩ số tối đa / lớp</div>
                <div className="text-sm font-bold text-slate-900">
                  {quota.maxStudentsPerClass} học viên
                </div>
              </div>

              {/* AI Quota */}
              <div className="border-l border-slate-200/80 pl-4">
                <div className="text-xs font-medium text-slate-500">AI Quota / tháng</div>
                <div className="text-sm font-bold text-slate-900">
                  {quota.aiQuotaMonthly} lượt
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => navigate('/app/goi-dich-vu')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:shadow-md cursor-pointer shrink-0"
              >
                <Sparkles size={14} />
                <span>Nâng cấp gói</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {!quota.canCreateMoreClasses && (
            <div className="mt-3.5 flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2 text-xs font-medium text-amber-800 border border-amber-200/60">
              <ShieldAlert size={15} className="shrink-0 text-amber-600" />
              <span>
                Bạn đã sử dụng hết hạn mức <strong>{quota.maxClasses} lớp</strong> của gói hiện tại. Vui lòng nâng cấp gói Pro hoặc Advanced để mở thêm lớp mới.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Table card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Toolbar & Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 flex-1">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Tìm kiếm tên lớp, mã lớp (nhấn Enter)..."
              className="w-full max-w-sm text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer focus:outline-none"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>

            {/* Nút nâng cấp — chỉ hiện với giáo viên khi đã hết quota */}
            {!isAdmin && quota && !quota.canCreateMoreClasses && (
              <button
                type="button"
                onClick={() => navigate('/app/goi-dich-vu')}
                className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800 transition-colors cursor-pointer shadow-2xs"
              >
                <Sparkles size={14} className="text-amber-600" />
                <span>Nâng cấp thêm lớp</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={15} />
              <span>Tạo lớp học</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3.5">TÊN LỚP</th>
                {isAdmin && (
                  <th className="px-6 py-3.5">LỚP CỦA</th>
                )}
                <th className="px-6 py-3.5">GIÁO TRÌNH</th>
                <th className="px-6 py-3.5">MÃ THAM GIA</th>
                <th className="px-6 py-3.5 text-center">SỐ HỌC VIÊN</th>
                <th className="px-6 py-3.5 text-center">SỐ BÀI TẬP</th>
                <th className="px-6 py-3.5">TRẠNG THÁI</th>
                <th className="px-6 py-3.5 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-8 text-center">
                    <LoadingSpinner text="Đang tải danh sách lớp học..." />
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-sm text-slate-400">
                    Không tìm thấy lớp học nào phù hợp
                  </td>
                </tr>
              ) : (
                paged.map((cls) => {
                  const statusKey = (cls.status || 'ACTIVE').toLowerCase()
                  const statusMeta = CLASS_STATUS[statusKey] || CLASS_STATUS.active
                  const levelKey = cls.cefrTarget || cls.level || 'B1'
                  const levelStyle = LEVEL_COLOR[levelKey] ?? LEVEL_COLOR.B1

                  return (
                    <tr
                      key={cls.id}
                      onClick={() => onViewClass(cls)}
                      className="group transition-colors hover:bg-slate-50/50 cursor-pointer"
                    >
                      {/* Tên lớp */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold shadow-2xs"
                            style={{ backgroundColor: levelStyle.bg, color: levelStyle.text }}
                          >
                            {levelKey}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 text-sm tracking-tight block">
                              {cls.name}
                            </span>
                            {cls.description && (
                              <span className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                {cls.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Lớp của (chỉ admin) */}
                      {isAdmin && (
                        <td className="px-6 py-4.5">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800">
                              {cls.teacherName || '—'}
                            </span>
                            {cls.teacherId && (
                              <span className="text-xs text-slate-400 mt-0.5">ID: {cls.teacherId}</span>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Giáo trình khóa học */}
                      <td className="px-6 py-4.5">
                        {cls.courseTitle || cls.courseId ? (
                          <div className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50/70 border border-brand-100 px-2.5 py-1 text-sm font-medium text-brand-700 max-w-[200px]">
                            <BookOpen size={13} className="shrink-0 text-brand-600" />
                            <span className="truncate" title={cls.courseTitle}>
                              {cls.courseTitle || `Khóa #${cls.courseId}`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400 italic">Lớp tự do</span>
                        )}
                      </td>

                      {/* Mã lớp */}
                      <td className="px-6 py-4.5 font-mono text-sm font-semibold text-brand-600">
                        {cls.joinCode || cls.code || 'CHƯA CÓ'}
                      </td>

                      {/* Số học viên */}
                      <td className="px-6 py-4.5 text-center font-bold text-slate-800 text-sm">
                        {cls.studentCount ?? 0}
                        {cls.maxStudents && (
                          <span className="text-slate-400 text-xs font-normal">
                            {' '}/ {cls.maxStudents}
                          </span>
                        )}
                      </td>

                      {/* Số bài tập */}
                      <td className="px-6 py-4.5 text-center text-sm font-medium text-slate-600">
                        {cls.assignmentCount ?? 0}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-6 py-4.5">
                        <span
                          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor:
                              statusKey === 'active'
                                ? '#ecfdf5'
                                : statusKey === 'upcoming'
                                  ? '#fef3c7'
                                  : '#f1f5f9',
                            color:
                              statusKey === 'active'
                                ? '#059669'
                                : statusKey === 'upcoming'
                                  ? '#d97706'
                                  : '#475569',
                          }}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusMeta.dot }}
                          />
                          <span>{statusMeta.label}</span>
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center justify-end gap-1 text-slate-400">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onViewClass(cls)
                            }}
                            className="rounded-lg p-1.5 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleOpenEdit(cls, e)}
                            className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteClass(cls, e)}
                            className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
            <p className="text-sm text-slate-500">
              Hiển thị{' '}
              <strong>
                {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}
              </strong>
              -<strong>{Math.min(page * PAGE_SIZE, filtered.length)}</strong> trong tổng số{' '}
              <strong>{filtered.length}</strong> lớp học
            </p>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <ClassFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingClass}
        onSubmit={handleFormSubmit}
        quota={quota}
      />

      {/* Upgrade Prompt Modal */}
      {upgradeModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-4">
              <Crown size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Yêu cầu nâng cấp gói Giáo Viên</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {upgradeModal.message}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setUpgradeModal({ open: false, message: '' })}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Để sau
              </button>
              <button
                type="button"
                onClick={() => {
                  setUpgradeModal({ open: false, message: '' })
                  navigate('/app/goi-dich-vu')
                }}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Xem các gói Premium</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
