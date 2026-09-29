import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import DataImportWizardModal from '@/components/ui/DataImportWizardModal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuthStore } from '@/store/authStore'
import ReadingDetailDrawer from './components/ReadingDetailDrawer'
import ReadingToolbar from './components/ReadingToolbar'
import ReadingTableRow from './components/ReadingTableRow'
import {
  getReadingPassages,
  getReadingTopics,
  getReadingTrashCount,
  deleteReadingPassage,
  restoreReadingPassage,
  permanentDeleteReadingPassage,
  togglePublishReadingPassage,
  duplicateReadingPassage,
} from './readingApi'

const PAGE_SIZE = 8

// ── Main Page ──────────────────────────────────────────────────────────────
function ReadingPage() {
  const navigate  = useNavigate()
  const user      = useAuthStore((s) => s.user)

  // ── Data State ─────────────────────────────────────────────────────────────
  const [passages,    setPassages]    = useState([])
  const [topics,      setTopics]      = useState([])
  const [isLoading,   setIsLoading]   = useState(true)
  const [total,       setTotal]       = useState(0)
  const [totalPages,  setTotalPages]  = useState(1)
  const [trashCount,  setTrashCount]  = useState(0)

  // ── Filter State ───────────────────────────────────────────────────────────
  const [search,         setSearch]         = useState('')
  const [selectedTopic,  setSelectedTopic]  = useState('Tất cả chủ đề')
  const [selectedLevel,  setSelectedLevel]  = useState('Tất cả')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [page,           setPage]           = useState(1)
  const [trashView,      setTrashView]      = useState(false)

  // ── Modal / Drawer State ───────────────────────────────────────────────────
  const [activePassage,        setActivePassage]        = useState(null)
  const [isPdfImportOpen,      setIsPdfImportOpen]      = useState(false)
  const [deleteTarget,         setDeleteTarget]         = useState(null)
  const [permanentTarget,      setPermanentTarget]      = useState(null)
  const [isDeleting,           setIsDeleting]           = useState(false)

  // ── Refresh trash count ────────────────────────────────────────────────────
  const refreshTrashCount = useCallback(async () => {
    try {
      const count = await getReadingTrashCount()
      setTrashCount(count)
    } catch { /* silent */ }
  }, [])

  // ── Load topics ────────────────────────────────────────────────────────────
  useEffect(() => {
    getReadingTopics().then((t) => setTopics(t)).catch(() => {})
    refreshTrashCount()
  }, [refreshTrashCount])

  // ── Load passages (paginated) ──────────────────────────────────────────────
  const loadPassages = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getReadingPassages({
        search:    search.trim() || undefined,
        topic:     selectedTopic !== 'Tất cả chủ đề' ? selectedTopic : undefined,
        cefrLevel: selectedLevel !== 'Tất cả' ? selectedLevel : undefined,
        status:    !trashView && selectedStatus !== 'all' ? selectedStatus : undefined,
        trash:     trashView,
        page,
        size:      PAGE_SIZE,
        sortBy:    'created_desc',
      })
      setPassages(res.items || [])
      setTotal(res.total || 0)
      setTotalPages(res.totalPages || 1)
    } catch (err) {
      toast.error('Không thể tải danh sách bài đọc')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [search, selectedTopic, selectedLevel, selectedStatus, page, trashView])

  useEffect(() => { loadPassages() }, [loadPassages])

  // Filter handlers
  const handleSearch       = (v) => { setSearch(v);        setPage(1) }
  const handleTopicChange  = (v) => { setSelectedTopic(v); setPage(1) }
  const handleLevelChange  = (v) => { setSelectedLevel(v); setPage(1) }
  const handleStatusChange = (v) => { setSelectedStatus(v); setPage(1) }

  const handleToggleTrash = (nextTrashView) => {
    setTrashView(nextTrashView)
    setPage(1)
    setSearch('')
  }

  const handleReload = () => {
    setSearch('')
    setSelectedTopic('Tất cả chủ đề')
    setSelectedLevel('Tất cả')
    setSelectedStatus('all')
    setPage(1)
    refreshTrashCount()
    loadPassages()
    toast.success('Đã làm mới danh sách bài đọc')
  }

  const canManage = (item) => {
    if (!item) return false
    if (!user || user?.role !== 'student') return true
    return item.authorEmail === user.email || !item.authorEmail
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleTogglePublish = async (item) => {
    try {
      await togglePublishReadingPassage(item.id)
      toast.success(`Đã đổi trạng thái bài đọc "${item.titleEn}"`)
      loadPassages()
    } catch {
      toast.error('Không thể đổi trạng thái bài đọc')
    }
  }

  const handleDuplicate = async (item) => {
    try {
      await duplicateReadingPassage(item.id, {
        authorName:  user?.displayName  || 'Admin',
        authorEmail: user?.email        || 'admin@smartenglish.vn',
      })
      toast.success(`Đã nhân bản bài đọc "${item.titleEn}"`)
      loadPassages()
      refreshTrashCount()
    } catch {
      toast.error('Không thể nhân bản bài đọc')
    }
  }

  // Xóa mềm vào thùng rác
  const handleDeleteClick = (e, item) => {
    e?.stopPropagation?.()
    if (!canManage(item)) {
      toast.error('Bạn không có quyền xóa bài đọc này!')
      return
    }
    setDeleteTarget(item)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteReadingPassage(deleteTarget.id)
      toast.success(`Đã chuyển bài đọc "${deleteTarget.titleEn}" vào thùng rác`)
      setDeleteTarget(null)
      loadPassages()
      refreshTrashCount()
    } catch {
      toast.error('Xóa bài đọc thất bại')
    } finally {
      setIsDeleting(false)
    }
  }

  // Khôi phục từ thùng rác
  const handleTrashRestore = async (item) => {
    try {
      await restoreReadingPassage(item.id)
      toast.success(`Đã khôi phục bài đọc "${item.titleEn}"`)
      loadPassages()
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
      await permanentDeleteReadingPassage(permanentTarget.id)
      toast.success(`Đã xóa vĩnh viễn bài đọc "${permanentTarget.titleEn}"`)
      setPermanentTarget(null)
      loadPassages()
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
    navigate(`/app/hoc-lieu/bai-doc/${id}/chinh-sua`)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const start = (page - 1) * PAGE_SIZE

  return (
    <div className="space-y-4">
      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Banner thông báo khi ở chế độ thùng rác */}
        {trashView && (
          <div className="flex items-center justify-between bg-amber-50/90 border-b border-amber-200 px-5 py-2.5 text-xs text-amber-800">
            <span className="flex items-center gap-1.5 font-medium">
              <Trash2 size={14} className="text-amber-600 shrink-0" />
              Bạn đang xem các bài đọc trong <strong>Thùng rác</strong> ({trashCount}). Bạn có thể khôi phục hoặc xóa hẳn bất kỳ lúc nào.
            </span>
          </div>
        )}

        {/* Toolbar */}
        <ReadingToolbar
          search={search}
          onSearchChange={handleSearch}
          selectedTopic={selectedTopic}
          onTopicChange={handleTopicChange}
          topics={topics}
          selectedLevel={selectedLevel}
          onLevelChange={handleLevelChange}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          totalCount={total}
          trashView={trashView}
          onToggleTrash={handleToggleTrash}
          trashCount={trashCount}
          onOpenCreate={() => navigate('/app/hoc-lieu/bai-doc/tao-moi')}
          onOpenPdfImport={() => setIsPdfImportOpen(true)}
          onReload={handleReload}
        />

        {/* Table — no overflow-x-auto */}
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3 w-[40%]">Bài đọc hiểu</th>
              <th className="px-3 py-3 w-[10%]">Chủ đề</th>
              <th className="px-3 py-3 text-center w-[7%]">Cấp độ</th>
              <th className="px-3 py-3 text-center w-[11%]">Trạng thái</th>
              <th className="px-3 py-3 text-center w-[10%]">Độ dài</th>
              <th className="px-3 py-3 text-center w-[7%]">Câu hỏi</th>
              <th className="px-3 py-3 w-[9%]">Ngày tạo</th>
              <th className="px-4 py-3 text-right w-[11%]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <LoadingSpinner text="Đang tải danh sách bài đọc..." />
                </td>
              </tr>
            ) : passages.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                      {trashView ? (
                        <Trash2 size={24} className="text-slate-400" />
                      ) : (
                        <span className="text-2xl">📖</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-600">
                      {trashView ? 'Thùng rác đang trống' : 'Không tìm thấy bài đọc nào'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {trashView ? 'Chưa có bài đọc nào bị xóa' : 'Thử thay đổi bộ lọc hoặc thêm bài đọc mới'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              passages.map((item) => (
                <ReadingTableRow
                  key={item.id}
                  item={item}
                  isTrash={trashView}
                  canManage={canManage(item)}
                  onRowClick={setActivePassage}
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

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
          <p className="text-xs text-slate-500">
            {total === 0
              ? 'Không có kết quả'
              : <>Hiển thị <strong>{start + 1}</strong>–<strong>{Math.min(start + PAGE_SIZE, total)}</strong> trong <strong>{total}</strong> bài đọc</>
            }
          </p>
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      <ReadingDetailDrawer
        passage={activePassage}
        onClose={() => setActivePassage(null)}
        canManage={canManage(activePassage)}
        onEditClick={handleEditClick}
      />

      {/* Confirm Xóa mềm */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Chuyển vào thùng rác"
        description={`Bài đọc "${deleteTarget?.titleEn}" sẽ được chuyển vào thùng rác. Bạn có thể khôi phục sau.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Chuyển vào thùng rác'}
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Confirm Xóa vĩnh viễn */}
      <ConfirmDialog
        open={Boolean(permanentTarget)}
        title="Xóa vĩnh viễn bài đọc"
        description={`Bài đọc "${permanentTarget?.titleEn}" sẽ bị xóa vĩnh viễn và không thể khôi phục.`}
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
        defaultType="reading"
        onImportSuccess={(newItems) => {
          toast.success(`Đã import thành công ${newItems.length} bài đọc!`)
          loadPassages()
          refreshTrashCount()
        }}
      />
    </div>
  )
}

export default ReadingPage
