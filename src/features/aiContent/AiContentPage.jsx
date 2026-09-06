import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import {
  approveAIContent,
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
          return isDeleted && (activeTab === 'all' || activeTab === 'others' || item.type === activeTab)
        }

        if (isDeleted) return false

        const matchesType = activeTab === 'all' || item.type === activeTab
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

  const refresh = () => {
    const updated = getAIContentRecords()
    setItems(updated)
    if (selectedItem) {
      const fresh = updated.find((i) => i.id === selectedItem.id)
      if (fresh) setSelectedItem(fresh)
    }
  }

  const updateStatus = async (id, status, reason = '') => {
    try {
      if (status === 'APPROVED') approveAIContent(id, user)
      else if (status === 'REJECTED') rejectAIContent(id, reason, user)
      refresh()
      toast.success(status === 'APPROVED' ? 'Đã duyệt nội dung' : 'Đã từ chối nội dung')
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật nội dung')
    }
  }

  const handleBulkApprove = () => {
    const manageableItems = visibleItems.filter((item) => isOwnedByCurrentUser(item))
    for (const item of manageableItems) approveAIContent(item.id, user)
    refresh()
    toast.success(
      manageableItems.length > 0
        ? 'Đã duyệt tất cả nội dung thuộc quyền quản lý của bạn trong tab này'
        : 'Không có nội dung nào thuộc quyền quản lý của bạn để duyệt',
    )
  }

  const handleCardClick = (item) => {
    setSelectedItem(item)
    setView('detail')
  }

  const handleEdit = () => setView('edit')

  const handleSaveEdit = async ({ content, questions }) => {
    try {
      updateAIContent(selectedItem.id, { content, definition: content, questions })
      refresh()
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

  const handleRevoke = () => {
    try {
      revokeAIContent(selectedItem.id, '', user)
      refresh()
      toast.success('↩ Đã thu hồi — nội dung chuyển về chờ duyệt')
    } catch (error) {
      toast.error(error.message || 'Không thể thu hồi nội dung')
    }
  }

  const handleSoftDelete = (id) => {
    try {
      softDeleteAIContent(id, user)
      refresh()
      setSelectedItem(null)
      setView('list')
      toast.success('Đã chuyển nội dung vào thùng rác')
    } catch (error) {
      toast.error(error.message || 'Không thể xóa nội dung')
    }
  }

  const handleRestore = (id) => {
    try {
      restoreAIContent(id)
      refresh()
      setSelectedItem(null)
      setView('list')
      toast.success('Đã khôi phục nội dung từ thùng rác')
    } catch (error) {
      toast.error(error.message || 'Không thể khôi phục nội dung')
    }
  }

  const formatGeminiError = (error) => {
    if (error.code === 'NO_API_KEY') return '❌ Chưa cấu hình VITE_GEMINI_API_KEY trong .env'
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

      setGeneratingStatus('Đang lưu nội dung...')
      const finalTitle = `${draft.topic.trim()} - ${TYPE_LABELS[draft.type] || 'Nội dung AI'}`
      const saved = saveGeminiContent({
        type: draft.type,
        title: finalTitle,
        content: result.text || draft.topic,
        level: draft.level,
        questions: result.questions || [],
        geminiPrompt: draft.prompt || draft.topic,
        createdBy: user?.displayName || 'Admin',
      })

      refresh()
      setIsGenerating(false)
      setGeneratingStatus('')
      setDraft({ type: 'reading', topic: '', prompt: '', level: 'B2', questionCount: 3 })
      toast.success(`✅ Đã tạo ${saved.title} · ${saved.questions?.length || 0} câu hỏi · đang chờ duyệt`)
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
    <div className="space-y-4">
      <div className="space-y-5">
        <AiContentToolbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onOpenCreationModal={() => setShowCreationForm(true)}
          onBulkApprove={handleBulkApprove}
          showTrash={showTrash}
          setShowTrash={setShowTrash}
          trashCount={trashCount}
        />

        {/* Grid */}
        {visibleItems.length === 0 && !isGenerating ? (
          <EmptyState
            title={showTrash ? 'Thùng rác trống' : 'Không có nội dung'}
            description={
              showTrash
                ? 'Các nội dung đã xóa mềm sẽ hiển thị ở đây.'
                : 'Mọi mục trong tab này đã được xử lý hoặc chưa có dữ liệu.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Generating placeholder */}
            {isGenerating && (
              <Card className="border-2 border-brand-500/50 bg-brand-500/5">
                <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                  <div>
                    <h3 className="text-base font-semibold text-navy-700">Đang tạo nội dung...</h3>
                    <p className="mt-1 text-sm text-ink-muted">{generatingStatus}</p>
                  </div>
                  <div className="w-full rounded-lg bg-white p-3 text-center text-xs text-ink-muted">
                    💡 Quá trình này có thể mất từ 10-30 giây
                  </div>
                </div>
              </Card>
            )}

            {visibleItems.map((item) => (
              <AiContentCard
                key={item.id}
                item={item}
                canManage={isOwnedByCurrentUser(item)}
                showTrash={showTrash}
                onClick={() => handleCardClick(item)}
                onApprove={(id) => updateStatus(id, 'APPROVED')}
                onReject={(id) => updateStatus(id, 'REJECTED', 'Nội dung không đạt tiêu chuẩn chất lượng.')}
                onSoftDelete={handleSoftDelete}
                onRestore={handleRestore}
              />
            ))}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      <AiCreationModal
        isOpen={showCreationForm}
        onClose={() => setShowCreationForm(false)}
        isGenerating={isGenerating}
        generatingStatus={generatingStatus}
        draft={draft}
        setDraft={setDraft}
        onCreate={handleCreate}
      />
    </div>
  )
}

export default AiContentPage
