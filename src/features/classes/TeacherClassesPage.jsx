import { useMemo, useState } from 'react'
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
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Users,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import { CLASSES, CLASS_STATUS, CLASS_STUDENTS, LEVEL_COLOR } from '@/mocks/data/classes'
import { useAuthStore } from '@/store/authStore'

// ─── Hàm tiện ích ─────────────────────────────────────────────────────────────

// Avatar: nếu có ảnh thì dùng, không thì hiện initials
function StudentAvatar({ student, size = 'md' }) {
  const s = size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-xs'
  if (student.avatarUrl) {
    return <img src={student.avatarUrl} alt={student.name} className={`${s} rounded-full object-cover`} />
  }
  return (
    <span
      className={`${s} flex shrink-0 items-center justify-center rounded-full font-bold text-white`}
      style={{ backgroundColor: student.avatarColor }}
    >
      {student.initials}
    </span>
  )
}

// Thanh tiến độ học tập
function ProgressBar({ value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-ink-muted">{value}%</span>
    </div>
  )
}

// Badge điểm trung bình — màu theo điểm
function ScoreBadge({ score }) {
  const color =
    score >= 8.5 ? '#15803d' :
    score >= 7.0 ? '#1d4ed8' :
    '#b45309'
  const bg =
    score >= 8.5 ? '#dcfce7' :
    score >= 7.0 ? '#dbeafe' :
    '#fef3c7'
  return (
    <span
      className="inline-flex h-7 w-10 items-center justify-center rounded-lg text-xs font-bold"
      style={{ backgroundColor: bg, color }}
    >
      {score}
    </span>
  )
}

// ─── MÀNN HÌNH 1: DANH SÁCH LỚP ──────────────────────────────────────────────
function ClassListView({ onViewClass }) {
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
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
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
                          <span className="font-bold text-slate-900 text-sm tracking-tight">{cls.name}</span>
                        </div>
                      </td>
                      {/* Mã lớp */}
                      <td className="px-6 py-4.5 font-mono text-xs font-medium text-slate-500">{cls.code}</td>
                      {/* Số học viên */}
                      <td className="px-6 py-4.5 text-center font-bold text-slate-800 text-sm">
                        {cls.studentCount}
                      </td>
                      {/* Số bài tập */}
                      <td className="px-6 py-4.5 text-center text-sm font-medium text-slate-600">{cls.assignmentCount}</td>
                      {/* Trạng thái */}
                      <td className="px-6 py-4.5">
                        <span
                          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor: cls.status === 'active' ? '#ecfdf5' : cls.status === 'upcoming' ? '#fef3c7' : '#f1f5f9',
                            color: cls.status === 'active' ? '#059669' : cls.status === 'upcoming' ? '#d97706' : '#475569',
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
                            onClick={(e) => { e.stopPropagation(); onViewClass(cls) }}
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
            Hiển thị <strong>{filtered.length === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}</strong>-
            <strong>{Math.min(page * PAGE_SIZE, filtered.length)}</strong> trong tổng số{' '}
            <strong>{filtered.length}</strong> lớp học
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  )
}

// ─── MÀNN HÌNH 2: CHI TIẾT LỚP ───────────────────────────────────────────────
const DETAIL_TABS = ['Tổng quan', 'Học viên', 'Bài tập', 'Bảng điểm', 'Tiến độ']

function ClassDetailView({ cls, onBack, onViewStudent }) {
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
        className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-navy-700"
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
              <span key={tag} className="rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-ink-muted">
                {tag}
              </span>
            ))}
          </div>
          <h2 className="mt-3 text-2xl font-bold text-navy-700">{cls.name}</h2>
          <p className="mt-1 text-sm text-ink-muted">{cls.description}</p>

          {/* Join Code */}
          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Join Code</p>
            <div className="mt-1 inline-flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2">
              <span className="font-mono text-base font-bold tracking-widest text-navy-700">
                {cls.joinCode}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-ink-muted hover:text-brand-500"
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
                'px-5 py-3 text-sm font-semibold transition-colors',
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
                onChange={(e) => { setStudentSearch(e.target.value); setPage(1) }}
                placeholder="Tìm kiếm học viên..."
                className="flex-1 bg-transparent text-sm text-ink placeholder-ink-muted outline-none"
              />
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-canvas"
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
                              onClick={(e) => { e.stopPropagation(); onViewStudent(student, cls) }}
                              className="rounded-md p-1.5 text-ink-muted hover:bg-brand-50 hover:text-brand-500"
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
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-white text-ink-muted disabled:opacity-40 hover:bg-canvas"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-white text-ink-muted disabled:opacity-40 hover:bg-canvas"
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
            <p className="text-sm">Tab <strong>{activeTab}</strong> đang được phát triển</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MÀNN HÌNH 3: THÔNG TIN HỌC VIÊN ─────────────────────────────────────────
