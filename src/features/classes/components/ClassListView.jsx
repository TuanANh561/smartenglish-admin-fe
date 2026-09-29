import { useEffect, useState } from 'react'
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import Pagination from '@/components/ui/Pagination'
import { CLASS_STATUS, LEVEL_COLOR } from '@/mocks/data/classes'
import { useAuthStore } from '@/store/authStore'
import { createClass, deleteClass, getTeacherClasses, updateClass } from '../classApi'
import ClassFormModal from './ClassFormModal'

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Đang diễn ra' },
  { value: 'UPCOMING', label: 'Sắp diễn ra' },
  { value: 'ENDED', label: 'Đã kết thúc' },
]

export default function ClassListView({ onViewClass }) {
  const user = useAuthStore((s) => s.user)
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 5

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)

  const loadClasses = async () => {
    setLoading(true)
    try {
      // Nếu là giáo viên, truyền teacherId. Admin thì lấy tất cả.
      const teacherId = user?.role === 'teacher' ? (user.id || 2) : undefined
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
  }, [user?.id, user?.role, statusFilter])

  // Debounced or direct search on Enter / button
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setPage(1)
      loadClasses()
    }
  }

  const handleOpenCreate = () => {
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
      } catch (err) {
        alert(err?.message || 'Không thể xóa lớp học này')
      }
    }
  }

  const handleFormSubmit = async (payload) => {
    if (editingClass) {
      await updateClass(editingClass.id, payload)
    } else {
      const teacherId = user?.id || 2
      await createClass({
        ...payload,
        teacherId,
      })
    }
    await loadClasses()
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
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer focus:outline-none"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>

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
                  <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                    Đang tải danh sách lớp học...
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
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

                      {/* Mã lớp */}
                      <td className="px-6 py-4.5 font-mono text-xs font-semibold text-brand-600">
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
            <p className="text-xs text-slate-500">
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
      />
    </div>
  )
}
