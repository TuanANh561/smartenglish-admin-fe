import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Copy,
  GraduationCap,
  LayoutGrid,
  Users,
} from 'lucide-react'
import {
  addMember,
  createAssignment,
  getClassAssignments,
  getClassMembers,
  removeMember,
} from '../classApi'
import AddStudentModal from './detail/AddStudentModal'
import ClassAssignmentsTab from './detail/ClassAssignmentsTab'
import ClassGradebookTab from './detail/ClassGradebookTab'
import ClassOverviewTab from './detail/ClassOverviewTab'
import ClassStudentsTab from './detail/ClassStudentsTab'
import CreateAssignmentModal from './detail/CreateAssignmentModal'

const DETAIL_TABS = [
  { key: 'overview', label: 'Tổng quan', icon: LayoutGrid },
  { key: 'students', label: 'Học viên', icon: Users },
  { key: 'assignments', label: 'Bài tập', icon: BookOpen },
  { key: 'gradebook', label: 'Bảng điểm', icon: GraduationCap },
]

export default function ClassDetailView({ cls, onBack, onViewStudent }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)

  // Data states
  const [members, setMembers] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [loadingAssignments, setLoadingAssignments] = useState(false)

  // Modal states
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false)

  // Fetch members and assignments
  useEffect(() => {
    if (!cls?.id) return
    loadMembers()
    loadAssignments()
  }, [cls?.id])

  const loadMembers = async () => {
    setLoadingMembers(true)
    try {
      const data = await getClassMembers(cls.id)
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
      const data = await getClassAssignments(cls.id)
      setAssignments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.warn('Lỗi khi tải danh sách bài tập:', err)
      setAssignments([])
    } finally {
      setLoadingAssignments(false)
    }
  }

  const handleCopyCode = () => {
    if (!cls.joinCode) return
    navigator.clipboard.writeText(cls.joinCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleAddMember = async (payload) => {
    await addMember(cls.id, payload)
    await loadMembers()
  }

  const handleRemoveMember = async (userId, studentName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa học viên "${studentName}" khỏi lớp?`)) {
      try {
        await removeMember(cls.id, userId)
        await loadMembers()
      } catch (err) {
        alert(err?.message || 'Không thể xóa học viên khỏi lớp')
      }
    }
  }

  const handleCreateAssignment = async (payload) => {
    await createAssignment(cls.id, payload)
    await loadAssignments()
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

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600">
                {cls.cefrTarget || cls.level || 'B1'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Mã lớp: #{cls.id} • Join Code: <strong>{cls.joinCode}</strong>
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{cls.name}</h2>
            <p className="mt-1 text-sm text-slate-500 max-w-2xl">{cls.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2">
              <span className="text-xs font-semibold text-slate-500">Mã vào lớp:</span>
              <span className="font-mono text-sm font-bold text-slate-800 tracking-wider">
                {cls.joinCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-slate-400 hover:text-brand-600 transition-colors cursor-pointer ml-1"
                title="Sao chép mã"
              >
                {copied ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <Copy size={16} />
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
            cls={cls}
            members={members}
            assignments={assignments}
            copied={copied}
            onCopyCode={handleCopyCode}
          />
        )}

        {activeTab === 'students' && (
          <ClassStudentsTab
            cls={cls}
            members={members}
            loading={loadingMembers}
            onViewStudent={onViewStudent}
            onAddStudent={() => setIsAddStudentOpen(true)}
            onRemoveStudent={handleRemoveMember}
          />
        )}

        {activeTab === 'assignments' && (
          <ClassAssignmentsTab
            cls={cls}
            assignments={assignments}
            loading={loadingAssignments}
            onCreateAssignmentClick={() => setIsCreateAssignmentOpen(true)}
          />
        )}

        {activeTab === 'gradebook' && (
          <ClassGradebookTab cls={cls} members={members} assignments={assignments} />
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
        onCreateAssignment={handleCreateAssignment}
      />
    </div>
  )
}