function StudentDetailView({ student, cls, onBack }) {
  const scoreColor =
    student.avgScore >= 8.5 ? '#15803d' :
    student.avgScore >= 7.0 ? '#1d4ed8' :
    '#b45309'
  const scoreBg =
    student.avgScore >= 8.5 ? '#dcfce7' :
    student.avgScore >= 7.0 ? '#dbeafe' :
    '#fef3c7'

  return (
    <div className="space-y-4">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-navy-700"
      >
        <ArrowLeft size={16} />
        Quay lại lớp {cls.name}
      </button>

      {/* Profile card */}
      <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {/* Avatar lớn */}
          <span
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white"
            style={{ backgroundColor: student.avatarColor }}
          >
            {student.name.charAt(0)}
          </span>
          <div className="flex-1">
            <p className="text-sm text-ink-muted">{student.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-600">
                Lớp: {cls.name}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Cấp {cls.level}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {/* Điểm TB */}
        <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <p className="text-xs text-ink-muted">Điểm trung bình</p>
          <p
            className="mt-1 text-3xl font-bold"
            style={{ color: scoreColor }}
          >
            {student.avgScore}
          </p>
          <span
            className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: scoreBg, color: scoreColor }}
          >
            {student.avgScore >= 8.5 ? 'Xuất sắc' : student.avgScore >= 7.0 ? 'Khá' : 'Trung bình'}
          </span>
        </div>

        {/* Tiến độ */}
        <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <p className="text-xs text-ink-muted">Tiến độ</p>
          <p className="mt-1 text-3xl font-bold text-navy-700">{student.progress}%</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${student.progress}%` }}
            />
          </div>
        </div>

        {/* Lần học cuối */}
        <div className="col-span-2 rounded-xl border border-line bg-white p-4 shadow-sm sm:col-span-1">
          <p className="text-xs text-ink-muted">Lần học cuối</p>
          <p className="mt-1 text-base font-bold text-navy-700">{student.lastSeen}</p>
          <p className="mt-1 text-xs text-ink-muted">Hoạt động gần đây</p>
        </div>
      </div>

      {/* Placeholder chi tiết hơn */}
      <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-navy-700">Lịch sử bài tập</h3>
        <div className="flex h-32 items-center justify-center text-sm text-ink-muted">
          <ClipboardList size={24} className="mr-2 opacity-40" />
          Tính năng đang được phát triển
        </div>
      </div>
    </div>
  )
}

// ─── COMPONENT CHÍNH — router 3 view ─────────────────────────────────────────
function TeacherClassesPage() {
  // view: 'list' | 'detail' | 'student'
  const [view, setView] = useState('list')
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)

  const handleViewClass = (cls) => {
    setSelectedClass(cls)
    setSelectedStudent(null)
    setView('detail')
  }

  const handleViewStudent = (student, cls) => {
    setSelectedClass(cls)
    setSelectedStudent(student)
    setView('student')
  }

  const handleBackToList = () => {
    setSelectedClass(null)
    setSelectedStudent(null)
    setView('list')
  }

  const handleBackToDetail = () => {
    setSelectedStudent(null)
    setView('detail')
  }

  if (view === 'detail' && selectedClass) {
    return (
      <ClassDetailView
        cls={selectedClass}
        onBack={handleBackToList}
        onViewStudent={handleViewStudent}
      />
    )
  }

  if (view === 'student' && selectedStudent && selectedClass) {
    return (
      <StudentDetailView
        student={selectedStudent}
        cls={selectedClass}
        onBack={handleBackToDetail}
      />
    )
  }

  return <ClassListView onViewClass={handleViewClass} />
}

export default TeacherClassesPage
