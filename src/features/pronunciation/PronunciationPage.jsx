import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Crown,
  Sparkles,
  Plus,
  Bot,
  Volume2,
  Mic,
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  Layers,
  BookOpen,
  Loader2,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { PRONUNCIATION_CATEGORIES } from '@/mocks/data/pronunciation'
import { useAuthStore } from '@/store/authStore'
import { speakWord, stopAudio } from '@/lib/ipaHelper'

import PronunciationToolbar from './components/PronunciationToolbar'
import PronunciationTableRow from './components/PronunciationTableRow'
import PronunciationDetailDrawer from './components/PronunciationDetailDrawer'

// Speaking Scenario components
import SpeakingScenarioCard from './components/SpeakingScenarioCard'
import SpeakingScenarioModal from './components/SpeakingScenarioModal'
import SpeakingSimulatorModal from './components/SpeakingSimulatorModal'
import {
  getSpeakingScenarios,
  createSpeakingScenario,
  updateSpeakingScenario,
  deleteSpeakingScenario,
} from './speakingScenarioApi'
import {
  getPronunciationLessons,
  createPronunciationLesson,
  updatePronunciationLesson,
  deletePronunciationLesson,
  togglePublishPronunciationLesson,
} from './pronunciationLessonApi'

const PAGE_SIZE = 8

const CEFR_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trình độ' },
  { value: 'A1', label: 'A1 - Mới bắt đầu' },
  { value: 'A2', label: 'A2 - Cơ bản' },
  { value: 'B1', label: 'B1 - Trung cấp' },
  { value: 'B2', label: 'B2 - Khá' },
  { value: 'C1', label: 'C1 - Cao cấp' },
  { value: 'C2', label: 'C2 - Thành thạo' },
]

const CATEGORY_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất cả chủ đề' },
  { value: 'Giao tiếp', label: 'Giao tiếp hàng ngày' },
  { value: 'Công việc', label: 'Công việc & Văn phòng' },
  { value: 'Đời sống', label: 'Đời sống & Gia đình' },
  { value: 'Du lịch', label: 'Du lịch & Khám phá' },
  { value: 'Luyện thi', label: 'Luyện thi (IELTS / TOEIC)' },
]

