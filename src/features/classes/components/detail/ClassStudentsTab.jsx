import { useState } from 'react'
import { Eye, Plus, Search, Trash2, UserPlus } from 'lucide-react'
import { maskEmail } from '@/lib/utils'
import Pagination from '@/components/ui/Pagination'
import { ProgressBar, ScoreBadge, StudentAvatar } from '../ClassSharedComponents'

export default function ClassStudentsTab({
  cls,
  members = [],
  loading = false,
  onViewStudent,
  onAddStudent,
  onRemoveStudent,
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 5

  const filtered = members.filter((s) => {
    const name = (s.userName || s.name || '').toLowerCase()
    const email = (s.userEmail || s.email || '').toLowerCase()
    const q = search.toLowerCase()
    return name.includes(q) || email.includes(q)
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3 flex-1">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Tìm kiếm học viên theo tên hoặc email..."
            className="w-full max-w-sm text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
        </div>
        <button
          type="button"
          onClick={onAddStudent}
          className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
        >
          <UserPlus size={14} />
          <span>Thêm học viên</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/40 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-3.5">HỌC VIÊN</th>
              <th className="px-6 py-3.5 text-center">ĐIỂM TB</th>
              <th className="px-6 py-3.5">TIẾN ĐỘ</th>
              <th className="px-6 py-3.5">HOẠT ĐỘNG CUỐI</th>
              <th className="px-6 py-3.5 text-right">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                  Đang tải danh sách học viên...
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                  Chưa có học viên nào trong lớp này
                </td>
              </tr>
            ) : (
              paged.map((student) => {
                const sObj = {
                  id: student.userId || student.id,
                  name: student.userName || student.name || `Học viên #${student.userId}`,
                  email: student.userEmail || student.email || '',
                  avatarUrl: student.userAvatar || student.avatarUrl,
                  avatarColor: student.avatarColor || '#2563eb',
                  initials: (student.userName || student.name || 'H').slice(0, 2).toUpperCase(),
                  avgScore: student.avgScore ?? 7.5,
                  progress: student.progress ?? 60,
                  lastSeen: student.lastSeen || 'Gần đây',
                }

                return (
                  <tr
                    key={sObj.id}
                    onClick={() => onViewStudent(sObj, cls)}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <StudentAvatar student={sObj} />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{sObj.name}</p>
                          {/* Yêu cầu bảo mật: Email hiển thị dạng ẩn ki*******com */}
                          <p className="font-mono text-xs text-slate-400 mt-0.5">
                            {maskEmail(sObj.email)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ScoreBadge score={sObj.avgScore} />
                    </td>
                    <td className="px-6 py-4">
                      <ProgressBar value={sObj.progress} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{sObj.lastSeen}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5 text-slate-400">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onViewStudent(sObj, cls)
                          }}
                          className="rounded-lg p-1.5 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemoveStudent(student.userId || student.id, sObj.name)
                          }}
                          className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Xóa khỏi lớp"
                        >
                          <Trash2 size={16} />
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
            <strong>{filtered.length}</strong> học viên
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  )
}
