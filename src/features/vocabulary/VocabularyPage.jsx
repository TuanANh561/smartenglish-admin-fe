import { Download, Plus, Upload, Play, Pencil, Trash2, Search, Volume2, Loader2, ArrowUpDown, Layers, BookOpen, RotateCcw, RefreshCw, Check, X, Sparkles } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import VocabImportModal from '@/features/vocabulary/import/VocabImportModal'
import { vocabularyColumns } from './columns'
import { speakWord, speakWithWebSpeech, stopAudio } from '@/lib/ipaHelper'
import { registerAudioStopHandler } from '@/lib/appAudioCoordinator'
import { api } from '@/lib/api'
import { ENDPOINTS } from '@/lib/endpoints'

const PAGE_SIZE = 10

const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Mới nhất trước' },
  { value: 'created_asc', label: 'Cũ nhất trước' },
  { value: 'word_asc', label: 'Từ A → Z' },
  { value: 'word_desc', label: 'Từ Z → A' },
]

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const PARTS_OF_SPEECH = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun', 'Preposition', 'Conjunction', 'Interjection']
const PART_OF_SPEECH_LABEL = {
  Noun: 'Danh từ', Verb: 'Động từ', Adjective: 'Tính từ', Adverb: 'Trạng từ',
  Pronoun: 'Đại từ', Preposition: 'Giới từ', Conjunction: 'Liên từ', Interjection: 'Thán từ',
}

