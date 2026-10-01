import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Trash2, GraduationCap, CheckSquare } from 'lucide-react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import DataImportWizardModal from '@/components/ui/DataImportWizardModal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuthStore } from '@/store/authStore'
import ExamToolbar from './components/ExamToolbar'
import ExamTableRow from './components/ExamTableRow'
import ExamCard from './components/ExamCard'
import ExamDetailDrawer from './components/ExamDetailDrawer'
import PracticeQuizTab from './components/PracticeQuizTab'
import {
  getExams,
  getExamCategories,
  getExamTrashCount,
  deleteExam,
  restoreExam,
  permanentDeleteExam,
  togglePublishExam,
  duplicateExam,
} from './examApi'

const PAGE_SIZE = 8

export default function QuizBankPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  // ── Tab State: 'exams' (content-service) vs 'quizzes' (learning-service) ───
  const [activeTab, setActiveTab] = useState('exams')

  // ── Data State ─────────────────────────────────────────────────────────────
  const [exams, setExams] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [trashCount, setTrashCount] = useState(0)

  // ── Filter State ───────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedLevel, setSelectedLevel] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [trashView, setTrashView] = useState(false)
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('quiz_view_mode') || 'list')

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
    localStorage.setItem('quiz_view_mode', mode)
  }

  // ── Modal / Drawer State ───────────────────────────────────────────────────
  const [activeExam, setActiveExam] = useState(null)
  const [isPdfImportOpen, setIsPdfImportOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [permanentTarget, setPermanentTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // ── Refresh trash count ────────────────────────────────────────────────────
  const refreshTrashCount = useCallback(async () => {
    try {
      const count = await getExamTrashCount()
      setTrashCount(count)
    } catch { /* silent */ }
  }, [])

  // ── Load categories ────────────────────────────────────────────────────────
  useEffect(() => {
    getExamCategories().then((c) => setCategories(c)).catch(() => {})
    refreshTrashCount()
  }, [refreshTrashCount])

  // ── Load exams (paginated) ─────────────────────────────────────────────────
  const loadExams = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getExams({
        search: search.trim() || undefined,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        cefrLevel: selectedLevel !== 'ALL' ? selectedLevel : undefined,
        status: !trashView && selectedStatus !== 'all' ? selectedStatus : undefined,
        trash: trashView,
        page,
        size: PAGE_SIZE,
        sortBy: 'created_desc',
      })
      setExams(res.items || [])
      setTotal(res.total || 0)
      setTotalPages(res.totalPages || 1)
    } catch (err) {
      toast.error('Không thể tải danh sách bài thi')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [search, selectedCategory, selectedLevel, selectedStatus, page, trashView])

  useEffect(() => { loadExams() }, [loadExams])

  // Filter handlers
  const handleSearch = (v) => { setSearch(v); setPage(1) }
  const handleCategoryChange = (v) => { setSelectedCategory(v); setPage(1) }
  const handleLevelChange = (v) => { setSelectedLevel(v); setPage(1) }
  const handleStatusChange = (v) => { setSelectedStatus(v); setPage(1) }

  const handleToggleTrash = (nextTrashView) => {
    setTrashView(nextTrashView)
    setPage(1)
    setSearch('')
  }

  const handleReload = () => {
    setSearch('')
    setSelectedCategory('ALL')
    setSelectedLevel('ALL')
    setSelectedStatus('all')
    setPage(1)
    refreshTrashCount()
    loadExams()
    toast.success('Đã làm mới danh sách bài thi')
  }

  const canManage = (item) => {
    if (!item) return false
    if (!user || user?.role !== 'student') return true
    return item.authorEmail === user.email || !item.authorEmail
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleTogglePublish = async (item) => {
    try {
      await togglePublishExam(item.id)
      toast.success(`Đã đổi trạng thái bài thi "${item.title}"`)
      loadExams()
    } catch {
      toast.error('Không thể đổi trạng thái bài thi')
    }
  }

  const handleDuplicate = async (item) => {
    try {
      await duplicateExam(item.id, {
        authorName: user?.displayName || 'Admin',
        authorEmail: user?.email || 'admin@smartenglish.vn',
      })
      toast.success(`Đã nhân bản bài thi "${item.title}"`)
      loadExams()
      refreshTrashCount()
    } catch {
      toast.error('Không thể nhân bản bài thi')
    }
  }

  // Xóa mềm vào thùng rác
  const handleDeleteClick = (e, item) => {
    e?.stopPropagation?.()
    if (!canManage(item)) {
      toast.error('Bạn không có quyền xóa bài thi này!')
      return
    }
    setDeleteTarget(item)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteExam(deleteTarget.id)
      toast.success(`Đã chuyển bài thi "${deleteTarget.title}" vào thùng rác`)
      setDeleteTarget(null)
      loadExams()
      refreshTrashCount()
    } catch {
      toast.error('Xóa bài thi thất bại')
    } finally {
      setIsDeleting(false)
    }
  }

  // Khôi phục từ thùng rác
  const handleTrashRestore = async (item) => {
    try {
      await restoreExam(item.id)
      toast.success(`Đã khôi phục bài thi "${item.title}"`)
      loadExams()
      refreshTrashCount()
    } catch {
      toast.error('Khôi phục thất bại')
    }
  }

  // Xóa vĩnh viễn
  const handleConfirmPermanentDelete = async () => {
    if (!permanentTarget) return
    setIsDeleting(true)
    try {
      await permanentDeleteExam(permanentTarget.id)
      toast.success(`Đã xóa vĩnh viễn bài thi "${permanentTarget.title}"`)
      setPermanentTarget(null)
      loadExams()
      refreshTrashCount()
    } catch {
      toast.error('Xóa vĩnh viễn thất bại')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditClick = (e, item) => {
    if (e?.stopPropagation) e.stopPropagation()
    const target = item?.id ? item : (e?.id ? e : null)
    const id = target?.id
    if (!id) return
    navigate(`/app/hoc-lieu/bai-kiem-tra/${id}/chinh-sua`)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const start = (page - 1) * PAGE_SIZE

  return (
    <div className="space-y-4">
      {/* ─── SEGMENTED NAVIGATION TABS ─── */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'exams'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <GraduationCap size={16} className={activeTab === 'exams' ? 'text-brand-600' : 'text-slate-400'} />
          <span>Đề thi chuẩn hóa (TOEIC, IELTS)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quizzes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'quizzes'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <CheckSquare size={16} className={activeTab === 'quizzes' ? 'text-brand-600' : 'text-slate-400'} />
          <span>Bài tập & Quiz luyện tập</span>
        </button>
      </div>

      {activeTab === 'quizzes' ? (
        /* ─── TAB 2: LEARNING-SERVICE QUIZZES ─── */
        <PracticeQuizTab />
      ) : (
        /* ─── TAB 1: CONTENT-SERVICE EXAMS ─── */
        <>
          {/* Table Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            {/* Banner thông báo khi ở chế độ thùng rác */}
            {trashView && (
              <div className="flex items-center justify-between bg-amber-50/90 border-b border-amber-200 px-5 py-2.5 text-xs text-amber-800">
                <span className="flex items-center gap-1.5 font-medium">
                  <Trash2 size={14} className="text-amber-600 shrink-0" />
                  Bạn đang xem các bài thi trong <strong>Thùng rác</strong> ({trashCount}). Bạn có thể khôi phục hoặc xóa hẳn bất kỳ lúc nào.
                </span>
              </div>
            )}

        {/* Toolbar */}
        <ExamToolbar
          search={search}
          onSearchChange={handleSearch}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          selectedLevel={selectedLevel}
          onLevelChange={handleLevelChange}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          totalCount={total}
          trashView={trashView}
          onToggleTrash={handleToggleTrash}
          trashCount={trashCount}
          onOpenCreate={() => navigate('/app/hoc-lieu/bai-kiem-tra/tao-moi')}
          onOpenImport={() => setIsPdfImportOpen(true)}
          onReload={handleReload}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />

        {/* Chế độ hiển thị: Dạng Bảng (List) hoặc Dạng Thẻ (Grid) */}
        {viewMode === 'list' ? (
          /* Table — co dãn 100% width, không cuộn ngang */
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 w-[38%]">Bài thi / Đề kiểm tra</th>
                <th className="px-3 py-3 w-[12%]">Thể loại</th>
                <th className="px-3 py-3 text-center w-[8%]">Cấp độ</th>
                <th className="px-3 py-3 text-center w-[11%]">Trạng thái</th>
                <th className="px-3 py-3 text-center w-[9%]">Thời lượng</th>
                <th className="px-3 py-3 text-center w-[8%]">Số câu</th>
                <th className="px-3 py-3 text-center w-[6%]">Ngày tạo</th>
                <th className="px-4 py-3 text-right w-[8%]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <LoadingSpinner text="Đang tải danh sách bài thi & kiểm tra..." />
                  </td>
                </tr>
              ) : exams.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                        {trashView ? (
                          <Trash2 size={24} className="text-slate-400" />
                        ) : (
                          <span className="text-2xl">📝</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-600">
                        {trashView ? 'Thùng rác đang trống' : 'Không tìm thấy bài thi nào'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {trashView ? 'Chưa có bài thi nào bị xóa' : 'Thử thay đổi bộ lọc hoặc tạo đề thi mới'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                exams.map((item) => (
                  <ExamTableRow
                    key={item.id}
                    item={item}
                    isTrash={trashView}
                    canManage={canManage(item)}
                    onRowClick={setActiveExam}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                    onRestoreClick={handleTrashRestore}
                    onPermanentDeleteClick={(it) => setPermanentTarget(it)}
                    onTogglePublish={handleTogglePublish}
                    onDuplicate={handleDuplicate}
                  />
                ))
              )}
            </tbody>
          </table>
        ) : (
          /* Card Grid — hiển thị dạng lưới thẻ bài thi hiện đại */
          <div className="p-5">
            {isLoading ? (
              <div className="py-14 text-center">
                <LoadingSpinner text="Đang tải danh sách bài thi & kiểm tra..." />
              </div>
            ) : exams.length === 0 ? (
              <div className="py-14 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                    {trashView ? (
                      <Trash2 size={24} className="text-slate-400" />
                    ) : (
                      <span className="text-2xl">📝</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    {trashView ? 'Thùng rác đang trống' : 'Không tìm thấy bài thi nào'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {trashView ? 'Chưa có bài thi nào bị xóa' : 'Thử thay đổi bộ lọc hoặc tạo đề thi mới'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {exams.map((item) => (
                  <ExamCard
                    key={item.id}
                    item={item}
                    isTrash={trashView}
                    canManage={canManage(item)}
                    onCardClick={setActiveExam}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                    onRestoreClick={handleTrashRestore}
                    onPermanentDeleteClick={(it) => setPermanentTarget(it)}
                    onTogglePublish={handleTogglePublish}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
          <p className="text-xs text-slate-500">
            {total === 0
              ? 'Không có kết quả'
              : <>Hiển thị <strong>{start + 1}</strong>–<strong>{Math.min(start + PAGE_SIZE, total)}</strong> trong <strong>{total}</strong> bài thi</>
            }
          </p>
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      <ExamDetailDrawer
        exam={activeExam}
        onClose={() => setActiveExam(null)}
        canManage={canManage(activeExam)}
        onEditClick={handleEditClick}
      />
        </>
      )}

      {/* Confirm Xóa mềm */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Chuyển bài thi vào thùng rác"
        description={`Bài thi "${deleteTarget?.title}" sẽ được chuyển vào thùng rác. Bạn có thể khôi phục sau.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Chuyển vào thùng rác'}
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Confirm Xóa vĩnh viễn */}
      <ConfirmDialog
        open={Boolean(permanentTarget)}
        title="Xóa vĩnh viễn bài thi"
        description={`Bài thi "${permanentTarget?.title}" sẽ bị xóa vĩnh viễn và không thể khôi phục.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleConfirmPermanentDelete}
        onCancel={() => setPermanentTarget(null)}
      />

      {/* Modal Import PDF */}
      <DataImportWizardModal
        open={isPdfImportOpen}
        onClose={() => setIsPdfImportOpen(false)}
        defaultType="quiz"
        onImportSuccess={() => {
          toast.success('Đã import bài thi thành công!')
          loadExams()
          refreshTrashCount()
        }}
      />
    </div>
  )
}
