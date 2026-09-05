import { Download, Plus, Upload, Play, Pencil, Trash2, Search, Volume2 } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import DataImportWizardModal from '@/components/ui/DataImportWizardModal'
import { vocabularies } from '@/mocks/data/vocabulary'
import { vocabularyColumns } from './columns'

const PAGE_SIZE = 10

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
  const [vocabList, setVocabList] = useState(vocabularies)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [isPdfImportOpen, setIsPdfImportOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [playingId, setPlayingId] = useState(null)

  // Lọc dữ liệu theo tìm kiếm
  const filtered = useMemo(() => {
    if (!search.trim()) return vocabList
    const keyword = search.toLowerCase()
    return vocabList.filter(
      (v) =>
        v.word.toLowerCase().includes(keyword) ||
        v.vietnameseMeaning.toLowerCase().includes(keyword) ||
        (v.pronunciation || '').toLowerCase().includes(keyword) ||
        (v.topic || '').toLowerCase().includes(keyword),
    )
  }, [search, vocabList])

  const total = filtered.length
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1
  const start = (page - 1) * PAGE_SIZE
  const pageData = filtered.slice(start, start + PAGE_SIZE)

  const allSelected = pageData.length > 0 && pageData.every((v) => selectedIds.has(v.id))
  const someSelected = pageData.some((v) => selectedIds.has(v.id))

  const handleSelectAll = (checked) => {
    const newSelected = new Set(selectedIds)
    if (checked) pageData.forEach((v) => newSelected.add(v.id))
    else pageData.forEach((v) => newSelected.delete(v.id))
    setSelectedIds(newSelected)
  }

  const handleSelectRow = (id, checked) => {
    const newSelected = new Set(selectedIds)
    if (checked) newSelected.add(id)
    else newSelected.delete(id)
    setSelectedIds(newSelected)
  }

  const handleOpenCreate = () => navigate('/hoc-lieu/tu-vung/tao-moi')

  const handleOpenEdit = (e, item) => {
    e?.stopPropagation?.()
    navigate(`/hoc-lieu/tu-vung/${item.id}/chinh-sua`)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setVocabList(prev => prev.filter(v => v.id !== deleteTarget.id))
    setSelectedIds(prev => { const n = new Set(prev); n.delete(deleteTarget.id); return n })
    toast.success(`Đã xóa từ "${deleteTarget.word}"`)
    setDeleteTarget(null)
  }

  const handleExport = () => {
    toast.success('Đang xuất danh sách từ vựng... (Demo)')
  }

  const handlePlayAudio = (e, item) => {
    e.stopPropagation()
    if (playingId === item.id) {
      setPlayingId(null)
      toast('Đã dừng phát âm', { icon: '⏸️' })
    } else {
      setPlayingId(item.id)
      toast.success(`Phát âm: "${item.word}"`)
      setTimeout(() => setPlayingId(null), 2500)
    }
  }

  return (
    <div className="space-y-4">
      {/* Table card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
          <div className="flex-1 min-w-[260px] max-w-md">
            <div className="relative flex items-center">
              <Search size={18} className="pointer-events-none absolute left-3 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm từ vựng, ý nghĩa, phiên âm, chủ đề..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" icon={Upload} onClick={() => setIsPdfImportOpen(true)}>
              Import
            </Button>
            <Button size="sm" variant="secondary" icon={Download} onClick={handleExport}>
              Xuất dữ liệu
            </Button>
            <Button size="sm" icon={Plus} onClick={handleOpenCreate}>
              Thêm từ mới
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="w-12 px-6 py-3.5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = !allSelected && someSelected }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                </th>
                {vocabularyColumns.map((col) => (
                  <th
                    key={col.accessorKey}
                    className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    {typeof col.header === 'function' ? col.header() : col.header}
                  </th>
                ))}
                <th className="px-6 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                  Bài tập
                </th>
                <th className="px-6 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                  Audio
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={vocabularyColumns.length + 4} className="px-6 py-8 text-center text-sm text-slate-400">
                    Chưa có từ vựng nào khớp với tìm kiếm
                  </td>
                </tr>
              ) : (
                pageData.map((vocab) => (
                  <tr key={vocab.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="w-12 px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(vocab.id)}
                        onChange={(e) => handleSelectRow(vocab.id, e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                    </td>
                    {vocabularyColumns.map((col) => (
                      <td key={`${vocab.id}-${col.accessorKey}`} className="px-6 py-4 text-sm">
                        {col.cell({ getValue: () => vocab[col.accessorKey], row: { original: vocab } })}
                      </td>
                    ))}
                    {/* Số câu bài tập */}
                    <td className="px-6 py-4 text-center">
                      {vocab.exercises?.length > 0 ? (
                        <span className="inline-flex items-center justify-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-600 border border-brand-100">
                          {vocab.exercises.length} câu
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
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
        confirmLabel="Xóa từ"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Modal Import PDF AI */}
      <DataImportWizardModal
        open={isPdfImportOpen}
        onClose={() => setIsPdfImportOpen(false)}
        defaultType="vocabulary"
        onImportSuccess={(newItems) => {
          const formatted = newItems.map((item, idx) => ({
            id: `imported-${Date.now()}-${idx}`,
            word: item.word,
            pronunciation: item.phonetic || '/.../',
            vietnameseMeaning: item.vietnameseMeaning,
            englishMeaning: item.exampleSentence || 'Imported from PDF',
            partOfSpeech: item.partOfSpeech || 'noun',
            cefrLevel: item.cefrLevel || 'B2',
            topic: item.topic || '',
            audioUrl: '',
            exercises: [],
          }))
          setVocabList((prev) => [...formatted, ...prev])
          toast.success(`Đã thêm thành công ${formatted.length} từ vựng từ PDF vào danh sách!`)
        }}
      />
    </div>
  )
}

export default VocabularyPage
