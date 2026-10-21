import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Copy,
  GraduationCap,
  LayoutGrid,
  Pencil,
  Shield,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { formatTeacherName } from '../classConstants'
import {
  addMember,
  createAssignment,
  getClassAssignments,
  getClassMembers,
  removeMember,
  updateClass,
} from '../classApi'
import AddStudentModal from './detail/AddStudentModal'
import ClassAssignmentsTab from './detail/ClassAssignmentsTab'
import ClassGradebookTab from './detail/ClassGradebookTab'
import ClassOverviewTab from './detail/ClassOverviewTab'
import ClassStudentsTab from './detail/ClassStudentsTab'
import CreateAssignmentModal from './detail/CreateAssignmentModal'
import ClassFormModal from './ClassFormModal'

const DETAIL_TABS = [
  { key: 'overview', label: 'Tổng quan', icon: LayoutGrid },
  { key: 'students', label: 'Học viên', icon: Users },
  { key: 'assignments', label: 'Bài tập', icon: BookOpen },
  { key: 'gradebook', label: 'Bảng điểm', icon: GraduationCap },
]

export default function ClassDetailView({ cls, onBack, onViewStudent }) {
  const user = useAuthStore((s) => s.user)
  const [currentCls, setCurrentCls] = useState(cls)
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)

  const userRole = (user?.role || '').toLowerCase()
  const isAdmin = userRole === 'admin' || userRole === 'role_admin'
  const isTeacherOwner =
    currentCls?.teacherId != null && user?.id != null && String(currentCls.teacherId) === String(user.id)
  const canEditClass = isAdmin || isTeacherOwner

  // Data states
  const [members, setMembers] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [loadingAssignments, setLoadingAssignments] = useState(false)

  // Modal states
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    setCurrentCls(cls)
  }, [cls])

  const loadMembers = async () => {
    setLoadingMembers(true)
    try {
      const data = await getClassMembers(currentCls?.id)
      setMembers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.warn('Lỗi khi tải danh sách học viên:', err)
      setMembers([])
    } finally {
      setLoadingMembers(false)
    }
  }

  const loadAssignments = async () => {
    setLoadingAssignments(true)
    try {
      const data = await getClassAssignments(currentCls?.id)
      setAssignments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.warn('Lỗi khi tải danh sách bài tập:', err)
      setAssignments([])
    } finally {
      setLoadingAssignments(false)
    }
  }

  // Fetch members and assignments
  useEffect(() => {
    if (!currentCls?.id) return
    loadMembers()
    loadAssignments()
  }, [currentCls?.id])

  const handleCopyCode = () => {
    if (!currentCls.joinCode) return
    navigator.clipboard.writeText(currentCls.joinCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleAddMember = async (payload) => {
    await addMember(currentCls.id, payload)
    await loadMembers()
  }

  const handleRemoveMember = async (userId, studentName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa học viên "${studentName}" khỏi lớp?`)) {
      try {
        await removeMember(currentCls.id, userId)
        await loadMembers()
      } catch (err) {
        alert(err?.message || 'Không thể xóa học viên khỏi lớp')
      }
    }
  }

  const handleCreateAssignment = async (payload) => {
    await createAssignment(currentCls.id, payload)
    await loadAssignments()
  }

  const handleUpdateClass = async (payload) => {
    try {
      const updated = await updateClass(currentCls.id, payload)
      setCurrentCls(updated || { ...currentCls, ...payload })
      setIsEditModalOpen(false)
      toast.success('Cập nhật thông tin lớp học thành công!')
    } catch (err) {
      toast.error(err?.message || 'Không thể cập nhật lớp học')
    }
  }

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} />
        <span>Quay lại danh sách lớp học</span>
      </button>

      {/* Header Banner - Compact single-row layout */}
      <div className="rounded-2xl border border-slate-200/90 bg-white px-5 py-3.5 shadow-xs">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="shrink-0 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600">
              {currentCls.cefrTarget || currentCls.level || 'B1'}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="truncate text-lg font-bold text-slate-900 tracking-tight">{currentCls.name}</h2>
                <span className="shrink-0 text-xs font-mono text-slate-400">
                  #{currentCls.id}
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-200">
                    <Shield size={11} /> Chế độ Quản trị
                  </span>
                )}
                {(currentCls.teacherName || currentCls.teacherId) && (
                  <span className="hidden sm:inline text-xs text-slate-500 font-medium">
                    (GV: {formatTeacherName(currentCls.teacherName, currentCls.teacherId)})
                  </span>
                )}
              </div>
              {currentCls.description && (
                <p className="truncate text-xs text-slate-500 max-w-xl">{currentCls.description}</p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {canEditClass && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                title="Chỉnh sửa thông tin lớp học"
              >
                <Pencil size={13} className="text-slate-500" />
                <span>Chỉnh sửa lớp</span>
              </button>
            )}

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500">Mã vào lớp:</span>
              <span className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                {currentCls.joinCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-slate-400 hover:text-brand-600 transition-colors cursor-pointer ml-0.5"
                title="Sao chép mã"
              >
                {copied ? (
                  <CheckCircle2 size={15} className="text-emerald-500" />
                ) : (
                  <Copy size={15} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation & Content Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 px-3 pt-2">
          {DETAIL_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-brand-600 text-brand-600 bg-white rounded-t-xl shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.key === 'students' && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                    {members.length}
                  </span>
                )}
                {tab.key === 'assignments' && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                    {assignments.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Body */}
        {activeTab === 'overview' && (
          <ClassOverviewTab
            cls={currentCls}
            members={members}
            assignments={assignments}
            copied={copied}
            onCopyCode={handleCopyCode}
          />
        )}

        {activeTab === 'students' && (
          <ClassStudentsTab
            cls={currentCls}
            members={members}
            loading={loadingMembers}
            onViewStudent={onViewStudent}
            onAddStudent={() => setIsAddStudentOpen(true)}
            onRemoveStudent={handleRemoveMember}
          />
        )}

        {activeTab === 'assignments' && (
          <ClassAssignmentsTab
            cls={currentCls}
            assignments={assignments}
            loading={loadingAssignments}
            onCreateAssignmentClick={() => setIsCreateAssignmentOpen(true)}
          />
        )}

        {activeTab === 'gradebook' && (
          <ClassGradebookTab cls={currentCls} members={members} assignments={assignments} />
        )}
      </div>

      {/* Modals */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onAddMember={handleAddMember}
      />

      <CreateAssignmentModal
        isOpen={isCreateAssignmentOpen}
        onClose={() => setIsCreateAssignmentOpen(false)}
        cls={currentCls}
        onCreateAssignment={handleCreateAssignment}
      />

      <ClassFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={currentCls}
        onSubmit={handleUpdateClass}
        quota={null}
      />
    </div>
  )
}