export default function PronunciationPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  // Navigation Tab: 'ipa' (Ngân hàng phát âm - Tab 1) | 'scenarios' (Luyện nói AI - Tab 2)
  const [activeTab, setActiveTab] = useState('ipa')

  // View mode for scenarios: 'card' | 'table'
  const [scenarioViewMode, setScenarioViewMode] = useState('card')

  // ─── STATE: TAB 1: SPEAKING SCENARIOS (BACKEND API) ─────────────
  const [scenarios, setScenarios] = useState([])
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(false)
  const [scenarioPage, setScenarioPage] = useState(1)
  const [scenarioTotalPages, setScenarioTotalPages] = useState(1)
  const [scenarioTotalCount, setScenarioTotalCount] = useState(0)

  const [scenarioSearch, setScenarioSearch] = useState('')
  const [scenarioLevel, setScenarioLevel] = useState('ALL')
  const [scenarioCategory, setScenarioCategory] = useState('ALL')

  // Modals for Scenarios
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false)
  const [editingScenario, setEditingScenario] = useState(null)
  const [deleteScenarioTarget, setDeleteScenarioTarget] = useState(null)
  const [simulatingScenario, setSimulatingScenario] = useState(null)

  // ─── STATE: TAB 2: PRONUNCIATION IPA (BACKEND API) ──────────────
  const [lessons, setLessons] = useState([])
  const [isLoadingIpa, setIsLoadingIpa] = useState(false)
  const [ipaPage, setIpaPage] = useState(1)
  const [ipaTotalPages, setIpaTotalPages] = useState(1)
  const [ipaTotalCount, setIpaTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tất cả phân loại')
  const [selectedLevel, setSelectedLevel] = useState('Tất cả')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const [activeLesson, setActiveLesson] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [playingAudioId, setPlayingAudioId] = useState(null)
  const [isIpaModalOpen, setIsIpaModalOpen] = useState(false)
  const [editingIpa, setEditingIpa] = useState(null)

  // ─── LOAD SCENARIOS FROM BACKEND ──────────────────────────────
  const loadScenarios = async () => {
    setIsLoadingScenarios(true)
    try {
      const res = await getSpeakingScenarios({
        page: scenarioPage - 1,
        size: 8,
        cefrLevel: scenarioLevel,
        category: scenarioCategory,
        search: scenarioSearch,
      })

      const data = res?.data !== undefined ? res.data : res
      if (data?.content) {
        setScenarios(data.content)
        setScenarioTotalPages(data.totalPages || 1)
        setScenarioTotalCount(data.totalElements || data.content.length)
      } else if (Array.isArray(data)) {
        setScenarios(data)
        setScenarioTotalPages(1)
        setScenarioTotalCount(data.length)
      } else {
        setScenarios([])
      }
    } catch (err) {
      console.error('Lỗi khi tải kịch bản từ backend:', err)
      toast.error('Không thể kết nối máy chủ AI Practice. Vui lòng kiểm tra service.')
      setScenarios([])
    } finally {
      setIsLoadingScenarios(false)
    }
  }

  // ─── LOAD IPA LESSONS FROM BACKEND ────────────────────────────
  const loadIpaLessons = async () => {
    setIsLoadingIpa(true)
    try {
      const res = await getPronunciationLessons({
        page: ipaPage,
        size: PAGE_SIZE,
        search: search,
        category: selectedCategory,
        cefrLevel: selectedLevel,
        status: selectedStatus,
      })
      const data = res?.data !== undefined ? res.data : res
      if (data?.items) {
        setLessons(data.items)
        setIpaTotalPages(data.totalPages || 1)
        setIpaTotalCount(data.total || data.items.length)
      } else if (Array.isArray(data)) {
        setLessons(data)
        setIpaTotalPages(1)
        setIpaTotalCount(data.length)
      } else {
        setLessons([])
      }
    } catch (err) {
      console.error('Lỗi khi tải bài phát âm từ backend:', err)
      toast.error('Không thể tải danh sách bài phát âm. Vui lòng thử lại.')
      setLessons([])
    } finally {
      setIsLoadingIpa(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'scenarios') {
      loadScenarios()
    } else if (activeTab === 'ipa') {
      loadIpaLessons()
    }
  }, [activeTab, scenarioPage, scenarioLevel, scenarioCategory, ipaPage, selectedCategory, selectedLevel, selectedStatus])

  // Handle Search Debounce for Scenarios
  useEffect(() => {
    if (activeTab !== 'scenarios') return
    const timer = setTimeout(() => {
      loadScenarios()
    }, 400)
    return () => clearTimeout(timer)
  }, [scenarioSearch])

  // Handle Search Debounce for IPA
  useEffect(() => {
    if (activeTab !== 'ipa') return
    const timer = setTimeout(() => {
      setIpaPage(1)
      loadIpaLessons()
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Save Scenario (Create / Update)
  const handleSaveScenario = async (formData) => {
    try {
      if (formData.id) {
        await updateSpeakingScenario(formData.id, formData)
        toast.success('Đã cập nhật kịch bản thành công!')
      } else {
        await createSpeakingScenario(formData)
        toast.success('Đã tạo kịch bản mới thành công!')
      }
      setIsScenarioModalOpen(false)
      setEditingScenario(null)
      loadScenarios()
    } catch (err) {
      toast.error('Lỗi khi lưu kịch bản: ' + err.message)
    }
  }

  // Delete Scenario
  const handleConfirmDeleteScenario = async () => {
    if (!deleteScenarioTarget) return
    try {
      await deleteSpeakingScenario(deleteScenarioTarget.id)
      toast.success('Đã xóa kịch bản thành công!')
      setDeleteScenarioTarget(null)
      loadScenarios()
    } catch (err) {
      toast.error('Lỗi khi xóa kịch bản: ' + err.message)
    }
  }

  // ─── IPA: DELETE ───────────────────────────────────────────────
  const handleConfirmDeleteIpa = async () => {
    if (!deleteTarget) return
    try {
      await deletePronunciationLesson(deleteTarget.id)
      toast.success(`Đã xóa bài học "${deleteTarget.title}"`)
      setDeleteTarget(null)
      loadIpaLessons()
    } catch (err) {
      toast.error('Lỗi khi xóa bài phát âm: ' + err.message)
    }
  }

  // ─── IPA: TOGGLE PUBLISH ────────────────────────────────────────
  const handleTogglePublish = async (item) => {
    try {
      await togglePublishPronunciationLesson(item.id)
      const newStatus = item.status === 'published' ? 'draft' : 'published'
      toast.success(newStatus === 'published' ? `Đã xuất bản "${item.title}"` : `Đã chuyển về nháp "${item.title}"`)
      loadIpaLessons()
    } catch (err) {
      toast.error('Lỗi khi đổi trạng thái: ' + err.message)
    }
  }

  // ─── IPA: DUPLICATE LESSON ──────────────────────────────────────
  const handleDuplicateLesson = async (e, item) => {
    e?.stopPropagation?.()
    try {
      const copyPayload = {
        title: `${item.title} (Bản sao)`,
        ipaSymbol: item.ipaSymbol || '',
        category: item.category || 'Vowels',
        level: item.level || 'B1',
        status: 'draft',
        aiMinScoreThreshold: item.aiMinScoreThreshold ?? 85,
        description: item.description || '',
        mouthShapeGuide: item.mouthShapeGuide || '',
        sampleWords: item.sampleWords || [],
        sampleSentences: item.sampleSentences || [],
      }
      await createPronunciationLesson(copyPayload)
      toast.success(`Đã nhân bản bài học "${item.title}" thành công`)
      loadIpaLessons()
    } catch (err) {
      toast.error('Lỗi khi nhân bản bài học: ' + err.message)
    }
  }

  const handlePlayAudio = (e, item) => {
    e.stopPropagation()
    if (playingAudioId === item.id) {
      setPlayingAudioId(null)
      stopAudio()
    } else {
      setPlayingAudioId(item.id)
      const wordToSpeak = item.sampleWords?.[0]?.word || item.title || item.ipaSymbol
      speakWord(wordToSpeak)
      toast.success(`Phát âm mẫu: ${item.ipaSymbol || item.title}`)
      setTimeout(() => {
        setPlayingAudioId(null)
      }, 2000)
    }
  }

  const isTeacher = user?.role === 'teacher'

  return (
    <div className="space-y-5">
      {/* Teacher quota notification if applicable */}
      {isTeacher && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-indigo-200 bg-indigo-50/70 px-4 py-2.5 text-xs shadow-2xs">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
            <Crown size={13} />
          </span>
          <div>
            <span className="font-semibold text-slate-800">Gói Giảng Viên / Quản Trị:</span>{' '}
            <span className="text-slate-600">
              Quản lý kịch bản luyện nói AI & Ngân hàng âm chuẩn · Hạn mức{' '}
              <strong className="text-emerald-600 font-bold">Không giới hạn</strong>
            </span>
          </div>
          <Link to="/goi-dich-vu" className="ml-auto font-semibold text-indigo-600 hover:underline">
            Chi tiết gói →
          </Link>
        </div>
      )}

      {/* ─── Top Tabs Switcher ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 shrink-0">
          {/* TAB 1: Ngân hàng phát âm IPA & Từ mẫu */}
          <button
            type="button"
            onClick={() => setActiveTab('ipa')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'ipa'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <BookOpen size={15} />
            <span>Ngân hàng phát âm IPA & Từ mẫu</span>
          </button>

          {/* TAB 2: Kịch bản Luyện nói & AI Roleplay */}
          <button
            type="button"
            onClick={() => setActiveTab('scenarios')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'scenarios'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Bot size={15} />
            <span>Kịch bản Luyện nói & AI Roleplay</span>
            <span className="ml-1 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] text-indigo-600 border border-indigo-100">
              Mới
            </span>
          </button>

          {/* TAB 3: Nói chuyện 1v1 Linh vật (Coming soon) */}
          <button
            type="button"
            disabled
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-400 cursor-not-allowed select-none opacity-80"
            title="Tính năng đang được phát triển"
          >
            <span className="text-sm grayscale opacity-60">🦊</span>
            <span>Nói chuyện 1v1 với Linh vật</span>
            <span className="ml-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700 font-bold border border-amber-200">
              Coming soon
            </span>
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: NGÂN HÀNG PHÁT ÂM IPA & TỪ MẪU                           */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {activeTab === 'ipa' && (
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <PronunciationToolbar
            search={search}
            onSearchChange={(val) => {
              setSearch(val)
              setIpaPage(1)
            }}
            selectedCategory={selectedCategory}
            onCategoryChange={(val) => {
              setSelectedCategory(val)
              setIpaPage(1)
            }}
            selectedLevel={selectedLevel}
            onLevelChange={(val) => {
              setSelectedLevel(val)
              setIpaPage(1)
            }}
            selectedStatus={selectedStatus}
            onStatusChange={(val) => {
              setSelectedStatus(val)
              setIpaPage(1)
            }}
            onRefresh={loadIpaLessons}
            onOpenCreate={() => navigate('/app/hoc-lieu/phat-am/tao-moi')}
          />

          {isLoadingIpa ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-indigo-600 mb-2" />
              <p className="text-xs text-slate-500">Đang tải dữ liệu bài học từ máy chủ...</p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <BookOpen size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">Chưa có bài học phát âm nào</h3>
              <p className="text-xs text-slate-500 max-w-md mb-4">
                Hiện tại chưa có bài học nào trong cơ sở dữ liệu. Hãy bấm vào nút &quot;Thêm bài phát âm&quot; để tạo bài học đầu tiên.
              </p>
              <Button
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={() => navigate('/app/hoc-lieu/phat-am/tao-moi')}
              >
                Thêm bài phát âm ngay
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Bài học & Ký hiệu IPA</th>
                    <th className="py-3.5 px-3 w-36">Phân loại</th>
                    <th className="py-3.5 px-2 w-20 text-center">Trình độ</th>
                    <th className="py-3.5 px-3 w-32">Trạng thái</th>
                    <th className="py-3.5 px-3 w-32">Cập nhật</th>
                    <th className="py-3.5 px-6 w-36 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lessons.map((item) => (
                    <PronunciationTableRow
                      key={item.id}
                      item={item}
                      isPlaying={playingAudioId === item.id}
                      onPlayAudio={handlePlayAudio}
                      onViewDetails={(it) => setActiveLesson(it)}
                      onEdit={(e, it) => navigate(`/app/hoc-lieu/phat-am/${it.id}/chinh-sua`)}
                      onDuplicate={handleDuplicateLesson}
                      onDelete={(e, it) => setDeleteTarget(it)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* IPA Pagination */}
          {ipaTotalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <Pagination
                currentPage={ipaPage}
                totalPages={ipaTotalPages}
                onPageChange={setIpaPage}
              />
            </div>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: KỊCH BẢN LUYỆN NÓI & AI ROLEPLAY                         */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {activeTab === 'scenarios' && (
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          {/* Toolbar gộp chung 1 row đồng bộ với Tab phát âm */}
          <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
              <Search size={18} className="shrink-0 text-slate-400" />
              <input
                value={scenarioSearch}
                onChange={(e) => {
                  setScenarioSearch(e.target.value)
                  setScenarioPage(1)
                }}
                placeholder="Tìm kịch bản, nhân vật, từ khóa..."
                className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Dropdown Trình độ */}
              <select
                value={scenarioLevel}
                onChange={(e) => {
                  setScenarioLevel(e.target.value)
                  setScenarioPage(1)
                }}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
              >
                <option value="ALL">Tất cả trình độ</option>
                <option value="A1">Trình độ A1</option>
                <option value="A2">Trình độ A2</option>
                <option value="B1">Trình độ B1</option>
                <option value="B2">Trình độ B2</option>
                <option value="C1">Trình độ C1</option>
                <option value="C2">Trình độ C2</option>
              </select>

              {/* Dropdown Chủ đề */}
              <select
                value={scenarioCategory}
                onChange={(e) => {
                  setScenarioCategory(e.target.value)
                  setScenarioPage(1)
                }}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
              >
                {CATEGORY_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Bộ chuyển đổi dạng Card và dạng Bảng */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/90">
                <button
                  type="button"
                  onClick={() => setScenarioViewMode('card')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    scenarioViewMode === 'card'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Xem dạng thẻ (Card)"
                >
                  <LayoutGrid size={14} />
                  <span className="hidden sm:inline">Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScenarioViewMode('table')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    scenarioViewMode === 'table'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Xem dạng bảng (Table)"
                >
                  <List size={14} />
                  <span className="hidden sm:inline">Bảng</span>
                </button>
              </div>

              {/* Làm mới */}
              <button
                type="button"
                onClick={loadScenarios}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
                title="Làm mới dữ liệu"
              >
                <RefreshCw size={14} />
                <span className="hidden sm:inline">Làm mới</span>
              </button>

              {/* Thêm kịch bản mới */}
              <button
                type="button"
                onClick={() => {
                  setEditingScenario(null)
                  setIsScenarioModalOpen(true)
                }}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
              >
                <Plus size={15} />
                <span>Thêm kịch bản mới</span>
              </button>
            </div>
          </div>

          {/* Scenarios Content (Hiển thị dạng Card hoặc Bảng tùy chọn) */}
          {isLoadingScenarios ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-indigo-600 mb-2" />
              <p className="text-xs text-slate-500">Đang tải danh sách kịch bản từ máy chủ...</p>
            </div>
          ) : scenarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">Chưa tìm thấy kịch bản nào</h3>
              <p className="text-xs text-slate-500 max-w-md mb-4">
                Hãy thử thay đổi bộ lọc hoặc sử dụng trợ lý Gemini AI để tạo nhanh kịch bản luyện nói đầu tiên.
              </p>
              <Button
                size="sm"
                variant="primary"
                icon={Sparkles}
                onClick={() => {
                  setEditingScenario(null)
                  setIsScenarioModalOpen(true)
                }}
              >
                Sinh kịch bản bằng AI ngay
              </Button>
            </div>
          ) : scenarioViewMode === 'card' ? (
            /* DẠNG 1: CARD GRID */
            <div className="p-6 bg-slate-50/40">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {scenarios.map((item) => (
                  <SpeakingScenarioCard
                    key={item.id}
                    scenario={item}
                    onEdit={(sc) => {
                      setEditingScenario(sc)
                      setIsScenarioModalOpen(true)
                    }}
                    onDelete={(sc) => setDeleteScenarioTarget(sc)}
                    onSimulate={(sc) => setSimulatingScenario(sc)}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* DẠNG 2: TABLE */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6 w-20">Hình ảnh</th>
                    <th className="py-3.5 px-3 w-24 text-center">Trình độ</th>
                    <th className="py-3.5 px-6">Kịch bản & Tình huống</th>
                    <th className="py-3.5 px-4 w-32">Phân loại</th>
                    <th className="py-3.5 px-6 max-w-sm">Mô tả tóm tắt</th>
                    <th className="py-3.5 px-6 w-36 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scenarios.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSimulatingScenario(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-6">
                        <img
                          src={item.imageUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80'}
                          alt={item.titleEn}
                          className="h-10 w-14 object-cover rounded-lg border border-slate-200"
                        />
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-300/60 px-2.5 py-0.5 text-xs font-bold">
                          {item.cefrLevel || 'A1'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-900">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {item.titleEn}
                        </div>
                        {item.titleVi && (
                          <div className="text-[11px] text-slate-400 font-normal">
                            {item.titleVi}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {item.category || 'Tổng hợp'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 text-[11px]">
                        <p className="line-clamp-2">{item.descriptionEn || item.descriptionVi || '—'}</p>
                      </td>
                      <td className="py-3.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSimulatingScenario(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Luyện đàm thoại thử"
                          >
                            <MessageSquare size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingScenario(item)
                              setIsScenarioModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Chỉnh sửa kịch bản"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteScenarioTarget(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Xóa kịch bản"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer count & pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-xs text-slate-500 bg-white">
            <span>Tổng cộng {scenarios.length} kịch bản luyện nói</span>
            {scenarioTotalPages > 1 && (
              <Pagination
                currentPage={scenarioPage}
                totalPages={scenarioTotalPages}
                onPageChange={setScenarioPage}
              />
            )}
          </div>
        </div>
      )}

      {/* ─── MODALS & DRAWERS ────────────────────────────────────────── */}

      {/* Speaking Scenario Create/Edit Modal */}
      <SpeakingScenarioModal
        isOpen={isScenarioModalOpen}
        onClose={() => {
          setIsScenarioModalOpen(false)
          setEditingScenario(null)
        }}
        initialData={editingScenario}
        onSave={handleSaveScenario}
      />

      {/* Speaking Simulator Modal (Live AI Voice Test) */}
      <SpeakingSimulatorModal
        isOpen={Boolean(simulatingScenario)}
        onClose={() => setSimulatingScenario(null)}
        scenario={simulatingScenario}
      />

      {/* Delete Scenario Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteScenarioTarget)}
        title="Xác nhận xóa kịch bản"
        message={`Bạn có chắc chắn muốn xóa kịch bản "${deleteScenarioTarget?.titleEn}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa kịch bản"
        confirmVariant="danger"
        onConfirm={handleConfirmDeleteScenario}
        onClose={() => setDeleteScenarioTarget(null)}
      />

      {/* IPA Detail Drawer */}
      <PronunciationDetailDrawer
        activeLesson={activeLesson}
        lesson={activeLesson}
        isOpen={Boolean(activeLesson)}
        onClose={() => setActiveLesson(null)}
        onPlayAudio={handlePlayAudio}
        onEdit={(e, lesson) => {
          const target = lesson?.id ? lesson : (e?.id ? e : activeLesson)
          if (target?.id) navigate(`/app/hoc-lieu/phat-am/${target.id}/chinh-sua`)
        }}
      />

      {/* Delete IPA Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Xác nhận xóa bài phát âm"
        message={`Bạn có chắc chắn muốn xóa bài học "${deleteTarget?.title}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa bài học"
        confirmVariant="danger"
        onConfirm={handleConfirmDeleteIpa}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
