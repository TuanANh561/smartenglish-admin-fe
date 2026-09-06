import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Crown } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import DataImportWizardModal from '@/components/ui/DataImportWizardModal'
import { readings } from '@/mocks/data/readings'
import { LEVEL_GROUPS } from './levels'
import { buildPublicContent } from '@/features/aiContent/aiContentService'
import { useAuthStore } from '@/store/authStore'
import ReadingDetailDrawer from './components/ReadingDetailDrawer'
import ReadingToolbar from './components/ReadingToolbar'
import ReadingTableRow from './components/ReadingTableRow'

const PAGE_SIZE = 8

function ReadingPage() {
  const user = useAuthStore((s) => s.user)
  const isTeacher = user?.role === 'teacher'
  const isAdmin = user?.role === 'admin'
  const navigate = useNavigate()

  const [readingItems, setReadingItems] = useState(readings)
  const [ownershipFilter, setOwnershipFilter] = useState(isTeacher ? 'mine' : 'all')
  const [search, setSearch] = useState('')
  const [levelGroup, setLevelGroup] = useState('all')
  const [page, setPage] = useState(1)
  const [activeReading, setActiveReading] = useState(null)
  const [isPdfImportOpen, setIsPdfImportOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const publicReadings = useMemo(
    () => buildPublicContent('reading', readingItems),
    [readingItems],
  )
  const activeGroup = LEVEL_GROUPS.find((group) => group.key === levelGroup)

  const checkOwnership = (item) => {
    if (!user || !item) return false
    if (isTeacher) {
      return (
        item.authorEmail === user.email ||
        item.authorName === user.displayName ||
        item.authorName === 'Hoàng Thị Mai'
      )
    }
    return (
      item.authorEmail === user.email ||
      item.authorEmail === 'system@smartenglish.vn' ||
      item.authorName?.includes('Hệ thống') ||
      item.authorName?.includes('Quản trị')
    )
  }

  const canManage = (item) => {
    if (!user || !item) return false
    if (isAdmin) return true
    return checkOwnership(item)
  }

  const myReadingsCount = useMemo(() => {
    return publicReadings.filter((item) => checkOwnership(item)).length
  }, [publicReadings, user])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return publicReadings.filter((item) => {
      const isOwned = checkOwnership(item)
      const isSystem =
        item.authorEmail === 'system@smartenglish.vn' || item.authorName?.includes('Hệ thống')

      let matchOwner = true
      if (ownershipFilter === 'mine') {
        matchOwner = isOwned
      } else if (ownershipFilter === 'system') {
        matchOwner = isSystem
      } else if (ownershipFilter === 'others') {
        matchOwner = !isOwned && !isSystem
      } else if (ownershipFilter !== 'all') {
        matchOwner = item.authorName === ownershipFilter || item.authorEmail === ownershipFilter
      }

      const matchLevel = !activeGroup.levels || activeGroup.levels.includes(item.level)
      const matchSearch =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        (item.description || '').toLowerCase().includes(keyword) ||
        (item.topic || '').toLowerCase().includes(keyword)

      return matchOwner && matchLevel && matchSearch
    })
  }, [search, activeGroup, publicReadings, ownershipFilter, user])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageData = filtered.slice(start, start + PAGE_SIZE)

  const handleSearchChange = (value) => {
    setSearch(value)
    setPage(1)
  }

  const handleLevelChange = (key) => {
    setLevelGroup(key)
    setPage(1)
  }

  const handleOwnershipChange = (key) => {
    setOwnershipFilter(key)
    setPage(1)
  }

  const handleOpenCreate = () => navigate('/hoc-lieu/bai-doc/tao-moi')

  const handleEditClick = (e, item) => {
    e?.stopPropagation?.()
    if (!canManage(item)) {
      toast.error(`Bạn không thể sửa bài đọc của "${item.authorName || 'người khác'}".`)
      return
    }
    navigate(`/hoc-lieu/bai-doc/${item.id}/chinh-sua`)
  }

  const handleDeleteClick = (e, item) => {
    e?.stopPropagation?.()
    if (!canManage(item)) {
      toast.error('Bạn không có quyền xóa học liệu này!')
      return
    }
    setDeleteTarget(item)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    setReadingItems((prev) => prev.filter((r) => r.id !== deleteTarget.id))
    toast.success(`Đã xóa bài đọc "${deleteTarget.title}"`)
    setDeleteTarget(null)
  }

  const handleAssignToClass = (e, item) => {
    e.stopPropagation()
    toast.success(`Đã mở popup giao bài "${item.title}" cho lớp học`)
  }

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
              Bạn đã tạo <strong className="text-brand-600 font-bold">{myReadingsCount}</strong> bài đọc · Hạn mức{' '}
              <strong className="text-emerald-600 font-bold">Không giới hạn</strong>
            </span>
          </div>
          <Link to="/goi-dich-vu" className="ml-auto font-semibold text-brand-600 hover:underline">
            Chi tiết gói →
          </Link>
        </div>
      )}

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Toolbar */}
        <ReadingToolbar
          search={search}
          onSearchChange={handleSearchChange}
          ownershipFilter={ownershipFilter}
          onOwnershipChange={handleOwnershipChange}
          levelGroup={levelGroup}
          onLevelChange={handleLevelChange}
          totalCount={publicReadings.length}
          myReadingsCount={myReadingsCount}
          isTeacher={isTeacher}
          onOpenCreate={handleOpenCreate}
          onOpenPdfImport={() => setIsPdfImportOpen(true)}
        />

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3.5 w-[36%] min-w-[260px]">BÀI ĐỌC HIỂU</th>
                <th className="px-4 py-3.5 text-center w-[10%] min-w-[80px]">CẤP ĐỘ</th>
                <th className="px-4 py-3.5 text-center w-[13%] min-w-[110px]">ĐỘ DÀI</th>
                <th className="px-4 py-3.5 w-[14%] min-w-[130px]">NGUỒN / TÁC GIẢ</th>
                <th className="px-4 py-3.5 text-center w-[10%] min-w-[90px]">CÂU HỎI</th>
                <th className="px-4 py-3.5 w-[11%] min-w-[110px]">NGÀY TẠO</th>
                <th className="px-6 py-3.5 text-right w-[14%] min-w-[130px]">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                    Không tìm thấy bài đọc nào phù hợp
                  </td>
                </tr>
              ) : (
                pageData.map((item) => (
                  <ReadingTableRow
                    key={item.id}
                    item={item}
                    isOwned={checkOwnership(item)}
                    isSystem={
                      item.authorEmail === 'system@smartenglish.vn' ||
                      item.authorName?.includes('Hệ thống')
                    }
                    canManage={canManage(item)}
                    isTeacher={isTeacher}
                    onRowClick={setActiveReading}
                    onAssignToClass={handleAssignToClass}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-500">
            Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>-
            <strong>{Math.min(start + PAGE_SIZE, total)}</strong> trong tổng số{' '}
            <strong>{total}</strong> bài đọc
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* Drawer xem chi tiết */}
      <ReadingDetailDrawer
        reading={activeReading}
        onClose={() => setActiveReading(null)}
        isTeacher={isTeacher}
        isOwner={checkOwnership(activeReading)}
        canManage={canManage(activeReading)}
        onAssignToClass={handleAssignToClass}
        onEditClick={handleEditClick}
      />

      {/* Confirm Xóa */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa bài đọc"
        description={`Bạn có chắc chắn muốn xóa bài đọc "${deleteTarget?.title}"?`}
        confirmLabel="Xóa bài đọc"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Modal Import PDF AI */}
      <DataImportWizardModal
        open={isPdfImportOpen}
        onClose={() => setIsPdfImportOpen(false)}
        defaultType="reading"
        onImportSuccess={(newItems) => {
          const formatted = newItems.map((item, idx) => ({
            id: `read-imported-${Date.now()}-${idx}`,
            title: item.title,
            topic: item.topic || 'General Science',
            level: item.level || 'B2',
            status: item.status || 'published',
            wordCount: item.wordCount || 350,
            readingTime: item.readingTime || '4 phút',
            summary: item.summary || 'Trích xuất tự động từ file PDF...',
            content: item.content || '',
            questions: item.questions || [],
            authorName: user?.displayName || 'Admin AI Extractor',
            authorEmail: user?.email || 'admin@smartenglish.vn',
            createdAt: new Date().toISOString(),
          }))
          setReadingItems((prev) => [...formatted, ...prev])
          toast.success(`Đã thêm thành công ${formatted.length} bài đọc hiểu bóc tách từ PDF!`)
        }}
      />
    </div>
  )
}

export default ReadingPage
