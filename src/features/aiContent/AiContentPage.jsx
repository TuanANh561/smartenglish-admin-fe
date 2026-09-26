import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
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
import { TYPE_LABELS } from './components/aiContentConstants'
import AiDetailView from './components/AiDetailView'
import AiEditView from './components/AiEditView'
import AiContentCard from './components/AiContentCard'
import AiCreationModal from './components/AiCreationModal'
import AiContentToolbar from './components/AiContentToolbar'

function AiContentPage() {
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
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
    type: 'reading',
    topic: '',
    prompt: '',
    level: 'B2',
    questionCount: 3,
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
      const current = normalizeOwner(user.displayName || user.email || 'admin')
      const created = normalizeOwner(item?.createdBy || '')
      const approved = normalizeOwner(item?.approvedBy || '')
      return created === current || approved === current
    }
  }, [user])

  const trashCount = useMemo(
    () => items.filter((item) => item.status === 'DELETED').length,
    [items],
  )

  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        const isDeleted = item.status === 'DELETED'

        if (showTrash) {
          const matchesTrashType =
            activeTab === 'all' ||
            activeTab === 'others' ||
            (activeTab === 'toeic'
              ? (item.type || '').startsWith('toeic') || (item.type || '').startsWith('cloze')
              : item.type === activeTab)
          return isDeleted && matchesTrashType
        }

        if (isDeleted) return false

        const matchesType =
          activeTab === 'all' ||
          (activeTab === 'toeic'
            ? (item.type || '').startsWith('toeic') || (item.type || '').startsWith('cloze')
            : item.type === activeTab)
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter
        const matchesOwner = activeTab === 'others'
          ? !isOwnedByCurrentUser(item)
          : isOwnedByCurrentUser(item)
        const keyword = searchTerm.trim().toLowerCase()
        const matchesSearch =
          !keyword ||
          (item.title || '').toLowerCase().includes(keyword) ||
          (item.content || '').toLowerCase().includes(keyword)

        return matchesType && matchesStatus && matchesOwner && matchesSearch
      }),
    [items, activeTab, statusFilter, searchTerm, isOwnedByCurrentUser, showTrash],
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
      toast.success(status === 'APPROVED' ? 'Đã duyệt nội dung' : 'Đã từ chối nội dung')
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
    toast.success(`Đã duyệt ${ids.length} bài học liệu AI`)
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
    if (error.code === 'NO_API_KEY') return '❌ Backend chưa cấu hình GEMINI_API_KEY trong hệ thống'
    if (error.code === 'RATE_LIMIT') return '❌ Gemini đang vượt giới hạn sử dụng. Vui lòng thử lại sau.'
    if (error.code === 'TRUNCATED_RESPONSE') return '❌ Phản hồi bị cắt do giới hạn token — thử chủ đề ngắn hơn'
    if (error.code === 'PARSE_ERROR') return '❌ Gemini trả về JSON không hợp lệ — mở F12 → Console để xem chi tiết'
    if (error.code === 'SAFETY_BLOCK' || error.code === 'SAFETY_FILTER') return '❌ Gemini chặn nội dung — thử chủ đề khác'
    return `❌ Lỗi Gemini: ${error.message}`
  }

  const handleCreate = async () => {
    try {
      if (!draft.topic.trim()) { toast.error('Vui lòng nhập chủ đề nội dung'); return }
      setShowCreationForm(false)
      setIsGenerating(true)
      setGeneratingStatus('Đang gửi yêu cầu đến Gemini...')

      const questionCount = Math.min(Math.max(Number(draft.questionCount) || 3, 1), 5)
      let result
      if (draft.type === 'reading') {
        setGeneratingStatus('Đang sinh bài đọc và câu hỏi (có thể mất 10-20s)...')
        result = await generateReading({ topic: draft.topic, level: draft.level, questionCount })
      } else if (draft.type === 'quiz') {
        setGeneratingStatus('Đang sinh câu hỏi kiểm tra (có thể mất 15-30s)...')
        result = await generateQuiz({ topic: draft.topic, level: draft.level, questionCount })
      } else {
        setGeneratingStatus('Đang sinh dạng điền khuyết TOEIC (có thể mất 15-30s)...')
        result = await generateCloze({
          topic: draft.topic,
          level: draft.level,
          type: draft.type,
          questionCount,
        })
      }

      setGeneratingStatus('Đang lưu nội dung vào CSDL...')
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

      await refresh()
      setIsGenerating(false)
      setGeneratingStatus('')
      setDraft({ type: 'reading', topic: '', prompt: '', level: 'B2', questionCount: 3 })
      toast.success(`✅ Đã tạo ${saved.title} · ${saved.questions?.length || 0} câu hỏi · đã lưu vào CSDL`)
    } catch (error) {
      setIsGenerating(false)
      setGeneratingStatus('')
      if (error instanceof GeminiServiceError) toast.error(formatGeminiError(error))
      else toast.error(error.message || '❌ Không thể tạo nội dung')
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
        onSubmit={handleCreate}
      />

      {/* Generating Banner */}
      {isGenerating && (
        <Card className="border-primary/20 bg-primary/5 p-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                AI đang xử lý yêu cầu...
              </p>
              <p className="text-xs text-muted-foreground">{generatingStatus}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Toolbar gom gọn 1 hàng duy nhất */}
      <AiContentToolbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showTrash={showTrash}
        setShowTrash={setShowTrash}
        trashCount={trashCount}
        onOpenCreateModal={() => setShowCreationForm(true)}
        onBulkApprove={handleBulkApprove}
        isGenerating={isGenerating}
      />

      {/* Grid Danh sách Card */}
      {isLoading ? (
        <Card className="flex flex-col items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Đang tải học liệu từ CSDL...</p>
        </Card>
      ) : visibleItems.length === 0 ? (
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
                : 'Nhấn "Tạo nội dung AI" ở trên để bắt đầu sinh học liệu tự động.'
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleItems.map((item) => (
            <AiContentCard
              key={item.id}
              item={item}
              onClick={() => handleCardClick(item)}
              onApprove={() => updateStatus(item.id, 'APPROVED')}
              onReject={() => updateStatus(item.id, 'REJECTED', 'Nội dung không đạt tiêu chuẩn chất lượng.')}
              onRestore={() => handleRestore(item.id)}
              onDelete={() => handleSoftDelete(item.id)}
              isTrash={showTrash || item.status === 'DELETED'}
              canManage={isOwnedByCurrentUser(item)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default AiContentPage
