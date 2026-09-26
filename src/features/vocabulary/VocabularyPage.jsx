import { Download, Plus, Upload, Play, Pencil, Trash2, Search, Volume2, Loader2, ArrowUpDown, Layers, BookOpen, RotateCcw, RefreshCw, Check, X } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import VocabImportModal from '@/features/vocabulary/import/VocabImportModal'
import { vocabularyColumns } from './columns'
import { speakWord, stopAudio } from '@/lib/ipaHelper'
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
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('created_desc')
  const [partOfSpeech, setPartOfSpeech] = useState('')
  const [topicId, setTopicId] = useState('')
  const [topics, setTopics] = useState([])
  const [isPdfImportOpen, setIsPdfImportOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
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

  useEffect(() => {
    loadTopics()
  }, [loadTopics])

  const fetchWords = useCallback(async (targetPage, targetSearch, targetPos, targetTopic, targetSort) => {
    const p = targetPage !== undefined ? targetPage : page
    const s = targetSearch !== undefined ? targetSearch : search
    const pos = targetPos !== undefined ? targetPos : partOfSpeech
    const tid = targetTopic !== undefined ? targetTopic : topicId
    const sby = targetSort !== undefined ? targetSort : sortBy

    setIsLoading(true)
    try {
      const params = {
        page: p,
        size: PAGE_SIZE,
        sortBy: sby,
      }
      if (s && s.trim()) params.search = s.trim()
      if (pos) params.partOfSpeech = pos
      if (tid) params.topicId = tid

      const res = await api.get(ENDPOINTS.words.list, { params })
      if (res && res.items) {
        setVocabList(res.items)
        setTotal(res.total || 0)
        setTotalPages(res.totalPages || 1)
      } else if (Array.isArray(res)) {
        setVocabList(res)
        setTotal(res.length)
        setTotalPages(Math.ceil(res.length / PAGE_SIZE) || 1)
      }
    } catch (err) {
      console.error('Lỗi khi tải từ vựng:', err)
      toast.error('Không thể kết nối đến máy chủ để lấy từ vựng')
    } finally {
      setIsLoading(false)
    }
  }, [search, page, partOfSpeech, topicId, sortBy])

  useEffect(() => {
    fetchWords()
  }, [fetchWords])

  // Ngắt toàn bộ âm thanh khi người dùng rời khỏi trang
  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [])

  const loadWords = useCallback(() => {
    fetchWords()
    loadTopics()
  }, [fetchWords, loadTopics])

  const hasActiveFilters = Boolean(search || partOfSpeech || topicId || sortBy !== 'created_desc')

  const handleResetFilters = () => {
    setSearch('')
    setPartOfSpeech('')
    setTopicId('')
    setSortBy('created_desc')
    setPage(1)
    fetchWords(1, '', '', '', 'created_desc')
  }

  const start = (page - 1) * PAGE_SIZE
  const pageData = vocabList

  const handleOpenCreate = () => navigate('/app/hoc-lieu/tu-vung/tao-moi')

  const handleOpenEdit = (e, item) => {
    e?.stopPropagation?.()
    navigate(`/app/hoc-lieu/tu-vung/${item.id}/chinh-sua`)
  }

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    const target = deleteTarget

    try {
      await api.del(ENDPOINTS.words.remove, { path: { id: target.id } })
      // Xóa thành công: Cập nhật trực tiếp danh sách và đóng popup
      setVocabList((prev) => prev.filter((v) => v.id !== target.id))
      setTotal((prev) => Math.max(0, prev - 1))
      setDeleteTarget(null)
      loadTopics()
      toast.success(`Đã xóa từ "${target.word}" thành công!`)
    } catch (err) {
      console.error('Lỗi khi xóa từ vựng:', err)
      toast.error(`Lỗi khi xóa từ "${target.word}". Vui lòng thử lại!`)
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
      speakWord(item.word, item.audioUrl, () => {
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
        {/* Toolbar (Đồng bộ chuẩn Benchmark) */}
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm từ vựng, ý nghĩa, phiên âm, chủ đề..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
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

            {/* Nút Import */}
            <Button size="sm" variant="secondary" icon={Upload} onClick={() => setIsPdfImportOpen(true)}>
              Import
            </Button>

            {/* Nút Thêm mới */}
            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={15} />
              <span>Thêm từ mới</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                {vocabularyColumns.map((col) => (
                  <th
                    key={col.accessorKey}
                    className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    {typeof col.header === 'function' ? col.header() : col.header}
                  </th>
                ))}
                <th className="px-6 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                  Audio
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={vocabularyColumns.length + 2} className="px-6 py-12 text-center">
                    <LoadingSpinner text="Đang tải danh sách từ vựng từ máy chủ..." />
                  </td>
                </tr>
              ) : pageData.length === 0 ? (
                <tr>
                  <td colSpan={vocabularyColumns.length + 2} className="px-6 py-8 text-center text-sm text-slate-400">
                    Chưa có từ vựng nào khớp với tìm kiếm
                  </td>
                </tr>
              ) : (
                pageData.map((vocab) => (
                  <tr key={vocab.id} className="hover:bg-slate-50/50 transition-colors group">
                    {vocabularyColumns.map((col) => (
                      <td key={`${vocab.id}-${col.accessorKey}`} className="px-6 py-4 text-sm">
                        {col.cell({ getValue: () => vocab[col.accessorKey], row: { original: vocab } })}
                      </td>
                    ))}
                    {/* Audio */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => handlePlayAudio(e, vocab)}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                          playingId === vocab.id
                            ? 'bg-brand-500 text-white animate-pulse'
                            : 'text-slate-400 hover:bg-brand-50 hover:text-brand-600'
                        }`}
                        title="Phát âm thanh"
                      >
                        {playingId === vocab.id ? <Volume2 size={16} /> : <Play size={16} strokeWidth={2} />}
                      </button>
                    </td>
                    {/* Thao tác */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-slate-400">
                        <button
                          onClick={(e) => handleOpenEdit(e, vocab)}
                          className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                          title="Sửa từ vựng"
                        >
                          <Pencil size={16} strokeWidth={1.75} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(vocab) }}
                          className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                          title="Xóa từ vựng"
                        >
                          <Trash2 size={16} strokeWidth={1.75} />
                        </button>
                      </div>
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

      {/* ─── Confirm Xóa ─── */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa từ vựng"
        description={`Bạn có chắc muốn xóa từ "${deleteTarget?.word}"? Thao tác này không thể hoàn tác.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa từ'}
        cancelLabel="Hủy"
        variant="danger"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => !isDeleting && setDeleteTarget(null)}
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
