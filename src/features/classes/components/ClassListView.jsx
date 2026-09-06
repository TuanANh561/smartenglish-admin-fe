import { useMemo, useState } from 'react'
import { Eye, Pencil, Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react'
import Pagination from '@/components/ui/Pagination'
import { CLASSES, CLASS_STATUS, LEVEL_COLOR } from '@/mocks/data/classes'
import { useAuthStore } from '@/store/authStore'

export default function ClassListView({ onViewClass }) {
  const user = useAuthStore((s) => s.user)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 4

  const teacherClasses = useMemo(() => {
    if (!user || user.role === 'admin') return CLASSES
    return CLASSES.filter(
      (c) =>
        c.teacherEmail === user.email ||
        c.teacherName === user.displayName ||
        c.teacherName === 'Hoàng Thị Mai',
    )
  }, [user])

  const filtered = teacherClasses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  )

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
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Tìm kiếm tên lớp, mã lớp..."
              className="w-full max-w-md text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <SlidersHorizontal size={14} className="text-slate-500" />
              <span>Bộ lọc</span>
            </button>
            <button
              type="button"
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
                <th className="px-6 py-3.5">MÃ LỚP</th>
                <th className="px-6 py-3.5 text-center">SỐ HỌC VIÊN</th>
                <th className="px-6 py-3.5 text-center">SỐ BÀI TẬP</th>
                <th className="px-6 py-3.5">TRẠNG THÁI</th>
                <th className="px-6 py-3.5 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                    Không tìm thấy lớp nào phù hợp
                  </td>
                </tr>
              ) : (
                paged.map((cls) => {
                  const statusMeta = CLASS_STATUS[cls.status]
                  const levelStyle = LEVEL_COLOR[cls.level] ?? LEVEL_COLOR.B1
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
                            {cls.level}
                          </span>
                          <span className="font-bold text-slate-900 text-sm tracking-tight">
                            {cls.name}
                          </span>
                        </div>
                      </td>
                      {/* Mã lớp */}
                      <td className="px-6 py-4.5 font-mono text-xs font-medium text-slate-500">
                        {cls.code}
                      </td>
                      {/* Số học viên */}
                      <td className="px-6 py-4.5 text-center font-bold text-slate-800 text-sm">
                        {cls.studentCount}
                      </td>
                      {/* Số bài tập */}
                      <td className="px-6 py-4.5 text-center text-sm font-medium text-slate-600">
                        {cls.assignmentCount}
                      </td>
                      {/* Trạng thái */}
                      <td className="px-6 py-4.5">
                        <span
                          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor:
                              cls.status === 'active'
                                ? '#ecfdf5'
                                : cls.status === 'upcoming'
                                  ? '#fef3c7'
                                  : '#f1f5f9',
                            color:
                              cls.status === 'active'
                                ? '#059669'
                                : cls.status === 'upcoming'
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
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-500">
            Hiển thị{' '}
            <strong>
              {filtered.length === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}
            </strong>
            -<strong>{Math.min(page * PAGE_SIZE, filtered.length)}</strong> trong tổng số{' '}
            <strong>{filtered.length}</strong> lớp học
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  )
}
