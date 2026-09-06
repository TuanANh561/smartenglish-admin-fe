import { useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Copy,
  Eye,
  GraduationCap,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  Users,
} from 'lucide-react'
import { CLASS_STUDENTS } from '@/mocks/data/classes'
import { ProgressBar, ScoreBadge, StudentAvatar } from './ClassSharedComponents'

const DETAIL_TABS = ['Tổng quan', 'Học viên', 'Bài tập', 'Bảng điểm', 'Tiến độ']

export default function ClassDetailView({ cls, onBack, onViewStudent }) {
  const [activeTab, setActiveTab] = useState('Học viên')
  const [studentSearch, setStudentSearch] = useState('')
  const [copied, setCopied] = useState(false)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 4

  const students = CLASS_STUDENTS[cls.id] ?? []
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()),
  )
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleCopy = () => {
    navigator.clipboard.writeText(cls.joinCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-4">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-navy-700 cursor-pointer"
      >
        <ArrowLeft size={16} />
        Quay lại danh sách lớp
      </button>

      {/* Header: info + total students */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Info card */}
        <div className="lg:col-span-2 rounded-xl border border-line bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {cls.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-ink-muted"
              >
                {tag}
              </span>
            ))}
          </div>
          <h2 className="mt-3 text-2xl font-bold text-navy-700">{cls.name}</h2>
          <p className="mt-1 text-sm text-ink-muted">{cls.description}</p>

          {/* Join Code */}
          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
              Join Code
            </p>
            <div className="mt-1 inline-flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2">
              <span className="font-mono text-base font-bold tracking-widest text-navy-700">
                {cls.joinCode}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-ink-muted hover:text-brand-500 cursor-pointer"
                title="Sao chép"
              >
                {copied ? (
                  <CheckCircle2 size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Total Students card */}
        <div className="rounded-xl border border-line bg-white p-5 shadow-sm flex flex-col items-center justify-center gap-3">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10">
            <Users size={32} className="text-brand-500" />
          </span>
          <div className="text-center">
            <p className="text-4xl font-bold text-navy-700">{cls.studentCount}</p>
            <p className="mt-1 text-sm text-ink-muted font-medium">Total Students</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-line bg-white shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex gap-0 border-b border-line">
          {DETAIL_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={[
                'px-5 py-3 text-sm font-semibold transition-colors cursor-pointer',
                activeTab === tab
                  ? 'border-b-2 border-brand-500 text-brand-500'
                  : 'text-ink-muted hover:text-navy-700',
              ].join(' ')}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'Học viên' ? (
          <div>
            {/* Search */}
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <Search size={15} className="shrink-0 text-ink-muted" />
              <input
                value={studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Tìm kiếm học viên..."
                className="flex-1 bg-transparent text-sm text-ink placeholder-ink-muted outline-none"
              />
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-canvas cursor-pointer"
              >
                <SlidersHorizontal size={13} />
                Lọc
              </button>
            </div>

            {/* Student table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                    <th className="px-4 py-3">Học viên</th>
                    <th className="px-4 py-3 text-center">Điểm TB</th>
                    <th className="px-4 py-3">Tiến độ</th>
                    <th className="px-4 py-3">Lần học cuối</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-ink-muted">
                        Không tìm thấy học viên nào
                      </td>
                    </tr>
                  ) : (
                    paged.map((student) => (
                      <tr
                        key={student.id}
                        onClick={() => onViewStudent(student, cls)}
                        className="hover:bg-canvas transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <StudentAvatar student={student} />
                            <div>
                              <p className="font-semibold text-navy-700">{student.name}</p>
                              <p className="text-[11px] text-ink-muted">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ScoreBadge score={student.avgScore} />
                        </td>
                        <td className="px-4 py-3">
                          <ProgressBar value={student.progress} />
                        </td>
                        <td className="px-4 py-3 text-xs text-ink-muted">{student.lastSeen}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                onViewStudent(student, cls)
                              }}
                              className="rounded-md p-1.5 text-ink-muted hover:bg-brand-50 hover:text-brand-500 cursor-pointer"
                              title="Xem thông tin học viên"
                            >
                              <Eye size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-line px-4 py-3">
              <span className="text-xs text-ink-muted">
                Hiển thị{' '}
                <span className="font-semibold text-navy-700">
                  {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filtered.length)}
                </span>{' '}
                trong <span className="font-semibold text-navy-700">{filtered.length}</span> học viên
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-white text-ink-muted disabled:opacity-40 hover:bg-canvas cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-white text-ink-muted disabled:opacity-40 hover:bg-canvas cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Placeholder cho các tab khác */
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-ink-muted">
            {activeTab === 'Tổng quan' && <LayoutGrid size={32} className="opacity-40" />}
            {activeTab === 'Bài tập' && <ClipboardList size={32} className="opacity-40" />}
            {activeTab === 'Bảng điểm' && <BookOpen size={32} className="opacity-40" />}
            {activeTab === 'Tiến độ' && <GraduationCap size={32} className="opacity-40" />}
            <p className="text-sm">
              Tab <strong>{activeTab}</strong> đang được phát triển
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