const EMPTY_FORM = {
  word: '',
  pronunciation: '',
  partOfSpeech: 'Noun',
  vietnameseMeaning: '',
  englishMeaning: '',
  cefrLevel: 'B1',
  topic: '',
  exampleEn: '',
  exampleVi: '',
  synonyms: '',
  antonyms: '',
  // Câu hỏi bài tập (tối đa 3 câu MCQ)
  exercises: [
    { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' },
  ],
}

function ExerciseEditor({ exercises, onChange }) {
  const addExercise = () => {
    if (exercises.length >= 5) { toast.error('Tối đa 5 câu hỏi bài tập'); return }
    onChange([...exercises, { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }])
  }

  const removeExercise = (idx) => onChange(exercises.filter((_, i) => i !== idx))

  const updateExercise = (idx, field, value) => {
    const next = exercises.map((ex, i) => i === idx ? { ...ex, [field]: value } : ex)
    onChange(next)
  }

  const updateOption = (exIdx, optIdx, value) => {
    const next = exercises.map((ex, i) => {
      if (i !== exIdx) return ex
      const options = [...ex.options]
      options[optIdx] = value
      return { ...ex, options }
    })
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Câu hỏi bài tập ({exercises.length}/5)
        </label>
        <button
          type="button"
          onClick={addExercise}
          className="flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-100 transition-colors cursor-pointer"
        >
          <Plus size={12} /> Thêm câu hỏi
        </button>
      </div>

      {exercises.map((ex, exIdx) => (
        <div key={exIdx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Câu {exIdx + 1}</span>
            <button
              type="button"
              onClick={() => removeExercise(exIdx)}
              className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>

          <input
            type="text"
            value={ex.question}
            onChange={(e) => updateExercise(exIdx, 'question', e.target.value)}
            placeholder="Nhập câu hỏi... VD: Choose the correct meaning of 'serene':"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20"
          />

          <div className="grid grid-cols-2 gap-2">
            {ex.options.map((opt, optIdx) => (
              <div key={optIdx} className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateExercise(exIdx, 'correctIndex', optIdx)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors cursor-pointer ${
                    ex.correctIndex === optIdx
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 bg-white hover:border-slate-400'
                  }`}
                  title="Đánh dấu là đáp án đúng"
                >
                  {ex.correctIndex === optIdx && <Check size={11} strokeWidth={3} />}
                </button>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(exIdx, optIdx, e.target.value)}
                  placeholder={`Đáp án ${String.fromCharCode(65 + optIdx)}`}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-400"
                />
              </div>
            ))}
          </div>

          <input
            type="text"
            value={ex.explanation}
            onChange={(e) => updateExercise(exIdx, 'explanation', e.target.value)}
            placeholder="Giải thích đáp án (không bắt buộc)..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-600 placeholder:text-slate-400 outline-none focus:border-brand-400"
          />
        </div>
      ))}

      {exercises.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 py-4 text-center text-xs text-slate-400">
          Chưa có câu hỏi bài tập. Nhấn "Thêm câu hỏi" để tạo.
        </div>
      )}
    </div>
  )
}

function VocabularyPage() {
  const navigate = useNavigate()
  const [vocabList, setVocabList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('created_desc')
  const [partOfSpeech, setPartOfSpeech] = useState('')
  const [topicId, setTopicId] = useState('')
  const [topics, setTopics] = useState([])
  const [isPdfImportOpen, setIsPdfImportOpen] = useState(false)
  const [trashView, setTrashView] = useState(false)
  const [trashCount, setTrashCount] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [permanentTarget, setPermanentTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [playingId, setPlayingId] = useState(null)

  // Tải danh sách chủ đề từ CSDL
  const loadTopics = useCallback(async () => {
    try {
      const res = await api.get(ENDPOINTS.words.topics)
      const list = Array.isArray(res) ? res : (res?.data || [])
      setTopics(list)
    } catch (err) {
      console.warn('Lỗi khi tải danh sách chủ đề:', err)
    }
  }, [])

  // Tải số lượng từ trong thùng rác
  const refreshTrashCount = useCallback(async () => {
    try {
      const res = await api.get(ENDPOINTS.words.trashCount)
      const count = typeof res === 'number' ? res : (res?.data ?? 0)
      setTrashCount(Number(count) || 0)
    } catch (err) {
      console.warn('Lỗi khi tải số lượng từ trong thùng rác:', err)
    }
  }, [])

  useEffect(() => {
    loadTopics()
    refreshTrashCount()
  }, [loadTopics, refreshTrashCount])

  // Debounce tìm kiếm: Tự động kích hoạt sau khi người dùng dừng gõ 450ms
  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = searchInput.trim()
      if (trimmed !== search) {
        setSearch(trimmed)
        setPage(1)
      }
    }, 450)
    return () => clearTimeout(handler)
  }, [searchInput, search])

  const fetchWords = useCallback(async (targetPage, targetSearch, targetPos, targetTopic, targetSort, targetTrash) => {
    const p = targetPage !== undefined ? targetPage : page
    const s = targetSearch !== undefined ? targetSearch : search
    const pos = targetPos !== undefined ? targetPos : partOfSpeech
    const tid = targetTopic !== undefined ? targetTopic : topicId
    const sby = targetSort !== undefined ? targetSort : sortBy
    const isTrash = targetTrash !== undefined ? targetTrash : trashView

    setIsLoading(true)
    try {
      const params = {
        page: p,
        size: PAGE_SIZE,
        sortBy: sby,
        trash: isTrash,
      }
      if (s && s.trim()) params.search = s.trim()
      if (pos) params.partOfSpeech = pos
      if (tid) params.topicId = tid

      const res = await api.get(ENDPOINTS.words.list, { params })
      let items = res?.items || (Array.isArray(res) ? res : [])
      let total = res?.total ?? items.length

      // TỰ ĐỘNG TÌM KIẾM TRÊN INTERNET/AI & NẠP VÀO HỆ THỐNG NẾU CSDL CHƯA CÓ (chỉ khi không ở chế độ thùng rác)
      if (!isTrash && items.length === 0 && s && s.trim() && !pos && !tid) {
        try {
          const autoRes = await api.post(ENDPOINTS.words.autoImport, null, {
            params: { word: s.trim() }
          })
          const newWord = autoRes?.data || autoRes
          if (newWord && (newWord.id || newWord.word)) {
            items = [newWord]
            total = 1
            loadTopics()
            refreshTrashCount()
          }
        } catch (autoErr) {
          console.warn('Không thể tự động nạp từ internet:', autoErr)
        }
      }

      setVocabList(items)
      setTotal(total)
      setTotalPages(Math.ceil(total / PAGE_SIZE) || 1)
      if (s && items.length > 0) {
        loadTopics()
      }
    } catch (err) {
      console.error('Lỗi khi tải từ vựng:', err)
      toast.error('Không thể kết nối đến máy chủ để lấy từ vựng')
    } finally {
      setIsLoading(false)
    }
  }, [search, page, partOfSpeech, topicId, sortBy, trashView, loadTopics, refreshTrashCount])

  useEffect(() => {
    fetchWords()
  }, [fetchWords])

  // Ngắt âm thanh và đặt lại trạng thái icon khi chuyển trang, đổi bộ lọc, hoặc mở modal import
  useEffect(() => {
    stopAudio()
    setPlayingId(null)
  }, [page, search, partOfSpeech, topicId, sortBy, isPdfImportOpen, trashView])

  // Ngắt toàn bộ âm thanh khi người dùng rời khỏi trang hoặc bộ điều phối toàn cục yêu cầu
  useEffect(() => {
    const unregister = registerAudioStopHandler(() => {
      setPlayingId(null)
    })
    return () => {
      unregister()
      stopAudio()
    }
  }, [])

  const loadWords = useCallback(() => {
    fetchWords()
    loadTopics()
    refreshTrashCount()
  }, [fetchWords, loadTopics, refreshTrashCount])

  const handleToggleTrash = (nextTrash) => {
    setTrashView(nextTrash)
    setPage(1)
    setSearchInput('')
    setSearch('')
    fetchWords(1, '', partOfSpeech, topicId, sortBy, nextTrash)
  }

  const hasActiveFilters = Boolean(search || partOfSpeech || topicId || sortBy !== 'created_desc')

  const handleResetFilters = () => {
    setSearchInput('')
    setSearch('')
    setPartOfSpeech('')
    setTopicId('')
    setSortBy('created_desc')
    setPage(1)
    fetchWords(1, '', '', '', 'created_desc', trashView)
  }

  const start = (page - 1) * PAGE_SIZE
  const pageData = vocabList

  const handleOpenCreate = () => navigate('/app/hoc-lieu/tu-vung/tao-moi')

  const handleOpenEdit = (e, item) => {
    e?.stopPropagation?.()
    navigate(`/app/hoc-lieu/tu-vung/${item.id}/chinh-sua`)
  }

  // Xóa mềm vào thùng rác
  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    const target = deleteTarget

    try {
      await api.del(ENDPOINTS.words.remove, { path: { id: target.id } })
      // Xóa thành công: Cập nhật trực tiếp danh sách và đóng popup
      setVocabList((prev) => prev.filter((v) => v.id !== target.id))
      setTotal((prev) => Math.max(0, prev - 1))
      setTrashCount((prev) => prev + 1)
      setDeleteTarget(null)
      loadTopics()
      refreshTrashCount()
      toast.success(`Đã chuyển từ "${target.word}" vào thùng rác`)
    } catch (err) {
      console.error('Lỗi khi xóa từ vựng:', err)
      toast.error(`Lỗi khi xóa từ "${target.word}". Vui lòng thử lại!`)
    } finally {
      setIsDeleting(false)
    }
  }

  // Khôi phục từ thùng rác
  const handleRestore = async (vocab) => {
    try {
      await api.patch(ENDPOINTS.words.restore, null, { path: { id: vocab.id } })
      setVocabList((prev) => prev.filter((v) => v.id !== vocab.id))
      setTotal((prev) => Math.max(0, prev - 1))
      setTrashCount((prev) => Math.max(0, prev - 1))
      loadTopics()
      refreshTrashCount()
      toast.success(`Đã khôi phục từ "${vocab.word}" thành công!`)
    } catch (err) {
      console.error('Lỗi khi khôi phục từ vựng:', err)
      toast.error(`Không thể khôi phục từ "${vocab.word}"`)
    }
  }

  // Xóa vĩnh viễn
  const handleConfirmPermanentDelete = async () => {
    if (!permanentTarget || isDeleting) return
    setIsDeleting(true)
    const target = permanentTarget

    try {
      await api.del(ENDPOINTS.words.permanentRemove, { path: { id: target.id } })
      setVocabList((prev) => prev.filter((v) => v.id !== target.id))
      setTotal((prev) => Math.max(0, prev - 1))
      setTrashCount((prev) => Math.max(0, prev - 1))
      setPermanentTarget(null)
      loadTopics()
      refreshTrashCount()
      toast.success(`Đã xóa vĩnh viễn từ "${target.word}"`)
    } catch (err) {
      console.error('Lỗi khi xóa vĩnh viễn từ vựng:', err)
      toast.error(`Xóa vĩnh viễn thất bại: ${err?.message || ''}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePlayAudio = (e, item) => {
    e.stopPropagation()
    if (playingId === item.id) {
      setPlayingId(null)
      stopAudio()
      toast('Đã dừng phát âm', { icon: '⏸️' })
    } else {
      setPlayingId(item.id)
      speakWithWebSpeech(item.word, () => {
        setPlayingId((curr) => (curr === item.id ? null : curr))
      })
      setTimeout(() => {
        setPlayingId((curr) => (curr === item.id ? null : curr))
      }, 3000)
    }
  }

  return (
    <div className="space-y-4">
      {/* Table card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Banner thông báo khi ở chế độ thùng rác */}
        {trashView && (
          <div className="flex items-center justify-between bg-amber-50/90 border-b border-amber-200 px-5 py-2.5 text-xs text-amber-800">
            <span className="flex items-center gap-1.5 font-medium">
              <Trash2 size={14} className="text-amber-600 shrink-0" />
              Bạn đang xem các từ vựng trong <strong>Thùng rác</strong> ({trashCount}). Bạn có thể khôi phục hoặc xóa hẳn bất kỳ lúc nào.
            </span>
            <button
              type="button"
              onClick={() => handleToggleTrash(false)}
              className="font-semibold text-amber-900 hover:underline cursor-pointer"
            >
              Quay lại danh sách
            </button>
          </div>
        )}

        {/* Toolbar (Đồng bộ chuẩn Benchmark) */}
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder={trashView ? 'Tìm kiếm trong thùng rác...' : 'Tìm kiếm từ vựng...'}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = searchInput.trim()
                  if (val !== search) {
                    setSearch(val)
                    setPage(1)
                  }
                }
              }}
              className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  setSearch('')
                  setPage(1)
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                title="Xóa tìm kiếm"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sắp xếp */}
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Từ loại */}
            <select
              value={partOfSpeech}
              onChange={(e) => { setPartOfSpeech(e.target.value); setPage(1) }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="">Từ loại: Tất cả</option>
              {PARTS_OF_SPEECH.map((pos) => (
                <option key={pos} value={pos}>
                  {PART_OF_SPEECH_LABEL[pos] || pos} ({pos})
                </option>
              ))}
            </select>

            {/* Chủ đề */}
            <select
              value={topicId}
              onChange={(e) => { setTopicId(e.target.value); setPage(1) }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer max-w-[180px]"
            >
              <option value="">Chủ đề: Tất cả</option>
              {topics.map((top) => (
                <option key={top.id} value={top.id}>
                  {top.iconEmoji ? `${top.iconEmoji} ` : ''}{top.nameVi || top.nameEn} ({top.wordCount ?? 0})
                </option>
              ))}
            </select>

            {/* Nút Tải lại danh sách */}
            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              onClick={loadWords}
              title="Tải lại danh sách"
            />

            {/* Nút Import (Chỉ hiển thị khi không ở thùng rác) */}
            {!trashView && (
              <Button size="sm" variant="secondary" icon={Upload} onClick={() => setIsPdfImportOpen(true)}>
                Import
              </Button>
            )}

            {/* Nút Thêm mới (Chỉ hiển thị khi không ở thùng rác) */}
            {!trashView && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-800 hover:bg-navy-900 text-white transition-all shadow-xs hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                title="Thêm từ mới"
                aria-label="Thêm từ mới"
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>
            )}

            {/* Nút Thùng rác (Icon-only với Badge số lượng, ở cuối row) */}
            <button
              type="button"
              onClick={() => handleToggleTrash(!trashView)}
              className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all shadow-2xs cursor-pointer border ${
                trashView
                  ? 'border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
              }`}
              title={trashView ? 'Quay lại kho từ vựng' : `Thùng rác (${trashCount || 0})`}
              aria-label={trashView ? 'Quay lại kho từ vựng' : `Thùng rác (${trashCount || 0})`}
            >
              {trashView ? (
                <RotateCcw size={16} />
              ) : (
                <>
                  <Trash2 size={16} />
                  {trashCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-xs">
                      {trashCount}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full">
          <table className="w-full text-left text-sm table-fixed">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                {vocabularyColumns.map((col) => {
                  let widthClass = 'w-[12%]'
                  if (col.accessorKey === 'word') widthClass = 'w-[16%]'
                  else if (col.accessorKey === 'pronunciation') widthClass = 'w-[14%]'
                  else if (col.accessorKey === 'partOfSpeech') widthClass = 'w-[11%] text-center'
                  else if (col.accessorKey === 'vietnameseMeaning') widthClass = 'w-[27%]'
                  else if (col.accessorKey === 'cefrLevel') widthClass = 'w-[10%] text-center'
                  else if (col.accessorKey === 'topic') widthClass = 'w-[12%]'

                  return (
                    <th
                      key={col.accessorKey}
                      className={`px-3.5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap ${widthClass}`}
                    >
                      {typeof col.header === 'function' ? col.header() : col.header}
                    </th>
                  )
                })}
                <th className="px-1.5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500 w-[4%] whitespace-nowrap">
                  Audio
                </th>
                <th className="px-2 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500 w-[6%] whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={vocabularyColumns.length + 2} className="px-4 py-12 text-center">
                    <LoadingSpinner
                      text={
                        search
                           ? `Đang tìm kiếm từ "${search}"...`
                          : "Đang tải danh sách từ vựng..."
                      }
                    />
                  </td>
                </tr>
              ) : pageData.length === 0 ? (
                <tr>
                  <td colSpan={vocabularyColumns.length + 2} className="px-4 py-12 text-center">
                    <div className="max-w-sm mx-auto text-center space-y-2">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        {trashView ? <Trash2 size={24} /> : <BookOpen size={24} />}
                      </div>
                      <p className="text-sm font-bold text-slate-700">
                        {trashView
                          ? (search ? `Không tìm thấy từ vựng nào trong thùng rác cho "${search}"` : 'Thùng rác đang trống')
                          : (search ? `Không tìm thấy từ vựng nào cho "${search}"` : 'Kho từ vựng hiện đang trống')}
                      </p>
                      {trashView && (
                        <p className="text-xs text-slate-400">
                          Chưa có từ vựng nào bị chuyển vào thùng rác
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                pageData.map((vocab) => (
                  <tr key={vocab.id} className="hover:bg-slate-50/50 transition-colors group">
                    {vocabularyColumns.map((col) => (
                      <td
                        key={`${vocab.id}-${col.accessorKey}`}
                        className={`px-3.5 py-3 text-sm overflow-hidden ${
                          col.accessorKey === 'partOfSpeech' || col.accessorKey === 'cefrLevel'
                            ? 'text-center'
                            : ''
                        }`}
                      >
                        {col.cell({ getValue: () => vocab[col.accessorKey], row: { original: vocab } })}
                      </td>
                    ))}
                    {/* Audio */}
                    <td className="px-1.5 py-3 text-center">
                      <button
                        onClick={(e) => handlePlayAudio(e, vocab)}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                          playingId === vocab.id
                            ? 'bg-brand-500 text-white animate-pulse'
                            : 'text-slate-400 hover:bg-brand-50 hover:text-brand-600'
                        }`}
                        title="Phát âm từ vựng (Web Speech API)"
                      >
                        {playingId === vocab.id ? <Volume2 size={16} /> : <Play size={16} strokeWidth={2} />}
                      </button>
                    </td>
                    {/* Thao tác */}
                    <td className="px-2 py-3 text-right whitespace-nowrap">
                      {trashView ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRestore(vocab)
                            }}
                            className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                            title="Khôi phục từ vựng"
                          >
                            <RotateCcw size={16} strokeWidth={1.75} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setPermanentTarget(vocab)
                            }}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                            title="Xóa vĩnh viễn"
                          >
                            <Trash2 size={16} strokeWidth={1.75} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 text-slate-400">
                          <button
                            type="button"
                            onClick={(e) => handleOpenEdit(e, vocab)}
                            className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Sửa từ vựng"
                          >
                            <Pencil size={16} strokeWidth={1.75} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteTarget(vocab)
                            }}
                            className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                            title="Chuyển vào thùng rác"
                          >
                            <Trash2 size={16} strokeWidth={1.75} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-500">
            Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>-<strong>{Math.min(start + PAGE_SIZE, total)}</strong> trong tổng số{' '}
            <strong>{total}</strong> từ vựng
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* Form hiện ở trang riêng: /hoc-lieu/tu-vung/tao-moi hoặc /:id/chinh-sua */}

      {/* ─── Confirm Xóa mềm (Thùng rác) ─── */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Chuyển từ vựng vào thùng rác"
        description={`Bạn có chắc muốn chuyển từ "${deleteTarget?.word}" vào thùng rác? Bạn có thể khôi phục lại bất kỳ lúc nào.`}
        confirmLabel={isDeleting ? 'Đang chuyển...' : 'Chuyển vào thùng rác'}
        cancelLabel="Hủy"
        variant="warning"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => !isDeleting && setDeleteTarget(null)}
      />

      {/* ─── Confirm Xóa vĩnh viễn ─── */}
      <ConfirmDialog
        open={Boolean(permanentTarget)}
        title="Xóa vĩnh viễn từ vựng"
        description={`Bạn có chắc muốn xóa vĩnh viễn từ "${permanentTarget?.word}" khỏi cơ sở dữ liệu? Thao tác này không thể hoàn tác.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        cancelLabel="Hủy"
        variant="danger"
        loading={isDeleting}
        onConfirm={handleConfirmPermanentDelete}
        onCancel={() => !isDeleting && setPermanentTarget(null)}
      />

      {/* Modal Import PDF AI */}
      <VocabImportModal
        open={isPdfImportOpen}
        onClose={() => {
          setIsPdfImportOpen(false)
          fetchWords(1, '')
          loadTopics()
        }}
        defaultType="vocabulary"
        onImportSuccess={async (items) => {
          const formatted = items.map((item) => ({
            word: item.word,
            pronunciation: item.pronunciation || item.phonetic || '/.../',
            vietnameseMeaning: item.vietnameseMeaning || '',
            englishMeaning: item.englishMeaning || item.exampleSentence || 'Imported from file',
            partOfSpeech: item.partOfSpeech || 'Noun',
            cefrLevel: item.cefrLevel || 'B2',
            topic: item.topic || 'General',
            exampleEn: item.exampleEn || item.exampleSentence || '',
            exampleVi: item.exampleVi || '',
            audioUrl: item.audioUrl || '',
            exercises: item.exercises || [],
          }))
          try {
            const saved = await api.post(ENDPOINTS.words.import, {
              data: formatted,
              timeout: 0,
            })
            const count = Array.isArray(saved) ? saved.length : formatted.length
            toast.success(`Đã import thành công ${count} từ vựng vào cơ sở dữ liệu!`)
            loadWords()
          } catch (err) {
            console.error('Lỗi import:', err)
            toast.error(err?.message || 'Không thể import từ vựng vào hệ thống')
            throw err
          }
        }}
      />
    </div>
  )
}

export default VocabularyPage
