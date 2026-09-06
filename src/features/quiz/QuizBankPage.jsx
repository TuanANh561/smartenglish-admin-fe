import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Crown,
  Plus,
  Upload,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import DataTable from '@/components/ui/DataTable/DataTable'
import DataTableToolbar from '@/components/ui/DataTable/DataTableToolbar'
import DataImportWizardModal from '@/components/ui/DataImportWizardModal'
import SearchInput from '@/components/ui/SearchInput'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import { formatNumber } from '@/lib/utils'
import { quizQuestions } from '@/mocks/data/quizQuestions'
import { quizSets } from '@/mocks/data/quizSets'
import { buildPublicContent, getApprovedAIContent } from '@/features/aiContent/aiContentService'
import { buildQuizColumns } from './columns'
import { useAuthStore } from '@/store/authStore'
import QuestionDetailDrawer from './components/QuestionDetailDrawer'
import QuizSetCard from './components/QuizSetCard'
import QuizFilterBar from './components/QuizFilterBar'

const PAGE_SIZE = 10
const SETS_PAGE_SIZE = 6

function QuizBankPage() {
  const user = useAuthStore((s) => s.user)
  const isTeacher = user?.role === 'teacher'
  const isAdmin = user?.role === 'admin'

  // Dynamic state cho danh sách câu hỏi
  const [questionsData, setQuestionsData] = useState(quizQuestions)
  const [isPdfImportOpen, setIsPdfImportOpen] = useState(false)

  // Mặc định giáo viên chỉ xem đề/câu hỏi của mình
  const [ownershipFilter, setOwnershipFilter] = useState(isTeacher ? 'mine' : 'all')
  const [activeTab, setActiveTab] = useState('questions')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [collectionFilter, setCollectionFilter] = useState('all')
  const [setsPage, setSetsPage] = useState(1)

  const checkOwnership = useCallback(
    (item) => {
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
    },
    [isTeacher, user],
  )

  const canManage = (item) => {
    if (!user || !item) return false
    if (isAdmin) return true
    return checkOwnership(item)
  }

  const publicQuizQuestions = useMemo(
    () => buildPublicContent('quiz', questionsData),
    [questionsData],
  )

  const myQuestionsCount = useMemo(() => {
    return publicQuizQuestions.filter((q) => checkOwnership(q)).length
  }, [publicQuizQuestions, checkOwnership])

  const mySetsCount = useMemo(() => {
    return quizSets.filter((s) => checkOwnership(s)).length
  }, [checkOwnership])

  // Combine mock quizSets with AI-generated quiz content
  const combinedQuizSets = useMemo(() => {
    const approved = getApprovedAIContent('quiz')
    const aiSets = approved.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.content || '',
      examTrack: 'toeic2',
      collection: 'AI',
      authorName: item.createdBy || 'AI System',
      authorEmail: 'ai@smartenglish.vn',
      verificationStatus: 'verified',
      durationMinutes: 45,
      questionCount: Array.isArray(item.questions) ? item.questions.length : 10,
      attempts: 0,
      attemptsType: 'practice',
      createdAt: new Date(item.createdAt),
      isAI: true,
    }))
    return [...quizSets, ...aiSets]
  }, [])

  // Get unique collections for filter chips
  const allCollections = useMemo(() => {
    const unique = new Set(combinedQuizSets.map((s) => s.collection))
    return Array.from(unique).sort()
  }, [combinedQuizSets])

  // Lọc câu hỏi theo ownership + search + filter
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return publicQuizQuestions.filter((q) => {
      const isOwned = checkOwnership(q)
      const isSystem =
        q.authorEmail === 'system@smartenglish.vn' || q.authorName?.includes('Hệ thống')

      let matchOwner = true
      if (ownershipFilter === 'mine') {
        matchOwner = isOwned
      } else if (ownershipFilter === 'system') {
        matchOwner = isSystem
      } else if (ownershipFilter === 'others') {
        matchOwner = !isOwned && !isSystem
      } else if (ownershipFilter !== 'all') {
        matchOwner = q.authorName === ownershipFilter || q.authorEmail === ownershipFilter
      }

      const matchSearch =
        !keyword ||
        (q.title || '').toLowerCase().includes(keyword) ||
        (q.questionText || '').toLowerCase().includes(keyword) ||
        (q.relatedWord || '').toLowerCase().includes(keyword)

      return matchOwner && matchSearch
    })
  }, [search, publicQuizQuestions, ownershipFilter, checkOwnership])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageData = filtered.slice(start, start + PAGE_SIZE)

  // Lọc bộ đề thi theo ownership + collection + search
  const filteredSets = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return combinedQuizSets.filter((set) => {
      const isOwned = set.isAI ? false : checkOwnership(set)
      const isSystem =
        set.isAI ||
        set.authorEmail === 'system@smartenglish.vn' ||
        set.authorName?.includes('Hệ thống') ||
        set.authorEmail === 'ai@smartenglish.vn'

      let matchOwner = true
      if (ownershipFilter === 'mine') {
        matchOwner = isOwned
      } else if (ownershipFilter === 'system') {
        matchOwner = isSystem
      } else if (ownershipFilter === 'others') {
        matchOwner = !isOwned && !isSystem
      } else if (ownershipFilter !== 'all') {
        matchOwner = set.authorName === ownershipFilter || set.authorEmail === ownershipFilter
      }

      const matchCollection =
        collectionFilter === 'all' || set.collection === collectionFilter
      const matchSearch =
        !keyword ||
        (set.title || '').toLowerCase().includes(keyword) ||
        (set.subtitle || '').toLowerCase().includes(keyword)

      return matchOwner && matchCollection && matchSearch
    })
  }, [search, collectionFilter, ownershipFilter, checkOwnership, combinedQuizSets])

  const setsTotal = filteredSets.length
  const setsTotalPages = Math.max(1, Math.ceil(setsTotal / SETS_PAGE_SIZE))
  const setsStart = (setsPage - 1) * SETS_PAGE_SIZE
  const setsPageData = filteredSets.slice(setsStart, setsStart + SETS_PAGE_SIZE)

  const columns = useMemo(
    () =>
      buildQuizColumns({
        onView: setActiveQuestion,
        onEdit: (q) => {
          if (!checkOwnership(q) && !isAdmin) {
            toast.error(`Bạn không thể sửa câu hỏi của "${q.authorName || 'tác giả khác'}".`)
            return
          }
          setActiveQuestion(q)
        },
        onDelete: (q) => {
          if (!checkOwnership(q) && !isAdmin) {
            toast.error('Chỉ tác giả mới có quyền xoá câu hỏi này!')
            return
          }
          setDeleteTarget(q)
        },
        currentUser: user,
      }),
    [checkOwnership, user, isAdmin],
  )

  const handleEditSet = (set) => {
    if (!checkOwnership(set) && !isAdmin) {
      toast.error(`Bạn không thể sửa đề thi của "${set.authorName || 'người khác'}".`)
      return
    }
    toast.success(`Mở trình chỉnh sửa đề thi: "${set.title}"`)
  }

  const handleAssignSet = (set) => {
    toast.success(`Đã mở popup giao đề thi "${set.title}" cho lớp học`)
  }

  const handleResetPages = () => {
    setPage(1)
    setSetsPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Header & Quota */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {isTeacher ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-brand-200 bg-brand-50/70 px-4 py-2 text-xs">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white">
              <Crown size={13} />
            </span>
            <div>
              <span className="font-semibold text-navy-700">Gói Teacher Pro:</span>{' '}
              <span className="text-ink-muted">
                Đã tạo <strong className="text-brand-600 font-bold">{myQuestionsCount}</strong> câu hỏi ·{' '}
                <strong className="text-brand-600 font-bold">{mySetsCount}</strong> đề thi · Hạn mức{' '}
                <strong className="text-emerald-600 font-bold">Không giới hạn</strong>
              </span>
            </div>
            <Link to="/goi-dich-vu" className="ml-2 font-semibold text-brand-600 hover:underline">
              Chi tiết gói →
            </Link>
          </div>
        ) : (
          <div />
        )}

        <div className="flex flex-1 items-center gap-3 self-end sm:self-auto">
          <SearchInput
            placeholder="Tìm đề thi, câu hỏi..."
            value={search}
            onChange={(value) => {
              setSearch(value)
              handleResetPages()
            }}
            className="flex-1 min-w-[200px]"
          />
          <Button
            size="sm"
            variant="secondary"
            icon={Upload}
            onClick={() => setIsPdfImportOpen(true)}
          >
            Import
          </Button>
          <Button icon={Plus} onClick={() => toast.success('Mở form tạo Quiz mới')}>
            Tạo Quiz Mới
          </Button>
        </div>
      </div>

      {/* Merged Tabs + Filter Row */}
      <QuizFilterBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ownershipFilter={ownershipFilter}
        setOwnershipFilter={setOwnershipFilter}
        collectionFilter={collectionFilter}
        setCollectionFilter={setCollectionFilter}
        allCollections={allCollections}
        combinedQuizSets={combinedQuizSets}
        myQuestionsCount={myQuestionsCount}
        mySetsCount={mySetsCount}
        publicQuizQuestionsCount={publicQuizQuestions.length}
        quizSetsCount={quizSets.length}
        isTeacher={isTeacher}
        onResetPage={handleResetPages}
      />

      {/* TAB 1: Ngân hàng câu hỏi */}
      {activeTab === 'questions' && (
        <Card>
          <DataTableToolbar
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            searchPlaceholder="Tìm theo câu hỏi hoặc từ vựng..."
          />

          <div className="mt-4">
            <DataTable
              columns={columns}
              data={pageData}
              pagination={{ page, size: PAGE_SIZE, total, totalPages }}
              onPageChange={setPage}
              onRowClick={setActiveQuestion}
              emptyMessage={
                ownershipFilter === 'mine'
                  ? 'Bạn chưa tạo câu hỏi nào khớp bộ lọc. Bấm "Tất cả" hoặc tạo câu hỏi mới.'
                  : 'Chưa có câu hỏi nào khớp bộ lọc'
              }
              enableSelection
            />
          </div>
        </Card>
      )}

      {/* TAB 2: Bộ đề thi */}
      {activeTab === 'sets' && (
        <div className="space-y-4">
          {setsPageData.length === 0 ? (
            <EmptyState
              title="Chưa có đề thi nào phù hợp"
              description={
                ownershipFilter === 'mine'
                  ? 'Bạn chưa tạo bộ đề nào trong danh mục này. Hãy tạo đề thi mới hoặc chọn "Tất cả đề thi".'
                  : 'Thử đổi bộ lọc hoặc tạo đề thi mới.'
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {setsPageData.map((set) => (
                <QuizSetCard
                  key={set.id}
                  set={set}
                  isTeacher={isTeacher}
                  isOwned={set.isAI ? false : checkOwnership(set)}
                  canManage={canManage(set)}
                  onEditSet={() => handleEditSet(set)}
                  onAssignSet={() => handleAssignSet(set)}
                  onStartPlacement={() => toast.success(`Bắt đầu thi Placement: "${set.title}"`)}
                  onViewDetails={() => toast.success(`Xem chi tiết đề: "${set.title}"`)}
                />
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line">
            <p className="text-xs text-ink-muted">
              Hiển thị <strong>{setsTotal === 0 ? 0 : (setsPage - 1) * SETS_PAGE_SIZE + 1}</strong>-
              <strong>{Math.min(setsPage * SETS_PAGE_SIZE, setsTotal)}</strong> trong tổng số{' '}
              <strong>{formatNumber(setsTotal)}</strong> đề thi
            </p>
            <Pagination page={setsPage} totalPages={setsTotalPages} onChange={setSetsPage} />
          </div>
        </div>
      )}

      {/* Drawer xem chi tiết câu hỏi */}
      <QuestionDetailDrawer
        question={activeQuestion}
        onClose={() => setActiveQuestion(null)}
        isOwner={checkOwnership(activeQuestion)}
        isAdmin={isAdmin}
        onDeleteRequest={() => {
          const q = activeQuestion
          setActiveQuestion(null)
          setDeleteTarget(q)
        }}
        onEditRequest={() => toast.success(`Mở trình sửa câu hỏi ${activeQuestion?.id}`)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          toast.success(`Đã xoá câu hỏi ${deleteTarget?.id}`)
          setDeleteTarget(null)
        }}
        title="Xoá câu hỏi này?"
        description={`Câu hỏi "${deleteTarget?.id}" sẽ bị xoá khỏi ngân hàng câu hỏi. Hành động này không thể hoàn tác.`}
        confirmText="Xoá câu hỏi"
      />

      {/* Modal Import PDF AI */}
      <DataImportWizardModal
        open={isPdfImportOpen}
        onClose={() => setIsPdfImportOpen(false)}
        defaultType="quiz"
        onImportSuccess={(newItems) => {
          const formatted = newItems.map((item, idx) => ({
            id: `Q-PDF-${Date.now()}-${idx}`,
            question: item.question,
            options: item.options || [],
            correctAnswer: item.correctAnswer || 'A',
            explanation: item.explanation || '',
            topic: item.topic || 'TOEIC Part 5',
            difficulty: item.difficulty || 'Medium',
            skill: item.skill || 'Grammar',
            authorName: user?.displayName || 'Admin AI OCR',
            authorEmail: user?.email || 'admin@smartenglish.vn',
            type: 'multiple_choice',
            createdAt: new Date().toISOString(),
          }))
          setQuestionsData((prev) => [...formatted, ...prev])
          toast.success(`Đã thêm thành công ${formatted.length} câu hỏi bóc tách từ PDF!`)
        }}
      />
    </div>
  )
}

export default QuizBankPage
