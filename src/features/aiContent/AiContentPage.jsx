import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2, Trash2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  approveAIContent,
  bulkApproveAIContents,
  fetchAIContentRecords,
  getAIContentRecords,
  rejectAIContent,
  restoreAIContent,
  revokeAIContent,
  saveGeminiContent,
  softDeleteAIContent,
  updateAIContent,
} from './aiContentService'
import {
  generateCloze,
  generateReading,
  generateQuiz,
  GeminiServiceError,
} from './geminiService'
import { useAuthStore } from '@/store/authStore'
import { useTopbarStore } from '@/store/topbarStore'
import { TYPE_LABELS } from './components/aiContentConstants'
import AiDetailView from './components/AiDetailView'
import AiEditView from './components/AiEditView'
import AiContentCard from './components/AiContentCard'
import AiGeneratingCard from './components/AiGeneratingCard'
import AiCreationModal from './components/AiCreationModal'
import AiContentToolbar from './components/AiContentToolbar'

const SYSTEM_AUTHORS = new Set(['', 'ai system', 'system', 'admin', 'hệ thống', 'quản trị viên'])

function AiContentPage() {
  const user = useAuthStore((state) => state.user)
  const isTeacher = String(user?.role || '').toLowerCase().includes('teacher')
  const defaultAuthorFilter = isTeacher ? 'mine' : 'all'
  const [activeTab, setActiveTab] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [authorFilter, setAuthorFilter] = useState(defaultAuthorFilter)

  useEffect(() => {
    setAuthorFilter(defaultAuthorFilter)
  }, [defaultAuthorFilter, user?.id])
  const [searchTerm, setSearchTerm] = useState('')
  const [items, setItems] = useState(() => getAIContentRecords())
  const [isLoading, setIsLoading] = useState(false)
  const [view, setView] = useState('list') // 'list' | 'detail' | 'edit'
  const [selectedItem, setSelectedItem] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingStatus, setGeneratingStatus] = useState('')
  const [showCreationForm, setShowCreationForm] = useState(false)
  const [showTrash, setShowTrash] = useState(false)
  const [draft, setDraft] = useState({
    type: 'quiz_grammar',
    topic: '12 Thì cơ bản & Nâng cao (Tenses & Aspects)',
    prompt: '',
    level: 'B2',
    questionCount: 5,
  })

  // Tải dữ liệu thật từ Backend PostgreSQL khi vào trang
  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      setIsLoading(true)
      try {
        const records = await fetchAIContentRecords()
        if (isMounted && records) {
          setItems(records)
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu AI:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  const normalizeOwner = (value) => String(value ?? '').trim().toLowerCase()
  const isOwnedByCurrentUser = useMemo(() => {
    return (item) => {
      if (!user) return true
      const candidates = [
        normalizeOwner(user.displayName),
        normalizeOwner(user.email),
        normalizeOwner(user.username),
        normalizeOwner(user.id),
      ].filter(Boolean)
      const created = normalizeOwner(item?.createdBy || item?.authorName || item?.authorEmail || '')
      const approved = normalizeOwner(item?.approvedBy || '')
      return candidates.some((c) => c === created || c === approved)
    }
  }, [user])

  // Nội dung hệ thống: do AI/quản trị viên tạo (createdBy rỗng hoặc là tài khoản hệ thống)
  const isSystemItem = (item) =>
    SYSTEM_AUTHORS.has(normalizeOwner(item?.createdBy || item?.authorName || ''))

  const trashCount = useMemo(
    () => items.filter((item) => item.status === 'DELETED').length,
    [items],
  )

  const matchCategoryFilter = (tab, rawType) => {
    if (tab === 'all') return true
    const t = (rawType || '').toLowerCase()
    if (tab === 'grammar') return t.includes('grammar')
    if (tab === 'vocab') return t.includes('vocab')
    if (tab === 'toeic') return t.includes('toeic') || t.includes('cloze')
    if (tab === 'placement') return t.includes('placement')
    if (tab === 'reading') return t === 'reading'
    if (tab === 'quiz') return t.includes('quiz') || t === 'exam' || t === 'general'
    return t === tab
  }

  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        const isDeleted = item.status === 'DELETED'
        const itemType = (item.rawType || item.type || '').toLowerCase()

        if (showTrash) {
          const matchesTrashType = matchCategoryFilter(activeTab, itemType)
          return isDeleted && matchesTrashType
        }

        if (isDeleted) return false

        const matchesType = matchCategoryFilter(activeTab, itemType)
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter
        const isMine = isOwnedByCurrentUser(item)
        const isSystem = isSystemItem(item)
        // Giáo viên chỉ được thấy nội dung của mình và của hệ thống, không thấy của giáo viên khác
        if (isTeacher && !isMine && !isSystem) return false
        const matchesOwner =
          authorFilter === 'all'
            ? true
            : authorFilter === 'mine'
              ? isMine
              : authorFilter === 'system'
                ? isSystem
                : !isMine
        const keyword = searchTerm.trim().toLowerCase()
        const matchesSearch =
          !keyword ||
          (item.title || '').toLowerCase().includes(keyword) ||
          (item.content || '').toLowerCase().includes(keyword)

        return matchesType && matchesStatus && matchesOwner && matchesSearch
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, activeTab, statusFilter, authorFilter, searchTerm, isOwnedByCurrentUser, showTrash, isTeacher],
  )

  const pendingCount = useMemo(
    () => visibleItems.filter((i) => i.status === 'PENDING_REVIEW' && isOwnedByCurrentUser(i)).length,
    [visibleItems, isOwnedByCurrentUser],
  )

  const refresh = async () => {
    try {
      const updated = await fetchAIContentRecords()
      setItems(updated)
      if (selectedItem) {
        const fresh = updated.find((i) => i.id === selectedItem.id)
        if (fresh) setSelectedItem(fresh)
      }
    } catch {
      const localUpdated = getAIContentRecords()
      setItems(localUpdated)
      if (selectedItem) {
        const fresh = localUpdated.find((i) => i.id === selectedItem.id)
        if (fresh) setSelectedItem(fresh)
      }
    }
  }

  const updateStatus = async (id, status, reason = '') => {
    try {
      if (status === 'APPROVED') await approveAIContent(id, user)
      else if (status === 'REJECTED') await rejectAIContent(id, reason, user)
      await refresh()
      toast.success(status === 'APPROVED' ? 'Đã duyệt nội dung & đồng bộ sang Ngân hàng đề thi' : 'Đã từ chối nội dung')
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật nội dung')
    }
  }

  const handleBulkApprove = async () => {
    const manageableItems = visibleItems.filter((item) => isOwnedByCurrentUser(item))
    if (manageableItems.length === 0) {
      toast.error('Không có nội dung nào thuộc quyền quản lý của bạn để duyệt')
      return
    }
    const ids = manageableItems.map((item) => item.id)
    await bulkApproveAIContents(ids, user)
    await refresh()
    toast.success(`Đã duyệt ${ids.length} bài học liệu & đề thi AI`)
  }

  const handleCardClick = (item) => {
    setSelectedItem(item)
    setView('detail')
  }

  const handleEdit = () => setView('edit')

  const handleSaveEdit = async ({ content, questions }) => {
    try {
      await updateAIContent(selectedItem.id, { content, definition: content, questions })
      await refresh()
      toast.success('Đã lưu thay đổi')
      setView('detail')
    } catch (error) {
      toast.error(error.message || 'Không thể lưu thay đổi')
    }
  }

  const setCustomHeader = useTopbarStore((s) => s.setCustomHeader)
  const clearCustomHeader = useTopbarStore((s) => s.clearCustomHeader)

  useEffect(() => {
    if (view === 'detail' && selectedItem) {
      setCustomHeader({
        onBack: handleBack,
        backText: 'Quay lại',
        title: selectedItem.title || 'Chi tiết nội dung AI',
        subtitle: `Nội dung AI / ${TYPE_LABELS[selectedItem.type] || selectedItem.type || ''}`,
      })
    } else if (view === 'edit' && selectedItem) {
      setCustomHeader({
        onBack: handleBack,
        backText: 'Quay lại',
        title: `Chỉnh sửa: ${selectedItem.title || 'Nội dung AI'}`,
        subtitle: 'Nội dung AI / Chỉnh sửa',
      })
    } else {
      clearCustomHeader()
    }
    return () => clearCustomHeader()
  }, [view, selectedItem, setCustomHeader, clearCustomHeader])

  const handleBack = () => {
    if (view === 'edit') {
      setView('detail')
    } else {
      setView('list')
      setSelectedItem(null)
    }
  }

  const handleRevoke = async () => {
    try {
      await revokeAIContent(selectedItem.id, '', user)
      await refresh()
      toast.success('↩ Đã thu hồi — nội dung chuyển về chờ duyệt')
    } catch (error) {
      toast.error(error.message || 'Không thể thu hồi nội dung')
    }
  }

  const handleSoftDelete = async (id) => {
    try {
      await softDeleteAIContent(id, user)
      await refresh()
      setSelectedItem(null)
      setView('list')
      toast.success('Đã chuyển nội dung vào thùng rác')
    } catch (error) {
      toast.error(error.message || 'Không thể xóa nội dung')
    }
  }

  const handleRestore = async (id) => {
    try {
      await restoreAIContent(id)
      await refresh()
      setSelectedItem(null)
      setView('list')
      toast.success('Đã khôi phục nội dung từ thùng rác')
    } catch (error) {
      toast.error(error.message || 'Không thể khôi phục nội dung')
    }
  }

  const formatGeminiError = (error) => {
    if (error.code === 'RATE_LIMIT') return 'AI đang quá tải, vui lòng thử lại sau ít phút'
    if (error.code === 'SAFETY_BLOCK' || error.code === 'SAFETY_FILTER') return 'AI từ chối chủ đề này, hãy thử chủ đề khác'
    return error.message || 'AI chưa tạo được nội dung, vui lòng thử lại'
  }

  const handleCreate = async () => {
    try {
      if (!draft.topic.trim()) { toast.error('Vui lòng nhập chủ đề nội dung'); return }
      setShowCreationForm(false)
      setIsGenerating(true)
      setGeneratingStatus('Đang gửi yêu cầu đến AI...')

      const questionCount = Math.min(Math.max(Number(draft.questionCount) || 3, 1), 10)
      const instructions = (draft.prompt || '').trim().slice(0, 1000)
      let result
      if (draft.type === 'reading') {
        setGeneratingStatus('Đang sinh bài đọc và câu hỏi...')
        result = await generateReading({ topic: draft.topic, level: draft.level, questionCount, instructions })
      } else if (draft.type.includes('toeic') || draft.type.includes('cloze')) {
        setGeneratingStatus('Đang sinh bài tập TOEIC...')
        result = await generateCloze({
          topic: draft.topic,
          level: draft.level,
          type: draft.type,
          questionCount,
          instructions,
        })
      } else {
        setGeneratingStatus('Đang sinh bộ câu hỏi...')
        result = await generateQuiz({
          topic: draft.topic,
          level: draft.level,
          questionCount,
          type: draft.type,
          instructions,
        })
      }

      setGeneratingStatus('Đang lưu nội dung...')
      const finalTitle = `${draft.topic.trim()} - ${TYPE_LABELS[draft.type] || 'Nội dung AI'}`
      const saved = await saveGeminiContent({
        type: draft.type,
        title: finalTitle,
        content: result.text || draft.topic,
        level: draft.level,
        questions: result.questions || [],
        geminiPrompt: draft.prompt || draft.topic,
        createdBy: user?.displayName || user?.email || 'Admin',
      })

      // Đưa card mới tạo vào đầu danh sách ngay lập tức để người dùng thấy
      if (saved) {
        setItems((prev) => [saved, ...prev.filter((i) => i.id !== saved.id)])
      }
      setShowTrash(false)
      setStatusFilter('all')
      setAuthorFilter('all')
      if (activeTab !== 'all') {
        const itemType = (saved?.rawType || saved?.type || '').toLowerCase()
        if (!matchCategoryFilter(activeTab, itemType)) {
          setActiveTab('all')
        }
      }

      await refresh()
      setIsGenerating(false)
      setGeneratingStatus('')
      setDraft({
        type: 'quiz_grammar',
        topic: '12 Thì cơ bản & Nâng cao (Tenses & Aspects)',
        prompt: '',
        level: 'B2',
        questionCount: 5,
      })
      toast.success(`Đã tạo "${saved?.title || finalTitle}" (${saved?.questions?.length || result.questions?.length || 0} câu hỏi) thành công!`)
    } catch (error) {
      setIsGenerating(false)
      setGeneratingStatus('')
      if (error instanceof GeminiServiceError) toast.error(formatGeminiError(error))
      else toast.error(error.message || 'Không thể tạo nội dung')
    }
  }

  /* ── DETAIL VIEW ── */
  if (view === 'detail' && selectedItem) {
    return (
      <div className="space-y-4">
        <AiDetailView
          item={selectedItem}
          onBack={handleBack}
          onEdit={handleEdit}
          onApprove={() => updateStatus(selectedItem.id, 'APPROVED')}
          onReject={() => updateStatus(selectedItem.id, 'REJECTED', 'Nội dung không đạt tiêu chuẩn chất lượng.')}
          onRevoke={handleRevoke}
          onDelete={() => handleSoftDelete(selectedItem.id)}
          onRestore={() => handleRestore(selectedItem.id)}
          isTrash={showTrash || selectedItem.status === 'DELETED'}
          canManage={isOwnedByCurrentUser(selectedItem)}
        />
      </div>
    )
  }

  /* ── EDIT VIEW ── */
  if (view === 'edit' && selectedItem) {
    return (
      <div className="space-y-4">
        <AiEditView
          item={selectedItem}
          onBack={handleBack}
          onSave={handleSaveEdit}
        />
      </div>
    )
  }

  /* ── LIST VIEW ── */
  return (
    <div className="space-y-6">
      {/* Creation Modal */}
      <AiCreationModal
        isOpen={showCreationForm}
        onClose={() => setShowCreationForm(false)}
        draft={draft}
        setDraft={setDraft}
        onCreate={handleCreate}
        isGenerating={isGenerating}
        generatingStatus={generatingStatus}
      />

      {/* Banner thông báo khi ở chế độ thùng rác */}
      {showTrash && (
        <div className="flex items-center justify-between bg-amber-50/90 border border-amber-200 rounded-2xl px-6 py-3 text-xs text-amber-800 shadow-2xs">
          <span className="flex items-center gap-1.5 font-medium">
            <Trash2 size={14} className="text-amber-600 shrink-0" />
            Bạn đang xem các nội dung AI trong <strong>Thùng rác</strong> ({trashCount}). Bạn có thể khôi phục hoặc xóa hẳn bất kỳ lúc nào.
          </span>
        </div>
      )}

      {/* Toolbar gom gọn 1 hàng duy nhất chuẩn Benchmark */}
      <AiContentToolbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        authorFilter={authorFilter}
        setAuthorFilter={setAuthorFilter}
        isTeacher={isTeacher}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showTrash={showTrash}
        setShowTrash={setShowTrash}
        trashCount={trashCount}
        pendingCount={pendingCount}
        onOpenCreationModal={() => setShowCreationForm(true)}
        onBulkApprove={handleBulkApprove}
        onReload={refresh}
        isGenerating={isGenerating}
      />

      {/* Grid Danh sách Card */}
      {isLoading ? (
        <Card className="flex flex-col items-center justify-center p-8">
          <LoadingSpinner text="Đang tải học liệu..." className="py-6" />
        </Card>
      ) : visibleItems.length === 0 && !isGenerating ? (
        <Card className="p-8">
          <EmptyState
            title={
              showTrash
                ? 'Thùng rác trống'
                : searchTerm
                  ? `Không tìm thấy nội dung với từ khóa "${searchTerm}"`
                  : 'Chưa có nội dung AI nào'
            }
            description={
              showTrash
                ? 'Các nội dung bị xóa mềm sẽ xuất hiện tại đây và có thể khôi phục.'
                : 'Nhấn nút "+" ở trên để bắt đầu sinh đề thi và câu hỏi Quiz bằng AI.'
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card Đang Tạo Bởi AI - Luôn hiển thị ở vị trí đầu tiên trong danh sách */}
          {isGenerating && (
            <AiGeneratingCard
              draft={draft}
              status={generatingStatus}
            />
          )}

          {visibleItems.map((item) => (
            <AiContentCard
              key={item.id}
              item={item}
              onClick={() => handleCardClick(item)}
              onApprove={() => updateStatus(item.id, 'APPROVED')}
              onReject={() => updateStatus(item.id, 'REJECTED', 'Nội dung không đạt tiêu chuẩn chất lượng.')}
              onRestore={() => handleRestore(item.id)}
              onSoftDelete={() => handleSoftDelete(item.id)}
              showTrash={showTrash}
              canManage={isOwnedByCurrentUser(item)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default AiContentPage
