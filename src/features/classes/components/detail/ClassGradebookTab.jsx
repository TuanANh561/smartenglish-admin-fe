import { useState } from 'react'
import { Award, BookOpen, Search } from 'lucide-react'
import { maskEmail } from '@/lib/utils'
import { ProgressBar, ScoreBadge, StudentAvatar } from '../ClassSharedComponents'

export default function ClassGradebookTab({ cls, members = [], assignments = [] }) {
  const [search, setSearch] = useState('')

  const filtered = members.filter((s) => {
    const name = (s.userName || s.name || '').toLowerCase()
    const email = (s.userEmail || s.email || '').toLowerCase()
    const q = search.toLowerCase()
    return name.includes(q) || email.includes(q)
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3 flex-1">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm học viên trong bảng điểm..."
            className="w-full max-w-sm text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Award size={16} className="text-amber-500" />
          <span>Bảng tổng hợp kết quả học tập</span>
        </div>
      </div>

      {/* Grade Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/40 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-3.5">HỌC VIÊN</th>
              <th className="px-6 py-3.5 text-center">ĐIỂM TRUNG BÌNH</th>
              <th className="px-6 py-3.5">TIẾN ĐỘ HOÀN THÀNH</th>
              <th className="px-6 py-3.5 text-center">BÀI TẬP ĐÃ NỘP</th>
              <th className="px-6 py-3.5 text-center">XẾP LOẠI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                  Chưa có dữ liệu điểm cho học viên trong lớp
                </td>
              </tr>
            ) : (
              filtered.map((student) => {
                const sObj = {
                  id: student.userId || student.id,
                  name: student.userName || student.name || `Học viên #${student.userId}`,
                  email: student.userEmail || student.email || '',
                  avatarUrl: student.userAvatar || student.avatarUrl,
                  avatarColor: student.avatarColor || '#2563eb',
                  initials: (student.userName || student.name || 'H').slice(0, 2).toUpperCase(),
                  avgScore: student.avgScore ?? 7.8,
                  progress: student.progress ?? 70,
                }
                const score = sObj.avgScore
                const rating =
                  score >= 8.5 ? 'Xuất sắc' : score >= 7.0 ? 'Khá' : score >= 5.0 ? 'Trung bình' : 'Yếu'
                const ratingColor =
                  score >= 8.5
                    ? 'text-emerald-700 bg-emerald-50'
                    : score >= 7.0
                      ? 'text-blue-700 bg-blue-50'
                      : score >= 5.0
                        ? 'text-amber-700 bg-amber-50'
                        : 'text-red-700 bg-red-50'

                return (
                  <tr key={sObj.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <StudentAvatar student={sObj} />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{sObj.name}</p>
                          <p className="font-mono text-xs text-slate-400 mt-0.5">
                            {maskEmail(sObj.email)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ScoreBadge score={score} />
                    </td>
                    <td className="px-6 py-4">
                      <ProgressBar value={sObj.progress} />
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-semibold text-slate-700">
                      {Math.round((sObj.progress / 100) * Math.max(assignments.length, 1))} /{' '}
                      {Math.max(assignments.length, 1)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${ratingColor}`}>
                        {rating}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
