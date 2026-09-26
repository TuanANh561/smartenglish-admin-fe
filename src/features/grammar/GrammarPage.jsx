import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Archive,
  BookOpen,
  Crown,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import DataImportWizardModal from '@/components/ui/DataImportWizardModal'
import { GRAMMAR_TOPICS } from '@/mocks/data/grammar'
import { useAuthStore } from '@/store/authStore'
import GrammarTableRow from './components/GrammarTableRow'
import GrammarDetailDrawer from './components/GrammarDetailDrawer'
import {
  getGrammarLessons,
  getGrammarTopics,
  getGrammarTrashCount,
  createGrammarLesson,
  deleteGrammarLesson,
  restoreGrammarLesson,
  permanentDeleteGrammarLesson,
  duplicateGrammarLesson,
  togglePublishGrammarLesson,
} from './grammarLessonApi'

const CEFR_LEVELS = ['Tất cả', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'published', label: 'Published (Đã xuất bản)' },
  { value: 'draft', label: 'Draft (Bản nháp)' },
]

const PAGE_SIZE = 10

function GrammarPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [lessons, setLessons] = useState([])
  const [topics, setTopics] = useState(GRAMMAR_TOPICS)
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState('active') // 'active' | 'trash'
  const [trashCount, setTrashCount] = useState(0)
  const [selectedTopic, setSelectedTopic] = useState('Tất cả chủ điểm')
  const [selectedLevel, setSelectedLevel] = useState('Tất cả')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Drawer / Modal states
  const [activeLesson, setActiveLesson] = useState(null)
  const [isPdfImportOpen, setIsPdfImportOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null)
  const [isPermanentDeleting, setIsPermanentDeleting] = useState(false)

  // Load distinct topics and trash count
  const refreshTrashCount = useCallback(async () => {
    try {
      const count = await getGrammarTrashCount()
      setTrashCount(count)
    } catch (err) {
      console.warn('Không tải được số lượng thùng rác:', err)
    }
  }, [])

  useEffect(() => {
    getGrammarTopics()
      .then((resTopics) => {
        if (Array.isArray(resTopics) && resTopics.length > 0) {
          const unique = Array.from(new Set(['Tất cả chủ điểm', ...resTopics]))
          setTopics(unique)
        }
      })
      .catch((err) => console.warn('Không tải được topics:', err))

    refreshTrashCount()
  }, [refreshTrashCount])

  // Load lessons with search, filters, pagination, and trash mode
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getGrammarLessons({
        page,
        size: PAGE_SIZE,
        search,
        topic: selectedTopic,
        cefrLevel: selectedLevel,
        status: selectedStatus,
        trash: activeTab === 'trash',
      })
      const items = res?.items || []
      setLessons(items)
      setTotal(res?.total ?? items.length)
      setTotalPages(res?.totalPages ?? Math.max(1, Math.ceil((res?.total ?? items.length) / PAGE_SIZE)))
    } catch (err) {
      console.error('Lỗi khi tải bài học ngữ pháp:', err)
      toast.error('Không thể tải danh sách bài học ngữ pháp')
    } finally {
      setIsLoading(false)
    }
  }, [page, search, selectedTopic, selectedLevel, selectedStatus, activeTab])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setPage(1)
  }

  const handleOpenCreate = () => {
    navigate('/app/hoc-lieu/ngu-phap/tao-moi')
  }

  const handleOpenEdit = (e, item) => {
    e?.stopPropagation?.()
    navigate(`/app/hoc-lieu/ngu-phap/${item.id}/chinh-sua`)
  }

  const handleTogglePublish = async (e, item) => {
    e?.stopPropagation?.()
    try {
      const updated = await togglePublishGrammarLesson(item.id)
      const nextStatus = updated?.status || (item.status === 'published' ? 'draft' : 'published')
      setLessons((prev) =>
        prev.map((l) => (l.id === item.id ? { ...l, status: nextStatus } : l))
      )
      toast.success(
        nextStatus === 'published'
          ? `Đã xuất bản bài học "${item.title}"`
          : `Đã chuyển "${item.title}" về bản nháp`
      )
    } catch (err) {
      toast.error('Không thể cập nhật trạng thái bài học')
    }
  }

  const handleDuplicate = async (e, item) => {
    e?.stopPropagation?.()
    try {
      await duplicateGrammarLesson(item.id, {
        authorName: user?.displayName || 'Admin',
        authorEmail: user?.email || 'admin@smartenglish.vn',
      })
      toast.success(`Đã nhân bản bài học "${item.title}"`)
      loadData()
    } catch (err) {
      toast.error('Không thể nhân bản bài học')
    }
  }

  // Soft delete (move to trash)
  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setIsDeleting(true)
      await deleteGrammarLesson(deleteTarget.id)
      toast.success(`Đã chuyển bài học "${deleteTarget.title}" vào thùng rác`)
      setDeleteTarget(null)
      loadData()
      refreshTrashCount()
    } catch (err) {
      toast.error('Không thể chuyển bài học vào thùng rác')
    } finally {
      setIsDeleting(false)
    }
  }

  // Restore from trash
  const handleRestore = async (e, item) => {
    e?.stopPropagation?.()
    try {
      await restoreGrammarLesson(item.id)
      toast.success(`Đã khôi phục bài học "${item.title}"`)
      loadData()
      refreshTrashCount()
    } catch (err) {
      toast.error('Không thể khôi phục bài học')
    }
  }

  // Permanent delete
  const handlePermanentDelete = async () => {
    if (!permanentDeleteTarget) return
    try {
      setIsPermanentDeleting(true)
      await permanentDeleteGrammarLesson(permanentDeleteTarget.id)
      toast.success(`Đã xóa vĩnh viễn bài học "${permanentDeleteTarget.title}"`)
      setPermanentDeleteTarget(null)
      loadData()
      refreshTrashCount()
    } catch (err) {
      toast.error('Không thể xóa vĩnh viễn bài học')
    } finally {
      setIsPermanentDeleting(false)
    }
  }

  const start = (page - 1) * PAGE_SIZE
  const isTeacher = user?.role === 'teacher'

  return (
    <div className="space-y-4">
      {/* Top action & Quota */}
      {isTeacher && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-brand-200 bg-brand-50/70 px-4 py-2.5 text-xs shadow-2xs">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white">
            <Crown size={13} />
          </span>
          <div>
            <span className="font-semibold text-navy-700">Gói Teacher Pro:</span>{' '}
            <span className="text-ink-muted">
              Hệ thống lưu trữ <strong className="text-brand-600 font-bold">{total}</strong> bài học ngữ pháp · Hạn mức{' '}
              <strong className="text-emerald-600 font-bold">Không giới hạn</strong>
            </span>
          </div>
          <Link to="/goi-dich-vu" className="ml-auto font-semibold text-brand-600 hover:underline">
            Chi tiết gói →
          </Link>
        </div>
      )}

      {/* ─── Tabs Navigation: Active vs Trash ─────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTabChange('active')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen size={16} />
            <span>Đang hoạt động</span>
            {activeTab === 'active' && (
              <span className="ml-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                {total}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('trash')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'trash'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Trash2 size={16} />
            <span>Thùng rác</span>
            {trashCount > 0 && (
              <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                {trashCount}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'trash' && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
            Bài học trong thùng rác có thể khôi phục hoặc xóa hẳn bất kỳ lúc nào
          </span>
        )}
      </div>

      {/* ─── Table Card (Matching Benchmark Design) ────────────────────── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Toolbar & Search */}
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={activeTab === 'trash' ? "Tìm kiếm trong thùng rác..." : "Tìm kiếm bài học, cấu trúc ngữ pháp..."}
              className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedTopic}
              onChange={(e) => { setSelectedTopic(e.target.value); setPage(1) }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic === 'Tất cả chủ điểm' ? 'Chủ điểm: Tất cả' : topic}
                </option>
              ))}
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => { setSelectedLevel(e.target.value); setPage(1) }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              {CEFR_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl === 'Tất cả' ? 'Cấp độ: Tất cả' : `Cấp độ ${lvl}`}
                </option>
              ))}
            </select>

            {activeTab !== 'trash' && (
              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setPage(1) }}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              onClick={loadData}
              title="Tải lại danh sách"
            />

            {activeTab !== 'trash' && (
              <>
                <Button size="sm" variant="secondary" icon={Upload} onClick={() => setIsPdfImportOpen(true)}>
                  Import
                </Button>

                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Thêm bài học</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3.5 w-[36%] min-w-[260px]">BÀI HỌC NGỮ PHÁP</th>
                <th className="px-4 py-3.5 w-[14%] min-w-[120px]">CHỦ ĐIỂM</th>
                <th className="px-4 py-3.5 text-center w-[10%] min-w-[80px]">CẤP ĐỘ</th>
                <th className="px-4 py-3.5 text-center w-[11%] min-w-[90px]">SỐ BÀI TẬP</th>
                <th className="px-4 py-3.5 w-[14%] min-w-[130px]">TRẠNG THÁI</th>
                <th className="px-4 py-3.5 w-[11%] min-w-[100px]">{activeTab === 'trash' ? 'NGÀY XÓA' : 'CẬP NHẬT'}</th>
                <th className="px-6 py-3.5 text-right w-[14%] min-w-[130px]">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-brand-600" size={24} />
                      <span>{activeTab === 'trash' ? 'Đang tải thùng rác...' : 'Đang tải danh sách bài học ngữ pháp...'}</span>
                    </div>
                  </td>
                </tr>
              ) : lessons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                    {activeTab === 'trash'
                      ? 'Thùng rác trống. Không có bài học nào bị xóa.'
                      : 'Không tìm thấy bài học ngữ pháp nào phù hợp'}
                  </td>
                </tr>
              ) : (
                lessons.map((item) => (
                  <GrammarTableRow
                    key={item.id}
                    item={item}
                    isTrash={activeTab === 'trash'}
                    onView={(l) => setActiveLesson(l)}
                    onEdit={(e, l) => handleOpenEdit(e, l)}
                    onDuplicate={(e, l) => handleDuplicate(e, l)}
                    onDelete={(e, l) => {
                      e.stopPropagation()
                      setDeleteTarget(l)
                    }}
                    onRestore={(e, l) => handleRestore(e, l)}
                    onPermanentDelete={(e, l) => {
                      e.stopPropagation()
                      setPermanentDeleteTarget(l)
                    }}
                    onTogglePublish={(e, l) => handleTogglePublish(e, l)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-500">
            Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>-
            <strong>{Math.min(start + PAGE_SIZE, total)}</strong> trong tổng số{' '}
            <strong>{total}</strong> bài học {activeTab === 'trash' ? 'trong thùng rác' : ''}
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* ─── Drawer View Lesson Details ─────────────────────────────────── */}
      <GrammarDetailDrawer
        activeLesson={activeLesson}
        onClose={() => setActiveLesson(null)}
        onEdit={(item) => navigate(`/app/hoc-lieu/ngu-phap/${item.id}/chinh-sua`)}
      />

      {/* ─── Soft Delete Confirmation Dialog ────────────────────────────── */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Chuyển vào thùng rác"
        description={`Bạn có chắc chắn muốn chuyển bài học "${deleteTarget?.title}" vào thùng rác? Bài học sẽ tạm ẩn và bạn có thể khôi phục lại bất kỳ lúc nào.`}
        confirmLabel="Chuyển vào thùng rác"
        cancelLabel="Hủy"
        variant="warning"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ─── Permanent Delete Confirmation Dialog ───────────────────────── */}
      <ConfirmDialog
        open={Boolean(permanentDeleteTarget)}
        title="Xóa vĩnh viễn bài học"
        description={`Bạn có chắc chắn muốn xóa vĩnh viễn bài học "${permanentDeleteTarget?.title}" khỏi hệ thống? Toàn bộ quy tắc và câu hỏi luyện tập sẽ bị xóa vĩnh viễn và KHÔNG THỂ khôi phục.`}
        confirmLabel="Xóa vĩnh viễn"
        cancelLabel="Hủy"
        variant="danger"
        isLoading={isPermanentDeleting}
        onConfirm={handlePermanentDelete}
        onCancel={() => setPermanentDeleteTarget(null)}
      />

      {/* ─── Modal Import PDF AI ────────────────────────────────────────── */}
      <DataImportWizardModal
        open={isPdfImportOpen}
        onClose={() => setIsPdfImportOpen(false)}
        defaultType="grammar"
        onImportSuccess={async (newItems) => {
          try {
            let count = 0
            for (const item of newItems) {
              await createGrammarLesson({
                title: item.title,
                topic: item.topic || 'Advanced Grammar',
                cefrLevel: item.level || 'B2',
                status: item.status || 'published',
                exerciseCount: item.exerciseCount || 10,
                description: item.description || '',
                formula: item.formula || '',
                keyRules: item.keyRules || [],
                examples: item.examples || [],
                sampleExercises: item.sampleExercises || [],
                authorName: user?.displayName || 'Admin AI Parser',
                authorEmail: user?.email || 'admin@smartenglish.vn',
              })
              count++
            }
            toast.success(`Đã thêm thành công ${count} bài học ngữ pháp bóc tách từ PDF!`)
            loadData()
          } catch (err) {
            console.error('Lỗi lưu bài học bóc tách:', err)
            toast.error('Có lỗi xảy ra khi lưu bài học nhập khẩu')
          }
        }}
      />
    </div>
  )
}

export default GrammarPage
